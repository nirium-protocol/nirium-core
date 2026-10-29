import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { Keypair, StrKey } from '@stellar/stellar-sdk';

// Verifies an agent attestation signature server-side (default Node.js runtime —
// Buffer and node:crypto are native here; they are NOT available in the browser
// bundle for this app, see next.config.mjs's `buffer: false` client fallback).
//
// Same rule as packages/agent/src/services/agentAttestation.ts: the signed
// statement uses a separate domain, "nirium-audit-v1:<content_sha256>", never
// the bare hash, and two signature encodings are accepted — raw UTF-8 bytes of
// the statement, and its SEP-53 digest — because both require the private key,
// so accepting either does not weaken the proof.
//
// This route only verifies; it never anchors anything and reads no database.

const SEP53_PREFIX = Buffer.from('Stellar Signed Message:\n', 'utf8');
const SHA256_HEX = /^[0-9a-fA-F]{64}$/;

function sep53Digest(message: string): Buffer {
    return crypto
        .createHash('sha256')
        .update(Buffer.concat([SEP53_PREFIX, Buffer.from(message, 'utf8')]))
        .digest();
}

function decodeSignature(signature: string): Buffer | null {
    try {
        const b64 = Buffer.from(signature, 'base64');
        if (b64.length === 64) return b64;
    } catch { /* try hex below */ }
    if (/^[0-9a-fA-F]{128}$/.test(signature)) return Buffer.from(signature, 'hex');
    return null;
}

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ valid: false, error: 'invalid JSON body' }, { status: 400 });
    }

    const { key, signature, contentSha256 } = (body ?? {}) as Record<string, unknown>;

    if (typeof contentSha256 !== 'string' || !SHA256_HEX.test(contentSha256)) {
        return NextResponse.json({ valid: false, error: '`contentSha256` must be a 64-char sha-256 hex' }, { status: 400 });
    }
    if (typeof key !== 'string' || !StrKey.isValidEd25519PublicKey(key)) {
        return NextResponse.json({ valid: false, error: '`key` must be a Stellar ed25519 public key (G...)' }, { status: 400 });
    }
    if (typeof signature !== 'string') {
        return NextResponse.json({ valid: false, error: '`signature` must be a base64 or hex ed25519 signature' }, { status: 400 });
    }

    const sig = decodeSignature(signature);
    if (!sig) {
        return NextResponse.json({ valid: false, error: '`signature` must decode to a 64-byte ed25519 signature (base64 or hex)' }, { status: 400 });
    }

    const statement = `nirium-audit-v1:${contentSha256.toLowerCase()}`;
    let kp: Keypair;
    try {
        kp = Keypair.fromPublicKey(key);
    } catch {
        return NextResponse.json({ valid: false, error: '`key` is not a valid ed25519 public key' }, { status: 400 });
    }

    const candidates = [Buffer.from(statement, 'utf8'), sep53Digest(statement)];
    for (const data of candidates) {
        try {
            if (kp.verify(data, sig)) {
                return NextResponse.json({ valid: true, statement });
            }
        } catch { /* try the next encoding */ }
    }

    return NextResponse.json({ valid: false, statement, error: 'signature does not verify against this key' });
}
