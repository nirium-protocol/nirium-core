'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const BANNER_STORAGE_KEY = 'nirium-testnet-banner-dismissed';

export default function TestnetBanner() {
    const [dismissed, setDismissed] = useState(true); // Start dismissed to avoid flash
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === 'es' ? es : en);

    useEffect(() => {
        // Check sessionStorage (reset per session)
        const isDismissed = sessionStorage.getItem(BANNER_STORAGE_KEY) === 'true';
        setDismissed(isDismissed);
    }, []);

    // El ticker y el menú son fixed; este aviso iba en el flujo normal y quedaba
    // debajo de los dos, cortado. Ahora también es fixed (debajo del ticker) y
    // publica su altura en --banner-h para que el menú y el contenido bajen.
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const root = document.documentElement;
        const el = ref.current;
        if (dismissed || !el) {
            root.style.setProperty('--banner-h', '0px');
            return;
        }
        const update = () => root.style.setProperty('--banner-h', `${el.offsetHeight}px`);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => {
            ro.disconnect();
            root.style.setProperty('--banner-h', '0px');
        };
    }, [dismissed]);

    const handleDismiss = () => {
        try { sessionStorage.setItem(BANNER_STORAGE_KEY, 'true'); } catch {}
        setDismissed(true);
    };

    if (dismissed) return null;

    // 9-nov-2026: Payouts también está en mainnet solo por invitación (0 corridas en
    // mainnet según /api/reporting/summary?network=mainnet). Sin "revisión legal":
    // no hay abogado contratado ni opinión escrita todavía.
    // 9-nov-2026: mismo contenido, menos palabras, para que ocupe menos alto.
    const headline = lang(
        'On mainnet: x402, Audit Trail and Reporting. Treasury and Payouts invite-only (4 self-funded rebalances, last 6 Aug 2026; no Payouts runs yet).',
        'En mainnet: x402, Audit Trail y Reporting. Treasury y Payouts solo por invitación (4 rebalanceos con fondos propios, el último el 6 ago 2026; Payouts sin corridas aún).'
    );
    const detail = lang(
        'Both wait on a written legal opinion. NiriumVault stays on testnet until an external audit. Non-custodial · not financial advice.',
        'Los dos esperan una opinión legal por escrito. NiriumVault sigue en testnet hasta una auditoría externa. No custodial · no es asesoría financiera.'
    );

    return (
        <div
            ref={ref}
            role="banner"
            aria-label={`${headline} ${detail}`}
            className="nirium-netbanner fixed top-9 left-0 right-0 z-[105] w-full bg-background bg-gradient-to-r from-emerald-500/10 via-emerald-500/15 to-emerald-500/10 border-b border-emerald-500/25 backdrop-blur-sm"
        >
            <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-1.5 flex items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 shrink-0 mt-1 sm:mt-0">
                        <span className="relative flex h-2 w-2" aria-hidden="true">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                        </span>
                    </div>
                    {/* Completo en todos los tamaños: en celular se cortaba con "…" y escondía la segunda frase. */}
                    <p className="text-[10px] sm:text-[11px] font-mono text-emerald-700 dark:text-emerald-200/90 leading-snug">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">{headline}</span>
                        {' '}
                        <span className="text-amber-600 dark:text-amber-300/80">{detail}</span>
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors group"
                    aria-label={lang('Dismiss network notice', 'Cerrar aviso de red')}
                >
                    <X className="w-3.5 h-3.5 text-amber-700/70 dark:text-amber-400/70 group-hover:text-amber-900 dark:group-hover:text-white transition-colors" />
                </button>
            </div>
        </div>
    );
}
