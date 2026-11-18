// Secciones para decisores no técnicos (CFO / tesorería). Vivían en la home
// hasta el 4-oct-2026; la home pasó a ser x402-first y este contenido se movió
// aquí porque habla de tesorería y no de cobrar por API.
// 8-nov-2026: se quitó "Todos los CFO con los que hablamos..." ($0 / Horas / Meses),
// que no podíamos sostener, y las respuestas ahora dicen lo que el nodo hace hoy:
// el agente sí firma, pero solo dentro de la bóveda; en mainnet es por invitación.
'use client';

import Link from "next/link";
import { ArrowRight, Building2, ChevronRight, FileCheck, Lock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

export default function TreasuryPlainTerms() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === 'es' ? es : en);

    return (
        <>
            {/* BRIDGE FOR NON-CRYPTO DECISION-MAKERS - sección aparte, no reemplaza
                el lenguaje técnico de abajo (ese sigue sirviendo a devs y perfiles
                cripto-nativos). Traduce las mismas garantías reales a lenguaje de
                negocio, sin nombrar protocolos ni pedir que el lector sepa qué es
                blockchain. Nada aquí puede prometer más de lo que el resto del
                sitio ya sostiene (invite-only en tesorería/payouts sigue siendo
                invite-only). */}
            <section className="py-20 border-t border-white/5 bg-white/[0.015]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/50 text-[10px] font-black uppercase tracking-widest mb-4">
                            {lang("Don't speak crypto? Here's the version for you", '¿No hablas cripto? Esta versión es para ti')}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold">
                            {lang('Same model. In plain business terms.', 'El mismo modelo. En español de negocio.')}
                        </h2>
                        <p className="mt-4 text-white/50 max-w-xl mx-auto text-sm">
                            {lang(
                                "You don't need to understand blockchain to know if this is safe for your company. Three questions any CFO asks, answered without the jargon.",
                                'No necesitas entender blockchain para saber si esto es seguro para tu empresa. Tres preguntas que hace cualquier CFO, respondidas sin la jerga.')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-xl border border-white/10 bg-black/40">
                            <div className="p-2.5 rounded-lg bg-stellar-teal/10 w-fit mb-4">
                                <Lock className="w-5 h-5 text-stellar-teal" />
                            </div>
                            <h3 className="text-base font-bold mb-2">
                                {lang('"Can Nirium walk away with our money?"', '"¿Nirium se puede quedar con nuestro dinero?"')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed">
                                {lang(
                                    "No. Your money stays in a vault only your company controls. The agent is like an accountant who can move money between your own accounts but can never send it anywhere else. Taking money out of the vault always needs your signature.",
                                    'No. Tu dinero se queda en una bóveda que solo controla tu empresa. El agente es como un contador que puede mover dinero entre tus propias cuentas pero nunca mandarlo a otro lado. Sacar dinero de la bóveda siempre necesita tu firma.')}
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-white/10 bg-black/40">
                            <div className="p-2.5 rounded-lg bg-stellar-teal/10 w-fit mb-4">
                                <TrendingUp className="w-5 h-5 text-stellar-teal" />
                            </div>
                            <h3 className="text-base font-bold mb-2">
                                {lang('"Does someone have to push the button every day?"', '"¿Alguien tiene que apretar el botón todos los días?"')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed">
                                {lang(
                                    'No. Once your vault has autonomous rebalancing turned on, it works like a standing order at your bank: "if the yield goes above X, invest; if it drops below Y, pull it back". The agent checks every 10 minutes and every move is a public transaction anyone can look up. On mainnet it is invite-only today.',
                                    'No. Cuando tu bóveda tiene el rebalanceo autónomo encendido, funciona como una orden permanente en tu banco: "si el rendimiento sube de X, invierte; si baja de Y, sácalo". El agente revisa cada 10 minutos y cada movimiento es una transacción pública que cualquiera puede consultar. En mainnet hoy es por invitación.')}
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-white/10 bg-black/40">
                            <div className="p-2.5 rounded-lg bg-stellar-teal/10 w-fit mb-4">
                                <FileCheck className="w-5 h-5 text-stellar-teal" />
                            </div>
                            <h3 className="text-base font-bold mb-2">
                                {lang('"How do we prove this to an auditor?"', '"¿Cómo le probamos esto a un auditor?"')}
                            </h3>
                            <p className="text-sm text-white/55 leading-relaxed">
                                {lang(
                                    "Every move is a Stellar transaction, with date and time, that anyone can look up on their own - not a PDF we could edit, not a database we could quietly change. It's closer to a public bank statement than to an internal spreadsheet.",
                                    'Cada movimiento es una transacción de Stellar, con fecha y hora, que cualquiera puede consultar por su cuenta - no un PDF que pudiéramos editar, no una base de datos que pudiéramos cambiar en silencio. Se parece más a un estado de cuenta público que a un Excel interno.')}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-sm text-white/40 max-w-lg mx-auto mb-5">
                            {lang(
                                "Curious what this looks like for your specific case? We'll walk you through it in plain language - no blockchain knowledge required on your end.",
                                '¿Quieres ver cómo aplica esto a tu caso? Te lo explicamos en español llano - no necesitas saber nada de blockchain de tu lado.')}
                        </p>
                        <a href="mailto:niriumprotocol@gmail.com">
                            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
                                {lang('Talk to us in plain terms', 'Habla con nosotros, sin jerga')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* WHY NIRIUM */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang("Why you don't have to trust Nirium with your money", 'Por qué no tienes que confiarle tu dinero a Nirium')}
                    </h2>

                    {/* Guarantee callout */}
                    <div className="mt-10 relative rounded-xl border border-stellar-yellow/20 bg-stellar-yellow/[0.04] px-6 py-5 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,200,0,0.06),transparent_70%)]" />
                        <p className="relative text-base sm:text-lg font-black text-white tracking-tight">
                            {lang(
                                '"The software decides when. The contract limits what. Your money never leaves your vault without your signature."',
                                '"El software decide cuándo. El contrato limita qué. Tu dinero nunca sale de tu bóveda sin tu firma."')}
                        </p>
                        <p className="relative mt-2 text-xs text-stellar-yellow/60 font-mono uppercase tracking-widest">
                            {lang('Nirium Security Model - You always hold the keys', 'Modelo de seguridad Nirium - Tú siempre tienes las llaves')}
                        </p>
                    </div>

                    <div className="mt-10 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Lock,
                                title: lang('Your money, your keys', 'Tu dinero, tus llaves'),
                                body:  lang(
                                    'Nirium never holds your funds. You control everything. We only run the automation, inside your own vault.',
                                    'Nirium nunca toca tu dinero. Tú controlas todo. Nosotros solo corremos la automatización, dentro de tu propia bóveda.'),
                                link: '/security',
                            },
                            {
                                icon: FileCheck,
                                title: lang('Every move, recorded', 'Cada movimiento, registrado'),
                                body:  lang(
                                    'Every move is a signed Stellar transaction. If you need a receipt to hand over, anchor it with Audit Trail and anyone can check it at /verify.',
                                    'Cada movimiento es una transacción firmada en Stellar. Si necesitas un recibo para entregar, ánclalo con Audit Trail y cualquiera lo revisa en /verify.'),
                                link: '/compliance',
                            },
                            {
                                icon: Building2,
                                title: lang('Etherfuse converts your MXN - we never touch it', 'Etherfuse convierte tus MXN - nosotros nunca los tocamos'),
                                body:  lang(
                                    'To get tokenized CETES you contract directly with Etherfuse, an independent operator: you send MXN to their CLABE and they issue the token to your wallet. Nirium never receives, holds or converts fiat - we only show you the instructions and read the resulting balance. Test environment today.',
                                    'Para tener CETES tokenizados contratas directamente con Etherfuse, operador independiente: tú envías MXN a su CLABE y ellos emiten el token a tu wallet. Nirium nunca recibe, sostiene ni convierte fiat - solo te muestra las instrucciones y lee el saldo resultante. Hoy en entorno de pruebas.'),
                                link: '/ramp',
                            },
                        ].map((feature) => (
                            <Link
                                key={feature.title}
                                href={feature.link}
                                className="group p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:border-stellar-teal/30 transition-colors"
                            >
                                <div className="p-2.5 rounded-lg bg-stellar-teal/10 w-fit mb-4">
                                    <feature.icon className="w-5 h-5 text-stellar-teal" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm text-white/60 leading-relaxed mb-4">{feature.body}</p>
                                <div className="text-xs text-stellar-teal/80 group-hover:text-stellar-teal flex items-center gap-1.5">
                                    {lang('Learn more', 'Ver más')}
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Aviso legal - puntero corto, no una tercera versión redactada aparte.
                        El texto completo vive en un solo lugar canónico: /disclaimers
                        (que ya renderiza LegalDisclaimer variant="inline"). Repetirlo aquí
                        con otras palabras es lo que los desalinea con el tiempo. */}
                    <p className="mt-8 text-[10px] text-white/30 font-mono leading-relaxed border border-white/5 rounded-lg px-5 py-3 bg-white/[0.01]">
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
        </>
    );
}
