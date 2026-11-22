import { NextResponse } from 'next/server';
import { redactPrivateAnchorLog } from '@/lib/privateAnchors';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Llave de servidor (nunca NEXT_PUBLIC_): la respuesta pasa por redactPrivateAnchorLog,
// así que los anclajes privados salen sin CID aunque esta llave sí los vea.
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const TREASURY = "GC4Q5TWWXI7IHN6DYCBEKCOWJWCKY4JE2NLKLU5SE3YL44IUUFPKUOPC";
const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

export async function GET() {
    try {
        // 1. Fetch from agent_logs (Payments, M2M, x402 metadata)
        const agentLogsPromise = (SUPABASE_URL && SUPABASE_KEY) ? fetch(
            `${SUPABASE_URL}/rest/v1/agent_logs?select=*&order=created_at.desc&limit=30`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                },
                cache: 'no-store',
            }
        ).then(res => res.ok ? res.json() : []) : Promise.resolve([]);

        // 2. Fetch from logs (Soroban Intelligence, Activity)
        // agent_id=neq.REBALANCER-RATIO: the rebalancer stores its own rate
        // history in this table (message = "RATIO:<vault>|<n>|<ts>") as a
        // poor-man's KV store - internal bookkeeping, never meant to render
        // as a feed line.
        const activityLogsPromise = (SUPABASE_URL && SUPABASE_KEY) ? fetch(
            `${SUPABASE_URL}/rest/v1/logs?select=*&agent_id=neq.REBALANCER-RATIO&order=timestamp.desc&limit=30`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                },
                cache: 'no-store',
            }
        ).then(res => res.ok ? res.json() : []) : Promise.resolve([]);

        // 3. Fetch from Horizon (Live On-chain Settlements) - 5s timeout so we never block OpsConsole
        const horizonPromise = fetch(
            `https://horizon-testnet.stellar.org/accounts/${TREASURY}/operations?order=desc&limit=20`,
            { signal: AbortSignal.timeout(5000), cache: 'no-store' }
        ).then(res => res.ok ? res.json() : { _embedded: { records: [] } })
         .catch(() => ({ _embedded: { records: [] } }));

        const [agentData, activityData, horizonData] = await Promise.all([
            agentLogsPromise, 
            activityLogsPromise, 
            horizonPromise
        ]);

        // Normalize Horizon Settlements
        const settlements = (horizonData?._embedded?.records ?? []).reduce((acc: any[], r: any) => {
            let amount: string | null = null;
            if (r.type === 'invoke_host_function') {
                const change = r.asset_balance_changes?.find(
                    (c: any) => c.to === TREASURY && c.asset_code === 'USDC' && c.asset_issuer === USDC_ISSUER
                );
                if (change) amount = change.amount;
            } else if ((r.type === 'payment' || r.type === 'path_payment_strict_receive') && r.to === TREASURY && r.asset_code === 'USDC') {
                amount = r.amount;
            }

            if (!amount) return acc;
            const val = parseFloat(amount);
            let pType = 'SETTLEMENT';
            let route = '';
            
            if (val === 0.02) { pType = 'x402'; route = '/signals'; }
            else if (val === 0.05) { pType = 'x402'; route = '/market-data'; }
            else if (val === 0.25) { pType = 'MPP'; route = '/execution'; }
            else if (val >= 1.0) { pType = 'MPP'; route = '/mpp/session-init'; }
            else { return acc; } // Skip non-protocol payments

            acc.push({
                id: r.id,
                agent_id: pType,
                message: `Resolved: ${route} settlement confirmed (+${amount} USDC) | tx=${r.transaction_hash || r.transaction_id}`,
                level: 'success',
                created_at: r.created_at,
                source: 'horizon',
                tx_hash: r.transaction_hash || r.transaction_id,
                sortDate: new Date(r.created_at).getTime()
            });
            return acc;
        }, []);

        // Normalize and merge everything
        const unified = [
            ...agentData.map((l: any) => ({
                ...l,
                source: 'agent_logs',
                sortDate: new Date(l.created_at).getTime()
            })),
            ...activityData.map((l: any) => ({
                id: l.id,
                agent_id: 'INTELLIGENCE',
                message: l.message,
                level: l.level || 'info',
                created_at: l.timestamp,
                source: 'logs',
                sortDate: new Date(l.timestamp).getTime()
            })),
            ...settlements
        ];

        unified.sort((a, b) => b.sortDate - a.sortDate);

        // Anclajes de socios y recibos de Payouts: la línea se queda (se ve que
        // hubo actividad) pero sin CID, hash ni id de corrida. Ver lib/privateAnchors.
        const publicFeed = unified.slice(0, 50).map((l: any) =>
            typeof l.message === 'string' ? { ...l, message: redactPrivateAnchorLog(l.message) } : l,
        );

        // CDN cache: every open /agents or /dashboard tab polls this route; one run per
        // 10 s serves all of them instead of one run per tab per poll.
        return NextResponse.json(publicFeed, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=20' } });
    } catch (e) {
        console.error('[API /logs] GET Error:', e);
        return NextResponse.json([], { status: 200 });
    }
}

// POST /api/logs se quitó el 8-nov-2026: escribía en agent_logs con la llave pública
// y sin autenticación, así que cualquiera podía publicar en el feed un mensaje con el
// agent_id que quisiera. Su único uso era writeLog() del dashboard (ver lib/logger.ts).
