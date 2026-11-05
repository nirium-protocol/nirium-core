/** Nirium Ecosystem - "Built with Nirium" moved out of the home page scroll
 * into its own route (2026-10-09), reachable from Producto > Ecosistema. **/
'use client';

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";
import BuiltWithEcosystem from "@/components/home/BuiltWithEcosystem";
import { useLanguage } from "@/context/LanguageContext";

export default function EcosystemPage() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === 'es' ? es : en);

    return (
        <main className="min-h-screen bg-black text-white antialiased overflow-x-hidden">
            <Navbar />

            <div className="w-full pt-[115px] sm:pt-[140px] px-0 sm:px-4 flex justify-center relative z-50">
                <LegalDisclaimer variant="banner" locale={language === 'es' ? 'es' : 'en'} className="w-full max-w-[1600px] sm:rounded-xl shadow-2xl" />
            </div>

            <section className="relative pt-10 sm:pt-14 pb-4 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.08),transparent_60%)]" />
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold">
                        {lang('Built with Nirium', 'Hecho con Nirium')}
                    </h1>
                    <p className="mt-4 text-white/55 max-w-xl mx-auto text-sm">
                        {lang(
                            "What's integrated with Nirium, what's built on it, and what Nirium itself depends on. Each listing goes up once its owning team approves the text.",
                            'Qué se integra con Nirium, qué se construye sobre él, y de qué depende Nirium mismo. Cada ficha se publica cuando su equipo aprueba el texto.'
                        )}
                    </p>
                </div>
            </section>

            <BuiltWithEcosystem heading={false} />

            <Footer />
        </main>
    );
}
