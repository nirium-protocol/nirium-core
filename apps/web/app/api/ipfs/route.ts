import { NextResponse } from 'next/server';
import { ipfsGateways } from '@/lib/auditVerify';

// Server-side proxy for IPFS gateway reads. Public gateways don't send CORS
// headers, so a browser fetch() from nirium.xyz fails with "Failed to fetch".
// Fetching here (server-side) and returning the JSON sidesteps CORS and lets
// the page render the full audit record inline.
//
// Tries each gateway in ipfsGateways() order (Filebase first - measured
// 0.6s vs Pinata's 7.3s for the same CID - then the configured gateway if
// any, then Pinata/ipfs.io/dweb.link) and moves to the next on a non-ok
// response OR a body that doesn't parse as JSON (some gateways answer 200
// with an HTML page instead of erroring).

export async function GET(request: Request) {
    const cid = new URL(request.url).searchParams.get('cid') || '';
    // CIDv0 (Qm...) and CIDv1 are alphanumeric - reject anything else (SSRF guard).
    if (!/^[a-zA-Z0-9]{40,80}$/.test(cid)) {
        return NextResponse.json({ error: 'invalid cid' }, { status: 400 });
    }

    let lastError = 'all gateways failed';
    for (const base of ipfsGateways()) {
        try {
            const res = await fetch(`${base}/ipfs/${cid}`, { signal: AbortSignal.timeout(6_000) });
            if (!res.ok) {
                lastError = `gateway ${res.status}`;
                continue;
            }
            let data: unknown;
            try {
                data = await res.json();
            } catch {
                lastError = 'gateway did not return JSON';
                continue;
            }
            return NextResponse.json(data, {
                status: 200,
                headers: { 'Cache-Control': 'public, max-age=3600' },
            });
        } catch (e) {
            lastError = (e as Error)?.message || 'gateway fetch failed';
        }
    }
    return NextResponse.json({ error: lastError }, { status: 502 });
}
