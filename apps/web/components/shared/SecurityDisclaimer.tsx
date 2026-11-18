"use client";

import { ShieldCheck, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SecurityDisclaimer() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) =>
        language === "es" ? es : en;

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-8">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="p-3 rounded-xl bg-stellar-teal/10 border border-stellar-teal/20 shrink-0">
                    <ShieldCheck className="w-6 h-6 text-stellar-teal" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2 flex items-center gap-2">
                        {lang("Security Status", "Estado de Seguridad")}
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed max-w-3xl">
                        {lang(
                            "Non-custodial nodes (settlement, audit, reporting) run on mainnet without holding funds. Payouts also runs on mainnet, invite-only until we have a written legal opinion. Treasury rebalancing runs on mainnet over DeFindex vaults (third-party, already audited), invite-only. NiriumVault, Nirium's own vault contract, has not yet undergone a formal third-party audit and stays on testnet until one is completed.",
                            "Los nodos no custodiales (liquidación, auditoría, reportes) corren en mainnet sin custodiar fondos. Payouts también corre en mainnet, solo por invitación hasta tener una opinión legal por escrito. El rebalanceo de tesorería corre en mainnet sobre bóvedas de DeFindex (de terceros, ya auditadas), solo por invitación. NiriumVault, el contrato de bóveda propio de Nirium, todavía no tiene una auditoría formal de un tercero y sigue solo en testnet hasta que se complete una."
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 whitespace-nowrap">
                    <AlertCircle className="w-3 h-3" />
                    {lang("NIRIUMVAULT: TESTNET ONLY", "NIRIUMVAULT: SOLO TESTNET")}
                </div>
            </div>
        </div>
    );
}
