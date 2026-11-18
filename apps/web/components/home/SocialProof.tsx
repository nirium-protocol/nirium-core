"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

type StatsDownloads = { npm?: Record<string, { downloads?: number }>; pypi?: { total?: number } };

// Descargas de los paquetes (npm último año + PyPI), leídas en vivo de /api/stats,
// redondeadas hacia abajo al millar. Si la API falla no se muestra cifra: mejor
// nada que un número escrito a mano que caduca.
export default function SocialProof() {
    const { language } = useLanguage();
    const es = language === "es";
    const [thousands, setThousands] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/stats")
            .then((r) => (r.ok ? r.json() : null))
            .then((d: StatsDownloads | null) => {
                if (!d || cancelled) return;
                const npm = Object.values(d.npm ?? {}).reduce((sum, p) => sum + (p.downloads ?? 0), 0);
                const total = npm + (d.pypi?.total ?? 0);
                if (total >= 1000) setThousands(Math.floor(total / 1000));
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-white/50">
            {thousands !== null && (
                <>
                    <Link href="/stats" className="text-stellar-teal/80 hover:text-stellar-teal underline underline-offset-2">
                        {es ? `${thousands}K+ descargas de paquetes` : `${thousands}K+ package downloads`}
                    </Link>
                    <span aria-hidden="true">·</span>
                </>
            )}
            <span>2 SCF Instawards</span>
            <span aria-hidden="true">·</span>
            <Link href="/stats" className="text-stellar-teal/80 hover:text-stellar-teal underline underline-offset-2">
                {es ? "Uso en vivo: nirium.xyz/stats" : "Live usage: nirium.xyz/stats"}
            </Link>
        </div>
    );
}
