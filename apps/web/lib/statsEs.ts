// 21-nov-2026 (T1): /api/stats sirve estos textos en inglés y /stats los mostraba así también
// en la vista en español. La API no cambia (la leen otros, p. ej. el archivo diario del repo
// status); la página traduce aquí. Si un texto no está en el mapa, se muestra tal cual.
// Los títulos de PRs se quedan en su idioma original.

const ES: Record<string, string> = {
    'Nirium test wallet': 'Wallet de prueba de Nirium',
    'Public key independently re-derived from the private key we hold.':
        'Llave pública derivada de nuevo, por separado, de la llave privada que tenemos.',
    'Nirium test of the Pollar login flow': 'Prueba de Nirium del inicio de sesión con Pollar',
    'Wallet created through our Pollar app; its reserve sponsor was funded from a wallet we control.':
        'Wallet creada con nuestra app de Pollar; quien patrocina su reserva se fondeó desde una wallet que controlamos.',
    'AgentLedger (@fernando-mendoza), second agent wallet': 'AgentLedger (@fernando-mendoza), segunda wallet del agente',
    "Integration tests by AgentLedger - the operator identified these settlements as theirs, in public, on OpenZeppelin/relayer-plugin-x402-facilitator#47. Wallet initially funded by Nirium's founder. AgentLedger was an independent third party when these settlements happened (Aug-Sep 2026); its founder, Fer, also joined Nirium part-time in October 2026.":
        'Pruebas de integración de AgentLedger: el operador identificó estas liquidaciones como suyas, en público, en OpenZeppelin/relayer-plugin-x402-facilitator#47. La wallet la fondeó al principio el fundador de Nirium. AgentLedger era un tercero independiente cuando ocurrieron (ago-sep 2026); su fundador, Fer, también se unió a Nirium part-time en octubre de 2026.',
    "Mainnet test of the pre-sign policy hook by AgentLedger on 18 Nov 2026: an ALLOW, a HOLD released after the owner's approval, and a concurrent pair where one was blocked. The operator shared this wallet and the signed receipts with us directly, and its public ledger names the agent nirium-mainnet-agent. AgentLedger's founder, Fer, has worked with Nirium part-time since October 2026, so this is not organic adoption.":
        'Prueba en mainnet del hook de política antes de firmar, por AgentLedger el 18 nov 2026: un ALLOW, un HOLD liberado tras la aprobación del dueño y un par simultáneo en el que uno se bloqueó. El operador nos compartió esta wallet y los recibos firmados directamente, y su ledger público nombra al agente nirium-mainnet-agent. Fer, fundador de AgentLedger, trabaja con Nirium part-time desde octubre de 2026, así que esto no es adopción orgánica.',
    'Niriumtober participant': 'Participante de Niriumtober',
    'Paid during the Niriumtober sprint to earn a badge, with its own funds. Counted apart from external payers.':
        'Pagó durante el sprint de Niriumtober para ganar una insignia, con sus propios fondos. Se cuenta aparte de los pagadores externos.',
    'Nirium self-test (Protocol 30, nirium 0.20.0)': 'Autoprueba de Nirium (Protocol 30, nirium 0.20.0)',
    'Throwaway account we created and funded on 24 Nov 2026 to test nirium 0.20.0 with stellar-sdk 17 on mainnet (tx 786db50b...). Our own test, not usage.':
        'Cuenta desechable que creamos y fondeamos el 24 nov 2026 para probar nirium 0.20.0 con stellar-sdk 17 en mainnet (tx 786db50b...). Prueba nuestra, no uso.',
    'Funded by a Nirium wallet - counted as internal, not as an external payer.':
        'La fondeó una wallet de Nirium: se cuenta como interna, no como pagador externo.',
    'Not matched to any wallet we control - counted as external, unverified identity.':
        'No coincide con ninguna wallet que controlemos: se cuenta como externo, con identidad sin verificar.',
    'Team handles (Eras256, M0nsxx) and bots are excluded. fernando-mendoza joined the team part-time in October 2026 - PRs/issues from him on or after 2026-10-15 are excluded too, but anything from before that date (if any) still counts, since he was genuinely external then. The bounty issues themselves are written by the team, so "issues closed" counts only issues opened by people outside the team. Stellar Wave issues are labeled "Stellar Wave" in the repo; a PR counts as Wave work when it references one. Nothing here says whether any bounty or Wave reward was settled.':
        'Se excluyen las cuentas del equipo (Eras256, M0nsxx) y los bots. fernando-mendoza se unió al equipo part-time en octubre de 2026: también se excluyen sus PRs e issues desde el 2026-10-15, pero lo anterior (si lo hay) sí cuenta, porque entonces era externo de verdad. Los issues de recompensa los escribe el equipo, así que "issues cerrados" cuenta solo los que abrió gente de fuera. Los issues de Stellar Wave llevan la etiqueta "Stellar Wave" en el repo; un PR cuenta como trabajo de Wave cuando referencia uno. Nada de esto dice si se pagó alguna recompensa de bounty o de Wave.',
    "Nirium's own live reporting API - not a third party, hit the link yourself to see the raw response.":
        'La API de reporting en vivo de Nirium, no un tercero: abre el enlace para ver la respuesta cruda.',
    'Trustless Work escrow milestone releases sent to the mainnet receiving address, read from Horizon (payer = a contract address). Not x402 payments.':
        'Liberaciones de hitos de escrows de Trustless Work enviadas a la dirección receptora de mainnet, leídas de Horizon (el pagador es una dirección de contrato). No son pagos x402.',
    // Integraciones y demos
    'x402 payment with Pollar login (Google/email, no wallet required)':
        'Pago x402 con inicio de sesión de Pollar (Google o correo, sin wallet)',
    'Built by Nirium · reviewed and merged by Pollar': 'Construido por Nirium · revisado y mergeado por Pollar',
    'demo URL responds 200': 'la URL de la demo responde 200',
    'page mentions Nirium and Pollar': 'la página menciona a Nirium y a Pollar',
    'network read from the demo bundle’s configured key': 'red leída de la llave configurada en el bundle de la demo',
    'public URL responds 200': 'la URL pública responde 200',
    'game build is served': 'el build del juego se sirve',
    'x402 gate answers 402 and advertises its network': 'la compuerta x402 responde 402 y anuncia su red',
    'A Unity game where each action goes through an x402 payment gate on Stellar.':
        'Un juego en Unity donde cada acción pasa por una compuerta de pago x402 en Stellar.',
    'Built by Nirium · Stellar testnet': 'Construido por Nirium · Stellar testnet',
    'gate health': 'salud de la compuerta',
    'The x402 gate for Unity came out of GrantFox campaign issue #70; the community PR that solved it was merged.':
        'La compuerta x402 para Unity salió del issue #70 de la campaña de GrantFox; se mergeó el PR de la comunidad que lo resolvió.',
    'PR #68 merged in AgentRail': 'PR #68 mergeado en AgentRail',
    'PR #70 merged in AgentRail': 'PR #70 mergeado en AgentRail',
    'receipts provider still on their main branch': 'el proveedor de recibos sigue en su rama main',
    'network read from the provider’s default node': 'red leída del nodo por defecto del proveedor',
    'Opt-in public receipts for AgentRail agent spends and proof-of-task results: only a SHA-256 hash is anchored, checkable at nirium.xyz/verify. Off the payment path, so a failed anchor never blocks a spend.':
        'Recibos públicos opcionales para los gastos de agentes de AgentRail y los resultados de proof-of-task: solo se ancla un hash SHA-256, comprobable en nirium.xyz/verify. Va fuera del camino del pago, así que un anclaje fallido nunca bloquea un gasto.',
    'Built by Nirium · reviewed and merged by AgentRail': 'Construido por Nirium · revisado y mergeado por AgentRail',
    'AgentRail then built on it in its own repo: a PR by its founder settles pipeline spends on testnet and anchors receipts signed by the agent’s own key. Their work, on testnet - not counted as usage.':
        'Después, AgentRail construyó sobre esto en su propio repo: un PR de su fundador liquida gastos del pipeline en testnet y ancla recibos firmados con la llave del propio agente. Es trabajo suyo, en testnet: no se cuenta como uso.',
    'its testnet receipt': 'su recibo de testnet',
};

/** Spanish for a /api/stats text when the page is in Spanish; otherwise the text as served. */
export function statsText(text: string | null | undefined, language: string): string {
    if (!text) return '';
    return language === 'es' ? (ES[text] ?? text) : text;
}
