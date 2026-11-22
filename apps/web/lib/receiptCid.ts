// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Nirium Protocol Contributors
//
// Browser port of packages/sdk/src/receipt-cid.ts (nirium-protocol/nirium).
// Same algorithm, without Buffer or node:crypto: the client bundle sets
// `buffer: false`, so this uses Uint8Array and Web Crypto (crypto.subtle).

/**
 * CIDv0 of an Audit Trail receipt, computed locally (no IPFS node, no library).
 *
 * A receipt is one IPFS block: a dag-pb node wrapping a UnixFS File whose data
 * is the whole document (anything up to 256 KiB fits in one block). Its CIDv0
 * is base58btc(0x12 0x20 || sha256(node)), the same result `ipfs add` gives with
 * its defaults.
 *
 * Returns null when the bytes are empty or larger than one block: then the CID
 * can't be recomputed here (use `npx nirium-cli verify <CID>`).
 */
export async function receiptCid(bytes: Uint8Array): Promise<string | null> {
    if (bytes.length === 0 || bytes.length > UNIXFS_BLOCK_BYTES) return null;
    const unixfs = concat([Uint8Array.of(0x08, 0x02), bytesField(0x12, bytes), Uint8Array.of(0x18), varint(bytes.length)]);
    const node = bytesField(0x0a, unixfs);
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', node as BufferSource));
    return base58btc(concat([Uint8Array.of(0x12, 0x20), digest]));
}

export const UNIXFS_BLOCK_BYTES = 262144;
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function concat(parts: Uint8Array[]): Uint8Array {
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let o = 0;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return out;
}

function varint(n: number): Uint8Array {
    const out: number[] = [];
    while (n >= 0x80) { out.push((n & 0x7f) | 0x80); n = Math.floor(n / 128); }
    out.push(n);
    return Uint8Array.from(out);
}

function bytesField(tag: number, buf: Uint8Array): Uint8Array {
    return concat([Uint8Array.of(tag), varint(buf.length), buf]);
}

function base58btc(buf: Uint8Array): string {
    let hex = '';
    for (const b of buf) hex += b.toString(16).padStart(2, '0');
    let n = BigInt('0x' + hex);
    let out = '';
    while (n > 0n) { out = BASE58_ALPHABET[Number(n % 58n)] + out; n /= 58n; }
    for (const b of buf) { if (b !== 0) break; out = '1' + out; }
    return out;
}
