// Proxy del resumen público de reporting (9-nov-2026), para que /analytics lo lea
// desde el mismo origen: el agente solo permite CORS desde nirium.xyz y su consulta
// a veces tarda más de 8 s. Solo reenvía el JSON del agente, no calcula nada.
export const maxDuration = 30;

const AGENT = 'https://nirium-agent-mainnet.fly.dev/api/reporting/summary';

export async function GET(req: Request) {
    const network = new URL(req.url).searchParams.get('network') === 'mainnet' ? 'mainnet' : 'testnet';
    try {
        const r = await fetch(`${AGENT}?network=${network}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(25000) });
        if (!r.ok) return Response.json({ error: `agent ${r.status}`, source: `${AGENT}?network=${network}` }, { status: 502 });
        const data = await r.json();
        return Response.json(data, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' } });
    } catch (e) {
        return Response.json({ error: 'agent unreachable', source: `${AGENT}?network=${network}` }, { status: 504 });
    }
}
