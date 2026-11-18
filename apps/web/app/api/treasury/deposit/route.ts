import { NextRequest, NextResponse } from 'next/server';
import { agentPost, asAgentNetwork } from '@/lib/agentProxy';
import { tierBBlock } from '@/lib/tierBGate';

// Arma el XDR SIN firmar del depósito. El dinero es del cliente y lo firma el
// cliente: Nirium no participa - el depósito ni siquiera toca el rol de
// RebalanceManager.
export async function POST(req: NextRequest) {
    try {
        const { walletAddress, vault, amounts, invest, network } = await req.json();
        // EEE, UK y EE.UU.: no se ofrece (ver lib/tierBGate.ts).
        const blocked = tierBBlock(req, asAgentNetwork(network), 'treasury');
        if (blocked) return blocked;
        if (!walletAddress || !vault || !Array.isArray(amounts))
            return NextResponse.json({ error: 'walletAddress, vault and amounts required' }, { status: 400 });

        const { status, data } = await agentPost(
            '/api/treasury/deposit',
            { vault, from: walletAddress, amounts, invest },
            walletAddress,
            asAgentNetwork(network),
        );
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
