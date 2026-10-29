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

/** Accepts a bare CID or a full gateway URL and returns the CID, or null if unrecognizable. */
export function extractCid(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const afterIpfs = trimmed.includes('/ipfs/') ? trimmed.split('/ipfs/').pop()! : trimmed;
    const cid = afterIpfs.split(/[?#]/)[0].replace(/\/+$/, '');
    return CID_RE.test(cid) ? cid : null;
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

export function networkLabel(network?: string): 'mainnet' | 'testnet' {
    return network === 'stellar:pubnet' ? 'mainnet' : 'testnet';
}

export function explorerTxUrl(txHash: string, network?: string): string {
    return `https://stellar.expert/explorer/${networkLabel(network) === 'mainnet' ? 'public' : 'testnet'}/tx/${txHash}`;
}

export function explorerAccountUrl(address: string, network?: string): string {
    return `https://stellar.expert/explorer/${networkLabel(network) === 'mainnet' ? 'public' : 'testnet'}/account/${address}`;
}
