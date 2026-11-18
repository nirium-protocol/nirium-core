"use client";

/* Aviso de alcance por red (9-nov-2026). Algunas secciones solo existen en una
 * red (NiriumVault, por ejemplo, solo está en testnet). En vez de fingir que
 * cambian con el switch TEST/MAIN, dicen qué muestran y dónde está lo de la
 * otra red. El texto lo pone cada página. */

import { Info } from "lucide-react";
import { useNetwork } from "@/context/NetworkContext";
import { useLanguage } from "@/context/LanguageContext";

type Copy = { en: string; es: string };

export default function NetworkScopeNote({ testnet, mainnet, className = "" }: { testnet?: Copy; mainnet?: Copy; className?: string }) {
    const { network } = useNetwork();
    const { language } = useLanguage();
    const isMain = network === "mainnet";
    const copy = isMain ? mainnet : testnet;
    if (!copy) return null;
    return (
        <div className={`flex items-start gap-3 p-4 rounded-2xl border ${isMain ? "border-emerald-500/20 bg-emerald-500/[0.04]" : "border-stellar-yellow/20 bg-stellar-yellow/[0.04]"} ${className}`}>
            <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isMain ? "text-emerald-400" : "text-stellar-yellow"}`} />
            <p className="text-xs text-white/70 leading-relaxed">
                <span className={`font-mono uppercase tracking-widest text-[10px] mr-2 ${isMain ? "text-emerald-400" : "text-stellar-yellow"}`}>
                    {isMain ? "Mainnet" : "Testnet"}
                </span>
                {language === "es" ? copy.es : copy.en}
            </p>
        </div>
    );
}

/** Base URL del agente para la red elegida. Una misma API key sirve en las dos. */
export function useAgentBaseUrl() {
    const { network } = useNetwork();
    return network === "mainnet" ? "https://nirium-agent-mainnet.fly.dev" : "https://nirium-agent.fly.dev";
}
