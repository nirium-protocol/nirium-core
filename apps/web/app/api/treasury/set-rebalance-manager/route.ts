import { NextRequest, NextResponse } from 'next/server';
import { agentPost, asAgentNetwork } from '@/lib/agentProxy';
import { tierBBlock } from '@/lib/tierBGate';

// Entrega (o retira) el rol de RebalanceManager. Devuelve XDR SIN firmar
// porque lo firma el Manager - el cliente. Es la misma puerta en los dos
// sentidos: la que nos da el permiso es la que nos lo quita, y por eso el nodo
// no puede nombrarse a sí mismo.
export async function POST(req: NextRequest) {
    try {
        const { walletAddress, vault, rebalanceManager, network } = await req.json();
        // EEE, UK y EE.UU.: no se ofrece (ver lib/tierBGate.ts).
        const blocked = tierBBlock(req, asAgentNetwork(network), 'treasury');
        if (blocked) return blocked;
        if (!walletAddress || !vault || !rebalanceManager)
            return NextResponse.json({ error: 'walletAddress, vault and rebalanceManager required' }, { status: 400 });

        const { status, data } = await agentPost(
            '/api/treasury/set-rebalance-manager',
            { vault, manager: walletAddress, rebalanceManager },
            walletAddress,
            asAgentNetwork(network),
        );
        return NextResponse.json(data, { status });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'proxy error' }, { status: 502 });
    }
}
