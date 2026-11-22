import { ipfsGateways } from '@/lib/auditVerify';

// Server-side proxy for IPFS gateway reads. Public gateways don't send CORS
// headers, so a browser fetch() from nirium.xyz fails with "Failed to fetch".
//
// 21-nov-2026: returns the gateway's bytes exactly as received. It used to parse
// the JSON and serialize it again, so the browser could never recompute the CID
// and had to trust this server. Now /verify recomputes the CIDv0 of these bytes
// in the browser and compares it with the CID it asked for (lib/receiptCid.ts):
// if a gateway, or this server, serves a different document, the page says so.
//
// Tries each gateway in ipfsGateways() order (Filebase first - measured
// 0.6s vs Pinata's 7.3s for the same CID - then the configured gateway if
// any, then Pinata/ipfs.io/dweb.link) and moves to the next on a non-ok
// response OR a body that doesn't parse as JSON (some gateways answer 200
// with an HTML page instead of erroring).

const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function GET(request: Request) {
    const cid = new URL(request.url).searchParams.get('cid') || '';
    // CIDv0 (Qm...) and CIDv1 are alphanumeric - reject anything else (SSRF guard).
    if (!/^[a-zA-Z0-9]{40,80}$/.test(cid)) {
        return json({ error: 'invalid cid' }, 400);
    }

    let lastError = 'all gateways failed';
    for (const base of ipfsGateways()) {
        try {
            const res = await fetch(`${base}/ipfs/${cid}`, { signal: AbortSignal.timeout(6_000) });
            if (!res.ok) {
                lastError = `gateway ${res.status}`;
                continue;
            }
            const bytes = new Uint8Array(await res.arrayBuffer());
            try {
                JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
            } catch {
                lastError = 'gateway did not return JSON';
                continue;
            }
            return new Response(bytes, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Cache-Control': 'public, max-age=3600',
                },
            });
        } catch (e) {
            lastError = (e as Error)?.message || 'gateway fetch failed';
        }
    }
    return json({ error: lastError }, 502);
}
