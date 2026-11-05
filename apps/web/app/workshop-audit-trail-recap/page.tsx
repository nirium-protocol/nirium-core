"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
    ArrowRight, Building2, Check, FileWarning, Github, Key, Package,
    ShieldCheck, ShieldX, Sparkles, Users, Workflow,
} from "lucide-react";
import MinimalNav from "@/components/layout/MinimalNav";
import { useLanguage } from "@/context/LanguageContext";

// ═══════════════════════════════════════════════════════════════
// /workshop-audit-trail-recap — recap page for the 30-oct-2026 workshop
// ═══════════════════════════════════════════════════════════════
//
// Standalone page (MinimalNav, outside the (app) chrome), same pattern as
// app/workshop-audit-trail-october (the invite for this same workshop).
// Content is page-local lang(en, es), not dictionaries/ - same convention
// as that sibling page.
//
// Every claim here is checked against something real:
// - the Sept 2026 x402 facilitator outage: OpenZeppelin/relayer-plugin-
//   x402-facilitator#47, ~32 days (10-aug to 11-sep-2026), 5 independent
//   teams (incl. us) converged on the same finding before OZ fixed it.
// - TIA's CID (QmVWZM1i9qusiTfNAT9QdSFYJNEwQUXtnWuSkrCqRAnGEu): fetched
//   from the gateway and re-verified with `nirium-cli verify` on 30-oct-2026.
// - the Trustless Work decision-gate pilot: testnet only, see /docs#escrow-evidence.
//
// Screenshots: 01/02 are real frames extracted from the workshop's own demo
// recording (nirium-audit-trail-verify-demo-en-30oct.mp4, provided by the
// user). 04 is a live screenshot of nirium.xyz/verify with TIA's real CID.
// 03 (tampered/failed) is NOT from that video - the recording never
// actually triggers that branch in the 33-37s window it was expected in
// (checked every frame). It's a live reproduction instead: a real
// `nirium-cli verify` run against one of our own real anchored receipts
// with deliberately wrong evidence, same day. Real mismatch, just not
// lifted from the recording.
// ═══════════════════════════════════════════════════════════════

const TIA_CID = "QmVWZM1i9qusiTfNAT9QdSFYJNEwQUXtnWuSkrCqRAnGEu";
const REPO = "https://github.com/nirium-protocol/nirium";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.55, delay },
});

type LangFn = (en: string, es: string) => string;

const btnPrimary =
    "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-colors shadow-[0_10px_30px_rgba(16,185,129,0.3)]";
const btnGhost =
    "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/5 border border-white/15 text-white font-bold text-sm hover:bg-white/10 transition-colors";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`rounded-2xl border border-white/10 bg-[#0A0A0A] p-5 sm:p-7 ${className}`}>{children}</div>;
}

function SectionKicker({ n, children }: { n: string; children: React.ReactNode }) {
    return (
        <p className="text-[11px] font-mono uppercase tracking-widest text-emerald-300/90 mb-3">
            {n} · {children}
        </p>
    );
}

function Screenshot({
    src, width, height, caption, big = false,
}: { src: string; width: number; height: number; caption: string; big?: boolean }) {
    return (
        <div className={`rounded-2xl border border-white/10 overflow-hidden bg-black ${big ? "" : ""}`}>
            <Image
                src={src}
                alt={caption}
                width={width}
                height={height}
                sizes="(min-width: 1024px) 900px, 100vw"
                className="w-full h-auto"
            />
            <p className="px-4 py-3 text-xs sm:text-sm text-gray-400 border-t border-white/10 bg-white/[0.02]">
                {caption}
            </p>
        </div>
    );
}

function Page() {
    const { language } = useLanguage();
    const lang: LangFn = (en, es) => (language === "es" ? es : en);

    const whoFor = [
        { icon: Package, title: lang("x402 sellers", "Vendedores de x402"), desc: lang("Charging per request. A receipt per sale, not just a ledger entry.", "Que cobran por request. Un recibo por venta, no solo un movimiento en el ledger.") },
        { icon: Building2, title: lang("Escrow platforms", "Plataformas de escrow"), desc: lang("Like Trustless Work: evidence that a milestone's condition was actually met.", "Como Trustless Work: evidencia de que la condición de un hito de verdad se cumplió.") },
        { icon: FileWarning, title: lang("Anyone issuing quotes or invoices", "Cualquiera que emita cotizaciones o facturas"), desc: lang("A signed, timestamped record of exactly what was declared.", "Un registro firmado y con fecha de exactamente qué se declaró.") },
        { icon: Workflow, title: lang("AI agents that pay on their own", "Agentes de IA que pagan solos"), desc: lang("No human in the loop to vouch for what happened. The receipt does.", "Sin humano en el medio para dar fe de lo que pasó. El recibo lo hace.") },
    ];

    const possibleUseCases = [
        lang("Insurance claims", "Reclamos de seguros"),
        lang("Supply chain traceability", "Trazabilidad de cadena de suministro"),
        lang("Invoice disputes", "Disputas de facturas"),
        lang("Compliance and audits", "Cumplimiento y auditoría"),
        lang("AI agents that spend on their own", "Agentes de IA que gastan solos"),
    ];

    return (
        <main className="min-h-screen bg-black text-white antialiased">
            <MinimalNav />

            {/* ── MASTHEAD ──────────────────────────────────────────────── */}
            <section className="pt-10 sm:pt-16 pb-14 sm:pb-20">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <motion.div {...fadeUp()}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-widest mb-6">
                            <Sparkles className="w-3 h-3" /> {lang("Workshop recap", "Resumen del taller")}
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-5 leading-[1.08]">
                            {lang("Audit Trail: verifiable payment receipts on Stellar", "Audit Trail: recibos de pago verificables en Stellar")}
                        </h1>
                        <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto mb-8">
                            {lang(
                                "With Giovanny Amador and Monserrat Mendoza, Nirium co-founders. Everything below is real: the same CIDs, hashes and commands anyone can run today.",
                                "Con Giovanny Amador y Monserrat Mendoza, cofundadores de Nirium. Todo lo de abajo es real: los mismos CIDs, hashes y comandos que cualquiera puede correr hoy.",
                            )}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a href="/verify" className={btnPrimary}>
                                {lang("Try it yourself, free", "Pruébalo tú mismo, gratis")} <ArrowRight className="w-4 h-4" />
                            </a>
                            <a href={REPO} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                                <Github className="w-4 h-4" /> {lang("View the repo", "Ver el repo")}
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── 1. WHAT AUDIT TRAIL IS ───────────────────────────────── */}
            <section className="pb-16 sm:pb-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div {...fadeUp()}>
                        <SectionKicker n="01">{lang("What Audit Trail is", "Qué es Audit Trail")}</SectionKicker>
                        <Card className="space-y-4">
                            <p className="text-lg sm:text-xl font-bold text-white leading-snug">
                                {lang(
                                    "When an app, a backend or an AI agent pays on Stellar, the ledger shows that money moved. It doesn't show what was paid for, or who declared it.",
                                    "Cuando una app, un backend o un agente de IA paga en Stellar, el ledger muestra que el dinero se movió. No muestra qué se pagó, ni quién lo declaró.",
                                )}
                            </p>
                            <p className="text-gray-300">
                                {lang(
                                    "Audit Trail is a signed receipt anyone can verify without trusting us. A hash of the evidence, anchored to IPFS, optionally signed by whoever produced it.",
                                    "Audit Trail es un recibo firmado que cualquiera verifica sin confiar en nosotros. Un hash de la evidencia, anclado en IPFS, opcionalmente firmado por quien lo produjo.",
                                )}
                            </p>
                            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                                <p className="text-sm text-amber-100/90 leading-relaxed">
                                    {lang(
                                        "The real story behind why this matters: in September 2026, an x402 facilitator failed silently for about a month, while still returning what looked like valid 402 responses. Four other integrators, plus us, had to reconstruct by hand what had actually happened before anyone outside could fix it.",
                                        "La historia real detrás de por qué importa: en septiembre de 2026, un facilitador de x402 falló en silencio durante casi un mes, mientras seguía devolviendo respuestas 402 que parecían válidas. Otros cuatro integradores, más nosotros, tuvimos que reconstruir a mano qué había pasado de verdad antes de que alguien de afuera pudiera arreglarlo.",
                                    )}
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* ── 2. WHO IT'S FOR ───────────────────────────────────────── */}
            <section className="pb-16 sm:pb-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div {...fadeUp()}>
                        <SectionKicker n="02">{lang("Who it's for", "Para quién")}</SectionKicker>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {whoFor.map((w) => (
                                <Card key={w.title} className="space-y-2">
                                    <w.icon className="w-5 h-5 text-emerald-300" />
                                    <h3 className="font-bold text-white">{w.title}</h3>
                                    <p className="text-sm text-gray-400">{w.desc}</p>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── 3. WHY NOW ────────────────────────────────────────────── */}
            <section className="pb-16 sm:pb-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div {...fadeUp()}>
                        <SectionKicker n="03">{lang("Why now", "Por qué ahora")}</SectionKicker>
                        <Card className="space-y-3">
                            <ul className="space-y-3">
                                {[
                                    lang("Agent-to-agent payments are growing on Stellar, through x402 and MPP.", "Los pagos de agente a agente están creciendo en Stellar, por x402 y MPP."),
                                    lang("When the one paying is a program, you need something anyone, human or machine, can check automatically.", "Cuando quien paga es un programa, hace falta algo que cualquiera, humano o máquina, pueda comprobar en automático."),
                                    lang("It's free and takes about a minute.", "Es gratis y toma alrededor de un minuto."),
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-gray-200">
                                        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* ── 4. HOW IT WORKS (screenshots) ────────────────────────── */}
            <section className="pb-16 sm:pb-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div {...fadeUp()}>
                        <SectionKicker n="04">{lang("How it works", "Cómo funciona")}</SectionKicker>
                        <h2 className="text-xl sm:text-2xl font-black mb-6">
                            {lang("A real receipt, checked four ways", "Un recibo real, comprobado de cuatro formas")}
                        </h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 gap-5 mb-5">
                        <motion.div {...fadeUp(0.05)}>
                            <Screenshot
                                src="/workshop-audit-trail-recap/04-verify-tia.png"
                                width={732}
                                height={1028}
                                caption={lang(
                                    "nirium.xyz/verify with a real receipt loaded: TIA's quote CID. The signature is verified against the declared hash.",
                                    "nirium.xyz/verify con un recibo real cargado: el CID de una cotización de TIA. La firma se verifica contra el hash declarado.",
                                )}
                            />
                        </motion.div>
                        <motion.div {...fadeUp(0.1)} className="space-y-5">
                            <Screenshot
                                src="/workshop-audit-trail-recap/01-create-receipt.png"
                                width={1392}
                                height={250}
                                caption={lang(
                                    "Creating a receipt, live: your Stellar key, your CID.",
                                    "Creando un recibo, en vivo: tu llave de Stellar, tu CID.",
                                )}
                            />
                            <Screenshot
                                src="/workshop-audit-trail-recap/02-verification-passed.png"
                                width={1920}
                                height={900}
                                caption={lang(
                                    "Verifying it from the terminal, independently.",
                                    "Verificándolo desde la terminal, de forma independiente.",
                                )}
                            />
                        </motion.div>
                    </div>

                    <motion.div {...fadeUp(0.15)}>
                        <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/5 overflow-hidden">
                            <div className="px-5 sm:px-7 pt-5 sm:pt-7 flex items-center gap-2">
                                <ShieldX className="w-5 h-5 text-red-400" />
                                <p className="text-sm font-black uppercase tracking-widest text-red-300">
                                    {lang("The moment that matters most", "El momento que más importa")}
                                </p>
                            </div>
                            <div className="p-5 sm:p-7 pt-4">
                                <Screenshot
                                    src="/workshop-audit-trail-recap/03-tampered-failed.png"
                                    width={1920}
                                    height={650}
                                    big
                                    caption={lang(
                                        "Same receipt, tampered evidence. Verification doesn't pass, because the content doesn't match what was declared anymore. This is a live run against one of our real anchored receipts, not staged.",
                                        "Mismo recibo, evidencia alterada. La verificación no pasa, porque el contenido ya no coincide con lo que se declaró. Es una corrida en vivo contra uno de nuestros recibos reales anclados, no un montaje.",
                                    )}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── 5. POSSIBLE USE CASES (ideas) ────────────────────────── */}
            <section className="pb-16 sm:pb-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div {...fadeUp()}>
                        <SectionKicker n="05">{lang("Ideas worth exploring", "Ideas que vale la pena explorar")}</SectionKicker>
                        <p className="text-sm text-gray-500 mb-4">
                            {lang(
                                "Not things we've shipped or clients asking for them. Just ideas that came up in the room.",
                                "No son cosas que ya construimos ni gente pidiéndolas. Son ideas que salieron en la sala.",
                            )}
                        </p>
                        <Card>
                            <div className="flex flex-wrap gap-2.5">
                                {possibleUseCases.map((uc) => (
                                    <span key={uc} className="px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-200">
                                        {uc}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* ── 6. REAL USE CASES TODAY ──────────────────────────────── */}
            <section className="pb-20 sm:pb-28">
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div {...fadeUp()}>
                        <SectionKicker n="06">{lang("Real, today", "Real, hoy")}</SectionKicker>
                        <div className="space-y-4 mb-10">
                            <Card className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-300" />
                                    <h3 className="font-bold text-white">{lang("TIA signs its own quotes", "TIA firma sus propias cotizaciones")}</h3>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {lang(
                                        "TIA signs and anchors every exchange-rate quote it issues, on mainnet, with its own key. ",
                                        "TIA firma y ancla cada cotización de tipo de cambio que emite, en mainnet, con su propia llave. ",
                                    )}
                                    <a href={`https://nirium.xyz/verify?cid=${TIA_CID}`} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:underline whitespace-nowrap">
                                        {lang("See this receipt", "Ver este recibo")}
                                    </a>
                                    {lang(".", ".")}
                                </p>
                            </Card>
                            <Card className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-emerald-300" />
                                    <h3 className="font-bold text-white">{lang("A testnet pilot with Trustless Work", "Un piloto en testnet con Trustless Work")}</h3>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {lang(
                                        "Before releasing a milestone's payment, the anchored evidence is checked. If it was altered, the payment is not released.",
                                        "Antes de liberar el pago de un hito, se revisa la evidencia anclada. Si fue alterada, el pago no se libera.",
                                    )}
                                </p>
                            </Card>
                        </div>

                        <Card className="text-center space-y-5 bg-gradient-to-b from-emerald-500/[0.06] to-transparent border-emerald-500/20">
                            <h2 className="text-xl sm:text-2xl font-black">{lang("Try it yourself, free", "Pruébalo tú mismo, gratis")}</h2>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <a href="/verify" className={btnPrimary}>
                                    nirium.xyz/verify <ArrowRight className="w-4 h-4" />
                                </a>
                                <a href="/keys" className={btnGhost}>
                                    <Key className="w-4 h-4" /> nirium.xyz/keys
                                </a>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}

export default function WorkshopAuditTrailRecapPage() {
    return <Page />;
}
