"use client";
import LiveReport from "@/components/shared/LiveReport";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
    ArrowLeft, ArrowRight, ExternalLink, Shield, Terminal, Hash, CheckCircle2,
    Lock, ShieldCheck, FileCheck, Code2, ListChecks, Scale, Map as MapIcon,
    AlertTriangle, Copy, BarChart3,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// ═══════════════════════════════════════════════════════════════
// /docs — Audit Trail: Verifiable Receipts
// ═══════════════════════════════════════════════════════════════
//
// Rewritten 29-oct-2026 as a single-focus reference for SCF Build Award #46
// reviewers: what a Nirium receipt is, how to get one, and how to check it
// yourself without trusting Nirium. Every command, hash and CID below was
// run live against nirium-agent.fly.dev (testnet) and
// nirium-agent-mainnet.fly.dev (mainnet) on 29-oct-2026 - see the PR
// description for the full transcript.
//
// Translated to Spanish 4-nov-2026, wired into the site's existing
// LanguageContext/useLanguage() toggle (the one in the Navbar already
// existed and worked everywhere except this page - it rendered but had
// nothing to switch here). Commands, code blocks, hashes, CIDs and
// filenames are left as-is in both languages on purpose.
//
// Treasury, Payouts and Vault are separate, invite-only modules and are
// deliberately out of scope here (see the closing line of §10).
// ═══════════════════════════════════════════════════════════════

const TESTNET_BASE = "https://nirium-agent.fly.dev";
const MAINNET_BASE = "https://nirium-agent-mainnet.fly.dev";

const SECTIONS = [
    { id: "what-it-is", en: "What Nirium Is", es: "Qué es Nirium" },
    { id: "quickstart", en: "Quickstart (5 min)", es: "Inicio rápido (5 min)" },
    { id: "receipt-format", en: "Receipt Format", es: "Formato del recibo" },
    { id: "verifying", en: "Verifying a Receipt", es: "Verificar un recibo" },
    { id: "reporting", en: "Reporting", es: "Reportes" },
    { id: "x402-sellers", en: "x402 Sellers", es: "Vendedores x402" },
    { id: "policy-hook", en: "Pre-Sign Policy Hook", es: "Hook de política antes de firmar" },
    { id: "escrow-evidence", en: "Escrow Evidence", es: "Evidencia de escrow" },
    { id: "evidence", en: "Evidence", es: "Evidencia" },
    { id: "security-limits", en: "Security & Limits", es: "Seguridad y límites" },
    { id: "roadmap", en: "Roadmap", es: "Hoja de ruta" },
] as const;

function CodeBlock({ children, label }: { children: string; label?: string }) {
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === "es" ? es : en);
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(children.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden my-4">
            {label && (
                <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">{label}</span>
                    <button onClick={copy} className="text-gray-500 hover:text-white transition-colors flex items-center gap-1 text-[11px]">
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? lang("Copied", "Copiado") : lang("Copy", "Copiar")}
                    </button>
                </div>
            )}
            <pre className="p-4 text-xs sm:text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre">{children.trim()}</pre>
        </div>
    );
}

function NetworkBadge({ network }: { network: "testnet" | "mainnet" }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide ${
            network === "mainnet"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        }`}>
            {network}
        </span>
    );
}

function ReceiptCard({
    network, cid, hash, note,
}: { network: "testnet" | "mainnet"; cid: string; hash: string; note: string }) {
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === "es" ? es : en);
    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
                <NetworkBadge network={network} />
                <a
                    href={`https://nirium.xyz/verify?cid=${cid}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-stellar-teal hover:underline inline-flex items-center gap-1"
                >
                    {lang("Open in /verify", "Abrir en /verify")} <ExternalLink className="w-3 h-3" />
                </a>
            </div>
            <div className="text-xs font-mono text-gray-300 break-all">{cid}</div>
            <div className="text-[11px] font-mono text-gray-500 break-all">sha256: {hash}</div>
            <p className="text-[11px] text-gray-500">{note}</p>
        </div>
    );
}

function EvidenceTable({ rows }: {
    rows: { proves: string; ref: string; refLink?: string; date: string; link: string }[];
}) {
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === "es" ? es : en);
    return (
        <div className="not-prose overflow-x-auto my-4 rounded-xl border border-white/10">
            <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-gray-500">
                        <th className="py-2.5 px-3 font-mono uppercase tracking-wider text-[10px]">{lang("What it proves", "Qué prueba")}</th>
                        <th className="py-2.5 px-3 font-mono uppercase tracking-wider text-[10px]">Hash / CID</th>
                        <th className="py-2.5 px-3 font-mono uppercase tracking-wider text-[10px]">{lang("Date", "Fecha")}</th>
                        <th className="py-2.5 px-3 font-mono uppercase tracking-wider text-[10px]">{lang("Link", "Enlace")}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                            <td className="py-3 px-3 text-gray-300 align-top">{r.proves}</td>
                            <td className="py-3 px-3 font-mono text-stellar-teal break-all align-top max-w-[220px]">{r.ref}</td>
                            <td className="py-3 px-3 text-gray-500 whitespace-nowrap align-top">{r.date}</td>
                            <td className="py-3 px-3 align-top">
                                <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline inline-flex items-center gap-1 whitespace-nowrap">
                                    {lang("View", "Ver")} <ExternalLink className="w-3 h-3" />
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Section({ id, title, kicker, icon: Icon, children }: {
    id: string; title: string; kicker: string; icon: any; children: React.ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-28 pb-16 mb-16 border-b border-white/5 last:border-0">
            <p className="text-[11px] font-mono uppercase tracking-widest text-stellar-teal mb-2 flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" /> {kicker}
            </p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-6">{title}</h2>
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4 [&_code]:text-stellar-teal [&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_a]:text-stellar-teal [&_a:hover]:underline">
                {children}
            </div>
        </section>
    );
}

function DocsContent() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === "es" ? es : en);
    const [active, setActive] = useState<string>(SECTIONS[0].id);
    const observedRef = useRef(false);

    useEffect(() => {
        if (observedRef.current) return;
        observedRef.current = true;
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setActive(visible[0].target.id);
            },
            { rootMargin: "-120px 0px -70% 0px", threshold: 0 }
        );
        SECTIONS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-stellar-teal/30">
            <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 pt-[100px] sm:pt-[130px] pb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> {lang("Back to Nirium", "Volver a Nirium")}
                </Link>

                <header className="mb-14 pb-10 border-b border-white/10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stellar-teal/10 border border-stellar-teal/20 text-stellar-teal text-[10px] font-black uppercase tracking-widest mb-5">
                        <Hash className="w-3 h-3" /> Audit Trail
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-4 leading-[1.05]">
                        {lang("Verifiable Receipts for Stellar Payments", "Recibos verificables para pagos en Stellar")}
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl leading-relaxed mb-6">
                        {lang(
                            "Nirium anchors payment and audit evidence as cryptographic receipts anyone can check independently. Non-custodial: we only verify and record - you and your counterparties sign every transaction yourselves.",
                            "Nirium ancla evidencia de pagos y auditoría como recibos criptográficos que cualquiera puede comprobar de forma independiente. No custodial: solo verificamos y registramos, tú y tus contrapartes firman cada transacción ustedes mismos."
                        )}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a href="https://nirium.xyz/verify" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-stellar-teal transition-colors inline-flex items-center gap-2">
                            {lang("Verify a receipt", "Verificar un recibo")} <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                        <a href="https://github.com/nirium-protocol/nirium" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-white/10 transition-colors inline-flex items-center gap-2">
                            GitHub <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar index. Not `position: sticky` on purpose - this page
                        renders inside AppLayout's `<main class="overflow-auto">`,
                        which formally qualifies as the nearest scroll container
                        even though it never actually scrolls (the real scrollbar
                        lives on <body> above it), which silently breaks sticky.
                        A plain in-flow index avoided depending on that shared
                        layout's internals. */}
                    <nav className="lg:w-64 shrink-0 order-first">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-3 px-2">{lang("On this page", "En esta página")}</p>
                        <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0">
                            {SECTIONS.map((s, i) => (
                                <li key={s.id} className="shrink-0">
                                    <a
                                        href={`#${s.id}`}
                                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                                            active === s.id
                                                ? "bg-stellar-teal/15 text-stellar-teal font-bold"
                                                : "text-gray-500 hover:text-white hover:bg-white/5"
                                        }`}
                                    >
                                        <span className="font-mono text-[10px] opacity-60 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                                        {lang(s.en, s.es)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Content */}
                    <div className="flex-1 min-w-0 max-w-3xl">

                        <Section id="what-it-is" kicker={lang("01 · Overview", "01 · Resumen")} title={lang("What Nirium Is", "Qué es Nirium")} icon={Shield}>
                            <p>
                                {lang(
                                    "Nirium anchors evidence - a payment, an API response, a milestone decision - as a sha-256 hash pinned to IPFS, with an optional ed25519 signature that shows which key signed it. The result is a ",
                                    "Nirium ancla evidencia (un pago, la respuesta de una API, la decisión de un hito) como un hash sha-256 anclado en IPFS, con una firma ed25519 opcional que muestra qué llave lo firmó. El resultado es un "
                                )}
                                <strong className="text-white">{lang("receipt", "recibo")}</strong>
                                {lang(
                                    ": a CID anyone can resolve, recompute, and compare against the original evidence, with or without Nirium being online.",
                                    ": un CID que cualquiera puede resolver, recalcular y comparar contra la evidencia original, con o sin que Nirium esté en línea."
                                )}
                            </p>
                            <p>
                                <strong className="text-white">{lang("Non-custodial by design.", "No custodial por diseño.")}</strong>{" "}
                                {lang(
                                    "Nirium never holds funds and never sees a private key: ",
                                    "Nirium nunca sostiene fondos ni ve una llave privada: "
                                )}
                                <code>POST /api/audit/log</code>{" "}
                                {lang(
                                    "only ever receives a hash (or a small JSON record) and, optionally, a signature someone else already produced. Every payment, approval or release referenced anywhere in this document is signed by the party that owns the funds, not by Nirium.",
                                    "solo recibe un hash (o un pequeño registro JSON) y, de forma opcional, una firma que alguien más ya produjo. Cada pago, aprobación o liberación mencionado en este documento lo firma quien es dueño de los fondos, nunca Nirium."
                                )}
                            </p>
                            <p>
                                {lang(
                                    "A CID by itself proves a fact did not change after it was anchored - it does not prove who produced it. The optional agent signature closes that second gap. Both are explained in detail in §3 and §4 below.",
                                    "Un CID por sí solo prueba que un hecho no cambió después de anclarse, no prueba quién lo produjo. La firma opcional del agente cierra ese segundo hueco. Ambas cosas se explican a detalle en el §3 y el §4 más abajo."
                                )}
                            </p>
                        </Section>

                        <Section id="quickstart" kicker={lang("02 · Quickstart", "02 · Inicio rápido")} title={lang("Quickstart (5 min)", "Inicio rápido (5 min)")} icon={Terminal}>
                            <p>
                                {lang(
                                    "Every command below ran against the live agent on 21-nov-2026. Swap the base URL to switch networks: ",
                                    "Cada comando de abajo corrió contra el agente en vivo el 21-nov-2026. Cambia la URL base para cambiar de red: "
                                )}
                                <code>{TESTNET_BASE}</code>{" "}
                                {lang("for testnet, ", "para testnet, ")}
                                <code>{MAINNET_BASE}</code>{" "}
                                {lang("for mainnet - both boxes expose the identical API.", "para mainnet, ambos servidores exponen la misma API.")}
                            </p>

                            <p className="!mb-2"><strong className="text-white">{lang("1. Get a free API key (optional today).", "1. Obtén una API key gratis (opcional por ahora).")}</strong></p>
                            <p>
                                {lang("Open ", "Entra a ")}<Link href="/keys">/keys</Link>
                                {lang(
                                    ", connect a Stellar wallet (Freighter, Pollar or any wallet-kit supported signer), and generate a free key. ",
                                    ", conecta una wallet de Stellar (Freighter, Pollar o cualquier firmante compatible con wallet-kit), y genera una key gratis. "
                                )}
                                <code>POST /api/audit/log</code>{" "}
                                {lang(
                                    "currently accepts requests with no key at all during the open beta - rate-limited to 20 requests/minute per IP on each box - so this step is optional right now and will matter once audit pricing goes live. Payouts does require one. The x402 and MPP routes don't: the payment itself is the access.",
                                    "hoy acepta solicitudes sin ninguna key durante la beta abierta (con límite de 20 solicitudes por minuto por IP en cada servidor), así que este paso es opcional por ahora y va a importar cuando el cobro del audit entre en vigor. Payouts sí la requiere. Las rutas x402 y MPP no: el pago mismo es el acceso."
                                )}
                            </p>

                            <p className="!mb-2"><strong className="text-white">{lang("2. Anchor a receipt.", "2. Ancla un recibo.")}</strong></p>
                            <CodeBlock label="testnet">{`
curl -X POST ${TESTNET_BASE}/api/audit/log \\
  -H "Content-Type: application/json" \\
  -d '{"record":{"doc_type":"invoice","amount_usd":42,"ref":"your-reference"},"tag":"demo"}'
`}</CodeBlock>
                            <CodeBlock label={lang("response, verbatim", "respuesta, textual")}>{`
{
  "cid": "QmehRz7Xab8Cg27fypBiffVgW11Yoac6BJcgd3g1pH5V7m",
  "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmehRz7Xab8Cg27fypBiffVgW11Yoac6BJcgd3g1pH5V7m",
  "content_sha256": "26a1d68440440d4ff02ac75c60ffebd7a6cb471b1634d25c8221609bcb6c4d55",
  "anchoredAt": "2026-11-21T22:18:49.010Z",
  "document": {
    "version": "1.1.0",
    "node": "audit-external",
    "content_sha256": "26a1d68440440d4ff02ac75c60ffebd7a6cb471b1634d25c8221609bcb6c4d55",
    "record": { "doc_type": "invoice", "amount_usd": 42, "ref": "your-reference" },
    "network": "stellar:testnet",
    "tag": "demo",
    "anchoredAt": "2026-11-21T22:18:49.010Z"
  },
  "keep": "Save \`document\` as JSON.stringify(document), no trailing newline. If IPFS ever loses this CID, adding those bytes again (CIDv0) gives back the same CID.",
  "verify": "fetch the gatewayUrl and recompute sha-256 over your original evidence"
}
`}</CodeBlock>
                            <p className="text-sm">
                                {lang(
                                    "Indented here for reading; the API answers on one line. Update, 21 Nov 2026: since that day the response also carries ",
                                    "Con sangría aquí para leerla; la API responde en una sola línea. Actualización, 21 nov 2026: desde ese día la respuesta trae también "
                                )}
                                <code>document</code>{lang(" (the exact document pinned) and ", " (el documento exacto que se fijó) y ")}<code>keep</code>
                                {lang(
                                    ". The response shown here before (29 Oct 2026) came from a request with a different ",
                                    ". La respuesta que se mostraba antes (29 oct 2026) venía de una solicitud con otro "
                                )}
                                <code>ref</code>
                                {lang(", so its hash did not match the command above; this one does.", ", así que su hash no coincidía con el comando de arriba; esta sí.")}
                            </p>

                            <p className="!mb-2"><strong className="text-white">{lang("3. Verify it in the browser.", "3. Verifícalo en el navegador.")}</strong></p>
                            <p>
                                {lang("Paste the CID at ", "Pega el CID en ")}
                                <a href="https://nirium.xyz/verify" target="_blank" rel="noopener noreferrer">nirium.xyz/verify</a>{" "}
                                {lang(
                                    "(or open ",
                                    "(o abre "
                                )}
                                <code>/verify?cid=&lt;CID&gt;</code>{" "}
                                {lang(
                                    "directly). It fetches the document from IPFS, recomputes the hash from the embedded ",
                                    "directo). Trae el documento desde IPFS, recalcula el hash a partir del "
                                )}
                                <code>record</code>{" "}
                                {lang(", and checks the agent signature if one is present.", "incluido, y revisa la firma del agente si hay una.")}
                            </p>

                            <p className="!mb-2"><strong className="text-white">{lang("4. Verify it independently, from the terminal.", "4. Verifícalo de forma independiente, desde la terminal.")}</strong></p>
                            <CodeBlock label={lang("install once", "instala una vez")}>{`npm install -g nirium-cli`}</CodeBlock>
                            <CodeBlock label={lang("real output", "salida real")}>{`
$ npx nirium-cli verify QmehRz7Xab8Cg27fypBiffVgW11Yoac6BJcgd3g1pH5V7m
🔍 Nirium Audit Verifier
CID:            QmehRz7Xab8Cg27fypBiffVgW11Yoac6BJcgd3g1pH5V7m
--------------------------------------------------
✔ HASH:        MATCH (26a1d68440440d4f...)
ℹ SIGNATURE:   ABSENT (No agent attestation embedded)
--------------------------------------------------
✅ VERIFICATION PASSED
`}</CodeBlock>
                            <p>
                                {lang(
                                    "That output came from ",
                                    "Esa salida vino de "
                                )}
                                <code>nirium-cli@3.2.7</code>{" "}
                                {lang(
                                    "installed fresh via ",
                                    "instalado de cero vía "
                                )}
                                <code>npx</code>{" "}
                                {lang(
                                    "on 21 Nov 2026, not from a local build - it independently refetched the CID and recomputed the hash itself. With no flags it tries Filebase's dedicated gateway, then Pinata, ipfs.io and dweb.link, so one slow or rate-limited gateway doesn't fail the check. Pass ",
                                    "el 21 de noviembre de 2026, no de una compilación local: volvió a traer el CID por su cuenta y recalculó el hash él mismo. Sin flags prueba el gateway dedicado de Filebase, luego Pinata, ipfs.io y dweb.link, así un gateway lento o con límite de uso no tumba la verificación. Usa "
                                )}
                                <code>--gateway</code>{" "}
                                {lang(
                                    "(repeatable) to use your own list.",
                                    "(se puede repetir) para usar tu propia lista."
                                )}
                            </p>

                            <p className="!mb-2"><strong className="text-white">{lang("5. Same thing, on mainnet.", "5. Lo mismo, en mainnet.")}</strong></p>
                            <ReceiptCard
                                network="mainnet"
                                cid="QmcJymJiegpsQ6peU7djM31hwcYbH5VvjYqnuUH1UcaKLP"
                                hash="fef2595c85078bc8471e30881a2cb8466aca4e27968a96661e6e5fc445dae6d9"
                                note={lang(
                                    'Anchored to the mainnet box while building this page. The document itself reports network: "stellar:pubnet" - that field is set by the box that anchored it, never by the request body.',
                                    'Anclado al servidor de mainnet mientras se construía esta página. El documento mismo reporta network: "stellar:pubnet"; ese campo lo pone el servidor que lo ancla, nunca el cuerpo de la solicitud.'
                                )}
                            />
                        </Section>

                        <Section id="receipt-format" kicker={lang("03 · Reference", "03 · Referencia")} title={lang("Receipt Format", "Formato del recibo")} icon={FileCheck}>
                            <p>{lang("The JSON document pinned to IPFS carries these fields:", "El documento JSON anclado en IPFS trae estos campos:")}</p>
                            <CodeBlock label={lang("anchored document", "documento anclado")}>{`
{
  "version": "1.1.0",
  "node": "audit-external",
  "content_sha256": "<64-char lowercase hex>",
  "agent": { "id": "optional", "key": "G...", "alg": "ed25519", "statement": "...", "signature": "..." },
  "record": { "...": "your JSON object, if you sent one (up to 8KB)" },
  "txHash": "optional, if you're pointing the receipt at an existing on-chain tx",
  "network": "stellar:testnet | stellar:pubnet",
  "tag": "optional label",
  "anchoredAt": "ISO 8601 timestamp"
}
`}</CodeBlock>
                            <p className="!mb-2"><strong className="text-white">{lang("How content_sha256 is computed:", "Cómo se calcula content_sha256:")}</strong></p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <strong className="text-white">{lang("Hash-only mode.", "Modo solo-hash.")}</strong>{" "}
                                    {lang(
                                        "You send ",
                                        "Envías "
                                    )}
                                    <code>hash</code>
                                    {lang(
                                        ": a 64-char sha-256 hex string, optionally prefixed ",
                                        ": una cadena hex sha-256 de 64 caracteres, opcionalmente con el prefijo "
                                    )}
                                    <code>sha-256:</code>
                                    {lang(
                                        ". The server stores it exactly (lowercased, prefix stripped) and never sees your original evidence.",
                                        ". El servidor lo guarda tal cual (en minúsculas, sin el prefijo) y nunca ve tu evidencia original."
                                    )}
                                </li>
                                <li>
                                    <strong className="text-white">{lang("Record mode.", "Modo record.")}</strong>{" "}
                                    {lang(
                                        "You send ",
                                        "Envías "
                                    )}
                                    <code>record</code>
                                    {lang(
                                        " (a plain JSON object, up to 8KB). The server computes ",
                                        " (un objeto JSON plano, hasta 8KB). El servidor calcula "
                                    )}
                                    <code>content_sha256 = sha256(JSON.stringify(record))</code>
                                    {lang(
                                        " - standard ",
                                        ", con el "
                                    )}
                                    <code> JSON.stringify</code>
                                    {lang(
                                        ", compact (no whitespace), in whatever key insertion order your object had. To recompute it yourself, stringify your object in the same key order and hash the UTF-8 bytes.",
                                        " estándar, compacto (sin espacios), en el mismo orden de llaves que tenía tu objeto. Para recalcularlo tú mismo, convierte tu objeto a string en el mismo orden de llaves y saca el hash de los bytes UTF-8."
                                    )}{" "}
                                    {lang(
                                        "If the document carries the key ",
                                        "Si el documento trae la llave "
                                    )}
                                    <code>record</code>
                                    {lang(
                                        ", even as ",
                                        ", aunque sea "
                                    )}
                                    <code>null</code>
                                    {lang(
                                        ", it is verified in record mode (sha-256 of JSON.stringify(record)). That's what the CLI has done since 3.2.6 and the GitHub Action does too; /verify does it once V1 ships.",
                                        ", se verifica como modo record (sha-256 de JSON.stringify(record)). Así lo hacen la CLI desde 3.2.6 y el GitHub Action; /verify lo hará con V1."
                                    )}
                                </li>
                            </ul>
                            <p className="!mb-2"><strong className="text-white">{lang("Agent attestation (optional):", "Atestación del agente (opcional):")}</strong></p>
                            <p>
                                {lang("Sign the string ", "Firma la cadena ")}
                                <code>nirium-audit-v1:&lt;content_sha256&gt;</code>{" "}
                                {lang(
                                    "(lowercase hex, domain-prefixed so a signature made for something else - a wallet login, for example - can",
                                    "(hex en minúsculas, con prefijo de dominio para que una firma hecha para otra cosa, como un login de wallet, no se pueda reutilizar aquí"
                                )}
                                {lang("'t be replayed here) with an ed25519 key. Any Stellar ", ") con una llave ed25519. Cualquier dirección ")}
                                <code>G...</code>{" "}
                                {lang(
                                    "address works as the public key, since a Stellar address is already an ed25519 public key - no separate registration. Two signature encodings are accepted: raw bytes of the statement, or the SEP-53 digest",
                                    "de Stellar funciona como llave pública, porque una dirección de Stellar ya es una llave pública ed25519, sin registro aparte. Se aceptan dos codificaciones de firma: los bytes crudos del mensaje, o el digest de SEP-53"
                                )}
                                {" "}(<code>sha256(&quot;Stellar Signed Message:\n&quot; + statement)</code>)
                                {lang(
                                    ", so a plain ",
                                    ", así que tanto un "
                                )}
                                <code>Keypair.sign()</code>{" "}
                                {lang("and a wallet's ", "plano como el ")}
                                <code>signMessage</code>{" "}
                                {lang("both work.", "de una wallet funcionan.")}
                            </p>
                        </Section>

                        <Section id="verifying" kicker={lang("04 · Reference", "04 · Referencia")} title={lang("Verifying a Receipt", "Verificar un recibo")} icon={ShieldCheck}>
                            <p>{lang("Three ways to check a receipt. The CLI and the by-hand route don't depend on Nirium at all; the browser page depends on our server only for the signature:", "Tres formas de comprobar un recibo. La CLI y la comprobación a mano no dependen de Nirium para nada; la página del navegador depende de nuestro servidor solo para la firma:")}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong className="text-white">{lang("Browser", "Navegador")}</strong> - <a href="https://nirium.xyz/verify" target="_blank" rel="noopener noreferrer">nirium.xyz/verify</a>{lang(" recalculates the CID and the hash in your browser and checks the signature on our server.", " recalcula el CID y el hash en tu navegador y revisa la firma en nuestro servidor.")}</li>
                                <li><strong className="text-white">CLI</strong> - <code>npx nirium-cli verify &lt;CID&gt;</code>{lang(" does all of it on your machine.", " lo hace todo en tu máquina.")}</li>
                                <li>
                                    <strong className="text-white">{lang("By hand", "A mano")}</strong>{" "}
                                    {lang(
                                        "- fetch the CID from any IPFS gateway and recompute the CID of the bytes you got (",
                                        "- trae el CID desde cualquier gateway de IPFS y recalcula el CID de los bytes que recibiste ("
                                    )}
                                    <code>ipfs add --only-hash --cid-version=0 {lang("file", "archivo")}</code>
                                    {lang(" or ", " o ")}
                                    <code>nirium cid {lang("file", "archivo")} --expect &lt;CID&gt;</code>
                                    {lang(
                                        "). If it matches the CID you asked for, the gateway doesn't need to be trusted. Then recompute sha-256 over ",
                                        "). Si coincide con el CID que pediste, no necesitas confiar en el gateway. Luego recalcula sha-256 sobre "
                                    )}
                                    <code>JSON.stringify(record)</code>{" "}
                                    {lang(
                                        "(or your original file, for hash-only anchors), and compare to ",
                                        "(o tu archivo original, para anclajes solo-hash), y compáralo con "
                                    )}
                                    <code>content_sha256</code>
                                    {lang(
                                        ". For a signature: verify ed25519(",
                                        ". Para una firma: verifica ed25519("
                                    )}
                                    <code>signature</code>
                                    {lang(
                                        ") over the UTF-8 bytes of ",
                                        ") sobre los bytes UTF-8 de "
                                    )}
                                    <code>nirium-audit-v1:&lt;content_sha256&gt;</code>{" "}
                                    {lang("against ", "contra ")}
                                    <code>agent.key</code>.
                                </li>
                            </ul>

                            <p className="!mb-2 !mt-6">
                                <strong className="text-white">{lang("A known, deliberate behavior: hash-only anchors with no signature verify nothing.", "Un comportamiento conocido y deliberado: los anclajes solo-hash sin firma no verifican nada.")}</strong>
                            </p>
                            <p>
                                {lang("If a receipt was anchored with ", "Si un recibo se ancló con ")}
                                <code>hash</code>{" "}
                                {lang("(not ", "(no con ")}
                                <code>record</code>
                                {lang(
                                    ") and carries no agent signature, there is nothing embedded for the tool to recompute against - so the CLI refuses to call that a pass:",
                                    ") y no trae firma del agente, no hay nada incluido contra qué recalcular, así que el CLI se niega a marcarlo como aprobado:"
                                )}
                            </p>
                            <CodeBlock label={lang("hash-only, no evidence supplied", "solo-hash, sin evidencia")}>{`
$ npx nirium-cli verify QmaofB6naeySxZsgA4R4p8YWzz3fujTitAa1ndJ1PQjbme
🔍 Nirium Audit Verifier
CID:            QmaofB6naeySxZsgA4R4p8YWzz3fujTitAa1ndJ1PQjbme
--------------------------------------------------
ℹ HASH:        NOT CHECKED (hash-only anchor: 0b2e5f91485badeb...)
   Pass --hash <hex> or --evidence <file> to compare it with your original evidence.
ℹ SIGNATURE:   ABSENT (No agent attestation embedded)
--------------------------------------------------
❌ NOTHING VERIFIED (pass --hash, --evidence, or anchor with an agent signature)
`}</CodeBlock>
                            <p>
                                {lang(
                                    "That refusal is the fix for",
                                    "Esa negativa es el arreglo del"
                                )}{" "}
                                <a href="https://github.com/nirium-protocol/nirium/issues/149" target="_blank" rel="noopener noreferrer">issue #149</a>
                                {lang(
                                    ": earlier versions of the CLI printed VERIFICATION PASSED in exactly this situation - a hash-only anchor with nothing to compare it against and no signature attached. Supplying your original evidence turns it into a real check:",
                                    ": versiones anteriores del CLI imprimían VERIFICATION PASSED justo en esta situación, un anclaje solo-hash sin nada contra qué comparar y sin firma. Dar tu evidencia original lo convierte en una verificación real:"
                                )}
                            </p>
                            <CodeBlock label={lang("same CID, with --evidence", "mismo CID, con --evidence")}>{`
$ npx nirium-cli verify QmaofB6naeySxZsgA4R4p8YWzz3fujTitAa1ndJ1PQjbme --evidence ./my-evidence.txt
...
✔ HASH:        MATCH (0b2e5f91485badeb...) [hash-only]
ℹ SIGNATURE:   ABSENT (No agent attestation embedded)
--------------------------------------------------
✅ VERIFICATION PASSED
`}</CodeBlock>
                            <p>
                                {lang(
                                    "An attested, record-mode receipt verifies both the hash and the signature automatically, with no extra flags:",
                                    "Un recibo en modo record y con firma verifica el hash y la firma automáticamente, sin flags extra:"
                                )}
                            </p>
                            <ReceiptCard
                                network="testnet"
                                cid="Qmbhgu8U2Fz5eJdHakveorj4FUTx7hjVFFzUXgv6fzQNha"
                                hash="dd8624889f541323551ba1167f5619ab87a8d418d5a342316b838671d761d6a3"
                                note={lang(
                                    "Signed with a throwaway testnet key generated for this page (GBJYCLT2AEWUTDKRETUTYHNNEH45QL4B6TFY6GKLKT4KQ57SHMSE7LFL). Run npx nirium-cli verify on this CID - no flags needed.",
                                    "Firmado con una llave de testnet desechable generada para esta página (GBJYCLT2AEWUTDKRETUTYHNNEH45QL4B6TFY6GKLKT4KQ57SHMSE7LFL). Corre npx nirium-cli verify sobre este CID, sin flags."
                                )}
                            />
                            <p>
                                {lang(
                                    "An unsigned record still passes on its recomputed hash, with the signature reported as ABSENT. If you only trust receipts your agents signed, add --require-signature (nirium-cli 3.2.6 or newer): an unsigned document then fails.",
                                    "Un record sin firma igual pasa por su hash recalculado, con la firma reportada como ABSENT. Si solo confías en recibos firmados por tus agentes, agrega --require-signature (nirium-cli 3.2.6 o más nuevo): un documento sin firma entonces falla."
                                )}
                            </p>
                            <p>
                                {lang(
                                    "Keep your own copy. A receipt stays on IPFS only while someone pins it. Today Nirium pins every receipt on Pinata; a second copy on Filebase is built but not active until that account is on a paid plan (GET /api/audit/info shows the live state). The anchor response includes the exact document that was pinned: nirium anchor --save receipt.json writes it, nirium cid receipt.json --expect <CID> shows it is the original (nirium-cli 3.2.7 or newer), and adding those bytes back to IPFS gives the same CID.",
                                    "Guarda tu propia copia. Un recibo sigue en IPFS solo mientras alguien lo mantenga fijado. Hoy Nirium fija cada recibo en Pinata; una segunda copia en Filebase ya está construida pero no está activa hasta que esa cuenta pase a un plan de pago (GET /api/audit/info muestra el estado en vivo). La respuesta del anclaje incluye el documento exacto que se fijó: nirium anchor --save receipt.json lo guarda, nirium cid receipt.json --expect <CID> muestra que es el original (nirium-cli 3.2.7 o más nuevo), y volver a subir esos bytes a IPFS da el mismo CID."
                                )}
                            </p>

                            <p className="!mb-2 !mt-8"><strong className="text-white">{lang("Anchor from the terminal (nirium-cli 3.1.0+).", "Anclar desde la terminal (nirium-cli 3.1.0 o más nuevo).")}</strong></p>
                            <p>
                                <code>nirium anchor</code>{" "}
                                {lang(
                                    "takes a hash (--hash), a file (--file, only its sha-256 is sent, never the file) or a small JSON record (--record, up to 8KB). Point it at a node with --url; there is no --network flag because the node decides its own network. Real run against testnet, 7 Nov 2026:",
                                    "recibe un hash (--hash), un archivo (--file, solo se manda su sha-256, nunca el archivo) o un registro JSON chico (--record, hasta 8KB). Apúntalo a un nodo con --url; no hay flag --network porque el nodo decide su propia red. Corrida real contra testnet, 7 de noviembre de 2026:"
                                )}
                            </p>
                            <CodeBlock label={lang("real output", "salida real")}>{`
$ npx nirium-cli anchor --record '{"doc":"nirium-docs-example","date":"2026-11-07"}' \\
    --tag docs-example-7nov --url ${TESTNET_BASE}
✅ Anchored to IPFS
   CID:            QmNNKGCx8i8zQZuCBsuRh9fbAiF7v2smQVszxkqdxpXx5J
   Content sha256: 938c3fbff4c3cb484fc8e3944e8e3d5334bee6abcec1e726d16b6d5adfead23d
   Gateway URL:    https://gateway.pinata.cloud/ipfs/QmNNKGCx8i8zQZuCBsuRh9fbAiF7v2smQVszxkqdxpXx5J
   Anchored at:    2026-11-07T19:31:43.837Z

   Verify independently: nirium verify QmNNKGCx8i8zQZuCBsuRh9fbAiF7v2smQVszxkqdxpXx5J
`}</CodeBlock>
                            <p>
                                {lang(
                                    "Add --sign to attach an ed25519 attestation. The secret key comes from an environment variable you name with --key-env (or the CLI config store); it signs locally and is never sent or printed. Same day, with a throwaway testnet key:",
                                    "Agrega --sign para adjuntar una atestación ed25519. La llave secreta sale de una variable de entorno que nombras con --key-env (o del almacén de configuración del CLI); firma localmente y nunca se manda ni se imprime. Mismo día, con una llave de testnet desechable:"
                                )}
                            </p>
                            <CodeBlock label={lang("real output", "salida real")}>{`
$ npx nirium-cli anchor --hash 8d81e311646b8b84dab222401576f2211df704e53ebac732e3fcd4219cd2a883 \\
    --sign --key-env MY_STELLAR_SECRET --tag docs-example-7nov --url ${TESTNET_BASE}
✅ Anchored to IPFS
   CID:            QmS1dJaMat4yWfMJ2HwYGkNMUxQD2fF7unUgFTnuLmRPfh
   Content sha256: 8d81e311646b8b84dab222401576f2211df704e53ebac732e3fcd4219cd2a883
   Attested by:    GBZSUF6WJ2M7HQ7B6ABBVHD7RJRK6FOMVKJMMSGO4C2F3RIKY2SVKN5A
   Anchored at:    2026-11-07T19:31:48.425Z

$ npx nirium-cli verify QmS1dJaMat4yWfMJ2HwYGkNMUxQD2fF7unUgFTnuLmRPfh \\
    --hash 8d81e311646b8b84dab222401576f2211df704e53ebac732e3fcd4219cd2a883
✔ HASH:        MATCH (8d81e311646b8b84...) [hash-only]
✔ SIGNATURE:   VALID (Signed by GBZSUF6WJ2M7HQ7B6ABBVHD7RJRK6FOMVKJMMSGO4C2F3RIKY2SVKN5A)
   Statement:  nirium-audit-v1:8d81e311646b8b84dab222401576f2211df704e53ebac732e3fcd4219cd2a883
--------------------------------------------------
✅ VERIFICATION PASSED
`}</CodeBlock>
                            <p>
                                {lang(
                                    "To pull many CIDs at once and verify them in bulk, use the Reporting node - see ",
                                    "Para sacar muchos CIDs de una vez y verificarlos en bloque, usa el nodo de Reporting; ve el "
                                )}
                                <a href="#reporting">§5</a>.
                            </p>
                        </Section>

                        <Section id="reporting" kicker={lang("05 · Reference", "05 · Referencia")} title={lang("Reporting", "Reportes")} icon={BarChart3}>
                            <p>
                                {lang(
                                    "The Reporting node is a read-only summary of what the Nirium agent already records: Audit Trail anchors, payment receipts from Nirium's own x402 endpoint, and Payouts runs. It holds no funds and no keys, and it needs no API key. Requests are rate-limited.",
                                    "El nodo de Reporting es un resumen de solo lectura de lo que el agente de Nirium ya registra: anclajes de Audit Trail, recibos de pago del endpoint x402 propio de Nirium y corridas de Payouts. No guarda fondos ni llaves, y no necesita API key. Las peticiones tienen límite de frecuencia."
                                )}
                            </p>
                            <p>
                                <strong className="text-white">{lang("What it is not.", "Lo que no es.")}</strong>{" "}
                                {lang(
                                    "It reports on the whole node, not on one account. Its counts include Nirium's own test anchors, so they are not a count of users - who anchored what is listed in Evidence (§9). It is not certified regulatory reporting: anything filed with an authority stays the client's responsibility, and every response says so in its disclaimer field.",
                                    "Reporta sobre todo el nodo, no sobre una cuenta. Sus conteos incluyen los anclajes de prueba de Nirium, así que no son un conteo de usuarios; quién ancló qué está en Evidencia (§9). No es un reporte regulatorio certificado: lo que se presente ante una autoridad sigue siendo responsabilidad del cliente, y cada respuesta lo dice en su campo disclaimer."
                                )}
                            </p>
                            <p className="text-sm">
                                {lang(
                                    "21 Nov 2026: payments count only received charges. Before, they also counted rejected attempts (3 on mainnet, from 6 Sep 2026: 42 instead of 39).",
                                    "21 nov 2026: los pagos cuentan solo cobros recibidos. Antes también contaban intentos rechazados (3 en mainnet, del 6 sep 2026: 42 en vez de 39)."
                                )}
                            </p>

                            {/* 9-nov-2026: un reporte real, no solo un ejemplo fijo. Sigue el switch. */}
                            <p className="!mb-2"><strong className="text-white">{lang("A real report, right now", "Un reporte real, ahora mismo")}</strong></p>
                            <LiveReport />

                            <p className="!mb-2"><strong className="text-white">{lang("Endpoints", "Endpoints")}</strong></p>
                            <ul>
                                <li><code>GET /api/reporting/summary</code> - {lang("totals for a period: Payouts runs, payment receipts, anchors and when the last anchor happened.", "totales de un periodo: corridas de Payouts, recibos de pago, anclajes y cuándo fue el último anclaje.")}</li>
                                <li><code>GET /api/reporting/export?type=anchors|payments|payroll&amp;format=csv|json</code> - {lang("the rows behind those totals, as CSV or JSON. No CIDs and no Payouts run ids: those belong to whoever anchored or paid.", "las filas detrás de esos totales, en CSV o JSON. Sin CIDs ni ids de corrida de Payouts: son de quien ancló o pagó.")}</li>
                                <li><code>GET /api/reporting/info</code> - {lang("node metadata and the list of endpoints.", "metadatos del nodo y la lista de endpoints.")}</li>
                            </ul>
                            <p>
                                <code>from</code> {lang("and", "y")} <code>to</code>{" "}
                                {lang(
                                    "take ISO dates and default to the full history (from the start of the Reporting node) if left out. ",
                                    "reciben fechas ISO y, si no se mandan, por defecto cubren toda la historia (desde el arranque del nodo de Reportería). "
                                )}
                                <code>network</code>{" "}
                                {lang("is ", "es ")}<code>mainnet</code> {lang("or", "o")} <code>testnet</code>
                                {lang("; leave it out to get both. ", "; si no lo pones, trae las dos. ")}
                                <code>limit</code>{" "}
                                {lang("defaults to 500, maximum 1000.", "por defecto es 500, máximo 1000.")}
                            </p>
                            {/* El "problema conocido" de limit antes del filtro de red se arregló
                                en reportingRoutes.ts el 9-nov-2026 (la red se filtra en la consulta). */}

                            <p className="!mb-2"><strong className="text-white">{lang("From the CLI", "Desde el CLI")}</strong></p>
                            <p>
                                <code>nirium report</code>{" "}
                                {lang("points at a local agent by default, so pass ", "apunta por defecto a un agente local, así que pasa ")}
                                <code>--url</code>
                                {lang(
                                    ". One week on mainnet (counts as of 8 Nov 2026). The last-anchor date and the CID-free export need nirium-cli 3.2.0 or newer; older versions print the latest CID instead:",
                                    ". Una semana en mainnet (conteos al 8 nov 2026). La fecha del último anclaje y el export sin CIDs necesitan nirium-cli 3.2.0 o más nuevo; las versiones anteriores muestran el último CID en su lugar:")}
                            </p>
                            {/* Hasta el 8-nov-2026 el summary traía el CID del último anclaje
                                y el ejemplo lo mostraba. Ya no se publica (decisión 1B). */}
                            <CodeBlock label={lang("example output", "salida de ejemplo")}>{`
$ npx nirium-cli report summary --from 2026-11-01 --to 2026-11-07 \\
    --network mainnet --url ${MAINNET_BASE}
📊 Nirium Reporting Summary
   Network:  mainnet
   Period:   2026-11-01 -> 2026-11-07
   Payroll:  0 settled run(s), 0 recipient(s) paid
   Payments: 0 receipt(s), 0.00 USDC total
   Anchors:  9 (last: 2026-11-06)
`}</CodeBlock>
                            <p>
                                {lang(
                                    "Payments is 0 for that week because no payment settled on Nirium's mainnet x402 endpoint between 29 Sep and 18 Nov 2026. ",
                                    "Payments da 0 esa semana porque ningún pago se liquidó en el endpoint x402 de mainnet de Nirium entre el 29 sep y el 18 nov 2026. "
                                )}
                                <code>export anchors</code>{" "}
                                {lang(
                                    "lists when and on which network each anchor happened, without CIDs: an anchor's CID stays with whoever made it, and they check it with nirium verify <cid> or on /verify.",
                                    "lista cuándo y en qué red ocurrió cada anclaje, sin CIDs: el CID de un anclaje se queda con quien lo hizo, y lo revisa con nirium verify <cid> o en /verify."
                                )}
                            </p>
                            <CodeBlock label={lang("usage", "uso")}>{`
nirium report export anchors --network mainnet --url ${MAINNET_BASE} --csv anchors.csv
`}</CodeBlock>
                            <p className="!mb-2"><strong className="text-white">{lang("Without the CLI", "Sin el CLI")}</strong></p>
                            <CodeBlock label="curl">{`
curl "${MAINNET_BASE}/api/reporting/summary?network=mainnet&from=2026-11-01&to=2026-11-07"
curl "${MAINNET_BASE}/api/reporting/export?type=anchors&format=csv&network=mainnet" -o anchors.csv
`}</CodeBlock>
                        </Section>

                        <Section id="x402-sellers" kicker={lang("06 · Guide", "06 · Guía")} title={lang("x402 Sellers", "Vendedores x402")} icon={Code2}>
                            <p>
                                <code>x402Serve()</code>
                                {lang(
                                    ", part of the ",
                                    ", parte del SDK de "
                                )}
                                <code>nirium</code>{" "}
                                {lang(
                                    "SDK, turns any Express route into a paid endpoint: nothing downstream runs until a payment settles on-chain. It works with any x402 facilitator - Nirium does not run one. The default is OpenZeppelin Channels; free, per-network keys are at ",
                                    ", convierte cualquier ruta de Express en un endpoint de pago: nada corre después hasta que un pago liquida en cadena. Funciona con cualquier facilitador de x402, Nirium no opera uno. El default es OpenZeppelin Channels; las keys gratis por red están en "
                                )}
                                <code>channels.openzeppelin.com/testnet/gen</code>{" "}
                                {lang("(testnet) and ", "(testnet) y ")}
                                <code>channels.openzeppelin.com/gen</code>{" "}
                                {lang(
                                    "(mainnet) - a mainnet key returns 401 against testnet and vice versa.",
                                    "(mainnet); una key de mainnet devuelve 401 contra testnet y viceversa."
                                )}
                            </p>
                            <p>
                                <code>x402Serve()</code>{" "}
                                {lang(
                                    "itself does not emit a receipt - it only collects payment. To anchor one per paid call, call ",
                                    "por sí mismo no emite un recibo, solo cobra. Para anclar uno por cada llamada pagada, llama a "
                                )}
                                <code>agent.anchorAuditRecord()</code>{" "}
                                {lang("(or ", "(o directo a ")}
                                <code>POST /api/audit/log</code>{" "}
                                {lang(
                                    "directly) inside your own route handler, which only runs after the middleware has already settled the charge:",
                                    ") dentro de tu propio manejador de ruta, que solo corre después de que el middleware ya liquidó el cobro:"
                                )}
                            </p>
                            <CodeBlock label="server.ts">{`
import express from 'express';
import { Agent, x402Serve } from 'nirium';

const app = express();
const agent = new Agent({ apiKey: process.env.NIRIUM_API_KEY });

app.use('/premium', x402Serve({
  payTo: process.env.STELLAR_PAY_TO!,
  facilitatorApiKey: process.env.X402_FACILITATOR_API_KEY!,
  routes: { 'GET /report': '$0.02' },
}));

app.get('/premium/report', async (_req, res) => {
  const report = { day: '2026-11-16', rows: 42 };
  const receipt = await agent.anchorAuditRecord({
    record: { route: '/premium/report', report },
    tag: 'x402-sale',
  });
  res.json({ report, receipt: receipt.cid });
});
`}</CodeBlock>
                            <p>
                                {lang(
                                    "A starting point for the server above, scaffolded by the published CLI (ran live while writing this page - exit code 0):",
                                    "Un punto de partida para el servidor de arriba, generado por el CLI publicado (corrido en vivo mientras se escribía esta página, código de salida 0):"
                                )}
                            </p>
                            <CodeBlock label={lang("real terminal output", "salida real de terminal")}>{`
$ npx nirium-cli create x402 -n my-api

💸 [Scaffold] Creating x402 paid API: my-api...

✅ Project initialized in ./my-api

🚀 Get started:
   cd my-api
   npm install
   npm run dev
`}</CodeBlock>

                            <p className="!mb-2"><strong className="text-white">{lang("Getting listed in an x402 Bazaar (optional, nirium@0.18.0+).", "Aparecer en un Bazaar de x402 (opcional, nirium@0.18.0 o más nuevo).")}</strong></p>
                            <p>
                                {lang(
                                    "Add ",
                                    "Agrega "
                                )}
                                <code>input</code>, <code>inputSchema</code>{" "}
                                {lang("and/or ", "y/o ")}
                                <code>output</code>{" "}
                                {lang(
                                    "to a route and x402Serve() declares the Bazaar discovery extension for it. A facilitator that reads that extension catalogs the route the first time a payment for it settles, so agents can find it by searching instead of needing the URL hardcoded. Checked live against Rail402's facilitator on Stellar testnet before this shipped (",
                                    "a una ruta y x402Serve() declara la extensión de descubrimiento de Bazaar. Un facilitador que lee esa extensión cataloga la ruta la primera vez que liquida un pago para ella, así los agentes la encuentran buscando en vez de necesitar la URL fija. Probado en vivo contra el facilitador de Rail402 en testnet de Stellar antes de publicarlo ("
                                )}
                                <a href="https://github.com/nirium-protocol/nirium/pull/262" target="_blank" rel="noopener noreferrer">#262</a>
                                {lang(
                                    "). Routes without these fields behave exactly as before.",
                                    "). Las rutas sin estos campos se comportan igual que antes."
                                )}
                            </p>
                            <CodeBlock label="server.ts">{`
app.use('/premium', x402Serve({
  payTo: process.env.STELLAR_PAY_TO!,
  facilitatorApiKey: process.env.X402_FACILITATOR_API_KEY!,
  routes: {
    'GET /report': {
      price: '$0.02',
      description: 'Daily usage report',
      input: { days: 7 },
      inputSchema: { properties: { days: { type: 'integer', maximum: 30 } } },
      output: { example: { report: { day: '2026-11-16', rows: 42 } } },
    },
  },
}));
`}</CodeBlock>

                            <p className="!mb-2"><strong className="text-white">{lang("Try it as a buyer: Nirium's own test endpoint.", "Pruébalo como comprador: el endpoint de prueba de Nirium.")}</strong></p>
                            <p>
                                {lang("To test an x402 client against a real seller, point it at ", "Para probar un cliente x402 contra un vendedor real, apúntalo a ")}
                                <code>GET /api/v1/premium/market</code>
                                {lang(
                                    ". It answers 402 for 0.05 USDC and, once paid, returns Stellar network state: the base fee, the Blend rate when the node can read it, and the fixed CETES reference (read 12 Nov 2026). It is a test target, not a data product: much of what it returns is fixed or public. On testnet it costs test USDC; on mainnet it charges real USDC. Who has paid it so far is in Evidence (§9). The other two premium routes answer 501 on mainnet without charging, because that box runs no signal loop and holds no signing key.",
                                    ". Responde 402 por 0.05 USDC y, una vez pagado, devuelve el estado de la red Stellar: la comisión base, la tasa de Blend cuando el nodo puede leerla y la referencia fija de CETES (leída el 12 de noviembre de 2026). Es un endpoint de prueba, no un producto de datos: buena parte de lo que devuelve es fijo o público. En testnet cuesta USDC de prueba; en mainnet cobra USDC real. Quién lo ha pagado hasta hoy está en Evidencia (§9). Las otras dos rutas premium responden 501 en mainnet sin cobrar, porque ese servidor no corre el loop de señales ni tiene llave para firmar."
                                )}
                            </p>
                            <CodeBlock label={lang("real output, testnet, 8 Nov 2026", "salida real, testnet, 8 nov 2026")}>{`
$ curl -i ${TESTNET_BASE}/api/v1/premium/market
HTTP/1.1 402 Payment Required
payment-required: eyJ4NDAyVmVyc2lvbiI6MiwiZXJyb3IiOiJQYXltZW50IHJlcXVpcmVkIi...

# accepts[0], decoded from the base64 header:
{
  "scheme": "exact",
  "network": "stellar:testnet",
  "amount": "500000",
  "asset": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  "payTo": "GC4Q5TWWXI7IHN6DYCBEKCOWJWCKY4JE2NLKLU5SE3YL44IUUFPKUOPC",
  "maxTimeoutSeconds": 300,
  "extra": { "areFeesSponsored": true }
}
`}</CodeBlock>
                            <p>
                                <code>amount</code>{" "}
                                {lang("is in the token's 7-decimal units: ", "va en las unidades de 7 decimales del token: ")}
                                <code>500000</code> = 0.05 USDC.{" "}
                                {lang("The same route on ", "La misma ruta en ")}
                                <code>{MAINNET_BASE}</code>{" "}
                                {lang("uses ", "usa ")}
                                <code>stellar:pubnet</code>{" "}
                                {lang("and the mainnet USDC contract.", "y el contrato de USDC de mainnet.")}
                            </p>
                        </Section>

                        <Section id="policy-hook" kicker={lang("07 · Advanced", "07 · Avanzado")} title={lang("Pre-Sign Policy Hook", "Hook de política antes de firmar")} icon={Lock}>
                            <p>
                                {lang(
                                    "A pre-sign policy hook (",
                                    "Un hook de política antes de firmar ("
                                )}
                                <a href="https://github.com/nirium-protocol/nirium/issues/96" target="_blank" rel="noopener noreferrer">#96</a>
                                {lang(
                                    ", shipped in ",
                                    ", incluido en "
                                )}
                                <code>nirium@0.16.0</code>
                                {lang(
                                    ") lets your own code approve or refuse an x402 payment ",
                                    ") deja que tu propio código apruebe o rechace un pago x402 "
                                )}
                                <strong className="text-white">{lang("before", "antes de que")}</strong>{" "}
                                {lang(
                                    "it is signed. It runs client-side, wraps your signer, and only lets a signature through when your policy function returns an ",
                                    "se firme. Corre del lado del cliente, envuelve tu firmante, y solo deja pasar una firma cuando tu función de política devuelve un "
                                )}
                                <code>ALLOW</code>{" "}
                                {lang(
                                    "bound to the exact authorization about to be signed - same contract, destination, amount, and a short-lived expiry you control. A ",
                                    "amarrado a la autorización exacta que está por firmarse (mismo contrato, destino, monto, y una expiración corta que tú controlas). Un "
                                )}
                                <code>DENY</code>
                                {lang(", a ", ", un ")}
                                <code>WAIT</code>
                                {lang(
                                    ", a timeout, a malformed answer, or no answer at all: nothing gets signed. It fails closed by construction, not by convention.",
                                    ", un timeout, una respuesta mal formada o ninguna respuesta: nada se firma. Falla cerrado por construcción, no por convención."
                                )}
                            </p>
                            <p>
                                <strong className="text-white">{lang("This is not a spending limit.", "Esto no es un límite de gasto.")}</strong>{" "}
                                {lang(
                                    "It is a single yes/no gate your own policy function controls, evaluated once per payment, against that one specific authorization - not a running budget or cap Nirium tracks on your behalf.",
                                    "Es una sola compuerta sí/no que controla tu propia función de política, evaluada una vez por pago, contra esa autorización específica, no un presupuesto corriente ni un tope que Nirium lleve por ti."
                                )}
                            </p>
                            <p>
                                <strong className="text-white">{lang("Status: exercised on testnet, and once on mainnet.", "Estado: probado en testnet, y una vez en mainnet.")}</strong>{" "}
                                {lang(
                                    "Verified against a throwaway testnet key: an ",
                                    "Verificado contra una llave de testnet desechable: una decisión "
                                )}
                                <code>ALLOW</code>{" "}
                                {lang("decision settled on-chain, while ", "liquidó en cadena, mientras que un ")}
                                <code>DENY</code>{" "}
                                {lang(
                                    "and an expired decision left the balance untouched. On 18 Nov 2026 AgentLedger ran the same three cases on mainnet with its own wallet (an ALLOW, a HOLD released after human approval, and a concurrent pair where one was blocked); its receipts for the HOLD and the block record payments that never happened. It has not run against organic mainnet traffic.",
                                    "y una decisión expirada dejaron el saldo intacto. El 18 nov 2026 AgentLedger corrió los mismos tres casos en mainnet con su propia wallet (un ALLOW, un HOLD liberado tras aprobación humana y un par concurrente donde uno se bloqueó); sus recibos del HOLD y del bloqueo registran pagos que nunca ocurrieron. No se ha corrido contra tráfico orgánico de mainnet."
                                )}
                            </p>
                        </Section>

                        <Section id="escrow-evidence" kicker={lang("08 · Pilot", "08 · Piloto")} title={lang("Escrow Evidence with Trustless Work", "Evidencia de escrow con Trustless Work")} icon={Scale}>
                            <p>
                                {lang(
                                    'A testnet pilot with Trustless Work closes the gap between "evidence was anchored" and "the escrow actually paid because of it." A decision gate (',
                                    'Un piloto en testnet con Trustless Work cierra la brecha entre "se ancló evidencia" y "el escrow de verdad pagó por eso." Una compuerta de decisión ('
                                )}
                                <code>POST /api/payroll/escrow/decision-gate/execute</code>
                                {lang(
                                    ") fetches a receipt by CID, recomputes its hash, and requires that the attestation on it be signed by the same key as the escrow's ",
                                    ") trae un recibo por su CID, recalcula su hash, y exige que la atestación venga firmada con la misma llave del rol "
                                )}
                                <code>serviceProvider</code>{" "}
                                {lang(
                                    "role - not just any valid signature - before it calls the existing scoped signer that approves and releases a milestone.",
                                    "del escrow (no cualquier firma válida) antes de llamar al firmante con alcance acotado que ya existe y que aprueba y libera un hito."
                                )}
                            </p>
                            <p className="!mb-2"><strong className="text-white">{lang("Honest limits, stated plainly:", "Límites honestos, dichos de frente:")}</strong></p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    {lang("This is a testnet-only pilot. Escrow contract: ", "Es un piloto solo en testnet. Contrato de escrow: ")}
                                    <code className="break-all">CADMJSOMBSHUW2LMETBUOVH2CSVY3EDISY4V7UMH7TDU2LE5XRCEULAG</code>.
                                </li>
                                <li>
                                    {lang("The on-chain release that was actually executed ran under the ", "La liberación en cadena que de verdad se ejecutó corrió bajo la ")}
                                    <strong className="text-white">{lang("first", "primera")}</strong>{" "}
                                    {lang(
                                        "version of this rule - before the serviceProvider-key requirement above was added. It has not been re-run end-to-end under the current rule yet; the stricter check has only been exercised with real ",
                                        "versión de esta regla, antes de que se agregara el requisito de la llave serviceProvider de arriba. Todavía no se ha vuelto a correr de punta a punta bajo la regla actual; la revisión más estricta solo se ha probado con casos reales de "
                                    )}
                                    <code>DENY</code>{" "}
                                    {lang("cases against the live gate since then.", "contra la compuerta en vivo desde entonces.")}
                                </li>
                            </ul>
                            <p>{lang("The approve and release transactions from that pilot, both confirmed successful on Horizon testnet:", "Las transacciones de aprobación y liberación de ese piloto, ambas confirmadas como exitosas en Horizon testnet:")}</p>
                            <div className="grid sm:grid-cols-2 gap-3 not-prose my-4">
                                <a href="https://stellar.expert/explorer/testnet/tx/e86861557ad2896452a0d9fc5590de341654ddc311d4bbcd5d8763e3f6961e7b" target="_blank" rel="noopener noreferrer" className="bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:border-stellar-teal/30 transition-colors">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">approve-milestone</p>
                                    <p className="text-xs font-mono text-stellar-teal break-all">e86861557ad2896452a0d9fc5590de341654ddc311d4bbcd5d8763e3f6961e7b</p>
                                </a>
                                <a href="https://stellar.expert/explorer/testnet/tx/429e550d2f05c6dd6316c8caab13605ee1f222d1ce40731d92c80f7f4bc5fc7c" target="_blank" rel="noopener noreferrer" className="bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:border-stellar-teal/30 transition-colors">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">release-milestone</p>
                                    <p className="text-xs font-mono text-stellar-teal break-all">429e550d2f05c6dd6316c8caab13605ee1f222d1ce40731d92c80f7f4bc5fc7c</p>
                                </a>
                            </div>
                        </Section>

                        <Section id="evidence" kicker={lang("09 · Evidence", "09 · Evidencia")} title={lang("Evidence", "Evidencia")} icon={ListChecks}>
                            <p>
                                {lang(
                                    "Public transaction hashes and CIDs, organized by network. Every row was independently re-verified against Horizon, the IPFS gateway, or GitHub directly before being listed here - not copied from prior reports.",
                                    "Hashes de transacciones públicas y CIDs, organizados por red. Cada fila se volvió a verificar de forma independiente contra Horizon, el gateway de IPFS o GitHub directamente antes de listarse aquí, no se copió de reportes anteriores."
                                )}
                            </p>

                            <p className="!mb-2 !mt-6"><strong className="text-white">Mainnet</strong></p>
                            <p>
                                {lang("The x402 payment account ", "La cuenta de cobro x402 ")}
                                <code className="break-all">GCLBBPON256CV7ATEHM5B54BOKNC7GX53MBINJ42MHVXGDMMZ3ZWKBHP</code>{" "}
                                {lang(
                                    "shows 40 settled x402 payments between 9 Jul and 24 Nov 2026 (confirmed against Horizon: the account's successful ",
                                    "muestra 40 pagos x402 liquidados entre el 9 de julio y el 24 de noviembre de 2026 (confirmado contra Horizon: las "
                                )}
                                <code>invoke_host_function</code>{" "}
                                {lang(
                                    "operations, minus the Trustless Work escrow release listed separately below, which is not an x402 payment, and the account's own funding tx). ",
                                    "operaciones exitosas de la cuenta, menos el release de escrow de Trustless Work listado por separado abajo, que no es un pago x402, y la transacción de fondeo de la propia cuenta). "
                                )}
                                <strong className="text-white">{lang(
                                    "Stated honestly: these are our own tests and integration tests, not independent paying customers yet.",
                                    "Dicho de frente: estas son nuestras propias pruebas y pruebas de integración, todavía no clientes independientes que paguen."
                                )}</strong>{" "}
                                {lang(
                                    "The two most recent batches, below, went through an external policy engine: on 29 Sep before the pre-sign hook existed, and on 18 Nov through it.",
                                    "Las dos tandas más recientes, abajo, pasaron por un motor de políticas externo: el 29 sep, antes de que existiera el hook, y el 18 nov, a través de él."
                                )}
                            </p>
                            <EvidenceTable rows={[
                                { proves: lang("x402 payment, first of the 29 Sep integration-test batch", "Pago x402, el primero de la tanda de pruebas de integración del 29 de sep"), ref: "18f7dcab48087800cefb319a04c17291376df053805763fe3e952d472e32fb91", date: "2026-09-29", link: "https://stellar.expert/explorer/public/tx/18f7dcab48087800cefb319a04c17291376df053805763fe3e952d472e32fb91" },
                                { proves: lang("x402 payment, last of the same batch", "Pago x402, el último de la misma tanda"), ref: "b34630f6637d6773ad4f7378dac8690ae6d1809173ff9c9541d22165aeef5788", date: "2026-09-29", link: "https://stellar.expert/explorer/public/tx/b34630f6637d6773ad4f7378dac8690ae6d1809173ff9c9541d22165aeef5788" },
                                { proves: lang("x402 payment through the pre-sign hook, AgentLedger mainnet integration test (ALLOW) - first of 3", "Pago x402 a través del hook, prueba de integración de AgentLedger en mainnet (ALLOW), el primero de 3"), ref: "ed5a41cf0b504a674ac621845767994d333aa253b9f9f3f7c5133df389e6d5d4", date: "2026-11-18", link: "https://stellar.expert/explorer/public/tx/ed5a41cf0b504a674ac621845767994d333aa253b9f9f3f7c5133df389e6d5d4" },
                                { proves: lang("Same run, last of the 3 - also the most recent of all 39 x402 payments", "Misma corrida, el último de los 3, también el más reciente de los 39 pagos x402"), ref: "0f6250773f9c3311bb27da64f5194c06e5d24cf2507d234a9df8c17ad156994b", date: "2026-11-18", link: "https://stellar.expert/explorer/public/tx/0f6250773f9c3311bb27da64f5194c06e5d24cf2507d234a9df8c17ad156994b" },
                                { proves: lang("Same run: AgentLedger's signed receipt for the HOLD - a payment that never happened while it waited", "Misma corrida: recibo firmado de AgentLedger del HOLD, un pago que no ocurrió mientras esperaba"), ref: "QmYUakxc4ZvBS5e3pyQAdzZBm6DAKBEPWrLPGoCeX7uyeW", date: "2026-11-18", link: "https://gateway.pinata.cloud/ipfs/QmYUakxc4ZvBS5e3pyQAdzZBm6DAKBEPWrLPGoCeX7uyeW" },
                                { proves: lang("Same run: AgentLedger's signed receipt for the blocked payment - no transaction exists, only the receipt records the decision", "Misma corrida: recibo firmado de AgentLedger del pago bloqueado; no existe transacción, solo el recibo registra la decisión"), ref: "QmS5q2NvZ2K2StLB3KCWRdkBtnZ5rHAJrQAez2PnKAPwTk", date: "2026-11-18", link: "https://gateway.pinata.cloud/ipfs/QmS5q2NvZ2K2StLB3KCWRdkBtnZ5rHAJrQAez2PnKAPwTk" },
                                { proves: lang("External integrator receipt: TIA anchors a signed exchange-rate quote (used with TIA's permission)", "Recibo de un integrador externo: TIA ancla una cotización de tipo de cambio firmada (usado con permiso de TIA)"), ref: "QmVWZM1i9qusiTfNAT9QdSFYJNEwQUXtnWuSkrCqRAnGEu", date: "2026-10-18", link: "https://gateway.pinata.cloud/ipfs/QmVWZM1i9qusiTfNAT9QdSFYJNEwQUXtnWuSkrCqRAnGEu" },
                                { proves: lang("Same integration, second anchored quote", "Misma integración, segunda cotización anclada"), ref: "QmWnt7mQNYB6RgFW9AUPxHsw1B5GerR6bJPHiCZXQLKdCH", date: "2026-10-23", link: "https://gateway.pinata.cloud/ipfs/QmWnt7mQNYB6RgFW9AUPxHsw1B5GerR6bJPHiCZXQLKdCH" },
                                { proves: lang("Same integration, third receipt - TIA's second key (GBMCX...), tag niriumtober", "Misma integración, tercer recibo - la segunda llave de TIA (GBMCX...), etiqueta niriumtober"), ref: "QmaueB7meg4yxUDfhbE3v6aJTStjNQ8zWgshxXrchReQJ2", date: "2026-11-02", link: "https://gateway.pinata.cloud/ipfs/QmaueB7meg4yxUDfhbE3v6aJTStjNQ8zWgshxXrchReQJ2" },
                                { proves: lang("Same integration, fourth receipt - same call, 1.6 s later, tag tia-route", "Misma integración, cuarto recibo - misma llamada, 1.6 s después, etiqueta tia-route"), ref: "QmZ2wVJLAP3ygRog9ANojeBaschSrARegVJF4maku3CgyA", date: "2026-11-02", link: "https://gateway.pinata.cloud/ipfs/QmZ2wVJLAP3ygRog9ANojeBaschSrARegVJF4maku3CgyA" },
                                { proves: lang("Same integration, fifth receipt - TIA's second key, tag niriumtober", "Misma integración, quinto recibo - la segunda llave de TIA, etiqueta niriumtober"), ref: "QmPS1snVHEzXaQe9YmXyDFrm5XfCXLWLAD6v59chSJqZby", date: "2026-11-06", link: "https://gateway.pinata.cloud/ipfs/QmPS1snVHEzXaQe9YmXyDFrm5XfCXLWLAD6v59chSJqZby" },
                                { proves: lang("Same integration, sixth receipt - same call, 2 s later, tag tia-route", "Misma integración, sexto recibo - misma llamada, 2 s después, etiqueta tia-route"), ref: "QmXT33ZyUvwxzamEMeGYyUxpAWt86bsPpRkFFu4D1fPkso", date: "2026-11-06", link: "https://gateway.pinata.cloud/ipfs/QmXT33ZyUvwxzamEMeGYyUxpAWt86bsPpRkFFu4D1fPkso" },
                                { proves: lang("Same integration, seventh anchored receipt", "Misma integración, séptimo recibo anclado"), ref: "QmZ9bQxXLqoCvAQ6AtRChd18MS9YkjBF6MbT9k5e84PTTv", date: "2026-11-12", link: "https://gateway.pinata.cloud/ipfs/QmZ9bQxXLqoCvAQ6AtRChd18MS9YkjBF6MbT9k5e84PTTv" },
                                { proves: lang("Trustless Work escrow, full lifecycle, own-funds test (0.50 USDC)", "Escrow de Trustless Work, ciclo completo, prueba con fondos propios (0.50 USDC)"), ref: "0c533088ab6326a78b9f79c197b7636ca4662a0d72562968ddea37f370a8192b", date: "2026-09-03", link: "https://stellar.expert/explorer/public/tx/0c533088ab6326a78b9f79c197b7636ca4662a0d72562968ddea37f370a8192b" },
                            ]} />
                            <p className="text-sm">
                                {lang("The seven TIA receipts are signed with two TIA keys: five by ", "Los siete recibos de TIA están firmados con dos llaves de TIA: cinco con ")}
                                <code className="break-all">GATT3MOLOCTDOUGS3FDNZUYV3UKDLIQE4PN7JJ4JYZBYJOOXBVJV4KXI</code>{" "}
                                {lang("(quotes and routes) and two by ", "(cotizaciones y rutas) y dos con ")}
                                <code className="break-all">GBMCX53NIDNHE6WL3FJGROYWTSGOQMWD6R7Y2ORBWR2G2SCLEKM376DY</code>{" "}
                                {lang("(tag niriumtober)", "(etiqueta niriumtober)")}
                                {lang(
                                    "- verified with ",
                                    ", verificados con "
                                )}
                                <code>npx nirium-cli verify</code>{" "}
                                {lang(
                                    "against each CID above. The first two receipts each link a payment (18 and 23 Oct 2026); TIA confirmed that both wallets in those two payments are its own, so they are integration tests, not customer payments.",
                                    "contra cada CID de arriba. Los dos primeros recibos enlazan cada uno un pago (18 y 23 oct 2026); TIA confirmó que las dos wallets de esos pagos son suyas, así que son pruebas de integración, no pagos de clientes."
                                )}
                            </p>

                            <p className="!mb-2 !mt-8"><strong className="text-white">Testnet</strong></p>
                            <EvidenceTable rows={[
                                { proves: lang("TIA's first anchored quote, testnet", "La primera cotización anclada de TIA, testnet"), ref: "QmQ71ruWPtEkDPmsPy1b3JNqJzwMJ1oGaZ3sdaXHWdUoDq", date: "2026-10-15", link: "https://gateway.pinata.cloud/ipfs/QmQ71ruWPtEkDPmsPy1b3JNqJzwMJ1oGaZ3sdaXHWdUoDq" },
                                { proves: lang("Pre-sign policy hook (§7): ALLOW decision, payment settled (0.02 USDC)", "Hook de política antes de firmar (§7): decisión ALLOW, pago liquidado (0.02 USDC)"), ref: "eefd57995733c29fd1ba8244b783419015af642073e9c918a0d732a6bb81a6b3", date: "2026-10-01", link: "https://stellar.expert/explorer/testnet/tx/eefd57995733c29fd1ba8244b783419015af642073e9c918a0d732a6bb81a6b3" },
                                { proves: lang("Trustless Work escrow pilot (§8): deploy", "Piloto de escrow de Trustless Work (§8): despliegue"), ref: "a0ed118a0a02ad87e09f0a743cc90d32199c931baf01b052cf49393e85719850", date: "2026-10-10", link: "https://stellar.expert/explorer/testnet/tx/a0ed118a0a02ad87e09f0a743cc90d32199c931baf01b052cf49393e85719850" },
                                { proves: lang("Same pilot: fund", "Mismo piloto: fondeo"), ref: "8769aba1b652b01ee2aafc9083fd1a775722690757e560fb43bd49f98e4856cf", date: "2026-10-11", link: "https://stellar.expert/explorer/testnet/tx/8769aba1b652b01ee2aafc9083fd1a775722690757e560fb43bd49f98e4856cf" },
                                { proves: lang("Same pilot: tampered evidence, decision gate refuses before touching the network. This record itself does not verify (its content_sha256 is the hash of an empty input); the refusal shows as the absence of a release transaction", "Mismo piloto: evidencia alterada, la compuerta de decisión se niega antes de tocar la red. Este registro no verifica (su content_sha256 es el hash de una entrada vacía); la negativa se ve en que no hay transacción de liberación"), ref: "Qmbwr5eYNex7pzvCSWVu8Q7h4bvfLzkukDu7XXtR7fnkYs", date: "2026-10-11", link: "https://gateway.pinata.cloud/ipfs/Qmbwr5eYNex7pzvCSWVu8Q7h4bvfLzkukDu7XXtR7fnkYs" },
                                { proves: lang("Same pilot: valid evidence, decision gate authorizes - the approve+release in §8", "Mismo piloto: evidencia válida, la compuerta de decisión autoriza (el approve+release del §8)"), ref: "QmSpgUkiJnCfdALUtHXocKQ8GtGaG4LsxUWEoUDFDruWXN", date: "2026-10-11", link: "https://gateway.pinata.cloud/ipfs/QmSpgUkiJnCfdALUtHXocKQ8GtGaG4LsxUWEoUDFDruWXN" },
                                { proves: lang("MPP Charge: settled payment", "MPP Charge: pago liquidado"), ref: "4d20d8648ce001c4e8e894725ad08a8dbcd3904e0024ca440728bc91e6c10236", date: "2026-10-15", link: "https://stellar.expert/explorer/testnet/tx/4d20d8648ce001c4e8e894725ad08a8dbcd3904e0024ca440728bc91e6c10236" },
                                { proves: lang("MPP Charge: settled payment", "MPP Charge: pago liquidado"), ref: "e70cfcb884c17d946210a000a627b7a9c316737a61a66ad2e42d905df679f167", date: "2026-10-15", link: "https://stellar.expert/explorer/testnet/tx/e70cfcb884c17d946210a000a627b7a9c316737a61a66ad2e42d905df679f167" },
                                { proves: lang("MPP Charge: settled payment", "MPP Charge: pago liquidado"), ref: "be7865f19b4daf9b60993eb4df900098663a55861a357fd7b67a059cc228ff03", date: "2026-10-15", link: "https://stellar.expert/explorer/testnet/tx/be7865f19b4daf9b60993eb4df900098663a55861a357fd7b67a059cc228ff03" },
                            ]} />
                            <p className="text-sm">
                                {lang(
                                    "Recap of the honest limit from §8: the valid-evidence release above ran under the ",
                                    "Recordatorio del límite honesto del §8: la liberación con evidencia válida de arriba corrió bajo la "
                                )}
                                <strong className="text-white">{lang("first", "primera")}</strong>{" "}
                                {lang(
                                    "version of the decision-gate rule - hash and milestone match only, before the serviceProvider-key requirement existed.",
                                    "versión de la regla de la compuerta de decisión, solo verificaba hash e hito, antes de que existiera el requisito de la llave serviceProvider."
                                )}
                            </p>

                            {/* 9-nov-2026: antes la tabla de testnet mostraba los CIDs de 2 builders de
                                Niriumtober sin constancia de permiso, y eran 6. Un anclaje es de quien lo
                                hizo (mismo criterio que /verify y lib/privateAnchors.ts): se da el conteo,
                                verificado en IPFS ese día, y los CIDs solo a petición. TIA va arriba, con
                                permiso, y no se cuenta otra vez aquí. */}
                            <p className="!mb-2 !mt-8"><strong className="text-white">{lang("External builders (Niriumtober)", "Builders externos (Niriumtober)")}</strong></p>
                            <p className="text-sm">
                                {lang(
                                    "Six external builders anchored their own signed receipts with their own keys during Niriumtober (22 Oct - 3 Nov 2026) or right after it: four on testnet and two on mainnet, six different signing keys. Each receipt was re-checked on IPFS on 9 Nov 2026 (hash and signature). Their CIDs are theirs, so they are not listed here; we share them on request with each builder's permission. TIA, listed above, is counted as an integration, not again here.",
                                    "Seis builders externos anclaron sus propios recibos firmados, con sus propias llaves, durante Niriumtober (22 oct - 3 nov 2026) o justo después: cuatro en testnet y dos en mainnet, seis llaves de firma distintas. Cada recibo se volvió a revisar en IPFS el 9 nov 2026 (hash y firma). Sus CIDs son suyos, así que no se listan aquí; los compartimos a petición, con permiso de cada builder. TIA, que aparece arriba, cuenta como integración y no se vuelve a contar aquí."
                                )}
                            </p>

                            <p className="!mb-2 !mt-8"><strong className="text-white">{lang("Upstream contributions", "Contribuciones a proyectos externos")}</strong></p>
                            <p>{lang(
                                "Merged in repositories Nirium does not control - each confirmed via the GitHub API (re-checked 19 Nov 2026). All were merged by the repository's maintainers except stellar-dev-skill #150 and #191, which Stellar's triage bot reviewed and merged:",
                                "Mergeadas en repositorios que Nirium no controla, cada una confirmada contra la API de GitHub (revisado otra vez el 19 nov 2026). Todas las mergearon los mantenedores del repositorio, salvo stellar-dev-skill #150 y #191, que revisó y mergeó el bot de triage de Stellar:")}</p>
                            <ul className="list-disc pl-5 space-y-1.5 text-sm">
                                <li><a href="https://github.com/stellar/stellar-dev-skill/pull/96" target="_blank" rel="noopener noreferrer">stellar/stellar-dev-skill #96</a> - {lang("Nirium added to the community skills catalog.", "Nirium se agregó al catálogo de skills de la comunidad.")}</li>
                                <li><a href="https://github.com/stellar/stellar-dev-skill/pull/97" target="_blank" rel="noopener noreferrer">stellar/stellar-dev-skill #97</a> - {lang("production patterns for x402 + MPP.", "patrones de producción para x402 + MPP.")}</li>
                                <li><a href="https://github.com/stellar/stellar-dev-skill/pull/150" target="_blank" rel="noopener noreferrer">stellar/stellar-dev-skill #150</a> - {lang("correction to a production claim in that same guide.", "corrección a un reclamo de producción en esa misma guía.")}</li>
                                <li><a href="https://github.com/stellar/stellar-dev-skill/pull/191" target="_blank" rel="noopener noreferrer">stellar/stellar-dev-skill #191</a> - {lang("Nirium's catalog card pointed at the renamed repo.", "la ficha de Nirium en el catálogo apunta al repo con su nombre nuevo.")}</li>
                                <li><a href="https://github.com/stellar/stellar-mpp-sdk/pull/69" target="_blank" rel="noopener noreferrer">stellar/stellar-mpp-sdk #69</a> - {lang("fixed two invalid mainnet SAC constants.", "corrigió dos constantes SAC de mainnet inválidas.")}</li>
                                <li><a href="https://github.com/pollar-xyz/pollar-apps/pull/30" target="_blank" rel="noopener noreferrer">pollar-xyz/pollar-apps #30</a> - {lang("Nirium x402 adapter demo app.", "app de demo del adaptador x402 de Nirium.")}</li>
                                <li>
                                    <a href="https://github.com/Trustless-Work/agentic-escrow-research/pull/1" target="_blank" rel="noopener noreferrer">Trustless-Work/agentic-escrow-research #1</a>,{" "}
                                    <a href="https://github.com/Trustless-Work/agentic-escrow-research/pull/2" target="_blank" rel="noopener noreferrer">#2</a>,{" "}
                                    <a href="https://github.com/Trustless-Work/agentic-escrow-research/pull/3" target="_blank" rel="noopener noreferrer">#3</a>,{" "}
                                    <a href="https://github.com/Trustless-Work/agentic-escrow-research/pull/4" target="_blank" rel="noopener noreferrer">#4</a>,{" "}
                                    <a href="https://github.com/Trustless-Work/agentic-escrow-research/pull/9" target="_blank" rel="noopener noreferrer">#9</a>,{" "}
                                    <a href="https://github.com/Trustless-Work/agentic-escrow-research/pull/10" target="_blank" rel="noopener noreferrer">#10</a>,{" "}
                                    <a href="https://github.com/Trustless-Work/agentic-escrow-research/pull/11" target="_blank" rel="noopener noreferrer">#11</a>,{" "}
                                    <a href="https://github.com/Trustless-Work/agentic-escrow-research/pull/12" target="_blank" rel="noopener noreferrer">#12</a>,{" "}
                                    <a href="https://github.com/Trustless-Work/agentic-escrow-research/pull/13" target="_blank" rel="noopener noreferrer">#13</a>{" "}
                                    - {lang("agent-escrow use cases and research notes from Nirium's mainnet and testnet evidence (#9-#13 merged 2-5 Nov 2026; #3, #12 and #13 by M0nsxx).", "casos de uso de agente-escrow y notas de investigación con evidencia de mainnet y testnet de Nirium (#9-#13 mergeadas del 2 al 5 nov 2026; #3, #12 y #13 de M0nsxx).")}
                                </li>
                                <li><a href="https://github.com/SorobanAgents/agentrail/pull/68" target="_blank" rel="noopener noreferrer">SorobanAgents/agentrail #68</a>, <a href="https://github.com/SorobanAgents/agentrail/pull/70" target="_blank" rel="noopener noreferrer">#70</a> - {lang("opt-in public receipts for agent spends and proof-of-task, and a --receipt flag for the sandbox demo (merged 17-18 Nov 2026 by the AgentRail maintainer).", "recibos públicos opcionales para gastos de agentes y prueba de tarea, y una opción --receipt para el demo (mergeados el 17 y 18 nov 2026 por el mantenedor de AgentRail).")}</li>
                            </ul>
                            <p className="text-sm">
                                {lang(
                                    "Separately, shared work in the x402 core protocol itself - team-wide, not exclusive to Nirium:",
                                    "Aparte, trabajo compartido en el protocolo central de x402 mismo, de todo el equipo, no exclusivo de Nirium:"
                                )}{" "}
                                <a href="https://github.com/x402-foundation/x402/pull/3138" target="_blank" rel="noopener noreferrer">#3138</a>,{" "}
                                <a href="https://github.com/x402-foundation/x402/pull/3215" target="_blank" rel="noopener noreferrer">#3215</a>,{" "}
                                <a href="https://github.com/x402-foundation/x402/pull/3338" target="_blank" rel="noopener noreferrer">#3338</a>,{" "}
                                <a href="https://github.com/x402-foundation/x402/pull/3339" target="_blank" rel="noopener noreferrer">#3339</a>{" "}
                                {lang("in ", "en ")}<code>x402-foundation/x402</code>.
                            </p>
                        </Section>

                        <Section id="security-limits" kicker={lang("10 · Reference", "10 · Referencia")} title={lang("Security and Limits", "Seguridad y límites")} icon={AlertTriangle}>
                            <p className="!mb-2"><strong className="text-white">{lang("What Nirium can and cannot do with your keys:", "Qué puede y qué no puede hacer Nirium con tus llaves:")}</strong></p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <code>POST /api/audit/log</code>{" "}
                                    {lang(
                                        "never receives a private key - only a hash, an optional small JSON record, and an optional signature someone else already produced.",
                                        "nunca recibe una llave privada, solo un hash, un pequeño registro JSON opcional, y una firma opcional que alguien más ya produjo."
                                    )}
                                </li>
                                <li>
                                    {lang("A free key from ", "Una key gratis de ")}<Link href="/keys">/keys</Link>{" "}
                                    {lang("is self-service and wallet-signed, scoped to the free tier by default.", "es de autoservicio y se firma con wallet, limitada al nivel gratis por default.")}
                                </li>
                                <li>
                                    {lang(
                                        "Free keys cannot trigger mainnet Payouts, or deploy, deposit into or rebalance a Treasury vault on mainnet - those stay invite-only (institutional/enterprise tier, assigned manually). Withdrawing from your own vault stays open to any key.",
                                        "Las keys gratis no pueden disparar Payouts en mainnet, ni desplegar, depositar o rebalancear una bóveda de Treasury en mainnet: eso se queda por invitación (nivel institucional/enterprise, asignado a mano). Retirar de tu propia bóveda sigue abierto para cualquier key."
                                    )}
                                </li>
                            </ul>
                            <p className="!mb-2 !mt-6"><strong className="text-white">{lang("Known limits, stated plainly:", "Límites conocidos, dichos de frente:")}</strong></p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    {lang(
                                        "MPP Charge is wired on both networks, but has only been tested on testnet: several settled charges on 15 Oct 2026 (see §9), none on mainnet - treat MPP on mainnet as unverified until a mainnet settlement hash exists.",
                                        "MPP Charge está conectado en las dos redes, pero solo se ha probado en testnet: varios cobros liquidados el 15 oct 2026 (ver §9), ninguno en mainnet; trata a MPP en mainnet como no verificado hasta que exista un hash de liquidación en mainnet."
                                    )}
                                </li>
                                <li>{lang("The pre-sign policy hook (§7, #96) has run on mainnet once, in an integration test by AgentLedger (18 Nov 2026), not against organic traffic.", "El hook de política antes de firmar (§7, #96) se ha corrido una vez en mainnet, en una prueba de integración de AgentLedger (18 nov 2026), no contra tráfico orgánico.")}</li>
                                <li>
                                    <code>/api/audit/log</code>{" "}
                                    {lang(
                                        "is free during the open beta, rate-limited to 20 requests/minute per IP on each box.",
                                        "es gratis durante la beta abierta, con límite de 20 solicitudes por minuto por IP en cada servidor."
                                    )}
                                </li>
                            </ul>
                            <p className="!mt-8 text-sm text-gray-500">
                                {lang("Treasury and Payouts are separate, invite-only modules, not covered here.", "Treasury y Payouts son módulos aparte, por invitación, que no se cubren aquí.")}
                            </p>
                        </Section>

                        <Section id="roadmap" kicker={lang("11 · Roadmap", "11 · Hoja de ruta")} title={lang("Roadmap", "Hoja de ruta")} icon={MapIcon}>
                            <p>
                                <strong className="text-white">{lang("Planned, not live:", "Planeado, no en vivo:")}</strong>{" "}
                                {lang(
                                    "batching anchored receipts into a Soroban registry contract, so a receipt's existence can be checked on-chain directly instead of only via an IPFS CID. No date set yet.",
                                    "agrupar recibos anclados en un contrato de registro en Soroban, para que la existencia de un recibo se pueda comprobar directo en cadena, no solo vía un CID de IPFS. Todavía sin fecha."
                                )}
                            </p>
                            <p>
                                {lang(
                                    "A minimal ",
                                    "Un prototipo mínimo de "
                                )}
                                <code>ReceiptRegistry</code>{" "}
                                {lang(
                                    "prototype was measured on testnet on 29 Oct 2026 - a cost check, not a launch: contract",
                                    "se midió en testnet el 29 de octubre de 2026, una revisión de costo, no un lanzamiento: contrato"
                                )}{" "}
                                <a href="https://stellar.expert/explorer/testnet/contract/CBK7GBTO32ZFARQP4D2LVPLR3AOFZZJZXQSMZJWRUPPU7OYIDFPIWQBG" target="_blank" rel="noopener noreferrer" className="break-all">CBK7GBTO32ZFARQP4D2LVPLR3AOFZZJZXQSMZJWRUPPU7OYIDFPIWQBG</a>,{" "}
                                {lang(
                                    "each ",
                                    "cada llamada a "
                                )}
                                <code>anchor_root</code>{" "}
                                {lang(
                                    "call costing 17,472 stroops (0.0017472 XLM), confirmed against Horizon.",
                                    "cuesta 17,472 stroops (0.0017472 XLM), confirmado contra Horizon."
                                )}
                            </p>
                        </Section>

                    </div>
                </div>
            </div>
        </main>
    );
}

export default function DocsPage() {
    return <DocsContent />;
}
