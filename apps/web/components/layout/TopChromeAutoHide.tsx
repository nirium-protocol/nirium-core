"use client";

import { useEffect } from "react";

// 15-nov-2026 (opción c): en celular y tablet (< 1024px) la cinta de mercado y el
// aviso de red ocupaban ~120px fijos arriba, casi un tercio de la pantalla dentro
// del navegador de X. Al bajar se deslizan fuera y solo queda fijo el navbar; al
// volver arriba reaparecen. Marca <html data-chrome="collapsed">; el resto está en
// globals.css (--top-chrome). En desktop no hace nada.
export default function TopChromeAutoHide() {
    useEffect(() => {
        const root = document.documentElement;
        const mq = window.matchMedia("(max-width: 1023.98px)");
        let ticking = false;
        const apply = () => {
            ticking = false;
            if (mq.matches && window.scrollY > 48) root.dataset.chrome = "collapsed";
            else delete root.dataset.chrome;
        };
        const onScroll = () => {
            if (!ticking) { ticking = true; requestAnimationFrame(apply); }
        };
        apply();
        window.addEventListener("scroll", onScroll, { passive: true });
        mq.addEventListener("change", apply);
        return () => {
            window.removeEventListener("scroll", onScroll);
            mq.removeEventListener("change", apply);
            delete root.dataset.chrome;
        };
    }, []);
    return null;
}
