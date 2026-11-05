"use client";

import { useState } from "react";
import Script from "next/script";
import { motion } from "framer-motion";
import {
    ArrowRight, Calendar, Check, Clock, Copy, ExternalLink, Github, Laptop,
    Loader2, MousePointerClick, ShieldCheck, Users,
} from "lucide-react";
import MinimalNav from "@/components/layout/MinimalNav";
import { useLanguage } from "@/context/LanguageContext";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.55, delay },
});

const REPO = "https://github.com/nirium-protocol/nirium";
const EVIDENCE_ISSUE_URL = `${REPO}/issues/new?template=niriumtober-evidence.yml`;
// Mainnet, no testnet: el anclaje nunca es una transacción de Stellar (solo
// firma un texto y lo sube a IPFS), así que no hace falta fondear ninguna
// cuenta - y usar mainnet vale +3 puntos de Niriumtober en vez de +2.
// Confirmado en vivo el 27-oct-2026: GET /api/audit/info en este box
// también responde "free during beta" (gratis, igual que en testnet).
const MAINNET_AGENT_URL = "https://nirium-agent-mainnet.fly.dev";
// Verificado en un navegador real (Playwright, no solo curl) el 27-oct-2026:
// el bundle UMD de esta versión expone `window.StellarSdk` y
// Keypair.random()/.sign() funcionan sin Node ni build step.
const STELLAR_SDK_CDN = "https://cdn.jsdelivr.net/npm/@stellar/stellar-sdk@14.6.1/dist/stellar-sdk.min.js";

const btnPrimary =
    "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-colors shadow-[0_10px_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed";
const btnGhost =
    "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/5 border border-white/15 text-white font-bold text-sm hover:bg-white/10 transition-colors";

type LangFn = (en: string, es: string) => string;

// Dos sesiones, mismo contenido, solo para cubrir más horarios de LatAm.
// Confirmado contra el start_at/end_at/timezone real de cada evento en Luma
// el 28-oct-2026, no copiado del brief a ciegas: ambas duran 60 min.
type Workshop = {
    id: string;
    label: string;
    dateLabel: string;
    timeLabel: string;
    lumaUrl: string;
    timezones: { place: string; time: string }[];
};

function getWorkshops(lang: LangFn): Workshop[] {
    return [
        {
            id: "ws1",
            label: lang("Workshop 1 of 2", "Workshop 1 de 2"),
            dateLabel: lang("Friday, October 30, 2026", "Viernes 30 de octubre de 2026"),
            timeLabel: lang("11:00 AM–12:00 PM Mexico City (UTC-6)", "11:00 AM–12:00 PM Ciudad de México (UTC-6)"),
            lumaUrl: "https://luma.com/knr98sro",
            timezones: [
                { place: lang("Mexico, Central America", "México, Centroamérica"), time: "11:00 AM" },
                { place: lang("Colombia, Peru, Ecuador", "Colombia, Perú, Ecuador"), time: "12:00 PM" },
                { place: "Bolivia", time: "1:00 PM" },
                { place: lang("Argentina, Chile, Uruguay, Brazil", "Argentina, Chile, Uruguay, Brasil"), time: "2:00 PM" },
            ],
        },
        {
            id: "ws2",
            label: lang("Workshop 2 of 2", "Workshop 2 de 2"),
            dateLabel: lang("Monday, November 2, 2026", "Lunes 2 de noviembre de 2026"),
            timeLabel: lang("4:00–5:00 PM Mexico City (UTC-6)", "4:00–5:00 PM Ciudad de México (UTC-6)"),
            lumaUrl: "https://luma.com/aljxkm5a",
            timezones: [
                { place: lang("Mexico, Central America", "México, Centroamérica"), time: "4:00 PM" },
                { place: lang("Colombia, Peru, Ecuador", "Colombia, Perú, Ecuador"), time: "5:00 PM" },
                { place: "Bolivia", time: "6:00 PM" },
                { place: lang("Argentina, Chile, Uruguay, Brazil", "Argentina, Chile, Uruguay, Brasil"), time: "7:00 PM" },
            ],
        },
    ];
}

function getAgenda(lang: LangFn): { time: string; title: string; detail?: string }[] {
    return [
        {
            time: "5 min",
            title: lang("The problem", "El problema"),
            detail: lang(
                "How you prove what an AI agent did, in a way nobody can change afterward.",
                "Cómo pruebas lo que hizo un agente de IA, sin que nadie lo pueda cambiar después.",
            ),
        },
        {
            time: "5 min",
            title: lang("What the Audit Trail is, in plain terms", "Qué es el Audit Trail, en simple"),
        },
        {
            time: "20 min",
            title: lang("Everyone follows along, live", "Todos siguen el paso, en vivo"),
            detail: lang(
                "One click on the button above: generates your key, signs and anchors it on mainnet, and verifies the result. If you'd rather use your terminal, the advanced mode further down covers that.",
                "Un clic en el botón de arriba: genera tu llave, firma y ancla en mainnet, y verifica el resultado. Quien prefiera su terminal puede seguir el modo avanzado más abajo.",
            ),
        },
        {
            time: "10 min",
            title: lang("Live Niriumtober evidence", "Evidencia de Niriumtober en vivo"),
            detail: lang("Fill out the issue with your CID and public key.", "Llenar el issue con su CID y llave pública."),
        },
        {
            time: "5 min",
            title: lang("Questions and wrap-up", "Preguntas y cierre"),
        },
    ];
}

const INSTALL = "npm install -g nirium-cli @stellar/stellar-sdk";

function getGenerateKeyCode(language: "en" | "es"): string {
    if (language === "en") {
        return `import { Keypair } from '@stellar/stellar-sdk';

const kp = Keypair.random();
console.log('Your public key:', kp.publicKey());
console.log('Your secret key (save it, never share it):', kp.secret());`;
    }
    return `import { Keypair } from '@stellar/stellar-sdk';

const kp = Keypair.random();
console.log('Tu llave pública:', kp.publicKey());
console.log('Tu llave secreta (guárdala, no la compartas):', kp.secret());`;
}

function getSignAndAnchorCode(language: "en" | "es"): string {
    if (language === "en") {
        return `import { Keypair } from '@stellar/stellar-sdk';
import { createHash } from 'node:crypto';

const kp = Keypair.fromSecret('YOUR_SECRET_KEY');
const sha = createHash('sha256').update('my first Niriumtober proof').digest('hex');
const signature = Buffer.from(kp.sign(Buffer.from(\`nirium-audit-v1:\${sha}\`))).toString('base64');

const res = await fetch('${MAINNET_AGENT_URL}/api/audit/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        hash: sha,
        tag: 'workshop-audit-trail',
        agent: { key: kp.publicKey(), signature },
    }),
});
const { cid } = await res.json();
console.log('CID:', cid);`;
    }
    return `import { Keypair } from '@stellar/stellar-sdk';
import { createHash } from 'node:crypto';

const kp = Keypair.fromSecret('TU_LLAVE_SECRETA');
const sha = createHash('sha256').update('mi primera prueba de Niriumtober').digest('hex');
const signature = Buffer.from(kp.sign(Buffer.from(\`nirium-audit-v1:\${sha}\`))).toString('base64');

const res = await fetch('${MAINNET_AGENT_URL}/api/audit/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        hash: sha,
        tag: 'workshop-audit-trail',
        agent: { key: kp.publicKey(), signature },
    }),
});
const { cid } = await res.json();
console.log('CID:', cid);`;
}

const VERIFY = "nirium verify <CID>";

function CodeBlock({ code }: { code: string }) {
    const { language } = useLanguage();
    const lang: LangFn = (en, es) => (language === "es" ? es : en);
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* sin portapapeles: el código sigue visible para copiarlo a mano */
        }
    };
    return (
        <div className="relative min-w-0">
            <button
                type="button"
                onClick={copy}
                className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-md border border-white/15 bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:border-emerald-400/60 hover:text-white"
            >
                {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                {copied ? lang("Copied", "Copiado") : lang("Copy", "Copiar")}
            </button>
            <pre className="text-[11px] sm:text-xs leading-relaxed font-mono text-gray-200 bg-black/70 border border-white/10 rounded-xl p-4 pt-10 sm:pt-4 sm:pr-20 whitespace-pre-wrap [overflow-wrap:anywhere] overflow-x-auto max-w-full [scrollbar-width:thin] [scrollbar-color:rgba(16,185,129,0.45)_transparent]">
                <code>{code}</code>
            </pre>
        </div>
    );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-white/10 bg-[#0A0A0A] p-5 sm:p-7 ${className}`}>{children}</div>
    );
}

function WorkshopCard({ workshop }: { workshop: Workshop }) {
    const { language } = useLanguage();
    const lang: LangFn = (en, es) => (language === "es" ? es : en);
    return (
        <Card className="space-y-4">
            <div>
                <p className="text-xs font-bold text-emerald-300 mb-1">{workshop.label}</p>
                <h3 className="font-black text-lg">{workshop.dateLabel}</h3>
                <p className="text-sm text-gray-400">{workshop.timeLabel}</p>
            </div>
            <div className="divide-y divide-white/10">
                {workshop.timezones.map((tz) => (
                    <div key={tz.place} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-gray-300">{tz.place}</span>
                        <span className="font-mono font-bold text-emerald-200">{tz.time}</span>
                    </div>
                ))}
            </div>
            <a href={workshop.lumaUrl} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} w-full`}>
                {lang("Reserve my spot", "Reservar mi lugar")} <ArrowRight className="w-4 h-4" />
            </a>
        </Card>
    );
}

type AnchorResult = { cid: string; gatewayUrl?: string; pubkey: string };

// Declaración mínima del global que carga el script de la CDN - no se instala
// el paquete, así que TypeScript no lo conoce de otra forma.
declare global {
    interface Window {
        StellarSdk?: {
            Keypair: { random: () => { publicKey: () => string; sign: (data: Uint8Array) => Uint8Array } };
        };
    }
}

function bytesToBase64(bytes: Uint8Array): string {
    // Sin Buffer (no existe en el navegador): btoa sobre los bytes crudos.
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

async function sha256Hex(text: string): Promise<string> {
    // .slice() sin argumentos: copia a un Uint8Array<ArrayBuffer> plano -
    // encode() por sí solo tipa como ArrayBufferLike, que digest() rechaza.
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text).slice());
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

function OneClickAnchor() {
    const { language } = useLanguage();
    const lang: LangFn = (en, es) => (language === "es" ? es : en);
    const [sdkReady, setSdkReady] = useState(false);
    const [sdkFailed, setSdkFailed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AnchorResult | null>(null);

    const run = async () => {
        setError(null);
        setBusy(true);
        try {
            const sdk = window.StellarSdk;
            if (!sdk) {
                throw new Error(
                    lang(
                        "The SDK hasn't loaded yet - wait a few seconds and try again.",
                        "El SDK todavía no cargó - espera unos segundos y vuelve a intentar.",
                    ),
                );
            }

            const kp = sdk.Keypair.random();
            const text = `nirium workshop audit trail - ${new Date().toISOString()}`;
            const sha = await sha256Hex(text);
            const statement = `nirium-audit-v1:${sha}`;
            const sig = kp.sign(new TextEncoder().encode(statement));
            const signature = bytesToBase64(sig);

            const res = await fetch(`${MAINNET_AGENT_URL}/api/audit/log`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hash: sha,
                    tag: "workshop-audit-trail",
                    agent: { key: kp.publicKey(), signature },
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || lang(`The server responded ${res.status}`, `El servidor respondió ${res.status}`));
            }

            setResult({ cid: data.cid, gatewayUrl: data.gatewayUrl, pubkey: kp.publicKey() });
        } catch (e) {
            setError(e instanceof Error ? e.message : lang("Something went wrong. Try again.", "Algo salió mal. Intenta de nuevo."));
        } finally {
            setBusy(false);
        }
    };

    const evidenceUrl = result
        ? `${EVIDENCE_ISSUE_URL}&project=${encodeURIComponent("Workshop Audit Trail")}&network=mainnet&evidence=${encodeURIComponent(result.cid)}&pubkey=${encodeURIComponent(result.pubkey)}`
        : EVIDENCE_ISSUE_URL;

    return (
        <>
            <Script
                src={STELLAR_SDK_CDN}
                strategy="afterInteractive"
                onLoad={() => setSdkReady(true)}
                onError={() => setSdkFailed(true)}
            />
            <Card className="border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <MousePointerClick className="w-4 h-4" /> {lang("One-click flow · Mainnet · Under 1 minute", "Flujo de un clic · Mainnet · Menos de 1 minuto")}
                </div>
                <p className="text-gray-200">
                    {lang(
                        "Generate a new key in your browser, sign a proof, and anchor it in Nirium's Audit Trail — on mainnet, free, nothing to install and no account to fund.",
                        "Genera una llave nueva en tu navegador, firma una prueba y ánclala en el Audit Trail de Nirium — en mainnet, gratis, sin instalar nada y sin fondear ninguna cuenta.",
                    )}
                </p>

                {!result && (
                    <button type="button" onClick={run} disabled={busy || (!sdkReady && !sdkFailed)} className={btnPrimary}>
                        {busy ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> {lang("Anchoring on mainnet…", "Anclando en mainnet…")}
                            </>
                        ) : sdkReady ? (
                            <>
                                {lang("Generate and anchor my proof", "Generar y anclar mi prueba")} <ArrowRight className="w-4 h-4" />
                            </>
                        ) : sdkFailed ? (
                            lang("Couldn't load the SDK - reload the page", "No se pudo cargar el SDK - recarga la página")
                        ) : (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> {lang("Loading…", "Cargando…")}
                            </>
                        )}
                    </button>
                )}

                {error && (
                    <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-3">
                        {error}
                    </p>
                )}

                {result && (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-emerald-400/30 bg-black/40 p-4 space-y-3">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">{lang("Your CID", "Tu CID")}</p>
                                <p className="font-mono text-sm text-emerald-200 break-all">{result.cid}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">{lang("Your public key", "Tu llave pública")}</p>
                                <p className="font-mono text-sm text-gray-200 break-all">{result.pubkey}</p>
                            </div>
                            {result.gatewayUrl && (
                                <a href={result.gatewayUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-emerald-300 underline underline-offset-2">
                                    {lang("View the anchored document", "Ver el documento anclado")} <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                                {lang("Submit my evidence", "Llenar mi evidencia")} <ArrowRight className="w-4 h-4" />
                            </a>
                            <button
                                type="button"
                                onClick={() => {
                                    setResult(null);
                                    setError(null);
                                }}
                                className={btnGhost}
                            >
                                {lang("Anchor another proof", "Anclar otra prueba")}
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </>
    );
}

export default function WorkshopAuditTrailOctoberPage() {
    const { language } = useLanguage();
    const lang: LangFn = (en, es) => (language === "es" ? es : en);
    const workshops = getWorkshops(lang);
    const agenda = getAgenda(lang);
    const generateKeyCode = getGenerateKeyCode(language);
    const signAndAnchorCode = getSignAndAnchorCode(language);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-400/30 overflow-x-clip">
            <MinimalNav />

            {/* ── HERO ──────────────────────────────────────────────────── */}
            <section className="relative pt-4 pb-14 sm:pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] max-w-full h-[360px] bg-[radial-gradient(ellipse,rgba(16,185,129,0.14),transparent_70%)] pointer-events-none" />
                <div className="container mx-auto px-4 max-w-4xl relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-5 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-200">
                                {lang("🔐 Live workshop · Niriumtober", "🔐 Taller en vivo · Niriumtober")}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-[1.05]">
                            {lang(
                                "Audit Trail on Stellar: verifiable proof for apps, backends, and agents, with Nirium",
                                "Audit Trail en Stellar: prueba verificable para apps, backends y agentes, con Nirium",
                            )}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm sm:text-base text-gray-300">
                            <span className="inline-flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-emerald-300" /> {lang("Two sessions: October 30 and November 2, 2026", "Dos sesiones: 30 de octubre y 2 de noviembre de 2026")}
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-300" /> {lang("Mexico City (UTC-6) · 60 min each", "Ciudad de México (UTC-6) · 60 min cada una")}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm sm:text-base">
                            {lang("With ", "Con ")}
                            <span className="text-white font-semibold">Giovanny Amador</span>
                            {lang(" and ", " y ")}
                            <span className="text-white font-semibold">Monserrat Mendoza</span>
                            {lang(
                                ", Nirium co-founders. Same content in both — pick whichever time works for you.",
                                ", cofundadores de Nirium. Mismo contenido en ambas — elige el horario que te convenga.",
                            )}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <a href="#horarios" className={btnPrimary}>
                                {lang("See times and reserve", "Ver horarios y reservar")} <ArrowRight className="w-4 h-4" />
                            </a>
                            <a href={REPO} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                                <Github className="w-4 h-4" /> {lang("View the repo", "Ver el repo")}
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── HORARIOS (dos sesiones) ──────────────────────────────── */}
            <section id="horarios" className="pb-14 sm:pb-20 scroll-mt-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.h2 {...fadeUp()} className="text-2xl font-black text-center mb-6">
                        {lang("Pick your time — same content in both sessions", "Elige tu horario — mismo contenido en las dos sesiones")}
                    </motion.h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                        {workshops.map((w, i) => (
                            <motion.div key={w.id} {...fadeUp(0.05 * i)}>
                                <WorkshopCard workshop={w} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── DESCRIPCIÓN ───────────────────────────────────────────── */}
            <section className="pb-14 sm:pb-20">
                <div className="container mx-auto px-4 max-w-2xl">
                    <motion.div {...fadeUp()}>
                        <Card className="space-y-4">
                            <p className="text-lg sm:text-xl font-bold text-white">
                                {lang(
                                    "🔐 How do you later prove something really happened, in a way nobody can change?",
                                    "🔐 ¿Cómo pruebas después que algo pasó de verdad, sin que nadie lo pueda cambiar?",
                                )}
                            </p>
                            <p className="text-gray-300">{lang("That's what you'll build today, live, with us.", "Eso es lo que vas a construir hoy, en vivo, con nosotros.")}</p>
                            <p className="text-gray-300">
                                {lang(
                                    "Nirium builds verifiable payment rails on Stellar. They work for apps, backends, and AI agents.",
                                    "Nirium hace rieles de pago verificables en Stellar. Sirven para apps, backends y agentes de IA.",
                                )}
                            </p>
                            <p className="text-gray-300">{lang("In 60 minutes you'll:", "En 60 minutos vas a:")}</p>
                            <ul className="space-y-2">
                                {[
                                    lang("Sign a proof with your own Stellar key", "Firmar una prueba con tu propia llave de Stellar"),
                                    lang("Anchor it in Nirium's Audit Trail (free, on mainnet)", "Anclarla en el Audit Trail de Nirium (gratis, en mainnet)"),
                                    lang("Verify it yourself, without taking our word for it", "Verificarla tú mismo, sin confiar en nuestra palabra"),
                                    lang("Walk away with a real Niriumtober badge", "Llevarte un badge real de Niriumtober"),
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-gray-200">
                                        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-gray-300">
                                {lang("You don't need Stellar experience. Just your laptop with Node.js.", "No necesitas experiencia con Stellar. Solo tu laptop con Node.js.")}
                            </p>
                            <p className="text-gray-400 text-sm pt-2">
                                {lang("👥 With Giovanny Amador and Monserrat Mendoza, Nirium co-founders.", "👥 Con Giovanny Amador y Monserrat Mendoza, cofundadores de Nirium.")}
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* ── FLUJO DE UN CLIC (principal) ─────────────────────────── */}
            <section className="pb-14 sm:pb-20">
                <div className="container mx-auto px-4 max-w-2xl">
                    <motion.div {...fadeUp()}>
                        <OneClickAnchor />
                    </motion.div>
                </div>
            </section>

            {/* ── REQUISITOS ────────────────────────────────────────────── */}
            <section className="pb-14 sm:pb-20">
                <div className="container mx-auto px-4 max-w-2xl">
                    <motion.div {...fadeUp()}>
                        <Card>
                            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                                <Laptop className="w-5 h-5 text-emerald-300" /> {lang("Requirements to attend", "Requisitos para asistir")}
                            </h2>
                            <ul className="space-y-2 text-gray-200">
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> {lang("Laptop with Node.js installed", "Laptop con Node.js instalado")}
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> {lang("No prior Stellar experience needed", "No hace falta experiencia previa con Stellar")}
                                </li>
                            </ul>
                            <p className="text-xs text-gray-500 mt-4">
                                {lang(
                                    "Node.js is only needed for the advanced (terminal) mode and to verify with the CLI. The button above runs entirely in the browser, nothing to install.",
                                    "Node.js solo hace falta para el modo avanzado (terminal) y para verificar con la CLI. El botón de arriba corre completo en el navegador, sin instalar nada.",
                                )}
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* ── AGENDA ────────────────────────────────────────────────── */}
            <section className="pb-14 sm:pb-20">
                <div className="container mx-auto px-4 max-w-2xl space-y-5">
                    <motion.h2 {...fadeUp()} className="text-2xl font-black text-center">
                        {lang("Agenda", "Agenda")}
                    </motion.h2>

                    {agenda.map((item) => (
                        <motion.div key={item.title} {...fadeUp()}>
                            <Card>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-400/10 border border-emerald-400/30 rounded-full px-2.5 py-1">
                                        {item.time}
                                    </span>
                                    <h3 className="font-bold">{item.title}</h3>
                                </div>
                                {item.detail && (
                                    <p className="text-gray-400 text-sm pl-0.5">
                                        {item.title === lang("Live Niriumtober evidence", "Evidencia de Niriumtober en vivo") ? (
                                            <>
                                                {item.detail}{" "}
                                                <a href={EVIDENCE_ISSUE_URL} target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline underline-offset-2">
                                                    {lang("Fill out the issue", "Llenar el issue")}
                                                </a>
                                            </>
                                        ) : (
                                            item.detail
                                        )}
                                    </p>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── MODO AVANZADO (terminal) ──────────────────────────────── */}
            <section className="pb-14 sm:pb-20">
                <div className="container mx-auto px-4 max-w-2xl">
                    <motion.div {...fadeUp()}>
                        <Card className="space-y-5">
                            <h2 className="text-lg font-black">{lang("Advanced mode: from your terminal", "Modo avanzado: desde tu terminal")}</h2>
                            <p className="text-sm text-gray-400">
                                {lang(
                                    "For anyone who'd rather do it step by step on their own machine instead of the button above.",
                                    "Para quien prefiera hacerlo paso a paso en su propia máquina en vez del botón de arriba.",
                                )}
                            </p>

                            <div>
                                <p className="text-sm text-gray-400 mb-2 font-semibold">{lang("a. Install", "a. Instalar")}</p>
                                <CodeBlock code={INSTALL} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-2 font-semibold">{lang("b. Generate a test key", "b. Generar una llave de prueba")}</p>
                                <CodeBlock code={generateKeyCode} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-2 font-semibold">
                                    {lang("c. Sign and anchor a hash in the Audit Trail", "c. Firmar y anclar un hash en el Audit Trail")}
                                </p>
                                <p className="text-xs text-gray-500 mb-2">
                                    {language === "es" ? (
                                        <>
                                            El anclaje se hace con una llamada directa a la API (<code className="text-emerald-300">POST {MAINNET_AGENT_URL}/api/audit/log</code>) — gratis durante el beta, en mainnet, 20 requests/min. No es una transacción de Stellar, así que no hace falta fondear ninguna cuenta. El CLI no crea el anclaje todavía, solo lo verifica.
                                        </>
                                    ) : (
                                        <>
                                            The anchor happens via a direct API call (<code className="text-emerald-300">POST {MAINNET_AGENT_URL}/api/audit/log</code>) — free during the beta, on mainnet, 20 requests/min. It&apos;s not a Stellar transaction, so no account needs funding. The CLI doesn&apos;t create the anchor yet, it only verifies it.
                                        </>
                                    )}
                                </p>
                                <CodeBlock code={signAndAnchorCode} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-2 font-semibold">{lang("d. Verify", "d. Verificar")}</p>
                                <CodeBlock code={VERIFY} />
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* ── NIRIUMTOBER DEADLINE ─────────────────────────────────── */}
            <section className="pb-14 sm:pb-20">
                <div className="container mx-auto px-4 max-w-2xl">
                    <motion.div {...fadeUp()}>
                        <Card className="border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent text-center space-y-4">
                            <ShieldCheck className="w-8 h-8 text-emerald-300 mx-auto" />
                            <p className="text-gray-200">
                                <span className="font-bold text-white">
                                    {lang(
                                        "Niriumtober closes Monday, November 2 at 6:00 PM Mexico City",
                                        "Niriumtober cierra el lunes 2 de noviembre a las 6:00 PM Ciudad de México",
                                    )}
                                </span>{" "}
                                {lang(
                                    "(midnight UTC, the sprint's real cutoff). Whatever you anchor and verify before that time counts as evidence.",
                                    "(medianoche UTC, el corte real del sprint). Lo que ancles y verifiques antes de esa hora cuenta como evidencia.",
                                )}
                            </p>
                            <p className="text-xs text-amber-300/90">
                                {lang(
                                    "If you attend Workshop 2 (ends 5:00 PM CDMX that same day), you only have 1 hour afterward to submit your evidence — don't leave it for later.",
                                    "Si asistes al Workshop 2 (termina 5:00 PM CDMX ese mismo día), tienes solo 1 hora después para llenar tu evidencia — no lo dejes para después.",
                                )}
                            </p>
                            <a href={EVIDENCE_ISSUE_URL} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                                <Users className="w-4 h-4" /> {lang("View the evidence template", "Ver la plantilla de evidencia")}
                            </a>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* ── CTA FINAL ─────────────────────────────────────────────── */}
            <section className="pb-20">
                <div className="container mx-auto px-4 max-w-2xl text-center space-y-5">
                    <motion.div {...fadeUp()} className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
                        {workshops.map((w) => (
                            <a key={w.id} href={w.lumaUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                                {lang("Reserve", "Reservar")} {w.label} <ArrowRight className="w-4 h-4" />
                            </a>
                        ))}
                        <a href={REPO} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                            <Github className="w-4 h-4" /> {lang("View the repo", "Ver el repo")}
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
