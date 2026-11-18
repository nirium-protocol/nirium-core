import { NextRequest, NextResponse } from 'next/server';
import { agentPost, asAgentNetwork } from '@/lib/agentProxy';
import { tierBBlock } from '@/lib/tierBGate';

// Broadcast the fully-signed (sponsor + employee) onboarding tx.
export async function POST(req: NextRequest) {
    try {
        const { walletAddress, signedXdr, network } = await req.json();
        // EEE, UK y EE.UU.: no se ofrece (ver lib/tierBGate.ts).
        const blocked = tierBBlock(req, asAgentNetwork(network), 'payouts');
        if (blocked) return blocked;
        if (!walletAddress || !signedXdr)
            return NextResponse.json({ error: 'walletAddress and signedXdr required' }, { status: 400 });
        const { status, data } = await agentPost('/api/payroll/onboard/submit', { signedXdr }, walletAddress, asAgentNetwork(network));
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
