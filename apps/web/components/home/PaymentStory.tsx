/** "Un pago, de punta a punta" - linea de tiempo de los 5 pasos de un pago
 * x402 con el hook de politica. Rehecha el 9-oct-2026: la version sticky de
 * 500vh mostraba un solo paso a la vez y dejaba tramos de scroll sin nada
 * visible. Aqui los 5 pasos estan siempre en el flujo normal y siempre
 * legibles; el scroll solo rellena la linea de progreso y el circulo de cada
 * paso (decorativo). Con prefers-reduced-motion no hay animacion alguna. **/
'use client';

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, MotionValue } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

type Step = { en: string; es: string };

const STEPS: Step[] = [
    {
        en: "An app, a backend or an AI agent requests your API.",
        es: "Una app, un backend o un agente de IA pide tu API.",
    },
    {
        en: "Before it signs anything, your policy engine says allow, wait for a human, or deny.",
        es: "Antes de firmar nada, tu motor de políticas dice permitir, esperar a un humano o negar.",
    },
    {
        en: "Only on allow does it sign the payment.",
        es: "Solo si permite, firma el pago.",
    },
    {
        en: "x402Serve() checks it and lets the request through.",
        es: "x402Serve() lo verifica y deja pasar el request.",
    },
    {
        en: "It settles on Stellar in ~5 s - and if you anchor it, anyone can verify the receipt from the CID alone.",
        es: "Liquida en Stellar en ~5 s - y si lo anclas, cualquiera verifica el recibo con el CID.",
    },
];

// Relleno decorativo del circulo: el numero y el texto nunca dependen de esto.
function StepFill({ index, total, progress }: { index: number; total: number; progress: MotionValue<number> }) {
    const t = index / (total - 1);
    const opacity = useTransform(progress, [t - 0.12, t], [0, 1]);
    return <motion.span aria-hidden style={{ opacity }} className="absolute inset-0 rounded-full bg-stellar-teal/20" />;
}

export default function PaymentStory() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === 'es' ? es : en);
    const listRef = useRef<HTMLOListElement>(null);
    const reduceMotion = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: listRef,
        offset: ['start 75%', 'end 55%'],
    });

    return (
        <section id="story" className="py-16 sm:py-24 border-t border-white/5 scroll-mt-28">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-12 sm:mb-16">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-stellar-teal mb-3">
                        {lang('How it works', 'Cómo funciona')}
                    </p>
                    <h2 className="text-2xl sm:text-4xl font-bold">
                        {lang('One payment, end to end', 'Un pago, de punta a punta')}
                    </h2>
                </div>

                <ol ref={listRef} className="relative">
                    <div aria-hidden className="absolute left-5 sm:left-6 top-5 bottom-5 w-px -translate-x-1/2 bg-stellar-teal/20" />
                    {!reduceMotion && (
                        <motion.div
                            aria-hidden
                            style={{ scaleY: scrollYProgress }}
                            className="absolute left-5 sm:left-6 top-5 bottom-5 w-0.5 -translate-x-1/2 origin-top bg-gradient-to-b from-stellar-teal to-stellar-yellow"
                        />
                    )}

                    {STEPS.map((step, i) => (
                        <li key={i} className="relative flex gap-4 sm:gap-6 pb-10 sm:pb-12 last:pb-0">
                            <div className="relative shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-stellar-teal/50 bg-black flex items-center justify-center">
                                {!reduceMotion && <StepFill index={i} total={STEPS.length} progress={scrollYProgress} />}
                                <span className="relative text-sm sm:text-base font-bold text-stellar-teal">{i + 1}</span>
                            </div>
                            <div className="min-w-0 pt-1 sm:pt-1.5">
                                <div className="text-[11px] font-mono uppercase tracking-widest text-stellar-teal mb-1.5">
                                    {lang('Step', 'Paso')} {i + 1}/{STEPS.length}
                                </div>
                                <p className="text-lg sm:text-2xl font-bold leading-snug text-white">
                                    {lang(step.en, step.es)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
