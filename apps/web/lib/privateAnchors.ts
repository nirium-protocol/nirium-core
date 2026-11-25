// Anclajes que son evidencia de otra persona y no deben listarse en público,
// y los anclajes propios de Nirium, que sí.
//
// /verify promete que un CID anclado para la evidencia de alguien (un socio que
// llama a POST /api/audit/log, o el recibo de una corrida de Payouts de una
// empresa) "no está pensado para navegación abierta" y solo se ve si ya tienes
// el CID. Hasta el 8-nov-2026 /api/audit (panel del dashboard) y /api/logs
// (consola de /agents y /analytics) los listaban a todos. Este archivo es el
// único lugar donde se decide qué es privado y qué es propio, para que las dos
// rutas no se separen.
//
// Formatos que escribe el agente (packages/agent):
//   [AUDIT-NODE] External record anchored to IPFS | sha256=… | CID: … | network=… | <gateway> [| agent=<G…>] [| tag=…]
//   [PAYROLL] 🧾 Receipt anchored to IPFS | Run pay_… | CID: …
//
// Un anclaje es PROPIO de Nirium si:
//   - lo firmó una llave de Nirium: el agente solo escribe `| agent=<llave>`
//     después de verificar la firma (verifyAgentAttestation en auditRoutes.ts),
//     así que no se puede fingir. Mismo criterio que usa el agente para los
//     badges de Niriumtober y Nirium Watch (auditAnchorDoc.ts).
//   - o es uno de los anclajes propios anteriores a que el log incluyera
//     `agent=` (lista fija, verificada abriendo cada documento).

/** Llaves de prueba de Nirium (selftest-nirium). Se pueden sumar más por env. */
const DEFAULT_OWN_KEYS = [
    'GC473KU66OO5KCJV22Y5W7VLZV2XUQ3EHUEKRULBNI2OIOH7M2L3K2VA', // mainnet
    'GBKRSEOACTOKL3O5IVEVAKKHPUHSNEL7OSLYDB57ODGIFQFYOT3B4HXP', // testnet
    'GCE5L5ZAXXLI4J6ZTMPIZKQBJLPUET33YCIZSQIC2AAMDV2U4A7FZE5Z', // mainnet, aviso de política v1.5 (25-nov-2026)
];

/**
 * Anclajes de prueba de Nirium del 21-oct-2026, anteriores a `agent=` en el log.
 * Verificado el 8-nov-2026: los dos documentos traen agent.id "selftest-nirium"
 * y la firma de las llaves de arriba.
 */
export const OWN_ANCHOR_CIDS = [
    'QmaAXCmpqaptjDTJoRPcyFBUywrvuA7GfLyArVaQwd5VDM', // mainnet
    'QmeTc3zduupTGYvnB6pczgtNoiaHbWZjMaS9YheDmicCcn', // testnet
];

export function ownAnchorKeys(): string[] {
    const extra = (process.env.NIRIUM_OWN_ANCHOR_KEYS || '')
        .split(',')
        .map((k) => k.trim())
        .filter((k) => /^G[A-Z2-7]{55}$/.test(k));
    return [...new Set([...DEFAULT_OWN_KEYS, ...extra])];
}

/** Texto a buscar en los logs para traer los anclajes propios (uno por consulta). */
export function ownAnchorNeedles(): string[] {
    return [...ownAnchorKeys().map((k) => `agent=${k}`), ...OWN_ANCHOR_CIDS];
}

const PRIVATE_ANCHOR = /External record anchored|Receipt anchored to IPFS/i;

export function isOwnAnchorLog(message: unknown): boolean {
    if (typeof message !== 'string') return false;
    if (ownAnchorKeys().some((k) => message.includes(`| agent=${k}`))) return true;
    return OWN_ANCHOR_CIDS.some((cid) => message.includes(cid));
}

export function isPrivateAnchorLog(message: unknown): boolean {
    return typeof message === 'string' && PRIVATE_ANCHOR.test(message) && !isOwnAnchorLog(message);
}

/**
 * Versión pública de una línea de log de anclaje privado: dice que hubo un
 * anclaje (y en qué red, si viene) sin CID, hash, URL de gateway ni id de
 * corrida. Una línea que no es privada se devuelve igual.
 */
export function redactPrivateAnchorLog(message: string): string {
    if (!isPrivateAnchorLog(message)) return message;
    const network = message.match(/network=(mainnet|testnet)/i)?.[1]?.toLowerCase();
    const where = network ? ` (${network})` : '';
    if (/Receipt anchored to IPFS/i.test(message)) {
        return `[PAYROLL] Payout receipt anchored to IPFS${where}. The CID stays with the company that ran it.`;
    }
    return `[AUDIT-NODE] Record anchored to IPFS for a caller${where}. The CID stays with whoever anchored it.`;
}
