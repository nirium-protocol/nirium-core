"use client";

/* Actividad por nodo (9-nov-2026). Sigue el switch TEST/MAIN.
 *
 * Mainnet: /api/stats (el mismo dato de /stats, con caché de 5 min). Si ese
 * resumen llega sin la parte de reporting (la consulta del agente tardó más
 * de 8 s), Audit Trail y Payouts se leen directo de la API de reporting.
 * Testnet: la API de reporting con network=testnet, y el conteo de bóvedas
 * del contrato verificado leído de Soroban.
 *
 * Un dato que no se pudo leer dice "sin dato", nunca "sin eventos": antes la
 * tarjeta de Audit Trail decía "Sin eventos todavía" con 34 anclas en mainnet. */

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { useNetwork } from "@/context/NetworkContext";
import { vaultGetVaultCount, CONTRACT_IDS } from "@/lib/sorobanContracts";

type Net = "mainnet" | "testnet";
type Summary = {
    payroll?: { settledRuns?: number; recipientsPaid?: number; lastSettledAt?: string | null };
    payments?: { count?: number; totalUsdc?: string; byGateway?: Record<string, { count?: number }> };
    anchors?: { count?: number; lastAnchoredAt?: string | null };
};
type Stats = {
    freshness?: { reporting?: { status: string; asOf: string | null } };
    x402Settlements: null | { totalSettlements: number; distinctPayers: number; externalPayerCount: number; lastAt: string | null; explorer: string };
    treasuryRebalances: null | { total: number; lastAt: string | null; explorer: string };
    auditTrailAnchors: { count: number | null; lastAnchoredAt: string | null };
    payoutsSettledRuns: { count: number | null };
    reportingRecords?: null | { payments: number; anchors: number; payrollRuns: number; total: number };
};

// Fuente pública (para los links) y proxy del mismo origen (para leerla sin CORS).
const summaryUrl = (net: Net) => `https://nirium-agent-mainnet.fly.dev/api/reporting/summary?network=${net}`;
const summaryProxy = (net: Net) => `/api/reporting-summary?network=${net}`;

async function getJson<T>(url: string): Promise<T> {
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
}

// En UTC, como el resto del sitio y la evidencia.
const fmtDate = (iso: string | null | undefined, es: boolean) =>
    iso ? new Date(iso).toLocaleDateString(es ? "es-MX" : "en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : null;

function Card({ node, value, lines, href, linkLabel, accent }: {
    node: string; value: string; lines: string[]; href: string; linkLabel: string; accent: string;
}) {
    return (
        <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col gap-3 hover:border-stellar-teal/20 transition-colors">
            <span className={`self-start text-[9px] font-black px-2 py-1 rounded-lg border font-mono uppercase tracking-widest ${accent}`}>{node}</span>
            <p className="text-3xl font-black text-white font-mono italic tracking-tighter">{value}</p>
            <div className="space-y-1 flex-1">
                {lines.filter(Boolean).map((l, i) => (
                    <p key={i} className="text-[11px] text-gray-400 leading-snug">{l}</p>
                ))}
            </div>
            <a href={href} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-stellar-teal hover:underline">
                {linkLabel} <ExternalLink size={11} />
            </a>
        </div>
    );
}

// `breakdownBelow`: la página muestra el desglose por pagador justo debajo (dashboard, analytics).
export default function NodeActivity({ language, network: fixed, breakdownBelow }: { language: string; network?: Net; breakdownBelow?: boolean }) {
    const es = language === "es";
    const L = (en: string, sp: string) => (es ? sp : en);
    const { network } = useNetwork();
    // `network` fijo (p. ej. /stats, que muestra testnet siempre en su propia sección);
    // sin él, sigue el selector TEST/MAIN como antes.
    const net: Net = fixed ?? (network === "mainnet" ? "mainnet" : "testnet");

    const [stats, setStats] = useState<Stats | null>(null);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [summaryFailed, setSummaryFailed] = useState(false);
    const [statsFailed, setStatsFailed] = useState(false);
    const [vaults, setVaults] = useState<number | null>(null);
    const [vaultsFailed, setVaultsFailed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setStats(null); setSummary(null); setVaults(null);
        setSummaryFailed(false); setStatsFailed(false); setVaultsFailed(false);
        setLoading(true);

        const readSummary = () =>
            getJson<Summary>(summaryProxy(net))
                .then((s) => { if (!cancelled) setSummary(s); })
                .catch(() => { if (!cancelled) setSummaryFailed(true); });

        const work: Promise<unknown>[] = [];
        if (net === "mainnet") {
            work.push(
                getJson<Stats>("/api/stats")
                    .then((s) => {
                        if (cancelled) return;
                        setStats(s);
                        // Resumen sin reporting: se pide directo al agente.
                        if (s.auditTrailAnchors?.count == null || s.payoutsSettledRuns?.count == null) return readSummary();
                    })
                    .catch(() => { if (!cancelled) { setStatsFailed(true); return readSummary(); } })
            );
        } else {
            work.push(readSummary());
            work.push(
                vaultGetVaultCount()
                    .then((n) => { if (!cancelled) setVaults(n); })
                    .catch(() => { if (!cancelled) setVaultsFailed(true); })
            );
        }
        Promise.allSettled(work).then(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [net]);

    const noData = loading ? "-" : L("no data", "sin dato");
    const show = (n: number | null | undefined) => (typeof n === "number" ? String(n) : noData);
    const last = (iso: string | null | undefined, have: boolean) => {
        if (!have) return loading ? "" : L("Could not be read right now", "No se pudo leer ahora");
        const d = fmtDate(iso, es);
        return d ? `${L("Last", "Último")}: ${d}` : L("No events yet", "Sin eventos todavía");
    };

    // Audit Trail y Payouts: en mainnet primero /api/stats, si no el resumen directo.
    const anchors = net === "mainnet" ? (stats?.auditTrailAnchors?.count ?? summary?.anchors?.count) : summary?.anchors?.count;
    const anchorsLast = net === "mainnet" ? (stats?.auditTrailAnchors?.lastAnchoredAt ?? summary?.anchors?.lastAnchoredAt) : summary?.anchors?.lastAnchoredAt;
    const runs = net === "mainnet" ? (stats?.payoutsSettledRuns?.count ?? summary?.payroll?.settledRuns) : summary?.payroll?.settledRuns;
    const reportingOk =
        net === "mainnet"
            ? stats?.freshness?.reporting?.status === "live" || (!!summary && !summaryFailed)
            : !!summary && !summaryFailed;

    // Registros que Reporting exporta hoy: pagos cobrados + recibos + lotes.
    const rec = net === "mainnet"
        ? (stats?.reportingRecords ?? (summary
            ? { payments: summary.payments?.count ?? 0, anchors: summary.anchors?.count ?? 0, payrollRuns: summary.payroll?.settledRuns ?? 0 }
            : null))
        : (summary
            ? { payments: summary.payments?.count ?? 0, anchors: summary.anchors?.count ?? 0, payrollRuns: summary.payroll?.settledRuns ?? 0 }
            : null);
    const recTotal = rec ? rec.payments + rec.anchors + rec.payrollRuns : null;

    const x = stats?.x402Settlements;
    const t = stats?.treasuryRebalances;
    const gw = summary?.payments?.byGateway ?? {};
    const tx402 = gw.x402?.count;
    const tmpp = gw.mpp?.count;
    const explorerNet = net === "mainnet" ? "public" : "testnet";

    return (
        <section className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
                <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">
                        {L("Activity by node", "Actividad por nodo")} · {net === "mainnet" ? "mainnet" : "testnet"}
                    </h2>
                    <p className="text-[11px] text-gray-500 mt-1 max-w-2xl">
                        {net === "mainnet"
                            ? L(
                                `Read live from public sources, the same data as /stats. Includes our own testing; the breakdown by payer is ${breakdownBelow ? "just below" : "on /stats"}. Switch to TEST in the sidebar to see testnet.`,
                                `Leído en vivo de fuentes públicas, el mismo dato que /stats. Incluye nuestras pruebas; el desglose por pagador está ${breakdownBelow ? "justo abajo" : "en /stats"}. Cambia a TEST en el menú para ver testnet.`)
                            : L(
                                "Testnet, no real value. Payments, receipts and payout runs come from the public reporting API; vaults are read from the verified contract. Mostly our own tests and workshops." + (fixed ? "" : " Switch to MAIN to see mainnet."),
                                "Testnet, sin valor real. Pagos, recibos y lotes vienen de la API pública de reporting; las bóvedas se leen del contrato verificado. Casi todo son pruebas nuestras y de talleres." + (fixed ? "" : " Cambia a MAIN para ver mainnet."))}
                    </p>
                    {loading && (
                        <p role="status" aria-live="polite" className="mt-2 inline-flex items-center gap-2 text-[11px] text-stellar-yellow/80">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {L("Reading live data from the network. It can take a few seconds.", "Leyendo datos en vivo de la red. Puede tardar unos segundos.")}
                        </p>
                    )}
                </div>
                <a href={net === "mainnet" ? "/api/stats" : summaryUrl("testnet")} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-stellar-teal hover:underline">
                    {L("Raw JSON", "JSON crudo")}
                </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {net === "mainnet" ? (
                    <Card
                        node="x402"
                        value={show(x?.totalSettlements)}
                        lines={[
                            L("Settled payments, read from Horizon", "Pagos liquidados, leídos de Horizon"),
                            x ? L(`${x.distinctPayers} payers · ${x.externalPayerCount} external`, `${x.distinctPayers} pagadores · ${x.externalPayerCount} externos`) : "",
                            last(x?.lastAt, !!x),
                        ]}
                        href={x?.explorer ?? "https://stellar.expert/explorer/public"}
                        linkLabel={L("See on-chain", "Ver on-chain")}
                        accent="bg-stellar-yellow/10 text-stellar-yellow border-stellar-yellow/20"
                    />
                ) : (
                    <Card
                        node="x402"
                        value={show(tx402)}
                        lines={[
                            L("Payments recorded by the agent", "Pagos registrados por el agente"),
                            typeof tmpp === "number" ? L(`Plus ${tmpp} with MPP · ${summary?.payments?.totalUsdc ?? "-"} test USDC in total`, `Más ${tmpp} con MPP · ${summary?.payments?.totalUsdc ?? "-"} USDC de prueba en total`) : "",
                            summary ? "" : last(null, false),
                        ]}
                        href={summaryUrl("testnet")}
                        linkLabel={L("Open the API", "Abrir la API")}
                        accent="bg-stellar-yellow/10 text-stellar-yellow border-stellar-yellow/20"
                    />
                )}
                <Card
                    node="Audit Trail"
                    value={show(anchors)}
                    lines={[
                        L("Receipts anchored to IPFS", "Recibos anclados en IPFS"),
                        last(anchorsLast, typeof anchors === "number"),
                    ]}
                    href="/verify"
                    linkLabel={L("Verify a receipt", "Verificar un recibo")}
                    accent="bg-rose-500/10 text-rose-400 border-rose-500/20"
                />
                <Card
                    node="Reporting"
                    value={loading ? "-" : typeof recTotal === "number" && reportingOk ? String(recTotal) : reportingOk ? L("Live", "En vivo") : L("Not responding", "No responde")}
                    lines={[
                        L("Records you can export as CSV or JSON", "Registros exportables en CSV o JSON"),
                        rec ? L(`${rec.payments} payments · ${rec.anchors} receipts · ${rec.payrollRuns} payout runs`, `${rec.payments} pagos · ${rec.anchors} recibos · ${rec.payrollRuns} lotes`) : "",
                    ]}
                    href={summaryUrl(net)}
                    linkLabel={L("Open the API", "Abrir la API")}
                    accent="bg-blue-500/10 text-blue-400 border-blue-500/20"
                />
                {net === "mainnet" ? (
                    <Card
                        node="Treasury"
                        value={show(t?.total)}
                        lines={[
                            L("Rebalances, team funds only", "Rebalanceos, solo fondos del equipo"),
                            last(t?.lastAt, !!t),
                        ]}
                        href={t?.explorer ?? "https://stellar.expert/explorer/public"}
                        linkLabel={L("See on-chain", "Ver on-chain")}
                        accent="bg-green-500/10 text-green-400 border-green-500/20"
                    />
                ) : (
                    <Card
                        node="Treasury"
                        value={typeof vaults === "number" ? String(vaults) : vaultsFailed ? L("no data", "sin dato") : "-"}
                        lines={[
                            L("Vaults on the verified NiriumVault contract (since 9 Nov 2026)", "Bóvedas en el contrato verificado de NiriumVault (desde el 9 nov 2026)"),
                            L("Earlier contracts are listed on /security", "Los contratos anteriores están en /security"),
                            L("DeFindex vaults deployed from /treasury/vault are not counted here", "Las bóvedas de DeFindex desplegadas desde /treasury/vault no se cuentan aquí"),
                        ]}
                        href={`https://stellar.expert/explorer/${explorerNet}/contract/${CONTRACT_IDS.VAULT}`}
                        linkLabel={L("See on-chain", "Ver on-chain")}
                        accent="bg-green-500/10 text-green-400 border-green-500/20"
                    />
                )}
                <Card
                    node="Payouts"
                    value={show(runs)}
                    lines={[
                        L("Settled batch runs", "Lotes liquidados"),
                        net === "mainnet"
                            ? L("Invite-only", "Solo por invitación")
                            : typeof summary?.payroll?.recipientsPaid === "number"
                                ? L(`${summary.payroll.recipientsPaid} recipients paid`, `${summary.payroll.recipientsPaid} destinatarios pagados`)
                                : "",
                        net === "testnet" ? last(summary?.payroll?.lastSettledAt, !!summary) : "",
                    ]}
                    href={summaryUrl(net)}
                    linkLabel={L("Open the API", "Abrir la API")}
                    accent="bg-stellar-teal/10 text-stellar-teal border-stellar-teal/20"
                />
            </div>
        </section>
    );
}
