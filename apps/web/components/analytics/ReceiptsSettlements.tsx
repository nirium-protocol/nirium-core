"use client";

/* Recibos, cobros y reporting (16-nov-2026). Va arriba en /dashboard y /analytics:
 * el producto que se pide en SCF #46 son los recibos, y antes estas páginas
 * eran casi solo Treasury.
 *
 * Mismas fuentes que NodeActivity, sin backend nuevo:
 * - mainnet: /api/stats (cobros por pagador, con etiqueta y hashes; recibos).
 * - testnet: la API pública de reporting (vía el proxy del mismo origen).
 *
 * Los recibos que anclan otros no se listan (decisión del 8-nov-2026): aquí
 * solo se da la caja para verificar cualquier CID en /verify. Buscar por
 * pagador o por wallet es el entregable 2.5 del Build Award; no va aquí. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { useNetwork } from "@/context/NetworkContext";

type Net = "mainnet" | "testnet";
type PayerKind = "internal" | "integration-test" | "campaign" | "external";
type Payer = { address: string; count: number; lastAt: string; hashes: string[]; kind: PayerKind; label: string; shortName?: string; evidenceUrl?: string | null };
type Stats = {
    x402Settlements: null | { totalSettlements: number; externalPayerCount: number; payers?: Payer[]; explorer: string };
    auditTrailAnchors: { count: number | null; lastAnchoredAt: string | null };
};
type Summary = {
    payments?: { count?: number; totalUsdc?: string; byGateway?: Record<string, { count?: number }> };
    anchors?: { count?: number; lastAnchoredAt?: string | null };
};

const summaryUrl = (net: Net) => `https://nirium-agent-mainnet.fly.dev/api/reporting/summary?network=${net}`;
const summaryProxy = (net: Net) => `/api/reporting-summary?network=${net}`;

async function getJson<T>(url: string): Promise<T> {
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
}

const fmtDate = (iso: string | null | undefined, es: boolean) =>
    iso ? new Date(iso).toLocaleDateString(es ? "es-MX" : "en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : null;

function Panel({ tag, accent, title, children }: { tag: string; accent: string; title: string; children: React.ReactNode }) {
    return (
        <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col gap-4 min-w-0">
            <div className="flex items-center gap-3">
                <span className={`text-[9px] font-black px-2 py-1 rounded-lg border font-mono uppercase tracking-widest ${accent}`}>{tag}</span>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function LinkRow({ href, children }: { href: string; children: React.ReactNode }) {
    const external = href.startsWith("http");
    return (
        <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
           className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-stellar-teal hover:underline">
            {children} {external && <ExternalLink size={11} />}
        </a>
    );
}

export default function ReceiptsSettlements({ language, children }: { language: string; children?: React.ReactNode }) {
    const es = language === "es";
    const L = (en: string, sp: string) => (es ? sp : en);
    const router = useRouter();
    const { network } = useNetwork();
    const net: Net = network === "mainnet" ? "mainnet" : "testnet";

    const [stats, setStats] = useState<Stats | null>(null);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [failed, setFailed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cid, setCid] = useState("");

    useEffect(() => {
        let cancelled = false;
        setStats(null); setSummary(null); setFailed(false); setLoading(true);
        const job = net === "mainnet"
            ? getJson<Stats>("/api/stats").then((s) => { if (!cancelled) setStats(s); })
            : getJson<Summary>(summaryProxy(net)).then((s) => { if (!cancelled) setSummary(s); });
        job.catch(() => { if (!cancelled) setFailed(true); })
           .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [net]);

    const noData = loading ? "-" : L("no data", "sin dato");
    const anchors = net === "mainnet" ? stats?.auditTrailAnchors?.count : summary?.anchors?.count;
    const anchorsLast = net === "mainnet" ? stats?.auditTrailAnchors?.lastAnchoredAt : summary?.anchors?.lastAnchoredAt;
    const x = stats?.x402Settlements;
    const payers = [...(x?.payers ?? [])].sort((a, b) => b.count - a.count);
    const gw = summary?.payments?.byGateway ?? {};
    const explorerNet = net === "mainnet" ? "public" : "testnet";

    const kindLabel = (k: PayerKind) =>
        k === "internal" ? L("Our own test", "Prueba nuestra")
        : k === "integration-test" ? L("Integration test", "Prueba de integración")
        : k === "campaign" ? "Niriumtober"
        : L("External", "Externo");
    const kindAccent = (k: PayerKind) =>
        k === "external" ? "bg-green-500/10 text-green-400 border-green-500/20"
        : k === "integration-test" ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
        : "bg-white/5 text-gray-400 border-white/10";

    const verify = (e: React.FormEvent) => {
        e.preventDefault();
        const v = cid.trim();
        router.push(v ? `/verify?cid=${encodeURIComponent(v)}` : "/verify");
    };

    return (
        <section className="mb-12">
            <div className="mb-6">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">
                    {L("Receipts, settlements and reporting", "Recibos, cobros y reporting")} · {net}
                </h2>
                <p className="text-[11px] text-gray-500 mt-1 max-w-2xl">
                    {L(
                        "What Nirium records and what it has been paid, read live from public sources. Includes our own testing, labeled as such.",
                        "Lo que Nirium registra y lo que le han pagado, leído en vivo de fuentes públicas. Incluye nuestras pruebas, marcadas como tales.")}
                </p>
                {loading && (
                    <p role="status" aria-live="polite" className="mt-2 inline-flex items-center gap-2 text-[11px] text-stellar-yellow/80">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {L("Reading live data. It can take a few seconds.", "Leyendo datos en vivo. Puede tardar unos segundos.")}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recibos */}
                <Panel tag="Audit Trail" accent="bg-rose-500/10 text-rose-400 border-rose-500/20" title={L("Receipts", "Recibos")}>
                    {/* 16-nov-2026: sin número grande; la fila de nodos de arriba ya lo muestra. */}
                    <p className="text-[11px] text-gray-400 leading-snug">
                        <span className="font-mono font-bold text-white">{typeof anchors === "number" ? anchors : noData}</span>{" "}
                        {L("receipts anchored to IPFS", "recibos anclados en IPFS")}
                        {fmtDate(anchorsLast, es) ? ` · ${L("last", "último")} ${fmtDate(anchorsLast, es)}` : ""}
                    </p>
                    <form onSubmit={verify} className="flex flex-col sm:flex-row gap-2">
                        <label htmlFor="receipt-cid" className="sr-only">{L("Receipt CID", "CID del recibo")}</label>
                        <input
                            id="receipt-cid"
                            value={cid}
                            onChange={(e) => setCid(e.target.value)}
                            placeholder={L("Paste a receipt CID (Qm…)", "Pega el CID de un recibo (Qm…)")}
                            className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-stellar-teal/40"
                        />
                        <button type="submit" className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stellar-teal/10 border border-stellar-teal/30 text-stellar-teal text-[10px] font-black uppercase tracking-widest hover:bg-stellar-teal/20 transition-colors">
                            <ShieldCheck size={12} /> {L("Verify", "Verificar")}
                        </button>
                    </form>
                    <p className="text-[10px] text-gray-500 leading-snug">
                        {L(
                            "Anyone can check any receipt, no account needed. Receipts made by other teams stay with them, so they are not listed here.",
                            "Cualquiera puede revisar cualquier recibo, sin cuenta. Los recibos de otros equipos se quedan con ellos, por eso no se listan aquí.")}
                    </p>
                </Panel>

                {/* Cobros */}
                <Panel tag="x402" accent="bg-stellar-yellow/10 text-stellar-yellow border-stellar-yellow/20" title={L("Settlements", "Cobros")}>
                    {net === "mainnet" ? (
                        <>
                            <p className="text-[11px] text-gray-400 leading-snug">
                                <span className="font-mono font-bold text-white">{x ? x.totalSettlements : noData}</span>{" "}
                                {L("settled x402 payments to our account, by payer", "pagos x402 liquidados a nuestra cuenta, por pagador")}
                            </p>
                            <ul className="space-y-2">
                                {payers.map((p) => {
                                    const lastTx = p.hashes?.[p.hashes.length - 1];
                                    return (
                                        <li key={p.address} className="flex items-center justify-between gap-3 p-3 bg-black/40 rounded-xl border border-white/5">
                                            <div className="min-w-0">
                                                {/* Nombre corto en integraciones ("AgentLedger"): el largo se cortaba en celular. */}
                                                <p className="text-xs font-bold text-white truncate" title={p.label}>
                                                    {p.kind === "internal" ? p.label : (p.shortName || p.label)}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-mono">
                                                    {p.count} · {L("last", "último")} {fmtDate(p.lastAt, es)}
                                                    {lastTx && (
                                                        <> · <a href={`https://stellar.expert/explorer/${explorerNet}/tx/${lastTx}`} target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline">tx</a></>
                                                    )}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 text-[8px] font-black px-2 py-1 rounded-lg border uppercase tracking-widest ${kindAccent(p.kind)}`}>{kindLabel(p.kind)}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                            {x && (
                                <p className="text-[10px] text-gray-500 leading-snug">
                                    {x.externalPayerCount === 0
                                        ? L("No settlement comes from an external payer yet.", "Todavía ningún cobro viene de un pagador externo.")
                                        : L(`${x.externalPayerCount} external payers.`, `${x.externalPayerCount} pagadores externos.`)}
                                </p>
                            )}
                            <LinkRow href={x?.explorer ?? "https://stellar.expert/explorer/public"}>{L("Account on-chain", "Cuenta on-chain")}</LinkRow>
                        </>
                    ) : (
                        <>
                            <p className="text-[11px] text-gray-400 leading-snug">
                                <span className="font-mono font-bold text-white">{typeof gw.x402?.count === "number" ? gw.x402.count : noData}</span>{" "}
                                {L("x402 payments recorded by the agent on testnet, no real value. Mostly our own tests and workshops.", "pagos x402 registrados por el agente en testnet, sin valor real. Casi todo son pruebas nuestras y de talleres.")}
                                {typeof gw.mpp?.count === "number" ? ` ${L(`Plus ${gw.mpp.count} with MPP.`, `Más ${gw.mpp.count} con MPP.`)}` : ""}
                            </p>
                            <LinkRow href={summaryUrl("testnet")}>{L("Open the API", "Abrir la API")}</LinkRow>
                        </>
                    )}
                    {failed && <p className="text-[10px] text-amber-400/80">{L("Could not be read right now.", "No se pudo leer ahora.")}</p>}
                </Panel>

                {/* Reporting */}
                <Panel tag="Reporting" accent="bg-blue-500/10 text-blue-400 border-blue-500/20" title="Reporting">
                    <p className="text-[11px] text-gray-400 leading-snug">
                        {L(
                            "Public, read-only summaries of payments, receipts and payout runs. The numbers on this page come from them, and anyone can query the same endpoints.",
                            "Resúmenes públicos, de solo lectura, de pagos, recibos y lotes de pago. Los números de esta página salen de ahí, y cualquiera puede consultar los mismos endpoints.")}
                    </p>
                    <div className="flex flex-col gap-2">
                        <LinkRow href={summaryUrl("mainnet")}>{L("Summary API · mainnet", "API de resumen · mainnet")}</LinkRow>
                        <LinkRow href={summaryUrl("testnet")}>{L("Summary API · testnet", "API de resumen · testnet")}</LinkRow>
                        <LinkRow href="/stats">{L("Full breakdown on /stats", "Desglose completo en /stats")}</LinkRow>
                        <LinkRow href="/api/stats">{L("Raw JSON", "JSON crudo")}</LinkRow>
                    </div>
                </Panel>
            </div>

            {children && <div className="mt-4">{children}</div>}
        </section>
    );
}
