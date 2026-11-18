/**
 * Client-side helpers for "Verificar un Audit Trail" (/verify).
 *
 * Deliberately Buffer-free — next.config.mjs sets `buffer: false` in the
 * client webpack fallback, so anything relying on the Node Buffer global in
 * browser code is not safe to assume here. Hashing uses only
 * TextEncoder + crypto.subtle (standard Web Crypto), available in every
 * modern browser without a polyfill.
 *
 * Mirrors the server's anchoring contract — packages/agent/src/services/
 * auditAnchorDoc.ts (document shape) and agentAttestation.ts (statement
 * domain) — so a visitor can independently recompute what the document
 * claims instead of trusting this page's own rendering of it.
 */

export interface AgentAttestation {
    id?: string;
    key: string;
    alg: string;
    statement: string;
    signature: string;
}

export interface AnchoredDoc {
    version?: string;
    node?: string;
    content_sha256: string;
    agent?: AgentAttestation;
    record?: Record<string, unknown>;
    txHash?: string;
    network?: 'stellar:pubnet' | 'stellar:testnet';
    tag?: string;
    anchoredAt?: string;
}

const CID_RE = /^[a-zA-Z0-9]{40,80}$/;

/**
 * Accepts a bare CID, `.../ipfs/<cid>`, `ipfs://<cid>`, or the subdomain
 * gateway style `https://<cid>.ipfs.<gateway>/...`, and returns the CID, or
 * null if unrecognizable.
 */
export function extractCid(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    if (trimmed.toLowerCase().startsWith('ipfs://')) {
        const cid = trimmed.slice('ipfs://'.length).split(/[/?#]/)[0];
        return CID_RE.test(cid) ? cid : null;
    }

    const subdomainMatch = trimmed.match(/^https?:\/\/([a-zA-Z0-9]{40,80})\.ipfs\./i);
    if (subdomainMatch) {
        const cid = subdomainMatch[1];
        return CID_RE.test(cid) ? cid : null;
    }

    const afterIpfs = trimmed.includes('/ipfs/') ? trimmed.split('/ipfs/').pop()! : trimmed;
    const cid = afterIpfs.split(/[?#]/)[0].replace(/\/+$/, '');
    return CID_RE.test(cid) ? cid : null;
}

// Same fallback order the CLI (`nirium-cli verify`) already uses when
// reading anchors the agent pinned to Pinata: Filebase answers fast
// (measured 0.6s vs Pinata's 7.3s for the same CID), the rest are
// fallbacks for whichever gateway is slow or down that day. Exported once
// here so the server route and the client page never drift apart on order.
const FILEBASE_GATEWAY = 'https://nirium.myfilebase.com';
const FALLBACK_GATEWAYS = ['https://gateway.pinata.cloud', 'https://ipfs.io', 'https://dweb.link'];

/** Filebase first, then the configured gateway (if any and not already in the list), then the rest. */
export function ipfsGateways(): string[] {
    const gateways = [FILEBASE_GATEWAY];
    const envGateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
    if (envGateway) {
        const normalized = (envGateway.startsWith('http') ? envGateway : `https://${envGateway}`).replace(/\/$/, '');
        if (normalized !== FILEBASE_GATEWAY && !FALLBACK_GATEWAYS.includes(normalized)) {
            gateways.push(normalized);
        }
    }
    gateways.push(...FALLBACK_GATEWAYS);
    return gateways;
}

/** The raw IPFS URL for a CID on the first (fastest) gateway in the fallback list. */
export function rawGatewayUrl(cid: string): string {
    return `${ipfsGateways()[0]}/ipfs/${cid}`;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
    // `BufferSource` in the newer DOM lib types is generic over ArrayBuffer vs
    // SharedArrayBuffer; a plain Uint8Array's inferred buffer type doesn't
    // always match, so cast explicitly rather than widen the whole signature.
    const digest = await crypto.subtle.digest('SHA-256', bytes as BufferSource);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** sha-256 of JSON.stringify(record), exactly as the agent computed it at anchor time. */
export async function hashRecord(record: Record<string, unknown>): Promise<string> {
    return sha256Hex(new TextEncoder().encode(JSON.stringify(record)));
}

export type RecordCheck = 'match' | 'mismatch' | 'no_record';

/** Recomputes the hash of the embedded `record` (if any) and compares it to the
 *  declared `content_sha256`. When there is no `record`, there is nothing in the
 *  anchored document itself to recompute against — `content_sha256` is simply the
 *  hash the submitter declared for evidence they hold elsewhere. */
export async function checkRecordIntegrity(doc: AnchoredDoc): Promise<RecordCheck> {
    if (!doc.record) return 'no_record';
    const recomputed = await hashRecord(doc.record);
    return recomputed === doc.content_sha256.toLowerCase() ? 'match' : 'mismatch';
}

// 9-nov-2026: antes solo 'stellar:pubnet' contaba como mainnet; un documento que
// escribiera 'mainnet' o 'pubnet' se mostraba como testnet. Lo que no sea mainnet
// se sigue tratando como testnet para los enlaces del explorador; la página
// distingue aparte cuando el documento no declara red (declaredNetwork).
const MAINNET_NAMES = new Set(['stellar:pubnet', 'pubnet', 'mainnet', 'public']);

export function networkLabel(network?: string): 'mainnet' | 'testnet' {
    return network && MAINNET_NAMES.has(network.toLowerCase()) ? 'mainnet' : 'testnet';
}

/** La red que el documento declara, o null si no declara ninguna (no se adivina). */
export function declaredNetwork(network?: string): 'mainnet' | 'testnet' | null {
    return network ? networkLabel(network) : null;
}

export function explorerTxUrl(txHash: string, network?: string): string {
    return `https://stellar.expert/explorer/${networkLabel(network) === 'mainnet' ? 'public' : 'testnet'}/tx/${txHash}`;
}

export type SignerAccount = 'exists' | 'missing' | 'unknown';

/** Whether the signer key has an account on the record's network. A signing
 *  key doesn't need one, so 'missing' is not an error; 'unknown' means Horizon
 *  couldn't be reached and the caller should keep its default rendering. */
export async function checkSignerAccount(key: string, network?: string): Promise<SignerAccount> {
    const horizon = networkLabel(network) === 'mainnet' ? 'https://horizon.stellar.org' : 'https://horizon-testnet.stellar.org';
    try {
        const res = await fetch(`${horizon}/accounts/${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(10_000) });
        if (res.status === 200) return 'exists';
        if (res.status === 404) return 'missing';
        return 'unknown';
    } catch {
        return 'unknown';
    }
}

export function explorerAccountUrl(address: string, network?: string): string {
    return `https://stellar.expert/explorer/${networkLabel(network) === 'mainnet' ? 'public' : 'testnet'}/account/${address}`;
}

// `toLocaleString()` on a numeric date is locale-order-ambiguous: "7/10/2026"
// reads as 7 Oct in es-MX and as 10 Jul in en-US — the exact mixup this
// replaces. Built manually (not via Intl's own month-first en-US default)
// so the day-month-year order and UTC hour are fixed regardless of locale.
const ANCHORED_AT_MONTHS: Record<'en' | 'es', string[]> = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
};

/** "7 Oct 2026, 06:01:07 UTC" (en) / "7 oct 2026, 06:01:07 UTC" (es) - unambiguous regardless of locale. */
export function formatAnchoredAtUtc(iso: string, language: 'en' | 'es'): string {
    const d = new Date(iso);
    const day = d.getUTCDate();
    const month = ANCHORED_AT_MONTHS[language][d.getUTCMonth()];
    const year = d.getUTCFullYear();
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    const ss = String(d.getUTCSeconds()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hh}:${mm}:${ss} UTC`;
}
