/** Nirium - home x402-first (rediseño 4-oct-2026) **/
'use client';

// La home dejó de ser un catálogo de nodos: abre con lo único que un dev puede
// hacer en cinco minutos - cobrarle a un agente por su API con x402Serve().
// Lo que vivía aquí antes no se borró: las secciones para CFO/tesorería están
// en /treasury (components/home/TreasuryPlainTerms), el catálogo de nodos en
// /agents y GET /api/nodes, y el resto de productos en "More from Nirium".

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowRight, ChevronRight, ExternalLink, FileCheck, GitPullRequest,
    Lock, Send, ShieldCheck, BarChart3, Layers, Zap, Activity, Terminal,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import HeroParticles from "@/components/home/HeroParticles";
import PaymentStory from "@/components/home/PaymentStory";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";
import NiriumtoberBanner from "@/components/home/NiriumtoberBanner";
import SocialProof from "@/components/home/SocialProof";
import { isNiriumtoberLive, niriumtoberHref } from "@/lib/niriumtober";
import { niriumtoberHit, trackFunnel } from "@/lib/attribution";
import { MAINNET_API_URL, PROOF_TX_HASH, PROOF_TX_URL } from "@/lib/constants";

// El snippet de abajo se corrió TAL CUAL contra nirium@0.18.0 el 9-nov-2026
// (Node 24, express 5.3, @x402/* 2.30.0, facilitador de OpenZeppelin en
// testnet, cuentas nuevas fondeadas con Friendbot): 402 sin pago, 200 con
// pago y {"tempC":21}, 0.05 USDC liquidado en esta tx (verificada en Horizon,
// ledger 5637422). La corrida anterior fue con 0.16.0 el 4-oct
// (d121b61c...). Si se edita el snippet, hay que volver a correrlo y cambiar
// este hash.
//
// Ojo, visto en la misma prueba: el facilitador de testnet respondió 504 en
// 6 de 9 intentos y aun así liquidó el pago, así que el cliente pagó y recibió
// 402. Es del facilitador, no del snippet, pero quien lo pruebe puede verlo.
// Verificación externa de holistis: sus 21 casos y su resultado público (19-nov-2026).
const HOLISTIS_RESULT_URL = 'https://github.com/nirium-protocol/nirium/pull/396#issuecomment-7016710117';
const SNIPPET_TESTNET_TX = '97f11e97d81924b8874f4643bcb59720cc59dfc4248beae5059422b7ae800b90';
const SNIPPET_TESTNET_TX_URL = `https://stellar.expert/explorer/testnet/tx/${SNIPPET_TESTNET_TX}`;

const SERVE_SNIPPET = `import express from 'express';
import { x402Serve } from 'nirium';

const app = express();
app.use(x402Serve({
  payTo: process.env.PAY_TO,                       // your G... address
  facilitatorApiKey: process.env.FACILITATOR_KEY,  // free testnet key
  routes: { 'GET /weather': '$0.05' },             // testnet by default
}));
app.get('/weather', (_req, res) => res.json({ tempC: 21 }));
app.listen(3000);`;

const INSTALL_CMD = 'npm i nirium express @x402/express @x402/core @x402/stellar';

const PAY_SNIPPET = `import { Agent } from 'nirium';

const agent = new Agent({ apiKey: 'unused' });
agent.initX402({ secretKey: process.env.PAYER_SECRET, network: 'stellar:testnet' });
const res = await agent.x402Fetch('http://localhost:3000/weather'); // 402 → sign → 200`;

const CHANGELOG_URL = 'https://github.com/nirium-protocol/nirium/blob/main/packages/sdk/CHANGELOG.md';
const PR_98_URL = 'https://github.com/nirium-protocol/nirium/pull/98';
const ISSUE_96_URL = 'https://github.com/nirium-protocol/nirium/issues/96';

// Excerpt del adaptador real que se corrio hoy (9-oct-2026) contra el motor
// de politicas de AgentLedger - call() es el helper HTTP propio hacia ese
// motor, no parte de Nirium. Ver scratch/agentledger-policy-test/run/run.mjs.
const POLICY_SNIPPET = `// excerpt - call() is your own HTTP helper to your policy engine
agent.initX402({
  signer, network: "stellar:testnet",
  policy: {
    requireExpiry: true,
    evaluate: (ctx, { signal }) =>
      call("decide", { method: "POST", body: JSON.stringify(ctx), signal }),
    currentVersion: async (_ctx, { signal }) =>
      (await call("version", { signal })).policyVersion,
    onDecision: (record) =>
      call("outcome", { method: "POST", body: JSON.stringify(record) }),
  },
});`;

// Las tres decisiones de politica probadas con dinero real en testnet,
// verificadas contra Horizon por el hub el 8/9-oct-2026 (ver
// scratch/agentledger-policy-test/run/run-log.jsonl y run-race-log.jsonl).
const POLICY_ALLOW_TX = 'c0646b0e7ac186f26c539bc9ecacda286bb8764cc8d14d5fd33130a01850d5f4';
const POLICY_WAIT_THEN_ALLOW_TX = '63fe315ad191c12d8baab4e7d146dc4b8cd7bb0c0ce97261799021eb5163b71d';
const POLICY_RACE_ALLOW_TX = '20b9f5a21f012001488630e4f5be7a64c69f6a39648ad53b092d724df3c9b57c';
const stellarTestnetTx = (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`;

// Ancla propia de Nirium en mainnet (agent.id "selftest-nirium", 21-oct-2026):
// firmada y con record embebido, así /verify muestra el resultado completo
// (hash recalculado y firma válida). Es la misma que usa el botón de ejemplo
// de /verify. La anterior (QmZEuGg…) solo declaraba un hash, sin firma, y en
// /verify no mostraba quién la ancló. Se enlaza a /verify y no a un gateway
// público, que a veces tarda o limita.
const AUDIT_ANCHOR_CID = 'QmaAXCmpqaptjDTJoRPcyFBUywrvuA7GfLyArVaQwd5VDM';
const AUDIT_ANCHOR_URL = `/verify?cid=${AUDIT_ANCHOR_CID}`;
// Recibo firmado de un integrador externo (TIA, agent.id "tia-api", llave GATT3…),
// mainnet, 12-nov-2026. `nirium verify` → SIGNATURE: VALID. Es su cuarto anclaje.
const TIA_ANCHOR_CID = 'QmZ9bQxXLqoCvAQ6AtRChd18MS9YkjBF6MbT9k5e84PTTv';
const TIA_ANCHOR_URL = `/verify?cid=${TIA_ANCHOR_CID}`;
// AgentLedger, 18 Nov 2026, mainnet: receipt for a payment its policy BLOCKED, so no
// transaction exists and only the receipt records the decision (EVIDENCE.md section 3).
const REFUSED_ANCHOR_CID = 'QmS5q2NvZ2K2StLB3KCWRdkBtnZ5rHAJrQAez2PnKAPwTk';
const REFUSED_ANCHOR_URL = `/verify?cid=${REFUSED_ANCHOR_CID}`;

function CodeBlock({ code, filename, copyLabel, copiedLabel }: { code: string; filename: string; copyLabel: string; copiedLabel: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <div className="relative rounded-xl border border-white/10 bg-black overflow-hidden text-left">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    <span className="ml-3 text-xs text-white/40 font-mono">{filename}</span>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        navigator.clipboard.writeText(code);
                        trackFunnel("docs_copy", { source: "home" });
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-xs text-white/50 hover:text-stellar-teal transition-colors font-mono"
                >
                    {copied ? copiedLabel : copyLabel}
                </button>
            </div>
            <pre className="p-4 sm:p-5 text-[12px] sm:text-[13px] text-white/80 font-mono leading-relaxed overflow-x-auto">
                <code>{code}</code>
            </pre>
        </div>
    );
}

export default function Home() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === 'es' ? es : en);
    // Un solo CTA. Durante Niriumtober lleva a la campaña; después, a la guía de
    // testnet de esta misma página. Se decide en el navegador, como el banner,
    // para que el HTML estático no se quede con la fecha del build.
    const [startHref, setStartHref] = useState("#charge");
    useEffect(() => {
        if (isNiriumtoberLive()) setStartHref(niriumtoberHref("home"));
    }, []);
    const copy = lang('Copy', 'Copiar');
    const copied = lang('Copied!', '¡Copiado!');

    // "No nos creas. Verifícanos." - agrupado por verbo (correccion del
    // 9-oct-2026: el endpoint 402 y el primer settlement van con el verbo 2,
    // no el 3; /api/audit/info no es prueba; el verbo 3 usa el ancla real de
    // /stats, verificada contra Pinata antes de escribir esto).
    const proofGroups = [
        {
            label: lang('PROOF', 'PRUEBA'),
            items: [
                {
                    icon: FileCheck,
                    title: lang('Signed mainnet anchor (our own test)', 'Ancla firmada en mainnet (prueba propia)'),
                    detail: `${AUDIT_ANCHOR_CID.slice(0, 18)}…`,
                    cta: lang('verify it, 2026-10-21', 'verifícala, 2026-10-21'),
                    href: AUDIT_ANCHOR_URL,
                },
                {
                    icon: FileCheck,
                    title: lang('A refused payment, recorded: never signed, no transaction (AgentLedger)', 'Un pago rechazado, registrado: nunca se firmó, no hay transacción (AgentLedger)'),
                    detail: `${REFUSED_ANCHOR_CID.slice(0, 18)}…`,
                    cta: lang('verify it, 2026-11-18', 'verifícalo, 2026-11-18'),
                    href: REFUSED_ANCHOR_URL,
                },
                {
                    icon: FileCheck,
                    title: lang("An external integrator's signed mainnet receipt (TIA)", 'Recibo firmado en mainnet de un integrador externo (TIA)'),
                    detail: `${TIA_ANCHOR_CID.slice(0, 18)}…`,
                    cta: lang('verify it, 2026-11-12', 'verifícalo, 2026-11-12'),
                    href: TIA_ANCHOR_URL,
                },
                {
                    icon: ShieldCheck,
                    title: lang('Checked from outside: an independent reviewer verified our receipts with their own code', 'Revisado por fuera: un revisor independiente comprobó nuestros recibos con su propio código'),
                    detail: lang('21 test cases · nirium-protocol/nirium#396', '21 casos de prueba · nirium-protocol/nirium#396'),
                    cta: lang('their result, 2026-11-19', 'su resultado, 2026-11-19'),
                    href: HOLISTIS_RESULT_URL,
                },
            ],
        },
        {
            label: lang('POLICY', 'DECIDE'),
            items: [
                {
                    icon: GitPullRequest,
                    title: lang('Policy hook, merged in public', 'Hook de políticas, mergeado en público'),
                    detail: 'nirium-protocol/nirium#98',
                    cta: 'GitHub',
                    href: PR_98_URL,
                },
                {
                    icon: ShieldCheck,
                    title: lang('Concurrent decisions, verified against Horizon', 'Decisiones concurrentes, verificadas contra Horizon'),
                    detail: `${POLICY_RACE_ALLOW_TX.slice(0, 20)}…`,
                    cta: lang('testnet, 2026-10-09', 'testnet, 2026-10-09'),
                    href: stellarTestnetTx(POLICY_RACE_ALLOW_TX),
                },
            ],
        },
        {
            label: lang('CHARGE', 'COBRA'),
            items: [
                {
                    icon: Activity,
                    title: lang('Mainnet endpoint, answers 402', 'Endpoint en mainnet, responde 402'),
                    detail: 'GET /api/v1/premium/market',
                    cta: lang('last paid 18 Nov 2026', 'último pago 18 nov 2026'),
                    href: `${MAINNET_API_URL}/api/v1/premium/market`,
                },
                {
                    icon: Zap,
                    title: lang('Our first mainnet x402 settlement (own test wallet)', 'Nuestro primer pago x402 liquidado en mainnet (wallet de prueba propia)'),
                    detail: `${PROOF_TX_HASH.slice(0, 20)}…`,
                    cta: 'stellar.expert',
                    href: PROOF_TX_URL,
                },
                {
                    icon: Terminal,
                    title: lang('The snippet above, run verbatim', 'El snippet de arriba, corrido tal cual'),
                    detail: `${SNIPPET_TESTNET_TX.slice(0, 20)}…`,
                    cta: lang('testnet, 2026-11-09', 'testnet, 2026-11-09'),
                    href: SNIPPET_TESTNET_TX_URL,
                },
            ],
        },
    ];

    return (
        <main className="min-h-screen bg-black text-white antialiased overflow-x-hidden">
            <Navbar />

            <div className="w-full pt-[115px] sm:pt-[140px] px-0 sm:px-4 flex flex-col items-center gap-3 relative z-50">
                <NiriumtoberBanner />
                <LegalDisclaimer variant="banner" locale={language === 'es' ? 'es' : 'en'} className="w-full max-w-[1600px] sm:rounded-xl shadow-2xl" />
            </div>

            {/* HERO - 19-nov-2026: abre con lo que solo Nirium hace (lo que la cadena no muestra), después los tres verbos */}
            <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.08),transparent_60%)]" />
                <HeroParticles />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                        </span>
                        {lang('Audit Trail + x402 on Stellar · testnet + mainnet', 'Audit Trail + x402 en Stellar · testnet + mainnet')}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.05 }}
                        className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight"
                    >
                        {language === 'es' ? (
                            <>Demuestra lo que la <span className="text-stellar-yellow">cadena</span> no muestra.</>
                        ) : (
                            <>Prove what the <span className="text-stellar-yellow">chain</span> doesn&apos;t show.</>
                        )}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mt-5 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
                    >
                        {lang(
                            'The ledger already proves who paid, how much and when. Nirium keeps what it can\'t: what each payment was for, the payments your policy refused and never signed, off-chain records, and who stands behind them. Payment, audit and execution rails for apps, backends and AI agents. Non-custodial: your keys, your funds.',
                            'El ledger ya prueba quién pagó, cuánto y cuándo. Nirium guarda lo que falta: para qué fue cada pago, los pagos que tu política rechazó y nunca firmó, los registros fuera de la cadena y quién responde por ellos. Rieles de pago, auditoría y ejecución para apps, backends y agentes de IA. No custodial: tus llaves, tus fondos.')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center"
                    >
                        <a href={startHref} onClick={() => { trackFunnel("cta_start", { source: "home_hero" }); niriumtoberHit("cta_home"); }}>
                            <Button size="lg" variant="premium" className="w-full sm:w-auto">
                                {lang('Start in 5 minutes', 'Empieza en 5 minutos')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </a>
                        <a href="/verify">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                {lang('Verify a receipt', 'Verifica un recibo')}
                                <FileCheck className="ml-2 w-4 h-4" />
                            </Button>
                        </a>
                    </motion.div>
                    <SocialProof />
                </div>
            </section>

            {/* UN PAGO, DE PUNTA A PUNTA - scrollytelling */}
            <PaymentStory />

            {/* LOS TRES VERBOS - un bloque por verbo, cada uno con código real, estado honesto y prueba */}
            <section className="py-16 sm:py-20 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-20">

                    {/* Verbo 3 - Demuestra lo que la cadena no muestra */}
                    <div id="prove" className="scroll-mt-28">
                        <div className="flex items-center gap-2 mb-3">
                            <FileCheck className="w-4 h-4 text-stellar-teal" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-stellar-teal/70">{lang('PROOF', 'PRUEBA')}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold">{lang('Prove what the chain doesn\'t show', 'Demuestra lo que la cadena no muestra')}</h2>
                        <p className="mt-3 text-white/60 max-w-2xl">
                            {lang(
                                'A Stellar payment is already public on the ledger. Audit Trail covers what is not: what your policy decided, including payments it refused and never signed, a record of what each payment bought, and any document or event off chain. Anyone can check it from a hash alone, and if anyone changes a receipt, it shows: the CID no longer matches.',
                                'Un pago en Stellar ya es público en el ledger. Audit Trail cubre lo que no está ahí: lo que decidió tu política, incluidos los pagos que rechazó y nunca firmó, un registro de qué compró cada pago, y cualquier documento o evento fuera de la cadena. Cualquiera lo revisa solo con el hash, y si alguien cambia un recibo, se nota: el CID deja de coincidir.')}
                        </p>
                        <div className="mt-6">
                            <CodeBlock
                                code={`POST /api/audit/log\n\n// example request, not a live anchor:\n{ "hash": "sha-256:e3b0c442...", "tag": "invoice-2026-07" }`}
                                filename="audit-log.http"
                                copyLabel={copy}
                                copiedLabel={copied}
                            />
                        </div>
                        <p className="mt-3 text-xs text-emerald-400/80">
                            {lang('Live on mainnet · free during beta.', 'En vivo en mainnet · gratis durante beta.')}
                        </p>
                        <p className="mt-3 text-xs text-white/50 leading-relaxed max-w-2xl">
                            {/* 21-nov-2026: IPFS guarda un archivo solo mientras alguien lo fija. Hoy lo fija
                                Pinata; la segunda copia en Filebase está lista pero inactiva (plan de pago),
                                por eso aquí solo se promete lo que ya funciona: la copia del propio cliente. */}
                            {lang('Keep your own copy: ', 'Guarda tu propia copia: ')}
                            <code className="font-mono text-stellar-teal/80">nirium anchor --save receipt.json</code>
                            {lang('. If IPFS ever loses it, ', '. Si algún día IPFS la pierde, ')}
                            <code className="font-mono text-stellar-teal/80">nirium cid receipt.json</code>
                            {lang(' shows it is the original, without relying on us.', ' demuestra que es el original, sin depender de nosotros.')}
                        </p>
                        <a href={REFUSED_ANCHOR_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-xs text-stellar-teal/80 hover:text-stellar-teal">
                            {lang('Verify a receipt for a payment that never happened (AgentLedger blocked it, mainnet, 18 Nov 2026)', 'Verifica el recibo de un pago que nunca ocurrió (AgentLedger lo bloqueó, mainnet, 18 nov 2026)')} <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Verbo 1 - Paga con tu propia política */}
                    <div id="policy" className="scroll-mt-28">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className="w-4 h-4 text-stellar-teal" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-stellar-teal/70">{lang('POLICY', 'DECIDE')}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold">{lang('Pay with your own policy', 'Paga con tu propia política')}</h2>
                        <p className="mt-3 text-white/60 max-w-2xl">
                            {lang(
                                "Before your agent signs a payment, Nirium asks your policy engine.",
                                'Antes de que tu agente firme un pago, Nirium le pregunta a tu motor de políticas.')}
                        </p>
                        <div className="mt-6">
                            <CodeBlock code={POLICY_SNIPPET} filename="client.js" copyLabel={copy} copiedLabel={copied} />
                        </div>
                        <p className="mt-3 text-xs text-amber-400/80 leading-relaxed">
                            {lang(
                                "Since 0.16.0 · experimental - the shape may change before 1.0. Tested on testnet and run on mainnet with AgentLedger (18 Nov 2026), engine-neutral by design (no smart account required on your side).",
                                'Desde 0.16.0 · experimental - la forma puede cambiar antes de 1.0. Probado en testnet y corrido en mainnet con AgentLedger (18 nov 2026), neutral al motor por diseño (no necesitas una smart account de tu lado).')}
                        </p>
                        <p className="mt-2 text-xs text-white/45 leading-relaxed">
                            {lang(
                                "The hook itself doesn't resolve concurrent requests - your engine does. AgentLedger's does it atomically (verified 2026-10-09, testnet). Code running in the same process as the raw signer can still sign around the hook - that gap is still open.",
                                'El hook no resuelve la concurrencia por sí solo - la resuelve tu motor. El de AgentLedger lo hace de forma atómica (verificado el 9-oct-2026, testnet). Código que corre en el mismo proceso que el firmante crudo todavía puede firmar saltándose el hook; ese hueco sigue abierto.')}
                        </p>
                        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3">
                                {lang('Three decisions, verified against Horizon', 'Tres decisiones, verificadas contra Horizon')}
                            </p>
                            <ul className="space-y-2 text-xs">
                                <li>
                                    <a href={stellarTestnetTx(POLICY_ALLOW_TX)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-stellar-teal/80 hover:text-stellar-teal">
                                        {lang('ALLOW, straight through', 'ALLOW directo')} <ExternalLink className="w-3 h-3" />
                                    </a>
                                </li>
                                <li>
                                    <a href={stellarTestnetTx(POLICY_WAIT_THEN_ALLOW_TX)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-stellar-teal/80 hover:text-stellar-teal">
                                        {lang('WAIT -> human approval -> ALLOW', 'WAIT -> aprobación humana -> ALLOW')} <ExternalLink className="w-3 h-3" />
                                    </a>
                                </li>
                                <li>
                                    <a href={stellarTestnetTx(POLICY_RACE_ALLOW_TX)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-stellar-teal/80 hover:text-stellar-teal">
                                        {lang('Two requests at once, room for one: one settles, the other DENY', 'Dos requests a la vez, espacio para uno: uno liquida, el otro DENY')} <ExternalLink className="w-3 h-3" />
                                    </a>
                                </li>
                            </ul>
                            <p className="mt-3 text-[10px] text-white/35">
                                {lang('Integration test coordinated with AgentLedger.', 'Prueba de integración coordinada con AgentLedger.')}
                            </p>
                        </div>
                    </div>

                    {/* Verbo 2 - Cobra por request */}
                    <div id="charge" className="scroll-mt-28">
                        <div className="flex items-center gap-2 mb-3">
                            <Terminal className="w-4 h-4 text-stellar-teal" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-stellar-teal/70">{lang('CHARGE', 'COBRA')}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold">{lang('Charge per request', 'Cobra por request')}</h2>
                        <p className="mt-3 text-white/60 max-w-2xl">
                            {lang('One middleware, and your API charges per call.', 'Un middleware, y tu API cobra por llamada.')}
                        </p>
                        <div className="mt-6">
                            <CodeBlock code={SERVE_SNIPPET} filename="server.js" copyLabel={copy} copiedLabel={copied} />
                        </div>
                        <p className="mt-3 text-xs text-white/40 font-mono leading-relaxed">
                            {lang('Ran verbatim with nirium@0.18.0 on testnet (9 Nov 2026): ', 'Corrido tal cual con nirium@0.18.0 en testnet (9 nov 2026): ')}
                            <a href={SNIPPET_TESTNET_TX_URL} target="_blank" rel="noopener noreferrer" className="text-stellar-teal/80 hover:text-stellar-teal underline underline-offset-2">
                                {lang('402, then paid, then 200', '402, luego pago, luego 200')}
                            </a>.
                        </p>
                        <p className="mt-3 text-xs text-white/45 leading-relaxed">
                            {lang(
                                // Decía "ya cobra en mainnet". "Cobrando" solo se afirma con un pago
                                // reciente y su fecha. Último pago a la cuenta de cobro (GCLBBPON...):
                                // 18-nov-2026, corridas de prueba de AgentLedger (Horizon, 19-nov).
                                "Open to everyone on testnet. Nirium's own endpoint answers 402 on mainnet; its last payment settled on 18 Nov 2026, in an integration test. Charging on your own API (x402Serve) on mainnet is not something we promote for third parties until we have a written legal opinion.",
                                'Abierto a todos en testnet. El endpoint de Nirium responde 402 en mainnet; su último pago se liquidó el 18 nov 2026, en una prueba de integración. Cobrar en tu propia API (x402Serve) en mainnet no lo promovemos para terceros hasta tener una opinión legal por escrito.')}
                        </p>
                        <div className="mt-6 grid sm:grid-cols-3 gap-4 text-xs">
                            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                                <div className="font-mono text-white/30 mb-2">01 {lang('Install', 'Instala')}</div>
                                <pre className="p-2 rounded-lg bg-black border border-white/10 font-mono text-white/70 whitespace-pre-wrap break-all text-[10px]">{INSTALL_CMD}</pre>
                            </div>
                            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                                <div className="font-mono text-white/30 mb-2">02 {lang('Get a key', 'Saca una llave')}</div>
                                <p className="text-white/55 leading-relaxed">
                                    {lang('Free testnet facilitator key from OpenZeppelin.', 'Llave gratis de facilitador de testnet en OpenZeppelin.')}
                                </p>
                                <a href="https://channels.openzeppelin.com/testnet/gen" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-stellar-teal hover:underline">
                                    channels.openzeppelin.com/testnet/gen <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                                <div className="font-mono text-white/30 mb-2">03 {lang('Pay it', 'Págalo')}</div>
                                <p className="text-white/55 leading-relaxed">
                                    {lang('Any x402 client works, from a testnet account with USDC.', 'Sirve cualquier cliente x402, desde una cuenta de testnet con USDC.')}
                                </p>
                            </div>
                        </div>
                        <a href={CHANGELOG_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70">
                            {lang('Also ships: replay guard + rate limit, opt-in since 0.15.0', 'También trae: protección contra replay + rate limit, opcional desde 0.15.0')} <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                </div>
            </section>

            {/* PROOF - no nos creas: verifícanos */}
            <section className="py-14 border-t border-emerald-400/10 bg-gradient-to-b from-emerald-400/[0.04] to-transparent">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                            {lang("Don't trust us. Verify us.", 'No nos creas. Verifícanos.')}
                        </h2>
                        <p className="text-[11px] text-white/40 font-mono text-center">
                            {lang('Every claim below resolves to something public.', 'Cada afirmación de abajo se puede comprobar en algo público.')}
                        </p>
                    </div>
                    <div className="space-y-8">
                        {proofGroups.map((group) => (
                            <div key={group.label}>
                                <p className="text-[10px] font-mono uppercase tracking-widest text-white/35 mb-3">{group.label}</p>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {group.items.map((p) => {
                                        const inner = (
                                            <>
                                                <p.icon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-white/90">{p.title}</div>
                                                    <div className="text-[10px] font-mono text-white/35 truncate mt-0.5">{p.detail}</div>
                                                    <div className="text-[10px] text-emerald-400/70 mt-1 inline-flex items-center gap-1">{p.cta} <ExternalLink className="w-2.5 h-2.5" /></div>
                                                </div>
                                            </>
                                        );
                                        const cls = "flex items-start gap-3 p-4 rounded-xl border border-emerald-400/15 bg-black/40 hover:border-emerald-400/40 transition-colors";
                                        return (
                                            <a key={p.title} href={p.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HECHO CON NIRIUM - teaser, el catálogo completo vive en /ecosystem */}
            <section className="py-12 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
                    <Link href="/ecosystem" className="inline-flex items-center gap-1.5 text-sm text-stellar-teal/80 hover:text-stellar-teal">
                        {lang("Who we work with: Pollar, TIA, Trustless Work and AgentLedger (its founder joined the Nirium team in October 2026), and what Nirium itself depends on.", 'Con quién trabajamos: Pollar, TIA, Trustless Work y AgentLedger (su fundador se unió al equipo de Nirium en octubre de 2026), y de qué depende Nirium mismo.')} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </section>

            {/* AVISO LEGAL - puntero corto; el texto canónico vive en /disclaimers.
                Treasury/Payouts/Fiat Hub/Strategy Builder etc. salieron del cuerpo de
                la landing (9-oct-2026) y se quedan solo en Producto > navbar. */}
            <section className="py-10 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <p className="text-[10px] text-white/30 font-mono leading-relaxed border border-white/5 rounded-lg px-5 py-3 bg-white/[0.01]">
                        <span className="text-white/45 font-semibold uppercase tracking-widest">
                            {lang('Legal notice', 'Aviso legal')} -{' '}
                        </span>
                        {lang(
                            'Nirium is B2B software-only infrastructure and never custodies funds; financial services (SPEI onramp, CETES custody) are operated by independent third parties, under their own terms.',
                            'Nirium es infraestructura de software B2B y nunca custodia fondos; los servicios financieros (onramp SPEI, custodia de CETES) los operan terceros independientes, bajo sus propios términos.')}
                        {' '}
                        <Link href="/disclaimers" className="text-stellar-teal/80 hover:text-stellar-teal underline underline-offset-2 font-bold">
                            {lang('Read full legal notice →', 'Ver aviso legal completo →')}
                        </Link>
                    </p>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-20 sm:py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        {lang('Set the policy, charge per call, prove what the chain doesn\'t show.', 'Define tu política, cobra por llamada, demuestra lo que la cadena no muestra.')}
                    </h2>
                    <p className="mt-4 text-white/60 max-w-xl mx-auto">
                        {lang('Start on testnet in five minutes. Nirium\'s own endpoint answers 402 on mainnet; third-party mainnet use is not something we promote until we have a written legal opinion.', 'Empieza en testnet en cinco minutos. El endpoint propio de Nirium responde 402 en mainnet; el uso en mainnet por terceros no lo promovemos hasta tener una opinión legal por escrito.')}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        <a href={startHref} onClick={() => { trackFunnel("cta_start", { source: "home_final" }); niriumtoberHit("cta_home"); }}>
                            <Button size="lg" variant="premium" className="w-full sm:w-auto">
                                {lang('Start in 5 minutes', 'Empieza en 5 minutos')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </a>
                        <a href="https://github.com/nirium-protocol/nirium" target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/5">
                                GitHub
                                <ExternalLink className="ml-2 w-4 h-4" />
                            </Button>
                        </a>
                    </div>
                    <Link href="/stats" className="mt-6 inline-flex items-center gap-1.5 text-sm text-stellar-teal hover:underline">
                        {lang('See live usage', 'Ver uso en vivo')} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </section>

            {/* BUILT ON OPEN STANDARDS */}
            <section className="py-12 border-t border-white/5 bg-black/50 text-center">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">{lang('Built on Open Standards', 'Construido sobre estándares abiertos')}</h3>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-white/60 mb-6">
                        <span className="font-mono">x402</span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono">MPP <span className="text-white/35">(testnet)</span></span>
                        <span className="text-white/20">•</span>
                        {/* LCP salía aquí como "estándar abierto". Es la capa propia de Nirium,
                            apagada mientras dura la revisión legal: no va en esta fila. */}
                        <span className="font-mono">Apache 2.0</span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono text-emerald-400">Stellar Mainnet</span>
                        <span className="text-white/20">+</span>
                        <span className="font-mono text-stellar-teal">Testnet</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono">
                        {lang('All rate data shown is protocol reference information only - not a return projection or guarantee.', 'Toda tasa mostrada es información de referencia del protocolo - no una proyección ni garantía de retorno.')}
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
