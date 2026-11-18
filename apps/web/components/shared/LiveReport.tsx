"use client";

/* Reporte en vivo (9-nov-2026): el resumen real de Reporting para la red del
 * switch, con el mismo formato que imprime `nirium report summary`. Sale de
 * /api/reporting-summary, que solo reenvía la API pública del agente. Es todo
 * el historial (sin from/to), no una semana. */

import { useEffect, useState } from "react";
import { useNetwork } from "@/context/NetworkContext";
import { useLanguage } from "@/context/LanguageContext";

type Summary = {
    network?: string;
    generatedAt?: string;
    payroll?: { settledRuns?: number; recipientsPaid?: number };
    payments?: { count?: number; totalUsdc?: string; byGateway?: Record<string, { count?: number }> };
    anchors?: { count?: number; lastAnchoredAt?: string | null };
};

const AGENT = "https://nirium-agent-mainnet.fly.dev/api/reporting/summary";

export default function LiveReport() {
    const { network } = useNetwork();
    const { language } = useLanguage();
    const es = language === "es";
    const net = network === "mainnet" ? "mainnet" : "testnet";
    const [s, setS] = useState<Summary | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setS(null); setFailed(false);
        fetch(`/api/reporting-summary?network=${net}`, { signal: AbortSignal.timeout(30000) })
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
            .then((j) => { if (!cancelled) setS(j); })
            .catch(() => { if (!cancelled) setFailed(true); });
        return () => { cancelled = true; };
    }, [net]);

    const gw = s?.payments?.byGateway ?? {};
    const gateways = Object.entries(gw).map(([k, v]) => `${k} ${v.count ?? 0}`).join(", ");
    const lastAnchor = s?.anchors?.lastAnchoredAt ? s.anchors.lastAnchoredAt.slice(0, 10) : "-";

    const body = failed
        ? (es ? "No se pudo leer el reporte ahora. Prueba el link de la API." : "Could not read the report right now. Try the API link.")
        : !s
            ? (es ? "Leyendo…" : "Loading…")
            : `📊 Nirium Reporting Summary
   Network:  ${net}
   Period:   ${es ? "todo el historial" : "all time"}
   Payroll:  ${s.payroll?.settledRuns ?? 0} settled run(s), ${s.payroll?.recipientsPaid ?? 0} recipient(s) paid
   Payments: ${s.payments?.count ?? 0} receipt(s), ${s.payments?.totalUsdc ?? "0.00"} USDC total${gateways ? ` (${gateways})` : ""}
   Anchors:  ${s.anchors?.count ?? 0} (last: ${lastAnchor})`;

    return (
        <div className="my-6 rounded-2xl border border-stellar-teal/20 bg-black/60 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-white/5 text-[10px] font-mono uppercase tracking-widest">
                <span className="text-stellar-teal">{es ? "Reporte en vivo" : "Live report"} · {net}</span>
                <a href={`${AGENT}?network=${net}`} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-stellar-teal">
                    {es ? "JSON de la API" : "API JSON"}
                </a>
            </div>
            <pre className="p-4 text-xs text-white/80 font-mono whitespace-pre-wrap">{body}</pre>
            <p className="px-4 pb-3 text-[11px] text-white/40">
                {net === "testnet"
                    ? (es ? "Testnet, sin valor real: casi todo son pruebas nuestras y de talleres. Cambia a MAIN en el menú para ver mainnet." : "Testnet, no real value: mostly our own tests and workshops. Switch to MAIN in the menu to see mainnet.")
                    : (es ? "Mainnet. Incluye nuestras pruebas; no es un conteo de usuarios. Cambia a TEST en el menú para ver testnet." : "Mainnet. Includes our own tests; not a count of users. Switch to TEST in the menu to see testnet.")}
            </p>
        </div>
    );
}
