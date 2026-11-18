'use client';

// Banner de Niriumtober en la home. Se decide en el navegador, después de
// montar: si se decidiera en el servidor, el HTML estático del build quedaría
// con la fecha del deploy y seguiría saliendo después del 2 de noviembre.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { isNiriumtoberLive, niriumtoberDaysLeft, niriumtoberHref } from "@/lib/niriumtober";

export default function NiriumtoberBanner() {
    const { language } = useLanguage();
    const [days, setDays] = useState<number | null>(null);

    useEffect(() => {
        if (isNiriumtoberLive()) setDays(niriumtoberDaysLeft());
    }, []);

    if (days === null) return null;
    const es = language === "es";
    const left = days <= 1
        ? (es ? "último día" : "last day")
        : (es ? `quedan ${days} días` : `${days} days left`);

    return (
        <Link
            href={niriumtoberHref("home")}
            className="w-full max-w-[1600px] block px-4 py-3 sm:rounded-xl border-y sm:border border-orange-400/40 bg-gradient-to-r from-orange-500/15 via-amber-400/10 to-fuchsia-500/15 text-center text-sm font-bold text-orange-100 hover:border-orange-400/70 transition-colors"
        >
            {es
                ? `🎃 Niriumtober: ancla tu primer recibo de agente en 5 minutos · ${left} →`
                : `🎃 Niriumtober: ship your first agent receipt in 5 minutes · ${left} →`}
        </Link>
    );
}
