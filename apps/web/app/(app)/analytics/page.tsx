"use client";

import { motion } from "framer-motion";
import { 
    Activity, TrendingUp, Zap, Server, Wallet, Database, 
    ShieldCheck, Globe, Cpu, Lock, Archive, ExternalLink,
    ChevronRight, Download, Box, Key, BarChart3, Clock,
    FileSearch, Shield, Fingerprint
} from "lucide-react";
import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";
import { useFreighter } from "@/hooks/useFreighter";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import OpsConsole from "@/components/layout/OpsConsole";
import NodeActivity from "@/components/analytics/NodeActivity";
import ReceiptsSettlements from "@/components/analytics/ReceiptsSettlements";
import NetworkScopeNote from "@/components/shared/NetworkScopeNote";
import { ComplianceBanner, AtomicProofBadge } from "@/components/ui/ComplianceBanner";
import { useEloReputation } from "@/hooks/useNiriumContracts";
import { getCETESBalance, vaultGetVaultCount, vaultGetTotalFees } from "@/lib/sorobanContracts";
import { CETES_REFERENCE_RATE_PCT, CETES_REFERENCE_DATE_LABEL_EN } from "@/lib/cetesReference";

// ── StatCard ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, change, icon: Icon, color, status }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121212] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-stellar-teal/20 transition-all duration-500 shadow-xl"
    >
        <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${color}`}>
                <Icon size={18} />
            </div>
            {status && (
                <span className={`text-[8px] font-black px-2 py-1 rounded-full border uppercase tracking-widest ${
                    status === 'READY' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    status === 'PROCESSING' ? 'bg-stellar-yellow/10 text-stellar-yellow border-stellar-yellow/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                    {status}
                </span>
            )}
        </div>
        <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</p>
            <h3 className="text-2xl font-black text-white font-mono italic tracking-tighter">{value}</h3>
            <p className={`text-[10px] font-black font-mono flex items-center gap-1 uppercase tracking-widest ${
                change && change.startsWith('+') ? 'text-emerald-400' : 'text-gray-500'
            }`}>
                {change}
            </p>
        </div>
    </motion.div>
);

// Muestra ilustrativa de la FORMA de las entradas del feed - el feed vivo está
// en el dashboard. Ningún hash colgado aquí: antes estas líneas traían tx
// reales bajo leyendas inventadas (montos de 5,000 USDC cuando el rebalanceo
// mueve 1.0, nóminas de 42 destinatarios, agentes "Nexus" y "Void" que no
// existen). El texto de abajo sí describe lo que el sistema hace de verdad.
type AnalyticsLog = { time: string; source: string; type: string; msg: string; tx?: string };

const ANALYTICS_LOGS: AnalyticsLog[] = [
    { time: '00:25:44', source: 'REBALANCE_NODE', type: 'info', msg: `Scan - CETES ${CETES_REFERENCE_RATE_PCT}% (Etherfuse fixed reference, ${CETES_REFERENCE_DATE_LABEL_EN}) vs idle USDC | base fee 100 stroops.` },
    { time: '00:25:46', source: 'REBALANCE_NODE', type: 'success', msg: 'Threshold condition met (>2.5%). The agent calls rebalance() on the owner\'s DeFindex vault: Invest into its own strategy - no swap, no destination address.' },
    { time: '00:25:48', source: 'AUDIT_NODE', type: 'audit', msg: 'Transaction confirmed on-chain before it is logged. Anchoring a receipt of it is opt-in, per call.' },
    { time: '00:30:12', source: 'PAYOUTS_NODE', type: 'payment', msg: 'Batch prepared: unsigned XDR built server-side. The client signs it with their own wallet - Nirium never holds the key.' },
    { time: '00:30:15', source: 'PAYOUTS_NODE', type: 'success', msg: 'Batch submitted. One signature, every transfer in a single Stellar transaction.' },
    { time: '00:35:00', source: 'SETTLEMENT', type: 'info', msg: 'x402 challenge issued - 0.02 USDC for /signals.' },
    { time: '00:35:02', source: 'SETTLEMENT', type: 'success', msg: 'Payment verified and settled on-chain before the response was returned.' },
    { time: '00:35:04', source: 'AUDIT_NODE', type: 'success', msg: 'Receipt anchored to IPFS on request - the caller gets a CID anyone can check at /verify.' },
];

export default function AnalyticsPage() {
    const { t, language } = useLanguage();
    const { address: accountStr, isConnected } = useFreighter();
    // Antes era `const latency = 142` - un número inventado bajo un panel
    // titulado "Infrastructure Status". Se mide de verdad contra /health.
    const [latency, setLatency] = useState<number | null>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;
        const measure = async () => {
            const started = performance.now();
            try {
                await fetch('https://nirium-agent.fly.dev/health', { cache: 'no-store' });
                if (!cancelled) setLatency(Math.round(performance.now() - started));
            } catch {
                if (!cancelled) setLatency(null);
            }
        };
        measure();
        const id = setInterval(measure, 30_000);
        return () => { cancelled = true; clearInterval(id); };
    }, []);

    // 9-nov-2026: el panel decía "Not checked here" en dos casillas y "Protocol 29"
    // fijo. Testnet ya está en Protocol 30 (mainnet sigue en 29). Ahora todo se lee
    // en vivo desde el navegador: Horizon de cada red (protocolo) y Soroban RPC de
    // testnet (getHealth). Verde solo si la fuente respondió; si no, se dice.
    type NetCheck = { ok: boolean; protocol: number | null } | null;
    const [horizonMain, setHorizonMain] = useState<NetCheck>(null);
    const [horizonTest, setHorizonTest] = useState<NetCheck>(null);
    const [sorobanTest, setSorobanTest] = useState<boolean | null>(null);

    useEffect(() => {
        let cancelled = false;
        const readHorizon = async (url: string): Promise<NetCheck> => {
            try {
                const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
                if (!r.ok) return { ok: false, protocol: null };
                const j = await r.json();
                return { ok: true, protocol: typeof j.current_protocol_version === 'number' ? j.current_protocol_version : null };
            } catch {
                return { ok: false, protocol: null };
            }
        };
        const readSoroban = async (): Promise<boolean> => {
            try {
                const r = await fetch('https://soroban-testnet.stellar.org', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' }),
                    signal: AbortSignal.timeout(8000),
                });
                const j = await r.json();
                return j?.result?.status === 'healthy';
            } catch {
                return false;
            }
        };
        const run = async () => {
            const [m, t, s] = await Promise.all([
                readHorizon('https://horizon.stellar.org/'),
                readHorizon('https://horizon-testnet.stellar.org/'),
                readSoroban(),
            ]);
            if (cancelled) return;
            setHorizonMain(m);
            setHorizonTest(t);
            setSorobanTest(s);
        };
        run();
        const id = setInterval(run, 60_000);
        return () => { cancelled = true; clearInterval(id); };
    }, []);

    // ── Live on-chain stats ──────────────────────────────────────────────────
    const [vaultCount, setVaultCount] = useState<string>('-');
    const [feesCollected, setFeesCollected] = useState<string>('-');
    const [cetesBalance, setCetesBalance] = useState<string>('-');
    const [eloScore, setEloScore] = useState<string>('-');
    const [cetesRate, setCetesRate] = useState<string>(`${CETES_REFERENCE_RATE_PCT}%`);
    const elo = useEloReputation();

    useEffect(() => {
        // Fetch on-chain metrics
        vaultGetVaultCount().then(n => setVaultCount(String(n))).catch(() => {});
        vaultGetTotalFees().then(f => setFeesCollected(`${(Number(f) / 10_000_000).toFixed(2)} XLM`)).catch(() => {});

        if (accountStr) {
            getCETESBalance(accountStr).then(b => setCetesBalance(`${Number(b).toFixed(2)} CETES`)).catch(() => {});
            elo.getScore(accountStr).then(s => setEloScore(String(s))).catch(() => {});
        }

        // CETES reference rate from the agent API: a fixed value (12 Nov 2026), not a live reading
        fetch('https://nirium-agent.fly.dev/api/tickers')
            .then(r => r.json())
            .then(d => { if (d.cetesRate) setCetesRate(`${d.cetesRate.toFixed(2)}%`); })
            .catch(() => {});
    }, [accountStr]);

    return (
        <main className="min-h-screen pt-8 px-4 pb-20 relative overflow-hidden flex flex-col bg-nirium-obsidian">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-stellar-yellow/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-stellar-teal/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-[1600px] w-full mx-auto relative z-10 px-4 md:px-8">
                {/* Header */}
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-4">
                        <SectionBrandLogo className="!justify-start mb-0" size="w-32 md:w-44" />
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 bg-stellar-yellow/10 border border-stellar-yellow/20 rounded-full text-stellar-yellow text-[10px] font-black uppercase tracking-widest">
                                <Clock className="w-3.5 h-3.5" />
                                {/* 16-nov-2026: decía "Legal opinion pending". La página abre con recibos,
                                    cobros y reporting, que no esperan opinión legal; la nota legal va en
                                    el bloque de Treasury, que es lo que sí la espera. */}
                                BETA
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white flex items-center gap-4">
                                {/* 16-nov-2026: decía "Treasury Telemetry"; la página ahora abre con recibos y cobros. */}
                                {language === 'es' ? 'TELEMETRÍA DE LA RED' : 'NETWORK TELEMETRY'}
                                <span className="text-[10px] not-italic font-black bg-white/5 text-gray-400 border border-white/10 px-3 py-1 rounded-full uppercase tracking-widest">
                                    v0.19.6
                                </span>
                            </h1>
                            <p className="text-gray-500 font-mono text-xs mt-2 uppercase tracking-widest">
                                {language === 'es' ? 'Recibos, cobros y actividad por nodo' : 'Receipts, settlements and node activity'} // VAULT: {accountStr ? `${accountStr.slice(0, 8)}...${accountStr.slice(-4)}` : (language === 'es' ? 'conecta tu wallet' : 'connect your wallet')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-6 py-3 bg-[#121212] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                        <span className="text-gray-500">{language === 'es' ? 'Lecturas on-chain · contratos en testnet' : 'On-chain reads · testnet contracts'}</span>
                    </div>
                </header>

                <ComplianceBanner />

                {/* 9-nov-2026: la página solo mostraba Treasury. Primero, un número real por nodo. */}
                <NodeActivity language={language} breakdownBelow />

                {/* 16-nov-2026: recibos, cobros y reporting antes que Treasury. */}
                <ReceiptsSettlements language={language} />

                {/* KPI Grid - Treasury, live on-chain data. Plegado por defecto (16-nov-2026). */}
                <details className="mb-12 group/treasury">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none flex items-center justify-between gap-4 p-5 mb-6 bg-[#121212] border border-white/5 rounded-3xl hover:border-stellar-teal/20 transition-colors">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">
                            {language === 'es' ? 'Treasury · tu wallet y testnet' : 'Treasury · your wallet and testnet'}
                        </h2>
                        <p className="text-[11px] text-gray-500 mt-1">
                            {language === 'es' ? 'Saldos de tu wallet y del contrato NiriumVault en testnet, sin valor real.' : 'Your wallet balances and the NiriumVault contract on testnet, no real value.'}
                        </p>
                        <p className="text-[11px] text-stellar-yellow/80 mt-1">
                            {language === 'es' ? 'En mainnet, Treasury es solo por invitación hasta tener una opinión legal por escrito.' : 'On mainnet, Treasury is invite-only until we have a written legal opinion.'}
                        </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 shrink-0 transition-transform group-open/treasury:rotate-90" />
                </summary>
                <NetworkScopeNote className="mb-6" mainnet={{
                    en: "These Treasury cards read NiriumVault on testnet and your wallet; NiriumVault is not on mainnet. Mainnet Treasury is in the Treasury card of the row above.",
                    es: "Estas tarjetas de Treasury leen NiriumVault en testnet y tu wallet; NiriumVault no está en mainnet. Treasury en mainnet está en la tarjeta Treasury de la fila de arriba.",
                }} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard
                        title="CETES Balance"
                        value={cetesBalance}
                        change="ON-CHAIN"
                        icon={Wallet}
                        color="text-stellar-teal"
                        status="ON-CHAIN"
                    />
                    <StatCard
                        title="Vaults Created (testnet)"
                        value={vaultCount}
                        change="TESTNET · verified contract since 9 Nov 2026 · incl. our tests"
                        icon={Server}
                        color="text-stellar-yellow"
                        status="ON-CHAIN"
                    />
                    <StatCard
                        title="ELO Score"
                        value={eloScore}
                        change="REPUTATION"
                        icon={TrendingUp}
                        color="text-green-400"
                        status="ON-CHAIN"
                    />
                    <StatCard
                        title="Deployment Fees (testnet)"
                        value={feesCollected}
                        change="TESTNET XLM · no monetary value"
                        icon={Database}
                        color="text-blue-400"
                        status="ON-CHAIN"
                    />
                    <StatCard
                        title="CETES reference (fixed)"
                        value={cetesRate}
                        change="FIXED · 12 NOV 2026"
                        icon={Shield}
                        color="text-stellar-teal"
                    />
                </div>

                {/* Charts & Side Area */}
                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="text-stellar-teal" size={20} />
                                <h3 className="text-sm font-black uppercase tracking-widest">TREASURY DEPLOYMENT HISTORY</h3>
                            </div>
                        </div>
                        {/* Aquí había una gráfica hecha con Math.random(): etiquetada "Datos de
                            muestra", pero con horas reales en el eje y una curva que cambiaba en
                            cada clic de 24H/7D/30D. En una página llamada "telemetría" eso se lee
                            como historial real. Hasta tener una serie real, se dice que no la hay. */}
                        <div className="h-[300px] w-full flex flex-col items-center justify-center text-center gap-3 rounded-2xl border border-dashed border-white/10 px-6">
                            <p className="text-sm font-black text-white/70 uppercase tracking-widest">
                                {language === 'es' ? 'Sin historial que graficar todavía' : 'No history to chart yet'}
                            </p>
                            <p className="text-[11px] text-gray-500 max-w-md leading-relaxed">
                                {language === 'es'
                                    ? 'El rebalanceo en mainnet solo ha corrido con fondos del equipo (4 rebalanceos, 6-ago-2026). Las ejecuciones reales, con su transacción, están en la evidencia on-chain verificada y en el feed del dashboard.'
                                    : "Mainnet rebalancing has only run with the team's own funds (4 rebalances, 6 Aug 2026). Real executions, each with its transaction, are under Verified On-chain Evidence and in the dashboard feed."}
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-xl">
                        <h3 className="text-[10px] font-black mb-8 text-gray-500 uppercase tracking-widest">CAPITAL DEPLOYMENT MATRIX</h3>
                        <div className="space-y-4">
                            {[
                                { asset: 'CETES', name: 'Etherfuse Stablebond', rate: `${CETES_REFERENCE_RATE_PCT}% fixed ref. (${CETES_REFERENCE_DATE_LABEL_EN})`, type: 'TOKENIZED CETES' },
                                { asset: 'USDC', name: 'Operational Liquidity', rate: '0.00%', type: 'STABLE' },
                                { asset: 'XLM', name: 'Gas Reserve', rate: 'Min.', type: 'UTILITY' },
                                // AUDIT y PAYOUTS salieron de aquí el 9-nov-2026: no son activos de la
                                // tesorería. Ahora tienen su propia tarjeta en "Actividad por nodo".
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-stellar-teal/30 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[8px] font-black px-2 py-1 rounded-lg border font-mono ${
                                            item.asset === 'USDC' ? 'bg-stellar-yellow/10 text-stellar-yellow border-stellar-yellow/20' :
                                            item.asset === 'AUDIT' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                            item.asset === 'CETES' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            item.asset === 'PAYOUTS' ? 'bg-stellar-teal/10 text-stellar-teal border-stellar-teal/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>{item.asset}</span>
                                        <span className="font-black text-xs text-gray-400 group-hover:text-white transition-colors uppercase italic tracking-tighter">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-emerald-400 font-black font-mono">{item.rate}</div>
                                        <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{item.type}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                </details>

                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    {/* Agent Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                <Activity className="w-4 h-4 text-stellar-teal" />
                                Agent Activity // Autonomous Feed
                            </h3>
                            <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">
                                SAMPLE
                            </span>
                        </div>
                        
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
                            <div className="bg-black/40 p-4 border-b border-white/5 flex items-center justify-between font-mono text-[10px] text-gray-500">
                                {/* Antes decía AGENT_UPLINK_LIVE con un ledger sequence
                                    inventado. El feed real y en vivo está en el dashboard;
                                    esto es una muestra de la forma que tienen las entradas. */}
                                <div className="flex items-center gap-4">
                                    <span className="text-amber-400">SAMPLE_TRACE</span>
                                    <span>
                                        {language === 'es' ? 'Feed en vivo en el dashboard' : 'Live feed in the dashboard'}
                                    </span>
                                </div>
                                <Clock size={14} />
                            </div>
                            
                            <div 
                                ref={logContainerRef}
                                className="flex-1 overflow-y-auto p-6 font-mono space-y-4 custom-scrollbar"
                            >
                                {ANALYTICS_LOGS.map((log, i) => (
                                    <div key={i} className="group/log border-l-2 border-white/5 hover:border-stellar-teal/30 pl-4 transition-colors">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[9px] text-gray-600">[{log.time}]</span>
                                            <span className="text-[10px] font-black text-white uppercase italic tracking-tighter">{log.source}</span>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                                                log.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                                log.type === 'payment' ? 'bg-stellar-yellow/10 text-stellar-yellow border border-stellar-yellow/20' :
                                                log.type === 'audit' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>{log.type}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-300 leading-relaxed">
                                            {log.msg}
                                        </p>
                                        {log.tx && (
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-[9px] text-gray-600 font-mono truncate max-w-[150px]">
                                                    TX: {log.tx}
                                                </span>
                                                <AtomicProofBadge txHash={log.tx} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                            {/* Antes "INSTITUTIONAL AUDIT" con "Decision Anchoring: ACTIVE" y
                                "Audit Trail (SHA-256): VERIFIED" escritos a mano: estados que nada
                                comprobaba, bajo un título que sugiere una auditoría que no existe. */}
                            <h3 className="text-[10px] font-black mb-8 text-gray-500 uppercase tracking-[0.3em]">{language === 'es' ? 'CÓMO FUNCIONAN LOS RECIBOS' : 'HOW RECEIPTS WORK'}</h3>

                            <div className="flex items-center justify-center gap-3 mb-8">
                                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg border border-blue-500/20 font-black uppercase">{language === 'es' ? 'Anclado en IPFS' : 'IPFS Anchored'}</span>
                                <span className="text-[9px] bg-stellar-yellow/10 text-stellar-yellow px-3 py-1 rounded-lg border border-stellar-yellow/20 font-black uppercase">{language === 'es' ? 'Firma opcional' : 'Signature optional'}</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                    Non-Custodial Integrity
                                </div>
                                <p className="text-[10px] text-gray-500 leading-relaxed pl-6">
                                    {language === 'es'
                                        ? <>Cada recibo lleva su hash SHA-256 y se ancla en IPFS. Cualquiera puede comprobarlo en <a href="/verify" className="text-stellar-teal hover:underline">/verify</a>.<br/>Alineado con el Código de Conducta de Stellar.</>
                                        : <>Each receipt carries its SHA-256 hash and is anchored to IPFS. Anyone can check it at <a href="/verify" className="text-stellar-teal hover:underline">/verify</a>.<br/>Aligned with the Stellar Code of Conduct.</>}
                                </p>
                            </div>
                            
                            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-stellar-teal opacity-5 rounded-full blur-3xl" />
                        </div>

                        <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-[10px] font-black mb-8 text-gray-500 uppercase tracking-[0.3em]">{language === 'es' ? 'Evidencia on-chain verificada' : 'Verified On-chain Evidence'}</h3>
                            {/* Hashes reales, etiquetados por red y verificados en Horizon
                                (los tres resuelven y son SUCCESS). Antes esta lista traía
                                leyendas inventadas colgadas de tx reales - el peor error
                                posible en la única página cuyo argumento es "verifícalo". */}
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {[
                                    { net: 'mainnet' as const, date: '2026-07-09', tx: '3134a51c66091fd7fbd85b38a4a6ec6cd432bb92c2450eac84ea7855cb7558bc', msg: 'x402 settlement - 0.02 USDC to our x402 account (Nirium-funded test wallet)' },
                                    { net: 'mainnet' as const, date: '2026-08-05', tx: 'e4fa3df9cb225a4d7f64dd0082eb38218ada4b4af3378f288989a5d4b1116ed9', msg: 'x402 settlement - 0.02 USDC, signed via Pollar social login (Nirium self-test, reserve funded by us)' },
                                    // Se retiró la tx del 19-abr etiquetada 'NiriumVault - revoke_agent(1218)'.
                                    // El hash era real y la cuenta fue nuestra, pero el contrato invocado era
                                    // CAU2XBJT… - el vault VIEJO, retirado en la consolidación a 2 contratos de
                                    // mayo. O sea: la etiqueta nombraba un contrato que no es el que publicamos,
                                    // y quien hiciera clic para verificar encontraría una dirección que no cuadra.
                                    // En su lugar va la evidencia más fuerte que tenemos, y es de agosto:
                                    // el agente invirtiendo fondos ajenos dentro de una bóveda de la que no
                                    // puede sacarlos.
                                    { net: 'testnet' as const, date: '2026-08-05', tx: 'c53d474658898af7ebbb84d17845902572147cfe1fb72965833e3d4cf7552ed3', msg: 'DeFindex vault - Invest signed by the agent, not the owner' },
                                    // 12-nov-2026: el texto de arriba remite aquí para "ejecuciones reales" de mainnet y no había
                                    // ninguna. rebalance() en Horizon, SUCCESS, 2026-08-06T00:56:39Z.
                                    { net: 'mainnet' as const, date: '2026-08-06', tx: '82d73f537e907140367f9343f63a36704c74a5286aced7a938cee8fffb56b3d4', msg: 'DeFindex rebalance() on mainnet - team funds, our own vault' },
                                    // 16-nov-2026: el Policy Gate no publica contadores; su única evidencia es esta corrida
                                    // de testnet (Horizon: SUCCESS, 2026-10-01T01:20:42Z). Los casos DENY y stale no firmaron nada.
                                    { net: 'testnet' as const, date: '2026-10-01', tx: 'eefd57995733c29fd1ba8244b783419015af642073e9c918a0d732a6bb81a6b3', msg: 'Policy Gate - ALLOW signed and settled (0.02 USDC); the DENY and stale cases in the same run signed nothing' },
                                ].map((log) => (
                                    <div key={log.tx} className="p-4 bg-black/40 border border-white/5 rounded-2xl font-mono text-[10px] space-y-2 group hover:border-stellar-teal/30 transition-all">
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                                                log.net === 'mainnet'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                                {log.net}
                                            </span>
                                            <span>{log.date}</span>
                                        </div>
                                        <p className="text-gray-400">{log.msg}</p>
                                        <div className="flex items-center justify-between">
                                            <a
                                                href={`https://stellar.expert/explorer/${log.net === 'mainnet' ? 'public' : 'testnet'}/tx/${log.tx}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-stellar-teal font-black hover:underline flex items-center gap-1"
                                            >
                                                VERIFY_ON_EXPLORER
                                                <ExternalLink size={8} />
                                            </a>
                                            <span className="text-gray-600">TX: {log.tx.slice(0, 6)}…{log.tx.slice(-4)}</span>
                                        </div>
                                    </div>
                                ))}
                                <p className="text-center text-gray-700 text-[8px] uppercase font-black py-2">
                                    {language === 'es' ? 'El registro completo está en el dashboard' : 'Full audit trail in the dashboard'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Network Status */}
                <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-xl">
                    <h3 className="text-[10px] font-black mb-10 text-gray-500 uppercase tracking-[0.3em]">
                        {language === 'es' ? 'Estado de la infraestructura (en vivo)' : 'Infrastructure status (live)'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {([
                            {
                                label: language === 'es' ? 'Stellar mainnet (Horizon)' : 'Stellar mainnet (Horizon)',
                                state: horizonMain === null ? null : horizonMain.ok,
                            },
                            {
                                label: language === 'es' ? 'Soroban RPC (testnet)' : 'Soroban RPC (testnet)',
                                state: sorobanTest,
                            },
                        ] as const).map((c) => (
                            <div key={c.label} className="space-y-2">
                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{c.label}</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${c.state === null ? 'bg-gray-500' : c.state ? 'bg-emerald-400' : 'bg-red-500'}`} />
                                    <span className={`text-xs font-mono font-black uppercase ${c.state === null ? 'text-white/50' : c.state ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {c.state === null
                                            ? (language === 'es' ? 'Comprobando…' : 'Checking…')
                                            : c.state
                                                ? (language === 'es' ? 'Responde' : 'Reachable')
                                                : (language === 'es' ? 'Sin respuesta' : 'No response')}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div className="space-y-2">
                            {/* Mide el viaje de ida y vuelta al /health del nodo de testnet; no es "audit sync". */}
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">
                                {language === 'es' ? 'Latencia del nodo (testnet)' : 'Node latency (testnet)'}
                            </p>
                            <span className="text-xs font-mono font-black text-stellar-teal">{latency === null ? '-' : `${latency}ms`}</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">
                                {language === 'es' ? 'Protocolo de red' : 'Network protocol'}
                            </p>
                            <span className="text-xs font-mono font-black text-white">
                                Mainnet {horizonMain?.protocol ?? '-'} · Testnet {horizonTest?.protocol ?? '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
