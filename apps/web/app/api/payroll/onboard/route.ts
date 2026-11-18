import { NextRequest, NextResponse } from 'next/server';
import { agentPost, asAgentNetwork } from '@/lib/agentProxy';
import { tierBBlock } from '@/lib/tierBGate';

// Build a USDC trustline for a recipient. Self-signed: the recipient's own account
// signs the changeTrust and pays its reserve (not sponsored; see onboardEmployee in
// packages/agent/src/execution/executePayroll.ts).
export async function POST(req: NextRequest) {
    try {
        const { walletAddress, employee, asset, limit, network } = await req.json();
        // EEE, UK y EE.UU.: no se ofrece (ver lib/tierBGate.ts).
        const blocked = tierBBlock(req, asAgentNetwork(network), 'payouts');
        if (blocked) return blocked;
        if (!walletAddress || !employee)
            return NextResponse.json({ error: 'walletAddress and employee required' }, { status: 400 });
        // Connected wallet = the sponsoring treasury.
        const { status, data } = await agentPost('/api/payroll/onboard', { employee, asset, limit, sponsor: walletAddress }, walletAddress, asAgentNetwork(network));
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
