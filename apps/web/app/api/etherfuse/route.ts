import { NextResponse } from 'next/server';
import crypto from 'crypto';

const API_KEY = process.env.ETHERFUSE_API_KEY || '';
const BASE_URL = process.env.ETHERFUSE_API_URL || 'https://api.sand.etherfuse.com';

// ── Solo sandbox (decidido el 8-nov-2026, opción A) ──────────────────────────
// Este flujo pide la cotización y la orden con la cuenta de ORGANIZACIÓN de Nirium
// en Etherfuse: la wallet del usuario se registra bajo esa organización y la orden
// usa la cuenta bancaria de la organización. El KYC del usuario crea un cliente
// aparte que la orden no usa. En el sandbox es una demo sin dinero real; con llaves
// de producción, Nirium quedaría como quien ordena fiat→cripto por terceros, que es
// justo lo que la postura legal dice que nunca hace ("solo muestra instrucciones y
// lee el saldo", ver legal/ARQUITECTURA-LEGAL.md). Por eso las acciones que crean
// algo en Etherfuse se niegan si la URL no es de sandbox. `lookup` (precio público)
// sigue disponible. Para producción: rehacer con la cuenta propia de cada usuario en
// Etherfuse o mandarlo a la app de Etherfuse.
const IS_SANDBOX = /\bsand\b|sandbox|devnet/i.test(BASE_URL);
const SANDBOX_ONLY_ACTIONS = new Set(['onboarding', 'quote', 'order', 'simulate_fiat']);
const headers = {
    'Authorization': API_KEY,
    'Content-Type': 'application/json'
};

// Per Etherfuse docs: customerId in quotes = org's own UUID (not a customer UUID)
let ORG_ID: string | null = null;
async function getOrgId(): Promise<string> {
    if (ORG_ID) return ORG_ID;
    const res = await fetch(`${BASE_URL}/ramp/me`, { headers });
    const data = await res.json();
    ORG_ID = data.id;
    return ORG_ID as string;
}

// Hallazgo real (2026-11-03, barrido de seguridad): esta ruta no tenía NINGÚN
// auth y el OPTIONS respondía `Access-Control-Allow-Origin: *` — cualquier
// sitio de terceros podía hacer un POST cross-origin con `action: 'list_orders'`
// y leer las últimas 10 órdenes de rampa reales (direcciones de wallet, datos
// de la orden). El widget de /ramp (`FiatRamp.tsx`) sí llama a este endpoint
// sin credenciales — por diseño: onboarding/quote/order/simulate_fiat/lookup
// son el flujo público de autoservicio y no deben requerir login. `list_orders`
// es la excepción: un endpoint de debug que ningún componente del frontend usa
// (confirmado con grep) y que no debería ser legible por cualquiera.
//
// Mismo patrón que el PR #99 (apps/web/app/api/config/llm/route.ts): en vez de
// duplicar `ADMIN_API_KEY` como variable de Vercel, se verifica el admin
// llamando al propio endpoint ya gateado del agente.
const AGENT_URL = (process.env.AGENT_INTERNAL_URL ?? 'https://nirium-agent.fly.dev').replace(/\/$/, '');

async function requireAdmin(req: Request): Promise<boolean> {
    const apiKey = req.headers.get('x-api-key');
    const authHeader = req.headers.get('authorization');
    if (!apiKey && !authHeader) return false;
    try {
        const h: Record<string, string> = {};
        if (apiKey) h['x-api-key'] = apiKey;
        if (authHeader) h['Authorization'] = authHeader;
        const res = await fetch(`${AGENT_URL}/api/system/health`, {
            headers: h,
            signal: AbortSignal.timeout(5000),
        });
        return res.ok;
    } catch {
        // Un agente inalcanzable nunca debe leerse como "admin confirmado".
        return false;
    }
}

// Sin handler de OPTIONS: esta ruta nunca tuvo un caller legítimo cross-origin
// (el widget de /ramp llama a `/api/etherfuse` como ruta relativa, mismo
// origen). Sin OPTIONS, Next.js responde 405 a un preflight — un sitio de
// terceros no puede completar un POST cross-origin contra esta ruta.

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action } = body;

        if (SANDBOX_ONLY_ACTIONS.has(action) && !IS_SANDBOX) {
            return NextResponse.json(
                { error: 'This demo only runs against the Etherfuse sandbox. To get real CETES, open your own account at Etherfuse.' },
                { status: 403 },
            );
        }

        // ── ONBOARDING ─────────────────────────────────────────────────────
        if (action === 'onboarding') {
            const { walletAddress } = body;
            const customerId = body.customerId || crypto.randomUUID();
            const bankAccountId = body.bankAccountId || crypto.randomUUID();

            const res = await fetch(`${BASE_URL}/ramp/onboarding-url`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ customerId, bankAccountId, publicKey: walletAddress, blockchain: 'stellar' })
            });

            const text = await res.text();
            let data: any;
            try { data = JSON.parse(text); } catch { data = text; }

            if (res.status === 409) {
                return NextResponse.json({
                    customerId,
                    bankAccountId,
                    alreadyRegistered: true,
                    presigned_url: data?.presigned_url || null,
                    kycDashboard: 'https://devnet.etherfuse.com'
                });
            }

            if (!res.ok) {
                console.error('[etherfuse] onboarding failed:', res.status, data);
                return NextResponse.json({ error: 'Onboarding failed', details: data }, { status: res.status });
            }

            return NextResponse.json({ ...data, customerId, bankAccountId });
        }

        // ── QUOTE ──────────────────────────────────────────────────────────
        if (action === 'quote') {
            const { amount, walletAddress, bondId = 'CETES', fiat = 'MXN' } = body;
            const quoteId = crypto.randomUUID();
            // Per Etherfuse docs: customerId = org UUID
            const customerId = await getOrgId();

            const quoteBody = {
                quoteId,
                customerId,
                blockchain: 'stellar',
                quoteAssets: {
                    type: 'onramp',
                    sourceAsset: fiat,
                    targetAsset: bondId === 'CETES' 
                        ? 'CETES:GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4' 
                        : bondId
                },
                sourceAmount: String(amount),
                walletAddress,
            };

            const res = await fetch(`${BASE_URL}/ramp/quote`, {
                method: 'POST',
                headers,
                body: JSON.stringify(quoteBody)
            });

            const text = await res.text();
            let data: any;
            try { data = JSON.parse(text); } catch { data = text; }

            if (!res.ok) {
                console.error('[etherfuse] quote failed:', res.status, data);
                return NextResponse.json({ error: 'Quote failed', details: data, status: res.status }, { status: res.status });
            }

            return NextResponse.json({ ...data, quoteId, customerId });
        }

        // ── ORDER ──────────────────────────────────────────────────────────
        if (action === 'order') {
            const { quoteId, walletAddress } = body;
            const orgId = await getOrgId();
            const orderId = crypto.randomUUID();

            // Register wallet under org → get walletId (409 = already exists, fetch from list)
            const walletRes = await fetch(`${BASE_URL}/ramp/wallet`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ customerId: orgId, publicKey: walletAddress, blockchain: 'stellar' })
            });
            const walletData = await walletRes.json().catch(() => ({})) as any;
            let cryptoWalletId = walletData?.walletId || walletData?.id || walletData?.cryptoWalletId;

            if (!cryptoWalletId) {
                // 21-nov-2026 (R2): antes era `GET /ramp/wallets?customerId=…&limit=50`. Según la doc
                // de Etherfuse (docs.etherfuse.com/api-reference/wallets/list-wallets), ese GET no
                // acepta filtros ni límite: devuelve solo la primera página (30). Todas las wallets
                // de los visitantes viven bajo la misma organización de pruebas, así que pasando de 30
                // una wallet ya registrada no aparecía (inferencia: no reproducido en el sandbox).
                // POST /ramp/wallets pagina con pageNumber/pageSize (máximo 100).
                console.warn('[etherfuse] register wallet returned no id:', { status: walletRes.status, body: walletData });
                const match = (w: any) => w?.publicKey === walletAddress || w?.address === walletAddress || w?.walletAddress === walletAddress;
                for (let pageNumber = 0; pageNumber < 50 && !cryptoWalletId; pageNumber++) {
                    const listRes = await fetch(`${BASE_URL}/ramp/wallets`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ pageNumber, pageSize: 100 }),
                    });
                    const listData = await listRes.json().catch(() => ({})) as any;
                    const wallets: any[] = listData?.items || listData?.wallets || [];
                    const found = wallets.find(match);
                    cryptoWalletId = found?.walletId || found?.id || found?.cryptoWalletId;
                    const totalPages = Number(listData?.totalPages);
                    if (!listRes.ok || wallets.length === 0 || (Number.isFinite(totalPages) && pageNumber + 1 >= totalPages)) {
                        if (!cryptoWalletId) console.warn('[etherfuse] wallet lookup ended without a match:', { status: listRes.status, pageNumber, totalPages: listData?.totalPages });
                        break;
                    }
                }
            }

            // Get first active bank account for the org
            const bankRes = await fetch(`${BASE_URL}/ramp/bank-accounts?limit=1`, { headers });
            const bankData = await bankRes.json().catch(() => ({})) as any;
            const bankAccountId = bankData?.items?.[0]?.bankAccountId || bankData?.items?.[0]?.id;

            if (!cryptoWalletId) {
                // El detalle técnico ya va al log de arriba; al usuario, un código que la página traduce.
                return NextResponse.json({ error: 'Could not resolve walletId for this address', code: 'WALLET_NOT_REGISTERED' }, { status: 400 });
            }

            console.log('[etherfuse] order payload:', { orderId, quoteId, cryptoWalletId, bankAccountId });

            const res = await fetch(`${BASE_URL}/ramp/order`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ orderId, quoteId, cryptoWalletId, bankAccountId })
            });

            const text = await res.text();
            let data: any;
            try { data = JSON.parse(text); } catch { data = text; }

            if (!res.ok) {
                console.error('[etherfuse] order failed:', res.status, JSON.stringify(data));
                // 409 = quoteId already used - tell the client to re-quote
                if (res.status === 409) {
                    return NextResponse.json({ error: 'Quote expired or already used. Please generate a new quote.', code: 'QUOTE_EXPIRED' }, { status: 409 });
                }
                return NextResponse.json({ error: typeof data?.message === 'string' ? data.message : 'Order failed', details: data }, { status: res.status });
            }

            return NextResponse.json({ ...data, orderId });
        }

        // ── SIMULATE FIAT ──────────────────────────────────────────────────
        if (action === 'simulate_fiat') {
            // Solo sandbox: marca una orden como "SPEI recibido" sin dinero real. El candado
            // general de arriba (SANDBOX_ONLY_ACTIONS) ya la cubre.
            const { orderId } = body;
            const res = await fetch(`${BASE_URL}/ramp/order/fiat_received`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ orderId })
            });
            if (!res.ok) {
                const err = await res.text();
                return NextResponse.json({ error: err }, { status: res.status });
            }
            return NextResponse.json({ success: true });
        }

        // ── DEBUG: LIST ORDERS ─────────────────────────────────────────────
        if (action === 'list_orders') {
            if (!(await requireAdmin(req))) {
                return NextResponse.json({ error: 'Admin permissions required' }, { status: 403 });
            }
            const res = await fetch(`${BASE_URL}/ramp/orders?limit=10`, { headers });
            const data = await res.json().catch(() => ({}));
            return NextResponse.json(data);
        }

        // Live price/TVL for the reference card on /ramp. Public endpoint, no
        // auth needed - but it MUST hit the same BASE_URL (sandbox today) the
        // rest of this route uses, not the production API: sandbox and
        // production report genuinely different numbers (verified live,
        // 26-ago-2026 - sandbox CETES price 1.142034 / TVL ~734M vs.
        // production 1.178212 / TVL ~87.9M), and quoting production while
        // orders execute against sandbox would just trade one mismatch for
        // another. Replaces a hardcoded snapshot that had drifted from both.
        if (action === 'lookup') {
            const { bondId = 'CETES' } = body;
            const res = await fetch(`${BASE_URL}/lookup/stablebonds`);
            const data = await res.json().catch(() => ({}));
            const bond = (data.stablebonds || []).find((b: any) => b.symbol === bondId);
            if (!bond) return NextResponse.json({ error: 'Bond not found in lookup response' }, { status: 502 });
            return NextResponse.json({
                symbol: bond.symbol,
                tokenPriceDecimal: bond.tokenPriceDecimal,
                netValueDecimal: bond.netValueDecimal,
                bondCurrency: bond.bondCurrency,
                calculatedAt: data.calculatedAt,
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
