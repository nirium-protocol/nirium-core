/** Nirium Security - who holds the keys, on mainnet (DeFindex) and testnet (NiriumVault) **/
'use client';

// Revisado el 8-nov-2026 contra la cadena y el código:
// - Mainnet: el agente solo tiene RebalanceManager en una bóveda DeFindex; rebalance()
//   acepta 4 instrucciones (Unwind, Invest, SwapExactIn, SwapExactOut), ninguna con destino;
//   el código de Nirium solo emite Invest/Unwind (corregido 12-nov-2026: antes decía "solo 2").
// - Testnet (9-nov-2026): NiriumVault pasó a CDMFUR…QOI2S2, desplegado desde el WASM que GitHub
//   compiló del repo público (release nirium-vault-v0.1.0, commit 8489481); Stellar Expert lo marca
//   "verified". Lo de abajo se revisó el 8-nov en CARTJI…5SICV y vale igual para el nuevo: mismo
//   código, mismo admin/treasury, sin cosignatarios. Instance storage leída vía Soroban RPC: no hay
//   Cosigner1/Cosigner2, así que pause/unpause hoy lo firma el admin solo. withdraw,
//   deposit, close_vault y delegate_agent llaman check_not_paused; revoke_agent no.
//   El WASM en vivo es d317ac7b… y no contiene upgrade/migrate/set_wasm ni
//   update_current_contract_wasm.
// La página anterior decía "vault 2-de-3 controlado por tres llaves del cliente" y que
// Nirium no podía pausar ni cambiar cosignatarios: las tres cosas eran falsas hoy.

import Link from "next/link";
import {
    Lock, Key, Shield, AlertTriangle, CheckCircle2, ArrowRight,
    FileSearch, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { useNetwork } from "@/context/NetworkContext";
import SecurityDisclaimer from "@/components/shared/SecurityDisclaimer";

const VAULT_ID = "CDMFURE6MYROTA2A6DLD4TN2S4QTN64L2FZ2I2RY2AREONX6DUQOI2S2";
const VAULT_WASM = "d317ac7bf81ba47dda9a6d61270525c35d3e182a75e27998cf1b1b4ba8f88e7d";
// El código exacto del que salió el WASM desplegado: commit fijo, no main.
const VAULT_SOURCE = "https://github.com/nirium-protocol/nirium-core/blob/8489481f41f5fd143ddf2c2426962a0db780b66d/nirium-soroban-contracts/src/nirium_vault.rs";
const VAULT_RELEASE = "https://github.com/nirium-protocol/nirium-core/releases/tag/nirium-vault-v0.1.0_nirium-contracts_pkg0.1.0_cli28.1.0";
const SOROBAN_AUTH_DOCS = "https://developers.stellar.org/docs/learn/fundamentals/contract-development/authorization";

// Contratos anteriores: siguen en testnet, ya no los usa el sitio (9-nov-2026).
const PREVIOUS_VAULTS = [
    {
        id: "CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU",
        en: "May 2026. Used by nirium.xyz until 9 Nov 2026; 180 vaults were created on it, including our own tests. Unverified, and older than the 25 Oct security fix (FZN-2026-NIR-02).",
        es: "Mayo de 2026. Lo usó nirium.xyz hasta el 9 nov 2026; ahí se crearon 180 bóvedas, incluidas nuestras pruebas. Sin verificar y anterior al arreglo de seguridad del 25 oct (FZN-2026-NIR-02).",
    },
    {
        id: "CARTJIASVFHS4JJ24GVRO3XFQD37JCJEAXVPS7SPIWB3HLBXAYQ5SICV",
        en: "25 Oct 2026. Redeployed with the FZN-2026-NIR-02 fix, but never connected to the site; 0 vaults. Unverified.",
        es: "25 oct 2026. Redesplegado con el arreglo FZN-2026-NIR-02, pero nunca se conectó al sitio; 0 bóvedas. Sin verificar.",
    },
];

// Payouts y Audit Trail a detalle (11-nov-2026), revisado contra packages/agent:
// - payrollRoutes.ts: POST /run devuelve el lote sin firmar; /submit solo transmite el XDR
//   que firmó la empresa. En mainnet: tier autorizado, acknowledgeTerms e identificación.
// - escrowRoutes.ts: solo testnet (assertTrustlessWorkTestnetOnly). El deploy lo firma una
//   persona y fija el receptor de cada milestone. approve/release-milestone/execute firman
//   con la llave del agente solo si el escrow nombra al agente como approver/releaseSigner,
//   el contrato está en ESCROW_ALLOWLIST (vacía por default, en el servidor) y la API key es
//   institutional/enterprise. approve_milestone y release_funds reciben un índice, nunca un
//   receptor. Prueba: tx 8c89ede2… (testnet, 3-sep-2026 UTC, release_milestone_funds; prueba propia,
//   el receptor fue nuestra misma cuenta).
// - auditRoutes.ts: anchoredAt es la hora del servidor (new Date()); txHash es una
//   referencia opcional que manda el cliente. El registro vive en IPFS, no en el ledger.
// - CLI: `nirium verify <cid>` (README de packages/cli) recalcula hash y firma desde el
//   contenido crudo; sin --hash/--evidence ni firma reporta NOTHING VERIFIED.
const ESCROW_PROOF_TX = "https://stellar.expert/explorer/testnet/tx/8c89ede21a7b2246c2d0bef3d7ee0a4e7218f7ec7a07b2b3d3cc150d05921f13";
const TW_DOCS = "https://docs.trustlesswork.com/trustless-work/api-rest/deploy-1.md";
const CLI_VERIFY_DOCS = "https://github.com/nirium-protocol/nirium/tree/main/packages/cli#verify-an-audit-record";

const DEFINDEX_EVIDENCE = [
    { en: "Rebalance transaction (6 Aug 2026)", es: "Transacción de rebalanceo (6 ago 2026)", href: "https://stellar.expert/explorer/public/tx/82d73f537e907140367f9343f63a36704c74a5286aced7a938cee8fffb56b3d4" },
    { en: "The vault on mainnet", es: "La bóveda en mainnet", href: "https://stellar.expert/explorer/public/contract/CAMDXG6L4LXLXXV675KZSHM3BMSETZ4NVMC7JYIQCZ2JTG54OMSK57MH" },
    { en: "DeFindex source: rebalance() and its four instructions", es: "Código de DeFindex: rebalance() y sus cuatro instrucciones", href: "https://github.com/paltalabs/defindex/blob/a0fcabfae38f1c7b0c9c2f10ff51d225f8edc2f1/apps/contracts/vault/src/lib.rs#L846-L903" },
    { en: "DeFindex vault roles", es: "Roles de una bóveda DeFindex", href: "https://docs.defindex.io/getting-started/vault-roles" },
    { en: "OtterSec audit of DeFindex (Mar 2025)", es: "Auditoría de OtterSec a DeFindex (mar 2025)", href: "https://github.com/paltalabs/defindex/blob/main/audits/2025_03_18_ottersec_defindex_audit.pdf" },
];

// Quién firma en cada nodo. Revisado el 9-nov-2026 contra packages/agent:
// fly.mainnet.toml (el box de mainnet no lleva STELLAR_SECRET_KEY ni BUYER_SECRET_KEY),
// auditRoutes.ts (hash o record de hasta 8 KB; firma ed25519 opcional, las inválidas se
// rechazan), payrollRoutes.ts (el cliente firma; en mainnet tier autorizado + acknowledgeTerms)
// y escrowRoutes.ts (firmante rápido solo en testnet, tiers institutional/enterprise y
// ESCROW_ALLOWLIST).
type NodeRow = { node: string; nodeEs?: string; en: string; es: string; mainEn: string; mainEs: string; testEn: string; testEs: string };
const NODE_ROWS: NodeRow[] = [
    {
        node: 'x402',
        en: "The buyer's own wallet signs each payment and a facilitator settles it on Stellar. If you sell with x402Serve, the USDC goes from the buyer straight to your account: Nirium is not in the path. If you pay Nirium's own API, Nirium is the seller and receives that payment.",
        es: 'La wallet del comprador firma cada pago y un facilitador lo liquida en Stellar. Si vendes con x402Serve, el USDC va del comprador directo a tu cuenta: Nirium no está en medio. Si pagas la API de Nirium, Nirium es el vendedor y recibe ese pago.',
        mainEn: 'The mainnet API server (x402, Audit Trail, Reporting) has no Stellar signing key. The only key Nirium runs on mainnet is a separate rebalancer\'s, and it holds only the DeFindex rebalance role (see Treasury below).',
        mainEs: 'El servidor de la API en mainnet (x402, Audit Trail, Reporting) no tiene ninguna llave de Stellar. La única llave que Nirium corre en mainnet es la de un rebalanceador aparte, y solo tiene el rol de rebalanceo de DeFindex (ver Tesorería abajo).',
        testEn: 'The testnet agent holds its own test key to pay for demo calls.',
        testEs: 'El agente de testnet tiene su propia llave de prueba para pagar las llamadas de demostración.',
    },
    {
        node: 'Pre-sign policy hook',
        nodeEs: 'Hook de política antes de firmar',
        en: "Runs inside the buyer's client, before anything is signed. If the policy says no, or does not answer in time, nothing is signed. Its decision is tied to the hash of the exact payment being signed. Nirium never sees the buyer's key.",
        es: 'Corre en el cliente del comprador, antes de firmar nada. Si la política dice que no, o no responde a tiempo, no se firma nada. Su decisión queda atada al hash del pago exacto que se va a firmar. Nirium nunca ve la llave del comprador.',
        mainEn: 'Same on both networks.',
        mainEs: 'Igual en las dos redes.',
        testEn: 'Same on both networks.',
        testEs: 'Igual en las dos redes.',
    },
    {
        node: 'Audit Trail',
        en: "You send a SHA-256 hash, or a small record of up to 8 KB, and it is pinned to IPFS. You get back a CID, which is the hash of the content, so nobody, Nirium included, can change what it points to. An optional signature with your own Stellar key proves who declared it, and invalid signatures are rejected. It holds no funds. IPFS records can't be deleted: send hashes, not personal data.",
        es: 'Mandas un hash SHA-256, o un registro chico de hasta 8 KB, y se fija en IPFS. Recibes un CID, que es el hash del contenido, así que nadie, ni Nirium, puede cambiar a qué apunta. Una firma opcional con tu propia llave de Stellar prueba quién lo declaró, y las firmas inválidas se rechazan. No toca fondos. Lo que va a IPFS no se puede borrar: manda hashes, no datos personales.',
        mainEn: 'Free and rate-limited during the beta.',
        mainEs: 'Gratis y con límite de uso durante la beta.',
        testEn: 'Free and rate-limited during the beta.',
        testEs: 'Gratis y con límite de uso durante la beta.',
    },
    {
        node: 'Reporting',
        en: 'Read-only. It summarizes what is already recorded (payments, receipts, payout runs). It cannot sign or move anything.',
        es: 'Solo lectura. Resume lo que ya está registrado (pagos, recibos, lotes de pago). No puede firmar ni mover nada.',
        mainEn: 'Public summary, no key needed.',
        mainEs: 'Resumen público, sin llave.',
        testEn: 'Public summary, no key needed.',
        testEs: 'Resumen público, sin llave.',
    },
    {
        node: 'Payouts',
        en: 'Nirium builds each batch as an unsigned transaction. The company signs it with its own wallet, and only then is it sent. Nirium never holds the funds being paid out.',
        es: 'Nirium arma cada lote como una transacción sin firmar. La empresa la firma con su propia wallet, y solo entonces se envía. Nirium nunca sostiene los fondos que se pagan.',
        mainEn: 'Invite-only, and every run requires accepting the Payouts Terms.',
        mainEs: 'Solo por invitación, y cada lote exige aceptar los Términos de Payouts.',
        testEn: 'Testnet only: on Trustless Work escrows, the agent can sign milestone approvals and releases with its own key, limited to allowlisted escrow contracts and authorized API keys.',
        testEs: 'Solo en testnet: en escrows de Trustless Work, el agente puede firmar la aprobación y liberación de milestones con su propia llave, limitado a contratos de escrow en la lista permitida y a API keys autorizadas.',
    },
    {
        node: 'Treasury',
        en: "The agent can only rebalance, never withdraw. Details for each network are in the sections below.",
        es: 'El agente solo puede rebalancear, nunca retirar. El detalle de cada red está en las secciones de abajo.',
        mainEn: 'Invite-only: a DeFindex vault you own, where the agent holds only the rebalance role. Deploying, depositing and asking for proposals through Nirium need an invited (institutional) key; withdrawing is always open.',
        mainEs: 'Solo por invitación: una bóveda de DeFindex que es tuya, donde el agente solo tiene el rol de rebalanceo. Desplegar, depositar y pedir propuestas a través de Nirium requiere una llave invitada (institucional); retirar siempre está abierto.',
        testEn: 'NiriumVault, source-verified: only your key withdraws.',
        testEs: 'NiriumVault, con código verificado: solo tu llave retira.',
    },
];

export default function SecurityPage() {
    const { language } = useLanguage();
    const { network } = useNetwork();
    const isMain = network === 'mainnet';
    const lang = (en: string, es: string) =>
        language === 'es' ? es : en;

    return (
        <main className="min-h-screen bg-black text-white antialiased">
            {/* HERO */}
            <section className="relative pt-8 pb-16 sm:pt-8 sm:pb-20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.06),transparent_60%)]" />
                <div className="relative max-w-5xl mx-auto px-6">
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stellar-teal/20 bg-stellar-teal/5 text-stellar-teal text-xs font-mono">
                            <Key className="w-3 h-3" />
                            {lang('Who holds the keys', 'Quién controla las llaves')}
                        </div>
                    </div>

                    <h1 className="text-center text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
                        {lang('100% non-custodial', '100% no custodial')}
                    </h1>
                    <p className="mt-6 text-center text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                        {lang(
                            "Nirium never holds a key that can withdraw your funds, in any node. Below: who signs in each one, on the network you have selected, and then Payouts, Audit Trail and the treasury in detail.",
                            'Nirium nunca tiene una llave que pueda retirar tus fondos, en ningún nodo. Abajo: quién firma en cada uno, en la red que tienes elegida, y luego Payouts, Audit Trail y la tesorería a detalle.')}
                    </p>
                </div>
            </section>

            {/* EVERY NODE (9-nov-2026): la página solo hablaba de Treasury. */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex justify-center mb-4">
                        <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border ${isMain ? 'border-emerald-400/30 text-emerald-400' : 'border-stellar-yellow/30 text-stellar-yellow'}`}>
                            {isMain ? lang('Showing mainnet · switch to TEST in the menu', 'Mostrando mainnet · cambia a TEST en el menú') : lang('Showing testnet · switch to MAIN in the menu', 'Mostrando testnet · cambia a MAIN en el menú')}
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Who signs, node by node', 'Quién firma, nodo por nodo')}
                    </h2>
                    <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {NODE_ROWS.map((r) => (
                            <div key={r.node} className="p-5 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col">
                                <div className="text-xs font-mono uppercase tracking-widest text-stellar-teal mb-3">{language === 'es' && r.nodeEs ? r.nodeEs : r.node}</div>
                                <p className="text-sm text-white/70 leading-relaxed flex-1">{lang(r.en, r.es)}</p>
                                <p className="mt-4 pt-3 border-t border-white/5 text-xs text-white/60 leading-relaxed">
                                    <span className={`font-mono uppercase tracking-widest text-[10px] mr-2 ${isMain ? 'text-emerald-400' : 'text-stellar-yellow'}`}>{isMain ? 'Mainnet' : 'Testnet'}</span>
                                    {isMain ? lang(r.mainEn, r.mainEs) : lang(r.testEn, r.testEs)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PAYOUTS (11-nov-2026): antes solo tenía una tarjeta. */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex justify-center mb-4">
                        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-stellar-teal/30 text-stellar-teal">
                            {lang('Payouts · batches and milestone escrows', 'Payouts · lotes y escrows por milestone')}
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Payouts: the company signs, the receiver is fixed by a person', 'Payouts: la empresa firma, el receptor lo fija una persona')}
                    </h2>
                    <div className="mt-10 grid md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-3" />
                            <div className="font-bold mb-2">{lang('Batch payments: your wallet signs', 'Pagos por lote: firma tu wallet')}</div>
                            <p className="text-sm text-white/60 leading-relaxed">
                                {lang(
                                    'Nirium builds each batch as an unsigned transaction. The company signs it with its own wallet, and Nirium only sends the transaction it already signed. On mainnet it is invite-only: an authorized API key, the Payouts Terms accepted on every run, and the company identifies itself.',
                                    'Nirium arma cada lote como una transacción sin firmar. La empresa la firma con su propia wallet, y Nirium solo envía la transacción que ella ya firmó. En mainnet es solo por invitación: una API key autorizada, los Términos de Payouts aceptados en cada lote y la empresa se identifica.')}
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
                            <Key className="w-5 h-5 text-amber-400 mb-3" />
                            <div className="font-bold mb-2">{lang('Milestone escrows: testnet only', 'Escrows por milestone: solo testnet')}</div>
                            <p className="text-sm text-white/60 leading-relaxed">
                                {lang(
                                    "With Trustless Work escrows, a person signs the deployment, and that fixes who each milestone pays. If the escrow names Nirium's agent as approver or release signer, the agent can sign approvals and releases with its own key. Only for contracts on an allowlist that is empty by default and set on our server, and only for authorized API keys.",
                                    'En los escrows de Trustless Work, una persona firma el despliegue, y eso fija a quién paga cada milestone. Si el escrow nombra al agente de Nirium como aprobador o firmante de liberación, el agente puede firmar aprobaciones y liberaciones con su propia llave. Solo en contratos de una lista permitida, vacía por default y fijada en nuestro servidor, y solo con API keys autorizadas.')}
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
                            <AlertTriangle className="w-5 h-5 text-amber-400 mb-3" />
                            <div className="font-bold mb-2">{lang("Worst case if the agent's key leaks", 'El peor caso si se filtra la llave del agente')}</div>
                            <p className="text-sm text-white/60 leading-relaxed">
                                {lang(
                                    'Someone could approve or release milestones of allowlisted escrows early. They could not send the money anywhere new: the approve and release calls take a milestone number, never a receiver. This flow is not enabled on mainnet.',
                                    'Alguien podría aprobar o liberar antes de tiempo milestones de escrows en la lista permitida. No podría mandar el dinero a otro lado: las llamadas de aprobar y liberar reciben un número de milestone, nunca un receptor. Este flujo no está activo en mainnet.')}
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2">
                        <a href={ESCROW_PROOF_TX} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-stellar-teal hover:underline">
                            {lang('Agent-signed milestone release, our own test (testnet, Sep 2026)', 'Liberación de milestone firmada por el agente, prueba propia (testnet, sep 2026)')} <ExternalLink className="w-3 h-3" />
                        </a>
                        <a href={TW_DOCS} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-stellar-teal hover:underline">
                            {lang('Trustless Work docs', 'Docs de Trustless Work')} <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </section>

            {/* AUDIT TRAIL (11-nov-2026) */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex justify-center mb-4">
                        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-stellar-teal/30 text-stellar-teal">
                            {lang('Audit Trail · holds no funds', 'Audit Trail · no toca fondos')}
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Audit Trail: what a receipt proves, and what it does not', 'Audit Trail: qué prueba un recibo y qué no')}
                    </h2>
                    <div className="mt-10 grid md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-3" />
                            <div className="font-bold mb-2">{lang('What it proves', 'Qué prueba')}</div>
                            <p className="text-sm text-white/60 leading-relaxed">
                                {lang(
                                    'That this exact content, or its hash, is stored under this CID, and nobody can change it without the CID changing. If it is signed, that the holder of that Stellar key declared it. Invalid signatures are rejected, never stored.',
                                    'Que este contenido exacto, o su hash, está guardado bajo este CID, y nadie puede cambiarlo sin que cambie el CID. Si está firmado, que quien tiene esa llave de Stellar lo declaró. Las firmas inválidas se rechazan, nunca se guardan.')}
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
                            <AlertTriangle className="w-5 h-5 text-amber-400 mb-3" />
                            <div className="font-bold mb-2">{lang('What it does not prove', 'Qué no prueba')}</div>
                            <p className="text-sm text-white/60 leading-relaxed">
                                {lang(
                                    "That the content is true or complete. The time on the receipt is when Nirium's server recorded it, not a time on the Stellar ledger: today the record lives on IPFS. An unsigned receipt says nothing about who sent it.",
                                    'Que el contenido sea cierto o esté completo. La hora del recibo es cuando lo registró el servidor de Nirium, no una hora en el ledger de Stellar: hoy el registro vive en IPFS. Un recibo sin firma no dice nada de quién lo mandó.')}
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
                            <FileSearch className="w-5 h-5 text-emerald-400 mb-3" />
                            <div className="font-bold mb-2">{lang('Check it without trusting us', 'Compruébalo sin confiar en nosotros')}</div>
                            <p className="text-sm text-white/60 leading-relaxed">
                                {lang(
                                    'nirium.xyz/verify, or npx nirium-cli verify <cid>, recompute the hash and check the signature from the raw content, not from what the document says about itself. Add --evidence <file> to compare it with your own file. If there is nothing to check, the CLI says NOTHING VERIFIED instead of passing.',
                                    'nirium.xyz/verify, o npx nirium-cli verify <cid>, recalculan el hash y revisan la firma desde el contenido crudo, no desde lo que el documento dice de sí mismo. Agrega --evidence <archivo> para compararlo con tu propio archivo. Si no hay nada que comprobar, el CLI dice NOTHING VERIFIED en vez de aprobarlo.')}
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 flex items-start gap-3 p-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.03] max-w-3xl mx-auto">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-white/70">
                            {lang(
                                "What goes to IPFS can't be deleted, by us or anyone. Send a hash of your evidence, not personal data.",
                                'Lo que va a IPFS no se puede borrar, ni por nosotros ni por nadie. Manda un hash de tu evidencia, no datos personales.')}
                        </p>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2">
                        <Link href="/verify" className="inline-flex items-center gap-1.5 text-xs text-stellar-teal hover:underline">
                            {lang('Verify a receipt', 'Verificar un recibo')} <ArrowRight className="w-3 h-3" />
                        </Link>
                        <a href={CLI_VERIFY_DOCS} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-stellar-teal hover:underline">
                            {lang('How the CLI checks it', 'Cómo lo revisa el CLI')} <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </section>

            {/* MAINNET: DEFINDEX */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex justify-center mb-4">
                        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-400/30 text-emerald-400">
                            {lang('Mainnet · invite-only', 'Mainnet · solo por invitación')}
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Treasury on mainnet: a DeFindex vault you own', 'Tesorería en mainnet: una bóveda de DeFindex que es tuya')}
                    </h2>
                    <div className="mt-10 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                t: lang('The agent can only rebalance', 'El agente solo puede rebalancear'),
                                d: lang(
                                    "Nirium's agent holds DeFindex's RebalanceManager role, nothing else. Our code only sends Invest and Unwind. The contract's rebalance() also accepts two swap instructions, but none of the four takes a destination address: whatever they produce stays in the vault, so the role cannot send funds anywhere. Worst case if the agent's key leaked: someone could swap at a bad price inside the vault and lose value to slippage.",
                                    'El agente de Nirium tiene el rol RebalanceManager de DeFindex y nada más. Nuestro código solo manda Invest y Unwind. El rebalance() del contrato también acepta dos instrucciones de swap, pero ninguna de las cuatro recibe una dirección de destino: lo que producen se queda en la bóveda, así que ese rol no puede mandar fondos a ningún lado. Peor caso si se filtrara la llave del agente: alguien podría hacer swaps a mal precio dentro de la bóveda y perder valor por slippage.'),
                            },
                            {
                                t: lang('Withdrawals stay with the owner', 'Los retiros son del dueño'),
                                d: lang(
                                    "The role that can withdraw (Manager) sits with the vault owner's key, separate from the agent's key. The owner can also replace the agent's role at any time.",
                                    'El rol que puede retirar (Manager) está en la llave del dueño de la bóveda, separada de la del agente. El dueño además puede quitarle el rol al agente cuando quiera.'),
                            },
                            {
                                t: lang('Audited, third-party contract', 'Contrato de terceros, auditado'),
                                d: lang(
                                    'The vault contract is DeFindex (PaltaLabs), audited by OtterSec in March 2025. Nirium did not write it.',
                                    'El contrato de la bóveda es de DeFindex (PaltaLabs), auditado por OtterSec en marzo de 2025. Nirium no lo escribió.'),
                            },
                        ].map((c) => (
                            <div key={c.t} className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-3" />
                                <div className="font-bold mb-2">{c.t}</div>
                                <p className="text-sm text-white/60 leading-relaxed">{c.d}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-center text-xs text-white/45 max-w-2xl mx-auto leading-relaxed">
                        {lang(
                            "Today the only live vault is Nirium's own, with its own funds: it proves the mechanism, not client use. Access for clients is invite-only until we have a written legal opinion.",
                            'Hoy la única bóveda en vivo es la de Nirium, con fondos propios: prueba el mecanismo, no uso de clientes. El acceso para clientes es solo por invitación hasta tener una opinión legal por escrito.')}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2">
                        {DEFINDEX_EVIDENCE.map((e) => (
                            <a key={e.href} href={e.href} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-stellar-teal hover:underline">
                                {lang(e.en, e.es)} <ExternalLink className="w-3 h-3" />
                            </a>
                        ))}
                        <Link href="/blog/treasury-node-verify-it-yourself" className="inline-flex items-center gap-1.5 text-xs text-stellar-teal hover:underline">
                            {lang('How to verify it yourself', 'Cómo verificarlo tú mismo')} <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* TESTNET: NIRIUMVAULT - two kinds of control */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex justify-center mb-4">
                        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-amber-400/30 text-amber-400">
                            {lang('Testnet · NiriumVault', 'Testnet · NiriumVault')}
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang("Nirium's own contract: two kinds of control", 'El contrato propio de Nirium: dos tipos de control')}
                    </h2>

                    <div className="mt-12 grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
                            <div className="flex items-center gap-2 mb-4">
                                <Key className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-lg font-bold">{lang('Your vault: your key', 'Tu bóveda: tu llave')}</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-white/70">
                                {[
                                    lang('Only your key withdraws, and only to your own address', 'Solo tu llave retira, y solo a tu propia dirección'),
                                    lang('Only your key closes the vault (its balance must be 0)', 'Solo tu llave cierra la bóveda (su saldo debe ser 0)'),
                                    lang('You can delegate to the agent up to a cumulative cap you set (max_execution_amount)', 'Puedes delegar al agente hasta un tope acumulado que tú fijas (max_execution_amount)'),
                                    lang('You can revoke the agent at any time, even while the contract is paused', 'Puedes revocar al agente cuando quieras, incluso con el contrato en pausa'),
                                ].map((x) => (
                                    <li key={x} className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
                                        {x}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-5 h-5 text-amber-400" />
                                <h3 className="text-lg font-bold">{lang('Emergency pause: Nirium', 'Pausa de emergencia: Nirium')}</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-white/70">
                                {[
                                    lang("Nirium's admin key can pause the whole contract (every vault) in an emergency", 'La llave admin de Nirium puede pausar todo el contrato (todas las bóvedas) en una emergencia'),
                                    lang('While paused, nobody can withdraw, deposit or close a vault, including you. Pausing never moves funds', 'En pausa, nadie puede retirar, depositar ni cerrar una bóveda, tampoco tú. Pausar nunca mueve fondos'),
                                    lang('The contract supports a 2-of-3 pause (admin plus one cosigner). It is not active yet: no cosigners are registered (checked on-chain, 8 Nov 2026), so today the admin pauses alone. Registering them is planned', 'El contrato admite una pausa 2-de-3 (admin más un cosignatario). Todavía no está activa: no hay cosignatarios registrados (revisado en la cadena, 8 nov 2026), así que hoy el admin pausa solo. Registrarlos está planeado'),
                                    lang('Cosigners are contract-wide and set by the admin, not by each vault owner', 'Los cosignatarios son de todo el contrato y los fija el admin, no cada dueño de bóveda'),
                                ].map((x) => (
                                    <li key={x} className="flex items-start gap-2">
                                        <Shield className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                                        {x}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHAT NIRIUM CANNOT DO */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('What Nirium CANNOT do', 'Lo que Nirium NO puede hacer')}
                    </h2>
                    <p className="mt-4 text-center text-white/60">
                        {lang(
                            'Not a legal disclaimer - what the contracts themselves allow.',
                            'No es un disclaimer legal - es lo que los propios contratos permiten.')}
                    </p>

                    <div className="mt-10 space-y-3">
                        {[
                            lang('Withdraw your funds, or send them to any address', 'Retirar tus fondos, o mandarlos a cualquier dirección'),
                            lang('Spend more than the cap you set when delegating (NiriumVault)', 'Gastar más del tope que fijaste al delegar (NiriumVault)'),
                            lang('Access your private keys', 'Acceder a tus llaves privadas'),
                            lang('Change who a milestone escrow pays: a person fixes that when deploying it', 'Cambiar a quién paga un escrow por milestone: eso lo fija una persona al desplegarlo'),
                            lang('Change NiriumVault code once deployed: the live WASM has no upgrade function', 'Cambiar el código de NiriumVault una vez desplegado: el WASM en vivo no tiene función de actualización'),
                        ].map((item) => (
                            <div
                                key={item}
                                className="flex items-center gap-3 p-4 rounded-lg border border-red-500/10 bg-red-500/[0.02]"
                            >
                                <Lock className="w-4 h-4 text-red-400/80 shrink-0" />
                                <span className="text-sm text-white/70">{item}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex items-start gap-3 p-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.03]">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-white/70">
                            {lang(
                                "What Nirium CAN do on NiriumVault (testnet): pause the whole contract with its admin key. Today that takes no second signature. It freezes withdrawals until it is unpaused, but it cannot move funds.",
                                'Lo que Nirium SÍ puede hacer en NiriumVault (testnet): pausar todo el contrato con su llave admin. Hoy eso no requiere una segunda firma. Congela los retiros hasta que se reanude, pero no puede mover fondos.')}
                        </p>
                    </div>
                </div>
            </section>

            {/* THE CONTRACT */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('The real contract', 'El contrato real')}
                    </h2>
                    <p className="mt-4 text-center text-white/60">
                        {lang(
                            'NiriumVault is deployed on Stellar Testnet and is verifiable.',
                            'NiriumVault está desplegado en Stellar Testnet y es verificable.')}
                    </p>

                    <div className="mt-8 p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase tracking-widest text-white/40 font-mono">Contract ID</span>
                            <span className="text-xs text-stellar-teal/80 font-mono">Stellar Testnet</span>
                        </div>
                        <code className="text-sm text-white/80 font-mono break-all block">{VAULT_ID}</code>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <a
                                href={`https://stellar.expert/explorer/testnet/contract/${VAULT_ID}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs text-stellar-teal hover:underline"
                            >
                                <FileSearch className="w-3.5 h-3.5" />
                                {lang('View on Stellar Expert', 'Ver en Stellar Expert')}
                            </a>
                            <a
                                href={VAULT_SOURCE}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs text-stellar-teal hover:underline"
                            >
                                <FileSearch className="w-3.5 h-3.5" />
                                {lang('View source code (public repo)', 'Ver código fuente (repo público)')}
                            </a>
                        </div>
                        <div className="mt-5 pt-5 border-t border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-widest text-white/40 font-mono">WASM hash</span>
                                <span className="text-[10px] text-emerald-400/80 font-mono">{lang('verified on Stellar Expert, 9 Nov 2026', 'verificado en Stellar Expert, 9 nov 2026')}</span>
                            </div>
                            <code className="text-xs text-white/60 font-mono break-all block">{VAULT_WASM}</code>
                            <p className="text-[11px] text-white/50 leading-relaxed pt-1">
                                {lang(
                                    `GitHub built this WASM from the public repo (commit 8489481) and attested it, and that exact file is what was deployed. Stellar Expert matched it to the source and shows the contract as "verified". The code has no upgrade, migrate or set_wasm function and never calls update_current_contract_wasm, so it cannot be changed after deployment. Check it yourself: stellar contract fetch --id ${VAULT_ID} --network testnet, then compare its sha256 with the release file.`,
                                    `GitHub compiló este WASM desde el repo público (commit 8489481) y lo firmó, y ese archivo exacto es el que se desplegó. Stellar Expert lo comparó con el código y marca el contrato como "verified". El código no tiene función upgrade, migrate ni set_wasm y nunca llama a update_current_contract_wasm, así que no se puede cambiar después de desplegado. Compruébalo tú: stellar contract fetch --id ${VAULT_ID} --network testnet, y compara su sha256 con el archivo del release.`)}
                            </p>
                            <a href={VAULT_RELEASE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-stellar-teal hover:underline">
                                <ExternalLink className="w-3.5 h-3.5" />
                                {lang('The release: WASM and build attestation', 'El release: WASM y atestación del build')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* PREVIOUS CONTRACTS + 2-OF-3 (9-nov-2026) */}
            <section className="pb-16">
                <div className="max-w-4xl mx-auto px-6 space-y-6">
                    <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                        <h3 className="text-sm font-bold mb-1">{lang('Previous NiriumVault deployments (testnet)', 'Despliegues anteriores de NiriumVault (testnet)')}</h3>
                        <p className="text-xs text-white/50 mb-4">
                            {lang(
                                'They stay on testnet and cannot be changed. nirium.xyz no longer uses them, so vault counts restart on the verified contract.',
                                'Siguen en testnet y no se pueden cambiar. nirium.xyz ya no los usa, así que el conteo de bóvedas empieza de nuevo en el contrato verificado.')}
                        </p>
                        <div className="space-y-3">
                            {PREVIOUS_VAULTS.map((v) => (
                                <div key={v.id} className="p-3 rounded-lg border border-white/5 bg-black/20">
                                    <a href={`https://stellar.expert/explorer/testnet/contract/${v.id}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-stellar-teal/80 hover:underline break-all">{v.id}</a>
                                    <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{language === 'es' ? v.es : v.en}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
                        <h3 className="text-sm font-bold mb-2">{lang('Not built yet: withdrawals that need 2 of 3 people', 'Todavía no construido: retiros que piden a 2 de 3 personas')}</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            {lang(
                                "Today a withdrawal needs one signature: the vault owner's. The 2-of-3 in the contract only covers the emergency pause, and no cosigners are registered yet. A company that wants, say, its CFO, CEO and accountant to approve every withdrawal can get that from Stellar itself, without changing the contract: the vault owner is a Stellar account with three signers and a threshold of two. Soroban checks that account's signers against its medium threshold, so a withdrawal with a single signature is rejected by the network. What is missing is on our side: nirium.xyz signs with one wallet and cannot collect a second signature yet. Planned, not built.",
                                'Hoy un retiro pide una sola firma: la del dueño de la bóveda. El 2-de-3 del contrato solo cubre la pausa de emergencia, y todavía no hay cosignatarios registrados. Una empresa que quiera que, por ejemplo, su CFO, su CEO y su contador aprueben cada retiro puede obtenerlo de Stellar mismo, sin cambiar el contrato: el dueño de la bóveda es una cuenta de Stellar con tres firmantes y umbral de dos. Soroban revisa los firmantes de esa cuenta contra su umbral medio, así que la red rechaza un retiro con una sola firma. Lo que falta es de nuestro lado: nirium.xyz firma con una sola wallet y todavía no puede juntar una segunda firma. Planeado, no construido.')}
                        </p>
                        <a href={SOROBAN_AUTH_DOCS} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs text-stellar-teal hover:underline">
                            <ExternalLink className="w-3.5 h-3.5" />
                            {lang('Stellar docs: authorization and multisig', 'Docs de Stellar: autorización y multifirma')}
                        </a>
                    </div>
                </div>
            </section>

            {/* AUDIT */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Audit', 'Auditoría')}
                    </h2>
                    <div className="mt-10 grid sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-3" />
                            <div className="text-sm font-bold mb-2">{lang('DeFindex (mainnet)', 'DeFindex (mainnet)')}</div>
                            <div className="text-2xl font-black text-emerald-400 mb-1">{lang('OtterSec, Mar 2025', 'OtterSec, mar 2025')}</div>
                            <p className="text-xs text-white/50">{lang("Third-party contract, audited by its authors' auditor", 'Contrato de terceros, auditado por el auditor de sus autores')}</p>
                        </div>
                        <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
                            <AlertTriangle className="w-5 h-5 text-amber-400 mb-3" />
                            <div className="text-sm font-bold mb-2">{lang('NiriumVault (testnet)', 'NiriumVault (testnet)')}</div>
                            <div className="text-2xl font-black text-amber-400 mb-1">{lang('Pending', 'Pendiente')}</div>
                            <p className="text-xs text-white/50">
                                {lang('No external audit yet: it stays on testnet until one is done', 'Sin auditoría externa todavía: se queda en testnet hasta que se haga')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <SecurityDisclaimer />

            {/* CTA */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        {lang('Your keys, your funds', 'Tus llaves, tus fondos')}
                    </h2>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        {/* Antes llevaba a /build/niriumtober, que ya cerró. Las bóvedas de
                            testnet se crean en el dashboard. */}
                        <Link href="/dashboard">
                            <Button size="lg" variant="premium">
                                {lang('Create a testnet vault', 'Crear una bóveda en testnet')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/treasury">
                            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
                                {lang('View the product', 'Ver el producto')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
