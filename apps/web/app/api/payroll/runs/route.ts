import { NextRequest, NextResponse } from 'next/server';
import { agentGet, asAgentNetwork } from '@/lib/agentProxy';

export const dynamic = 'force-dynamic';

// Recent settled runs: amount, recipient count and tx hash. The agent's own
// endpoint also returns runId and the IPFS receipt CID; this proxy drops them.
export async function GET(req: NextRequest) {
    try {
        const net = asAgentNetwork(req.nextUrl.searchParams.get('network'));
        const { status, data } = await agentGet('/api/payroll/runs', net);
        // Cinturón extra: ambos boxes comparten la tabla payroll_runs - filtrar
        // aquí también por si el agente aún no filtra por red.
        if (Array.isArray(data?.runs)) data.runs = data.runs.filter((r: any) => !r.network || r.network === net);
        // Sin runId ni cid: el recibo IPFS de una corrida es evidencia de la empresa
        // que pagó y no se lista en público (misma regla que /api/audit, ver
        // lib/privateAnchors). Se quedan monto, conteo y la tx, que ya es pública
        // en la cadena. Decidido el 8-nov-2026.
        if (Array.isArray(data?.runs)) {
            data.runs = data.runs.map((r: any) => ({
                network: r.network,
                asset: r.asset,
                totalAmount: r.totalAmount,
                recipientCount: r.recipientCount,
                txHash: r.txHash,
                explorer: r.explorer,
                signed: r.signed,
            }));
        }
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ runs: [], error: e instanceof Error ? e.message : 'proxy error' }, { status: 200 });
    }
}
