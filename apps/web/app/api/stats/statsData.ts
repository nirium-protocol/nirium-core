// Shared aggregation for /api/stats and the server-rendered /stats page, so
// the numbers that end up archived (Wayback Machine, our own daily snapshot)
// are already in the page's initial HTML instead of a client-only fetch that
// a non-JS crawler never sees.

// ═══════════════════════════════════════════════════════════════
// Nirium - Public usage stats, aggregated server-side
// ═══════════════════════════════════════════════════════════════
//
// Every number here is fetched live from a third-party source at request
// time (Horizon, npm registry, PyPI stats, GitHub) - nothing is hardcoded
// or updated by hand. This route exists to avoid CORS issues (PyPI/GitHub
// don't send Access-Control-Allow-Origin) and to keep GitHub's low search
// rate limit (10 req/min unauthenticated) off real visitor traffic via
// `revalidate` below, not to hide or reshape the source data.
//
// Each field's `source` is the exact URL a human can open to re-derive
// that same number independently.
// ═══════════════════════════════════════════════════════════════

const HORIZON = 'https://horizon.stellar.org';

// Mainnet accounts - see AGENTS.md / fly.mainnet.toml.
const X402_MAINNET_ACCOUNT = 'GCLBBPON256CV7ATEHM5B54BOKNC7GX53MBINJ42MHVXGDMMZ3ZWKBHP'; // X402_PAY_TO_ADDRESS / STELLAR_RECIPIENT
const REBALANCE_MANAGER_MAINNET = 'GCEAC7KKHLSPNHEO3N662N57ABRQZQ7QDVIZWQSQAUJZDMHU6ZEH7MNI';

// Known PAYER accounts (the real "from" on the USDC transfer, not the
// tx's source_account - x402 routes every payment through a fresh
// per-transaction facilitator channel account, so source_account is never
// the payer; it has to be read from asset_balance_changes[].from).
//
// Classification rule, learned the hard way: who CREATED or FUNDED a wallet
// says nothing about who holds its key. GA5WN2JB… was first labeled
// "internal" only because a wallet we control created it; the operator
// then confirmed in public (OZ#47) that it is their own buyer wallet. A wallet
// is "internal" only with positive proof we hold the key (public key
// re-derived locally, or the owner told us so); "external" needs the owner's
// own public statement. Anything unknown defaults to external - never
// silently hidden. Funding origin is disclosed either way.
// 'integration-test' = a third party's own wallet, used to test the integration
// (coordinated with us, funded by us at the start). It is NOT organic adoption,
// so it never feeds the "external payers" count; it is listed apart with dates.
// 'campaign' = a participant's own wallet that paid during Niriumtober to earn
// a badge. Real paid use, but incentivized: it never feeds the "external
// payers" count either, and is shown apart. Each entry is added by hand from
// an approved evidence issue (label `niriumtober` in nirium-protocol/nirium),
// never inferred from timing.
type PayerKind = 'internal' | 'external' | 'integration-test' | 'campaign';
const NIRIUMTOBER_PAYERS: Record<string, { evidenceUrl: string }> = {};
const KNOWN_PAYERS: Record<string, { kind: PayerKind; label: string; shortName: string; note: string; evidenceUrl?: string }> = {
    GAQPWCSBHQNBHR6XXAO2F3MNZIKWPDHCKNU5IEQ6PX6YEIUNNGWE252E: {
        kind: 'internal',
        label: 'Nirium test wallet',
        shortName: 'Nirium',
        note: 'Public key independently re-derived from the private key we hold.',
    },
    GCHKVQU5X7UCNO2Q5DM37I2EXAKRVANXY2Z2CJIY53T4XPDEXM6ZOFM3: {
        kind: 'internal',
        label: 'Nirium test of the Pollar login flow',
        shortName: 'Nirium',
        note: 'Wallet created through our Pollar app; its reserve sponsor was funded from a wallet we control.',
    },
    GA5WN2JBYTPARINB7YCAVGBHPV65475GY37DN7VDKU2VXYSY6MQAIUA3: {
        kind: 'integration-test',
        label: 'AgentLedger (@fernando-mendoza)',
        shortName: 'AgentLedger',
        note: "Integration tests by AgentLedger - the operator identified these settlements as theirs, in public, on OpenZeppelin/relayer-plugin-x402-facilitator#47. Wallet initially funded by Nirium's founder. AgentLedger was an independent third party when these settlements happened (Aug-Sep 2026); its founder, Fer, also joined Nirium part-time in October 2026.",
        evidenceUrl: 'https://github.com/OpenZeppelin/relayer-plugin-x402-facilitator/issues/47#issuecomment-5644298533',
    },
};

// Explicit allowlist of external merged PRs, each hand-verified to be
// genuinely Nirium-related (not a sibling project under the same shared
// GitHub identity - Eras256/M0nsxx also work on Periplo, Prova, Contextio,
// Vouch402, etc., see reference_shared_identity_attribution_method).
//
// A live `author:Eras256 is:pr is:merged` GitHub search was tried first and
// rejected: alongside real Nirium PRs it returned x402-foundation/x402#3336
// and #3228 (Periplo's), stellar-dev-skill#98/#101/#102 (Contextio's), and
// wevm/viem#5083 (unrelated) - repo proximity under a shared identity is not
// evidence of ownership. Each entry below was independently confirmed
// against project memory before being added; add new ones the same way,
// never from a raw search result.
const EXTERNAL_MERGED_PRS: Array<{ owner: string; repo: string; number: number }> = [
    { owner: 'stellar', repo: 'stellar-dev-skill', number: 96 },
    { owner: 'stellar', repo: 'stellar-dev-skill', number: 97 },
    { owner: 'stellar', repo: 'stellar-mpp-sdk', number: 69 },
    { owner: 'pollar-xyz', repo: 'pollar-apps', number: 30 },
    { owner: 'Trustless-Work', repo: 'agentic-escrow-research', number: 1 },
    { owner: 'Trustless-Work', repo: 'agentic-escrow-research', number: 2 },
    { owner: 'Trustless-Work', repo: 'agentic-escrow-research', number: 3 },
    { owner: 'Trustless-Work', repo: 'agentic-escrow-research', number: 4 },
    { owner: 'Trustless-Work', repo: 'agentic-escrow-research', number: 9 },
    // #10-#13 mergeados 4/5-nov-2026 por techrebelgit (Trustless Work); confirmado
    // el 9-nov que los cuatro son notas de Nirium: #10 piloto de liberación con
    // evidencia, #11 liveness del firmante de Treasury, #12 (M0nsxx) hook antes de
    // firmar, #13 (M0nsxx) x402 vs MPP Charge en el mismo endpoint.
    { owner: 'Trustless-Work', repo: 'agentic-escrow-research', number: 10 },
    { owner: 'Trustless-Work', repo: 'agentic-escrow-research', number: 11 },
    { owner: 'Trustless-Work', repo: 'agentic-escrow-research', number: 12 },
    { owner: 'Trustless-Work', repo: 'agentic-escrow-research', number: 13 },
    { owner: 'stellar', repo: 'stellar-dev-skill', number: 150 },
];

// "Built with Nirium" - third parties selling their own API over x402 via
// x402Serve(), verified independently of us. Add an entry only after
// confirming the endpoint really 402s and the source really imports
// x402Serve() at the cited lines - never from a claim alone.
const BUILT_WITH_NIRIUM: Array<{
    githubUser: string;
    endpoint: string;
    repo: string;
    packageJsonPath: string;
    sourceRefs: Array<{ label: string; path: string; lines: string }>;
    commitSha: string;
}> = [
    {
        githubUser: 'Edgadafi',
        endpoint: 'https://remesa-tia-backend.vercel.app/premium/fx',
        repo: 'Edgadafi/remesa-liquidez',
        packageJsonPath: 'backend/package.json',
        sourceRefs: [
            { label: 'x402Serve() on /premium', path: 'backend/src/app.ts', lines: 'L165' },
            { label: 'x402Serve() on /v1', path: 'backend/src/app.ts', lines: 'L178' },
        ],
        // 12-nov-2026: antes 1e0cbd5 (nirium 0.11.0). Su main de hoy usa nirium 0.16.0.
        commitSha: 'bb9d14b53c37b0662697a8a4c8a4c9c62826764a',
    },
];

async function getBuiltWithNirium() {
    return Promise.all(
        BUILT_WITH_NIRIUM.map(async (entry) => {
            const [endpointResult, pkgResult, settlementsResult] = await Promise.all([
                (async () => {
                    try {
                        const r = await fetch(entry.endpoint, { signal: AbortSignal.timeout(8000) });
                        return { checked: true, is402: r.status === 402, status: r.status };
                    } catch (e: any) {
                        return { checked: false, is402: false, status: null, error: String(e?.message ?? e) };
                    }
                })(),
                (async () => {
                    try {
                        const r = await fetch(
                            `https://raw.githubusercontent.com/${entry.repo}/${entry.commitSha}/${entry.packageJsonPath}`,
                            { signal: AbortSignal.timeout(8000) },
                        );
                        if (!r.ok) return { checked: true, dependsOnNirium: false, version: null };
                        const j = await r.json();
                        const version = j?.dependencies?.nirium ?? null;
                        return { checked: true, dependsOnNirium: !!version, version };
                    } catch (e: any) {
                        return { checked: false, dependsOnNirium: false, version: null, error: String(e?.message ?? e) };
                    }
                })(),
                (async () => {
                    const g = await guarded(`settle:${entry.endpoint}`, async () => {
                    // Read payTo straight from the endpoint's own live 402
                    // challenge (payment-required header) rather than trusting
                    // an env var or a claim - this is the one field we can
                    // verify independently of anything the operator told us.
                        const r = await fetch(entry.endpoint, { signal: AbortSignal.timeout(8000) });
                        const header = r.headers.get('payment-required');
                        if (!header) return { checked: true, payTo: null as string | null, count: null as number | null, source: undefined as string | undefined };
                        const decoded = JSON.parse(Buffer.from(header, 'base64').toString('utf8'));
                        const payTo = decoded?.accepts?.[0]?.payTo as string | undefined;
                        if (!payTo) return { checked: true, payTo: null as string | null, count: null as number | null, source: undefined as string | undefined };
                        const ops = await fetchAllOps(payTo);
                        // A real x402 payment is never submitted by payTo itself - per the
                        // comment above, x402 routes every payment through a fresh
                        // per-transaction facilitator channel account as source_account.
                        // An op where source_account === payTo is payTo moving its own
                        // balance (e.g. an XLM->USDC swap), not an incoming settlement -
                        // found live, 2026-10-07: tx 377e5f66... on this exact payTo.
                        const count = ops.filter((o) => o.type === 'invoke_host_function' && o.source_account !== payTo && (o.asset_balance_changes ?? []).some((c) => c.to === payTo && isMainnetUsdc(c))).length;
                        return {
                            checked: true,
                            payTo,
                            count,
                            source: `${HORIZON}/accounts/${payTo}/operations`,
                        };
                    }, (v) => v.count !== null);
                    if (g.value) return { ...g.value, freshness: g.freshness };
                    return { checked: false, payTo: null, count: null, freshness: g.freshness, error: g.freshness.error };
                })(),
            ]);
            return {
                githubUser: entry.githubUser,
                endpoint: entry.endpoint,
                repoUrl: `https://github.com/${entry.repo}`,
                packageJsonUrl: `https://github.com/${entry.repo}/blob/${entry.commitSha}/${entry.packageJsonPath}`,
                sourceRefs: entry.sourceRefs.map((s) => ({
                    label: s.label,
                    url: `https://github.com/${entry.repo}/blob/${entry.commitSha}/${s.path}#${s.lines}`,
                })),
                checks: { endpoint: endpointResult, packageJson: pkgResult },
                settlements: settlementsResult,
            };
        }),
    );
}


// Last good value per third-party source, so a source that fails at the
// wrong moment never leaves a hole or, worse, a number without a date. Kept
// in module memory: it survives while the serverless instance is warm (the
// 5-minute revalidation keeps it so) but NOT a cold start; if the source is
// down and this instance has no earlier read, the card says so instead of
// inventing a value.
type Freshness = { status: 'live' | 'stale' | 'unavailable'; asOf: string | null; error: string | null };
const LAST_GOOD = new Map<string, { value: unknown; at: string }>();

async function guarded<T>(key: string, fn: () => Promise<T>, isOk: (v: T) => boolean = () => true, reuseMs = 0): Promise<{ value: T | null; freshness: Freshness }> {
    // reuseMs: for rate-limited sources, a good read younger than this is reused
    // without calling the source again; its asOf is the real read time.
    const cached = LAST_GOOD.get(key);
    if (reuseMs > 0 && cached && Date.now() - Date.parse(cached.at) < reuseMs) {
        return { value: cached.value as T, freshness: { status: 'live', asOf: cached.at, error: null } };
    }
    let error: string | null = null;
    try {
        const v = await fn();
        if (isOk(v)) {
            const at = new Date().toISOString();
            LAST_GOOD.set(key, { value: v, at });
            return { value: v, freshness: { status: 'live', asOf: at, error: null } };
        }
        error = 'source answered incompletely';
    } catch (e: any) {
        error = String(e?.message ?? e).slice(0, 160);
    }
    const prev = LAST_GOOD.get(key);
    if (prev) return { value: prev.value as T, freshness: { status: 'stale', asOf: prev.at, error } };
    return { value: null, freshness: { status: 'unavailable', asOf: null, error } };
}

// GitHub REST, unauthenticated: 60 req/hour per IP. Every GitHub-backed list
// below goes through the Next data cache for an hour so a busy page can't burn
// that budget, and a failed/rate-limited call is REPORTED (never silently
// dropped, which would shrink a count without saying so).
async function ghJson(url: string): Promise<{ ok: true; data: any } | { ok: false; status: number | null }> {
    try {
        const r = await fetch(url, {
            headers: { Accept: 'application/vnd.github+json' },
            signal: AbortSignal.timeout(10000),
            next: { revalidate: 3600 },
        });
        if (!r.ok) return { ok: false, status: r.status };
        return { ok: true, data: await r.json() };
    } catch {
        return { ok: false, status: null };
    }
}

// Soroban ScVal Symbol XDR (base64) -> string. Enough to read the invoked
// function name off a Horizon operation without pulling in the full SDK.
function decodeScSymbol(b64: string | undefined): string | null {
    try {
        if (!b64) return null;
        const buf = Buffer.from(b64, 'base64');
        if (buf.readUInt32BE(0) !== 15) return null; // SCV_SYMBOL
        const len = buf.readUInt32BE(4);
        return buf.subarray(8, 8 + len).toString('utf8');
    } catch {
        return null;
    }
}

// Signers we control (positively proven: key held by us). A contract-mediated
// transfer signed by one of these is labelled an internal test.
// Wallets funded/held by Nirium's founder, used only to word the funding
// origin of an external payer's wallet ("funded by Nirium's founder"). The
// funder address itself is read live from Horizon (create_account), never typed.
const NIRIUM_FOUNDER_WALLETS = new Set([
    'GDCOXLT4TWKJEUQWBIU3D5RDSRE2A6XY76JUR4TZXXLHJITDKYKACTGS', // Lobstr self-custody wallet
]);

const KNOWN_INTERNAL_SIGNERS = new Set([
    'GDODE5YKUXHVLEZUVZAKAJTXNWW45WHJUHTWU7AEUIFIPHMGTUIWRU5O', // Trustless Work deploy/release signer
]);

type HorizonOp = {
    type: string;
    source_account?: string;
    transaction_hash: string;
    created_at: string;
    asset_balance_changes?: Array<{ type: string; from?: string; to?: string; amount?: string; asset_code?: string; asset_issuer?: string }>;
    parameters?: Array<{ type: string; value: string }>;
    funder?: string;
    starting_balance?: string;
};

// Circle's mainnet USDC. A "settlement" only counts if it is a transfer of THIS
// asset landing on the receiving account - a 100 XLM top-up from a contract
// (how a seller's account can get funded) is not a payment.
const USDC_MAINNET_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
const isMainnetUsdc = (c: { asset_code?: string; asset_issuer?: string }) => c.asset_code === 'USDC' && c.asset_issuer === USDC_MAINNET_ISSUER;

async function fetchAllOps(account: string): Promise<HorizonOp[]> {
    const out: HorizonOp[] = [];
    let url = `${HORIZON}/accounts/${account}/operations?order=asc&limit=200`;
    for (let page = 0; page < 10 && url; page++) {
        const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
        // A failed page must fail the whole read, so the caller can fall back to
        // its last good value; returning what we have would show a wrong count.
        if (!r.ok) throw new Error(`Horizon answered HTTP ${r.status}`);
        const j = await r.json();
        const records: any[] = j?._embedded?.records ?? [];
        out.push(...records);
        const next = j?._links?.next?.href as string | undefined;
        if (!next || records.length === 0) return out;
        url = next;
    }
    throw new Error('Horizon history too long for the 10-page read; refusing to report a truncated count');
}

// Public ledger of a third party whose wallet appears as an integration test.
// Read live, never restated: the settlement entry (by on-chain tx hash), and
// whether the ledger's own preceding control entry says Nirium asked for it.
const INTEGRATION_LEDGERS: Record<string, { page: string; api: string }> = {
    GA5WN2JBYTPARINB7YCAVGBHPV65475GY37DN7VDKU2VXYSY6MQAIUA3: {
        page: 'https://agentpayments.fi/ledger',
        api: 'https://agentpayments.fi/api/x402/ledger',
    },
};

async function getLedgerEvidence(address: string, hashes: string[]) {
    const src = INTEGRATION_LEDGERS[address];
    if (!src) return null;
    const g = await guarded(`ledger:${address}`, () => readLedger(address, hashes, src), (r) => r.ok === true);
    if (g.value) return { ...g.value, freshness: g.freshness };
    return { pageUrl: src.page, apiUrl: src.api, ok: false as const, status: null as number | null, freshness: g.freshness };
}

async function readLedger(address: string, hashes: string[], src: { page: string; api: string }) {
    try {
        const res = await fetch(src.api, { signal: AbortSignal.timeout(15000), next: { revalidate: 300 } });
        if (!res.ok) return { pageUrl: src.page, apiUrl: src.api, ok: false as const, status: res.status };
        const j = await res.json();
        const entries: any[] = Array.isArray(j.entries) ? j.entries : [];
        const found = entries
            .filter((e) => e.kind === 'settlement' && hashes.includes(e.txHash))
            .map((e) => {
                const ask = entries
                    .filter((c) => c.kind === 'control' && c.resource === e.resource && c.seq < e.seq)
                    .sort((a, b) => b.seq - a.seq)[0];
                return {
                    txHash: e.txHash as string,
                    seq: e.seq as number,
                    at: e.ts as string,
                    resource: e.resource as string,
                    httpStatus: (e.httpStatus ?? null) as number | null,
                    verdict: e.verdict as string,
                    amountUsdc: Number(e.amount),
                    network: e.network as string,
                    requestedByNirium: !!ask && /nirium/i.test(String(ask.reason ?? '')),
                };
            });
        return {
            pageUrl: src.page,
            apiUrl: src.api,
            ok: true as const,
            chainVerified: j.integrity?.ok === true,
            entriesRead: entries.length,
            found,
        };
    } catch (e) {
        return { pageUrl: src.page, apiUrl: src.api, ok: false as const, status: null as number | null };
    }
}

async function getX402Settlements() {
    const ops = await fetchAllOps(X402_MAINNET_ACCOUNT);
    const invocations = ops.filter((o) => o.type === 'invoke_host_function');

    // x402 "exact" settlements are USDC transfers whose payer (`from`) is a
    // classic G-account. A transfer whose `from` is a CONTRACT address (C...)
    // - e.g. a Trustless Work escrow releasing a milestone - is not an x402
    // payment, so it is EXCLUDED from the x402 count (not merely labelled)
    // and reported under escrowReleases. Amount and payer are read from the
    // transfer that lands on X402_MAINNET_ACCOUNT, not from index [0]: an
    // escrow release also emits a fee transfer to the escrow provider, and
    // that one can come first.
    const byPayer = new Map<string, { count: number; firstAt: string; lastAt: string; usdc: number; hashes: string[] }>();
    const escrowReleases: Array<{
        hash: string; at: string; contract: string; fn: string | null; signer: string | undefined;
        toReceiverUsdc: number; feeUsdc: number; totalUsdc: number; internal: boolean;
    }> = [];
    for (const op of invocations) {
        const changes = op.asset_balance_changes ?? [];
        const toUs = changes.find((c) => c.to === X402_MAINNET_ACCOUNT && isMainnetUsdc(c));
        const payer = toUs?.from;
        if (!toUs || !payer) continue;

        if (payer.startsWith('C')) {
            const receiver = Number(toUs.amount ?? 0);
            const fee = changes.filter((c) => c.from === payer && c.to !== X402_MAINNET_ACCOUNT).reduce((t, c) => t + Number(c.amount ?? 0), 0);
            escrowReleases.push({
                hash: op.transaction_hash,
                at: op.created_at,
                contract: payer,
                fn: decodeScSymbol(op.parameters?.[1]?.value),
                signer: op.source_account,
                toReceiverUsdc: Number(receiver.toFixed(7)),
                feeUsdc: Number(fee.toFixed(7)),
                totalUsdc: Number((receiver + fee).toFixed(7)),
                internal: !!op.source_account && KNOWN_INTERNAL_SIGNERS.has(op.source_account),
            });
            continue;
        }

        const amount = Number(toUs.amount ?? 0);
        const existing = byPayer.get(payer);
        if (existing) {
            existing.count += 1;
            existing.lastAt = op.created_at;
            existing.usdc += amount;
            existing.hashes.push(op.transaction_hash);
        } else {
            byPayer.set(payer, { count: 1, firstAt: op.created_at, lastAt: op.created_at, usdc: amount, hashes: [op.transaction_hash] });
        }
    }

    // Funding origin of every EXTERNAL payer's wallet, read live from Horizon:
    // who created the account and with how much, and whether the wallet's own
    // key signed a swap into USDC. Who funds a wallet is not proof of who
    // holds its key, so this is disclosed next to the count, never hidden.
    const fundingOf = async (address: string) => {
        try {
            const opsOfPayer = await fetchAllOps(address);
            const created = opsOfPayer.find((o) => o.type === 'create_account');
            if (!created?.funder) return null;
            return {
                funder: created.funder,
                funderIsNirium: NIRIUM_FOUNDER_WALLETS.has(created.funder),
                startingBalanceXlm: Number(created.starting_balance ?? 0),
                ownSwapToUsdc: opsOfPayer.some((o) => o.type.startsWith('path_payment') && o.source_account === address),
            };
        } catch {
            return null;
        }
    };

    const payers = await Promise.all(
        [...byPayer.entries()].map(async ([address, stats]) => {
            const campaign = NIRIUMTOBER_PAYERS[address];
            const known = KNOWN_PAYERS[address] ?? (campaign && {
                kind: 'campaign' as const,
                label: 'Niriumtober participant',
                shortName: 'Niriumtober',
                note: 'Paid during the Niriumtober sprint to earn a badge, with its own funds. Counted apart from external payers.',
                evidenceUrl: campaign.evidenceUrl,
            });
            const kind: PayerKind = known?.kind ?? 'external';
            return {
                address,
                count: stats.count,
                firstAt: stats.firstAt,
                lastAt: stats.lastAt,
                // USDC per payer is shown for our own wallets only. For any
                // non-internal payer this page reports a NUMBER OF SETTLEMENTS,
                // never an amount, so it can't be read as external revenue.
                totalUsdc: kind === 'internal' ? Number(stats.usdc.toFixed(7)) : null,
                hashes: stats.hashes,
                kind,
                label: known?.label ?? null,
                shortName: known?.shortName ?? null,
                note: known?.note ?? 'Not matched to any wallet we control - counted as external, unverified identity.',
                evidenceUrl: known?.evidenceUrl ?? null,
                funding: kind !== 'internal' ? await fundingOf(address) : null,
            };
        }),
    );
    payers.sort((a, b) => b.count - a.count);

    const externalPayers = payers.filter((p) => p.kind === 'external');
    const integrationTests = payers.filter((p) => p.kind === 'integration-test');
    const ledgers = await Promise.all(integrationTests.map((p) => getLedgerEvidence(p.address, p.hashes)));
    const totalSettlements = payers.reduce((t, p) => t + p.count, 0);
    const externalSettlements = externalPayers.reduce((t, p) => t + p.count, 0);
    const campaignPayers = payers.filter((p) => p.kind === 'campaign');

    return {
        totalSettlements,
        distinctPayers: payers.length,
        externalPayerCount: externalPayers.length,
        externalSettlements,
        campaignPayerCount: campaignPayers.length,
        campaignSettlements: campaignPayers.reduce((t, p) => t + p.count, 0),
        integrationTests: integrationTests.map((p, i) => ({
            ledger: ledgers[i],
            address: p.address,
            shortName: p.shortName,
            note: p.note,
            count: p.count,
            firstAt: p.firstAt,
            lastAt: p.lastAt,
            hashes: p.hashes,
            funding: p.funding,
        })),
        payers,
        escrowReleases,
        firstAt: payers.length ? payers.map((p) => p.firstAt).sort()[0] : null,
        lastAt: payers.length ? payers.map((p) => p.lastAt).sort().slice(-1)[0] : null,
        source: `${HORIZON}/accounts/${X402_MAINNET_ACCOUNT}/operations`,
        explorer: `https://stellar.expert/explorer/public/account/${X402_MAINNET_ACCOUNT}`,
    };
}

async function getTreasuryRebalances() {
    const ops = await fetchAllOps(REBALANCE_MANAGER_MAINNET);
    // Only invocations the RebalanceManager itself SENT - this account also
    // receives unrelated Stellar spam ("payment" ops with promo memos from
    // random accounts), which must never be counted as rebalances.
    const own = ops.filter(
        (o) => o.type === 'invoke_host_function' && o.source_account === REBALANCE_MANAGER_MAINNET,
    );
    return {
        total: own.length,
        lastAt: own[own.length - 1]?.created_at ?? null,
        source: `${HORIZON}/accounts/${REBALANCE_MANAGER_MAINNET}/operations`,
        explorer: `https://stellar.expert/explorer/public/account/${REBALANCE_MANAGER_MAINNET}`,
    };
}

// Every npm package we publish, in display order. The /stats cards and the
// freshness map both come from this list, so a new package is one edit here.
const NPM_PACKAGES = ['nirium', 'nirium-mcp', 'nirium-cli', 'nirium-pollar-adapter'] as const;

async function getNpmDownloads(pkg: string) {
    try {
        const r = await fetch(`https://api.npmjs.org/downloads/point/last-year/${pkg}`, {
            signal: AbortSignal.timeout(8000),
        });
        if (!r.ok) return { package: pkg, downloads: null, source: `https://www.npmjs.com/package/${pkg}` };
        const j = await r.json();
        return {
            package: pkg,
            downloads: typeof j.downloads === 'number' ? j.downloads : null,
            source: `https://api.npmjs.org/downloads/point/last-year/${pkg}`,
            npmUrl: `https://www.npmjs.com/package/${pkg}`,
        };
    } catch {
        return { package: pkg, downloads: null, source: `https://www.npmjs.com/package/${pkg}` };
    }
}

async function getPypiDownloads() {
    // Total downloads without mirrors (pypistats' own default), summed from the
    // daily series. pypistats only keeps ~180 days, so the sum is the true
    // all-time total only while the series still starts on or before the
    // package's first upload (read live from pypi.org); once it no longer does,
    // `fullHistory` is false and the card says "last 180 days" instead of
    // claiming a total. Not in the Next data cache on purpose (it would pin a
    // 429); the route cache and the last-good fallback cover the rate limit. A
    // failure THROWS so the caller reports the real HTTP status.
    // Sin `cache: 'no-store'` a proposito: en Next 15 un solo fetch no-store
    // vuelve dinamica TODA la ruta, anulaba `revalidate = 300` de /stats y cada
    // visita esperaba ~12 llamadas externas en vivo (4-5 s, medido 10-oct-2026).
    // Sin opcion de cache el fetch tampoco entra al data cache (default de
    // Next 15), asi que la intencion de arriba se mantiene.
    const ua = { 'User-Agent': 'nirium-stats/1.0 (+https://nirium.xyz/stats)' };
    const [stats, meta] = await Promise.all([
        fetch('https://pypistats.org/api/packages/nirium/overall', { headers: ua, signal: AbortSignal.timeout(8000) }),
        fetch('https://pypi.org/pypi/nirium/json', { headers: ua, signal: AbortSignal.timeout(8000) }),
    ]);
    if (!stats.ok) throw new Error(`pypistats answered HTTP ${stats.status}`);
    if (!meta.ok) throw new Error(`pypi.org answered HTTP ${meta.status}`);
    const rows: { category: string; date: string; downloads: number }[] = (await stats.json())?.data ?? [];
    const own = rows.filter((r) => r.category === 'without_mirrors');
    if (own.length === 0) throw new Error('pypistats returned no series');
    const releases = Object.values((await meta.json())?.releases ?? {}) as { upload_time: string }[][];
    const uploads = releases.flatMap((files) => files.map((f) => f.upload_time)).sort();
    const firstUpload = uploads[0]?.slice(0, 10) ?? null;
    const since = own.map((r) => r.date).sort()[0];
    return {
        total: own.reduce((t, r) => t + r.downloads, 0),
        since,
        firstUpload,
        fullHistory: firstUpload !== null && since <= firstUpload,
        days: own.length,
        source: 'https://pypistats.org/api/packages/nirium/overall',
        humanUrl: 'https://pypistats.org/packages/nirium',
    };
}

async function getExternalMergedPRs() {
    const results = await Promise.all(
        EXTERNAL_MERGED_PRS.map(async ({ owner, repo, number }) => {
            const r = await ghJson(`https://api.github.com/repos/${owner}/${repo}/pulls/${number}`);
            if (!r.ok) return { failed: true as const };
            const j = r.data;
            if (!j.merged) return { failed: false as const, item: null }; // re-verified; dropped if ever unmerged
            return {
                failed: false as const,
                item: {
                    title: j.title as string,
                    url: j.html_url as string,
                    repo: `${owner}/${repo}`,
                    number,
                    mergedAt: j.merged_at as string,
                    mergedBy: j.merged_by?.login as string | undefined,
                },
            };
        }),
    );
    const items = results
        .flatMap((x) => (x.failed || !x.item ? [] : [x.item]))
        .sort((a, b) => (a.mergedAt < b.mergedAt ? 1 : -1));
    const unavailable = results.filter((x) => x.failed).length;
    return { count: items.length, items, unavailable, source: 'https://api.github.com/repos/{owner}/{repo}/pulls/{number}' };
}

// Community contributions to OUR repos (nirium-protocol/*), from the GitHub
// API, live. The team is excluded by handle (Eras256, M0nsxx) and bots by
// account type. These are merged PRs from external contributors in GrantFox
// campaigns - NOT organic adoption, so they never feed "external payers" or
// "Built with Nirium". No bounty amounts are read or shown, and nothing here
// says whether any bounty was settled: that is decided by GrantFox after each
// campaign and cannot be verified from GitHub.
const GH_ORG = 'nirium-protocol';
const TEAM_HANDLES = new Set(['eras256', 'm0nsxx']);
// Joined the team mid-stream. PRs from before the join date are genuine
// community contributions made while the author was still external, and
// still count; PRs from the join date onward don't - adding the handle to
// TEAM_HANDLES outright would have retroactively erased that real pre-join
// history (there isn't any for this one yet, but the mechanism has to be
// date-aware to not do that the next time it matters).
const TEAM_JOIN_DATES: Record<string, string> = {
    'fernando-mendoza': '2026-10-15', // Fer, AgentLedger founder - joined Nirium part-time
};

async function getCommunityContributions() {
    const reposRes = await ghJson(`https://api.github.com/orgs/${GH_ORG}/repos?per_page=100`);
    if (!reposRes.ok) {
        return { available: false as const, status: reposRes.status, source: `https://api.github.com/orgs/${GH_ORG}/repos` };
    }
    const repos: string[] = (reposRes.data as any[]).filter((r) => !r.private && !r.archived).map((r) => r.name as string);

    let failures = 0;
    const pages = async (path: string) => {
        const all: any[] = [];
        for (let page = 1; page <= 3; page++) {
            const r = await ghJson(`https://api.github.com/repos/${GH_ORG}/${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
            if (!r.ok) { failures++; break; }
            all.push(...(r.data as any[]));
            if ((r.data as any[]).length < 100) break;
        }
        return all;
    };
    const isCommunity = (u: any, at: string) => {
        if (!u || u.type !== 'User') return false;
        const login = String(u.login).toLowerCase();
        if (TEAM_HANDLES.has(login)) return false;
        const joinDate = TEAM_JOIN_DATES[login];
        if (joinDate && at >= joinDate) return false;
        return true;
    };

    const perRepo = await Promise.all(
        repos.map(async (repo) => {
            const [pulls, issues, labels] = await Promise.all([
                pages(`${repo}/pulls?state=closed`),
                pages(`${repo}/issues?state=all`),
                pages(`${repo}/labels`),
            ]);
            const grantfoxIssueList = issues.filter((i) => !i.pull_request && (i.labels ?? []).some((l: any) => l.name === 'GrantFox OSS'));
            const grantfoxIssues = new Set<number>(grantfoxIssueList.map((i) => i.number as number));
            // Campaign of each bounty issue, from its own labels. Bare
            // "Official Campaign" = the first campaign; "Official Campaign | X"
            // and a bare "Third Campaign" label both name campaign X. An issue
            // reposted into a later campaign can carry more than one.
            const campaignsOf = (i: any): string[] => {
                const names = new Set<string>();
                for (const l of i.labels ?? []) {
                    const n = String(l.name);
                    if (n === 'Official Campaign') names.add('Official Campaign');
                    else if (/^Official Campaign \| /.test(n)) names.add(n.replace(/^Official Campaign \| /, ''));
                    else if (n === 'Third Campaign') names.add('Third Campaign');
                }
                return [...names];
            };
            const bountyByCampaign: Record<string, number> = {};
            for (const i of grantfoxIssueList) for (const c of campaignsOf(i)) bountyByCampaign[c] = (bountyByCampaign[c] ?? 0) + 1;
            const bountyIssueTotal = grantfoxIssueList.length;
            const mergedPRs = pulls
                .filter((p) => p.merged_at && isCommunity(p.user, p.merged_at))
                .map((p) => {
                    const refs = new Set<number>([...`${p.title} ${p.body ?? ''}`.matchAll(/(?:#|\/issues\/)(\d+)/g)].map((m) => Number(m[1])));
                    return {
                        repo: `${GH_ORG}/${repo}`,
                        number: p.number as number,
                        title: p.title as string,
                        url: p.html_url as string,
                        author: p.user.login as string,
                        mergedAt: p.merged_at as string,
                        linkedToGrantfoxIssue: [...refs].some((n) => grantfoxIssues.has(n)),
                    };
                });
            const closedIssues = issues
                .filter((i) => !i.pull_request && i.state === 'closed' && i.state_reason === 'completed' && isCommunity(i.user, i.closed_at))
                .map((i) => ({
                    repo: `${GH_ORG}/${repo}`,
                    number: i.number as number,
                    title: i.title as string,
                    url: i.html_url as string,
                    author: i.user.login as string,
                    closedAt: i.closed_at as string,
                    grantfoxLabeled: (i.labels ?? []).some((l: any) => l.name === 'GrantFox OSS'),
                }));
            void labels;
            return { mergedPRs, closedIssues, bountyByCampaign, bountyIssueTotal };
        }),
    );

    const mergedPRs = perRepo.flatMap((r) => r.mergedPRs).sort((a, b) => (a.mergedAt < b.mergedAt ? 1 : -1));
    const closedIssues = perRepo.flatMap((r) => r.closedIssues).sort((a, b) => (a.closedAt < b.closedAt ? 1 : -1));
    const bountyByCampaign: Record<string, number> = {};
    for (const r of perRepo) for (const [c, n] of Object.entries(r.bountyByCampaign)) bountyByCampaign[c] = (bountyByCampaign[c] ?? 0) + n;
    const campaignOrder = ['Official Campaign', 'FWC26', 'Third Campaign'];
    const campaigns = Object.keys(bountyByCampaign).sort((a, b) => ((campaignOrder.indexOf(a) + 1) || 99) - ((campaignOrder.indexOf(b) + 1) || 99) || a.localeCompare(b));
    const bountyIssuesTotal = perRepo.reduce((t, r) => t + r.bountyIssueTotal, 0);

    return {
        available: true as const,
        reposScanned: repos.length,
        campaigns: { count: campaigns.length, items: campaigns.map((name) => ({ name, bountyIssues: bountyByCampaign[name] })) },
        bountyIssues: { total: bountyIssuesTotal },
        mergedPRs: { count: mergedPRs.length, linkedToGrantfoxIssue: mergedPRs.filter((p) => p.linkedToGrantfoxIssue).length, items: mergedPRs },
        closedIssues: { count: closedIssues.length, items: closedIssues },
        failedRequests: failures,
        platformUrl: 'https://grantfox.xyz/open-source',
        source: `https://api.github.com/orgs/${GH_ORG}/repos`,
        note: 'Team handles (Eras256, M0nsxx) and bots are excluded. fernando-mendoza joined the team part-time in October 2026 - PRs/issues from him on or after 2026-10-15 are excluded too, but anything from before that date (if any) still counts, since he was genuinely external then. The bounty issues themselves are written by the team, so "issues closed" counts only issues opened by people outside the team. Nothing here says whether any bounty was settled.',
    };
}

// "Built with Nirium" - connectors: a third party's own product that talks
// to Nirium (as opposed to the x402-seller shape above). Everything shown
// is read live from the connector page itself, including its stated scope
// (network, PoC status, whether real funds move) - we never restate scope
// from memory. Listed with the operator's permission.
const CONNECTORS: Array<{ company: string; url: string; companyUrl: string }> = [
    {
        company: 'AgentLedger',
        url: 'https://agentpayments.fi/connectors/nirium/',
        companyUrl: 'https://agentpayments.fi/',
    },
];

async function getConnectors() {
    return Promise.all(
        CONNECTORS.map(async (c) => {
            try {
                const r = await fetch(c.url, { signal: AbortSignal.timeout(8000) });
                const html = await r.text();
                const text = html
                    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
                    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/&#x27;|&apos;/g, "'")
                    .replace(/\s+/g, ' ');
                const network: 'testnet' | 'mainnet' | 'unknown' = /stellar testnet/i.test(text)
                    ? 'testnet'
                    : /stellar (mainnet|pubnet)/i.test(text)
                        ? 'mainnet'
                        : 'unknown';
                return {
                    kind: 'connector' as const,
                    company: c.company,
                    companyUrl: c.companyUrl,
                    connectorUrl: c.url,
                    network,
                    statedScope: {
                        privateProofOfConcept: /private proof of concept/i.test(text),
                        noRealFunds: /no real funds/i.test(text),
                    },
                    checks: { checked: true, ok: r.status === 200, status: r.status, mentionsNirium: /nirium/i.test(text) },
                };
            } catch (e: any) {
                return {
                    kind: 'connector' as const,
                    company: c.company,
                    companyUrl: c.companyUrl,
                    connectorUrl: c.url,
                    network: 'unknown' as const,
                    statedScope: { privateProofOfConcept: false, noRealFunds: false },
                    checks: { checked: false, ok: false, status: null, mentionsNirium: false, error: String(e?.message ?? e) },
                };
            }
        }),
    );
}

// Integrations / demos built BY Nirium (distinct from "Built with Nirium",
// which is third parties building on their own). Every check is run live on
// each load; a failing check turns the card red instead of hiding it. The
// network is never assumed: it is read from the deployment's own config
// (Pollar: the publishable key baked into the demo bundle; Nirium Play: the
// network the x402 gate advertises in its live 402 challenge).
type Check = { label: string; ok: boolean; detail?: string };
type Integration = {
    name: string;
    description: string;
    demoUrl: string;
    badge: string;
    network: 'testnet' | 'mainnet' | 'unknown';
    links: Array<{ label: string; url: string }>;
    origin?: { text: string; links: Array<{ label: string; url: string; status: string | null }> };
    checks: { ok: boolean; items: Check[] };
};

async function getPollarIntegration(): Promise<Integration> {
    const demoUrl = 'https://nirium-pollar-x402-demo.vercel.app/';
    const base: Omit<Integration, 'network' | 'checks'> = {
        name: 'Nirium × Pollar',
        description: 'x402 payment with Pollar login (Google/email, no wallet required)',
        demoUrl,
        badge: 'Built by Nirium · reviewed and merged by Pollar',
        links: [{ label: 'pollar-xyz/pollar-apps#30', url: 'https://github.com/pollar-xyz/pollar-apps/pull/30' }],
    };
    try {
        const r = await fetch(demoUrl, { signal: AbortSignal.timeout(8000) });
        const html = await r.text();
        const items: Check[] = [
            { label: 'demo URL responds 200', ok: r.status === 200, detail: String(r.status) },
            { label: 'page mentions Nirium and Pollar', ok: /nirium/i.test(html) && /pollar/i.test(html) },
        ];
        let network: Integration['network'] = 'unknown';
        try {
            const chunkPaths = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]);
            const origin = new URL(demoUrl).origin;
            const texts = await Promise.all(
                chunkPaths.map((p) => fetch(`${origin}${p}`, { signal: AbortSignal.timeout(8000) }).then((cr) => (cr.ok ? cr.text() : '')).catch(() => '')),
            );
            // Require real key material after the prefix (hex, 16+ chars):
            // Pollar's SDK ships the bare literal "pub_mainnet_" inside a
            // startsWith() check in every deployment, which a plain substring
            // match would misread as "mainnet" on a testnet-configured app.
            const m = texts.join('').match(/pub_(testnet|mainnet|pubnet)_[a-f0-9]{16,}/i);
            if (m) network = m[1].toLowerCase() === 'testnet' ? 'testnet' : 'mainnet';
        } catch { /* stays 'unknown' - shown as such */ }
        items.push({ label: 'network read from the demo bundle\u2019s configured key', ok: network !== 'unknown', detail: network });
        return { ...base, network, checks: { ok: items.every((i) => i.ok), items } };
    } catch (e: any) {
        return { ...base, network: 'unknown', checks: { ok: false, items: [{ label: 'demo URL responds 200', ok: false, detail: String(e?.message ?? e) }] } };
    }
}

async function getNiriumPlayIntegration(): Promise<Integration> {
    const pageUrl = 'https://nirium.xyz/nirium-play/';
    const gameUrl = 'https://nirium.xyz/nirium-play/game/';
    const gateBase = 'https://nirium-play-backend.fly.dev';
    const gateUrl = `${gateBase}/api/v1/actions/reveal-loot`;

    const status = async (u: string) => {
        try { return (await fetch(u, { signal: AbortSignal.timeout(8000), redirect: 'follow' })).status; } catch { return null; }
    };
    const [pageStatus, gameStatus, gate, issue70, pr82] = await Promise.all([
        status(pageUrl),
        status(gameUrl),
        (async () => {
            try {
                // Unauthenticated POST with no payment: the gate answers 402 and
                // advertises its network. No side effects.
                const r = await fetch(gateUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(8000) });
                const header = r.headers.get('payment-required');
                const acc = header ? JSON.parse(Buffer.from(header, 'base64').toString('utf8'))?.accepts?.[0] : null;
                return { status: r.status, network: (acc?.network as string | undefined) ?? null, amount: acc?.amount as string | undefined };
            } catch { return { status: null as number | null, network: null as string | null, amount: undefined }; }
        })(),
        ghJson('https://api.github.com/repos/nirium-protocol/nirium/issues/70'),
        ghJson('https://api.github.com/repos/nirium-protocol/nirium/pulls/82'),
    ]);

    const network: Integration['network'] = gate.network === 'stellar:testnet' ? 'testnet' : gate.network === 'stellar:pubnet' ? 'mainnet' : 'unknown';
    const items: Check[] = [
        { label: 'public URL responds 200', ok: pageStatus === 200, detail: String(pageStatus) },
        { label: 'game build is served', ok: gameStatus === 200, detail: String(gameStatus) },
        {
            label: 'x402 gate answers 402 and advertises its network',
            ok: gate.status === 402 && network !== 'unknown',
            detail: gate.status === 402 ? `${gate.network}${gate.amount ? ` · ${(Number(gate.amount) / 1e7).toFixed(2)} USDC` : ''}` : String(gate.status),
        },
    ];
    const issueStatus = issue70.ok ? `${issue70.data.state}${issue70.data.state_reason ? ` · ${issue70.data.state_reason}` : ''}` : null;
    const prStatus = pr82.ok ? (pr82.data.merged ? `merged${pr82.data.user?.login ? ` · @${pr82.data.user.login}` : ''}` : pr82.data.state) : null;
    return {
        name: 'Nirium Play',
        description: 'A Unity game where each action goes through an x402 payment gate on Stellar.',
        demoUrl: pageUrl,
        badge: 'Built by Nirium · Stellar testnet',
        network,
        links: [{ label: 'gate health', url: `${gateBase}/health` }],
        origin: {
            text: 'The x402 gate for Unity came out of GrantFox campaign issue #70; the community PR that solved it was merged.',
            links: [
                { label: 'issue #70', url: 'https://github.com/nirium-protocol/nirium/issues/70', status: issueStatus },
                { label: 'PR #82', url: 'https://github.com/nirium-protocol/nirium/pull/82', status: prStatus },
            ],
        },
        checks: { ok: items.every((i) => i.ok), items },
    };
}

async function getIntegrations(): Promise<Integration[]> {
    return Promise.all([getPollarIntegration(), getNiriumPlayIntegration()]);
}

// The reporting API's table is shared across networks, and rows written
// before network tagging existed are 'unlabeled'. Fetch mainnet, testnet
// and the unfiltered total so the page can show ONLY mainnet-labeled rows
// under the Mainnet heading and disclose the unlabeled remainder instead of
// folding it in (the unfiltered anchors count of 6 was wrongly shown as
// mainnet until this split - filtered, mainnet is 0).
//
// `from` is always explicit (2026-01-01, safely before any Nirium mainnet
// activity: the earliest real record is a 9-jul-2026 payment). Found
// 14-nov-2026: the agent's own default when no `from` is given is a rolling
// 30-day window (`DEFAULT_WINDOW_DAYS` in reportingRoutes.ts) - a total
// that quietly shrinks as old anchors age out with no new ones to replace
// them, with nothing in the response to say so (`period.from` came back
// `null`). 34 mainnet anchors on 12-nov read as 32 two days later, with no
// deploy or deletion involved - two 13-oct anchors (our own blog-post demo
// receipts) simply fell out of the window. ALL_TIME_FROM makes the summary
// (and the link next to it) report the real lifetime count, not a window.
const ALL_TIME_FROM = '2026-01-01';

async function getReportingSummaries() {
    const base = 'https://nirium-agent-mainnet.fly.dev/api/reporting/summary';
    const last30From = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const get = async (q: string) => {
        try {
            const r = await fetch(`${base}${q}`, { signal: AbortSignal.timeout(25000) });
            return r.ok ? await r.json() : null;
        } catch {
            return null;
        }
    };
    const [mainnet, testnet, all, mainnetLast30] = await Promise.all([
        get(`?network=mainnet&from=${ALL_TIME_FROM}`),
        get(`?network=testnet&from=${ALL_TIME_FROM}`),
        get(`?from=${ALL_TIME_FROM}`),
        // Explicit from/to (not the agent's bare default) so this stays a
        // real "last 30 days" figure even after the agent's own default
        // changes to all-time.
        get(`?network=mainnet&from=${last30From}`),
    ]);
    return { mainnet, testnet, all, mainnetLast30 };
}

export async function getStatsData() {
    const [x402g, rebalancesg, npmg, pypig, prsg, reportingg, builtWith, integrations, connectors, communityg] = await Promise.all([
        guarded('x402', getX402Settlements),
        guarded('rebalances', getTreasuryRebalances),
        Promise.all(NPM_PACKAGES.map((pkg) =>
            guarded(`npm:${pkg}`, () => getNpmDownloads(pkg), (v) => v.downloads !== null))),
        guarded('pypi', getPypiDownloads, () => true, 60 * 60 * 1000),
        guarded('externalPRs', getExternalMergedPRs, (v) => v.unavailable === 0),
        // A summary with `warnings` means one of its Supabase queries hit the
        // agent's 8 s cap and came back empty: the counts are LOWER than real,
        // not live. Treat it as incomplete so the last good read (or an honest
        // "unavailable") is shown instead of an undercount.
        guarded('reporting', getReportingSummaries, (v) =>
            [v.mainnet, v.testnet, v.all, v.mainnetLast30].every((s) => !!s && !(Array.isArray(s.warnings) && s.warnings.length > 0))),
        getBuiltWithNirium(),
        getIntegrations(),
        getConnectors(),
        guarded('community', getCommunityContributions, (v) => v.available === true && v.failedRequests === 0),
    ]);
    const x402 = x402g.value;
    const rebalances = rebalancesg.value;
    const reporting: Awaited<ReturnType<typeof getReportingSummaries>> = reportingg.value ?? { mainnet: null, testnet: null, all: null, mainnetLast30: null };
    const npmByPkg = <T,>(pick: (g: (typeof npmg)[number]) => T): Record<string, T> =>
        Object.fromEntries(NPM_PACKAGES.map((pkg, i) => [pkg, pick(npmg[i])]));
    const pypi = pypig.value;
    const prs = prsg.value;
    const community = communityg.value;
    const freshness = {
        x402: x402g.freshness,
        rebalances: rebalancesg.freshness,
        reporting: reportingg.freshness,
        npm: npmByPkg((g) => g.freshness),
        pypi: pypig.freshness,
        externalPRs: prsg.freshness,
        community: communityg.freshness,
    };

    return {
            generatedAt: new Date().toISOString(),
            network: 'mainnet',
            freshness,
            x402Settlements: x402,
            treasuryRebalances: rebalances,
            auditTrailAnchors: {
                // Mainnet-labeled rows only, all-time (from=ALL_TIME_FROM - see
                // getReportingSummaries). Rows from before network tagging are
                // reported separately, never folded into mainnet.
                count: reporting.mainnet?.anchors?.count ?? null,
                // Echoes the agent's own `period.from` for this query, so the
                // label always names the exact window the count above covers
                // (never a bare number with no period, per the 12-14 Nov drift).
                since: reporting.mainnet?.period?.from ?? ALL_TIME_FROM,
                // Sin el CID del último anclaje (9-nov-2026): suele ser evidencia de un socio y
                // /verify promete que esos CIDs no se listan. Se publica solo la fecha.
                lastAnchoredAt: reporting.mainnet?.anchors?.lastAnchoredAt ?? null,
                unlabeledCount:
                    reporting.all && reporting.mainnet && reporting.testnet
                        ? Math.max(0, (reporting.all.anchors?.count ?? 0) - (reporting.mainnet.anchors?.count ?? 0) - (reporting.testnet.anchors?.count ?? 0))
                        : null,
                // Secondary, explicitly-windowed figure - freshness, not the total.
                last30Days: {
                    count: reporting.mainnetLast30?.anchors?.count ?? null,
                    from: reporting.mainnetLast30?.period?.from ?? null,
                },
                source: `https://nirium-agent-mainnet.fly.dev/api/reporting/summary?network=mainnet&from=${ALL_TIME_FROM}`,
                note: "Nirium's own live reporting API - not a third party, hit the link yourself to see the raw response.",
            },
            payoutsSettledRuns: {
                count: reporting.mainnet?.payroll?.settledRuns ?? null,
                since: reporting.mainnet?.period?.from ?? ALL_TIME_FROM,
                source: `https://nirium-agent-mainnet.fly.dev/api/reporting/summary?network=mainnet&from=${ALL_TIME_FROM}`,
            },
            escrowReleases: !x402 ? null : {
                count: x402.escrowReleases.length,
                items: x402.escrowReleases,
                allInternal: x402.escrowReleases.length > 0 && x402.escrowReleases.every((e) => e.internal),
                toReceiverUsdc: Number(x402.escrowReleases.reduce((t, e) => t + e.toReceiverUsdc, 0).toFixed(7)),
                feeUsdc: Number(x402.escrowReleases.reduce((t, e) => t + e.feeUsdc, 0).toFixed(7)),
                totalUsdc: Number(x402.escrowReleases.reduce((t, e) => t + e.totalUsdc, 0).toFixed(7)),
                note: 'Trustless Work escrow milestone releases sent to the mainnet receiving address, read from Horizon (payer = a contract address). Not x402 payments.',
                source: x402.source,
            },
            npm: npmByPkg((g) => g.value),
            pypi,
            externalMergedPRs: prs,
            builtWithNirium: [...builtWith.map((b) => ({ kind: 'x402-seller' as const, ...b })), ...connectors],
            integrations,
            communityContributions: community,
    };
}

export type StatsData = Awaited<ReturnType<typeof getStatsData>>;
