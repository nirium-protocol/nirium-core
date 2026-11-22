"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Terminal, Maximize2, Brain, CreditCard, Shield, Cpu, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

// El loop escribe el mismo pensamiento cada ~30s ("REBALANCE (95%) - CETES 5.57%
// excede el umbral de 2.5%"), así que el feed se veía como un disco rayado: veinte
// renglones idénticos leídos como "está atorado" en lugar de "está trabajando".
// Se pliegan los consecutivos equivalentes en uno con contador ×N.
//
// NUNCA se pliega una línea con hash de transacción o CID: esas son evidencia
// única y cada una tiene que poder abrirse y verificarse por separado.
const UNIQUE_EVIDENCE = /\b[a-f0-9]{64}\b|\bQm[1-9A-HJ-NP-Za-km-z]{44}\b/;

function collapseKey(log: { agent_id?: string; message?: string }): string | null {
    const raw = log.message || '';
    if (UNIQUE_EVIDENCE.test(raw)) return null;
    const normalized = raw
        .replace(/\(\d+%\)/g, '')      // confianza del LLM: 95% y 99% son el mismo pensamiento
        .replace(/#\d+/g, '#')          // [Scan #14] y [Scan #15] son el mismo evento
        .split(/[—|:]/)[0]!
        .trim()
        .slice(0, 60);
    return `${log.agent_id || ''}|${normalized}`;
}

function collapseRepeats<T extends { agent_id?: string; message?: string }>(logs: T[]): { log: T; repeat: number }[] {
    const out: { log: T; repeat: number; key: string | null }[] = [];
    for (const log of logs) {
        const key = collapseKey(log);
        const prev = out[out.length - 1];
        if (key !== null && prev && prev.key === key) {
            prev.repeat += 1;
            prev.log = log;             // conservar el más reciente del grupo
            continue;
        }
        out.push({ log, repeat: 1, key });
    }
    return out.map(({ log, repeat }) => ({ log, repeat }));
}

// Red de una línea del feed, según lo que el agente escribe en el mensaje:
// `network=mainnet` (x402, Audit Node, rebalanceador, AUTO-EXIT), `stellar:pubnet`,
// o la URL del explorador (/explorer/public/, Payouts). Sin pista, testnet: las
// liquidaciones que /api/logs lee de Horizon son de la tesorería de testnet.
function explorerNetwork(rawMessage: string): 'public' | 'testnet' {
    return /network=mainnet|stellar:pubnet|\/explorer\/public\//i.test(rawMessage) ? 'public' : 'testnet';
}

// Render a feed message, turning verifiable identifiers into clickable links:
// 64-char Stellar tx hashes → stellar.expert on the line's own network, IPFS CIDs
// (Qm…) → /verify, which recomputes the hash and checks the signature (before:
// raw JSON on Pinata, and every tx hash went to the testnet explorer).
function renderMessageWithTxLink(text: string, network: 'public' | 'testnet' = 'testnet') {
    const re = /\b([a-f0-9]{64})\b|\b(Qm[1-9A-HJ-NP-Za-km-z]{44})\b/g;
    const parts: React.ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        const token = m[0];
        const href = m[1]
            ? `https://stellar.expert/explorer/${network}/tx/${token}`
            : `/verify?cid=${token}`;
        parts.push(text.slice(last, m.index));
        parts.push(
            <a
                key={`${token}-${m.index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-stellar-teal underline decoration-stellar-teal/40 hover:decoration-stellar-teal break-all"
            >
                {token}
            </a>
        );
        last = m.index + token.length;
    }
    if (parts.length === 0) return text;
    parts.push(text.slice(last));
    return <>{parts}</>;
}

function formatTime(ts: string) {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
}

export default function OpsConsole({ isExpanded, onToggleExpand, walletAddress, heightClass }: { isExpanded: boolean, onToggleExpand: () => void, walletAddress?: string, heightClass?: string }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    
    // Empieza vacío. Antes arrancaba con tres líneas de demo ("Execution network
    // broadcasting on-chain...", "Vault architecture synchronized") que se veían
    // como logs reales y se quedaban en pantalla si /api/logs fallaba.
    const [logs, setLogs] = useState<any[]>([]);
    const [status, setStatus] = useState<'connecting' | 'online' | 'unavailable'>('connecting');
    // El feed escribe ~2 líneas por segundo (scans, señales, corredores) y una
    // ejecución real ocurre cada ~10 minutos. Los hashes existen y confirman,
    // pero quedan enterrados bajo el parloteo. Este filtro deja solo las líneas
    // que traen un hash - lo único que alguien puede verificar por su cuenta.
    const [onlyTx, setOnlyTx] = useState(false);
    const logContainerRef = useRef<HTMLDivElement>(null);
    const lastIdRef = useRef<string | null>(null);

    const fetchLogs = useCallback(async () => {
        try {
            const res = await fetch('/api/logs');
            if (!res.ok) {
                setStatus('unavailable');
                return;
            }
            const rows: any[] = await res.json();
            setStatus('online');
            
            if (rows) {
                const newestId = rows[0]?.id;
                if (newestId !== lastIdRef.current) {
                    lastIdRef.current = newestId;
                    setLogs(rows.length > 0 ? rows.reverse() : []);
                } else if (rows.length === 0 && logs.length !== 0) {
                    setLogs([]);
                }
            }
        } catch (e) {
            console.warn('[Telemetry Feed] Fetch error:', e);
            setStatus('unavailable');
        }
    }, [logs.length]);

    useEffect(() => {
        fetchLogs();
        // 10 s (was 4 s), and nothing while the tab is in the background: each poll is a
        // server function run on Vercel.
        const poll = setInterval(() => { if (document.visibilityState === 'visible') fetchLogs(); }, 10_000);
        return () => clearInterval(poll);
    }, [fetchLogs]);

    const visibleLogs = useMemo(
        () => (onlyTx ? logs.filter((l: any) => /TX:\s*[0-9a-f]{16,}/i.test(l?.message ?? '')) : logs),
        [logs, onlyTx],
    );
    const collapsedLogs = useMemo(() => collapseRepeats(visibleLogs), [visibleLogs]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setStatus(prev => prev === 'connecting' ? 'unavailable' : prev);
        }, 12000);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const statusColors = {
        connecting: { dot: 'bg-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'CONNECTING' },
        online: { dot: 'bg-green-400', text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'ONLINE' },
        unavailable: { dot: 'bg-gray-500', text: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20', label: 'UNAVAILABLE' },
    };
    const s = statusColors[status];

    const { t, language } = useLanguage();
    const lang = (en: string, es: string) => (language === 'es' ? es : en);

    return (
        <motion.div
            layout
            className={`bg-[#050505] border border-white/10 rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-[100] h-auto shadow-2xl' : (heightClass || 'h-full')}`}
        >
            <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-stellar-teal" />
                    <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">{t.dashboard.telemetry_feed.uplink}</span>
                    <span className={`flex items-center gap-1.5 ml-2 px-1.5 py-0.5 rounded ${s.bg} text-[10px] ${s.text} border`}>
                        <span className={`w-1 h-1 rounded-full ${s.dot} ${status === 'online' ? 'animate-pulse' : ''}`}></span>
                        {s.label}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOnlyTx((v) => !v)}
                        title={lang('Show only executions with a verifiable hash', 'Mostrar solo ejecuciones con hash verificable')}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest border transition-colors ${
                            onlyTx
                                ? 'bg-stellar-teal/15 text-stellar-teal border-stellar-teal/40'
                                : 'text-gray-600 border-white/10 hover:text-gray-300'
                        }`}
                    >
                        {lang('tx only', 'solo tx')}
                    </button>
                <button onClick={onToggleExpand} className="text-gray-500 hover:text-white transition-colors">
                    {isExpanded ? <Maximize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                </div>
            </div>

            <p className="shrink-0 px-4 py-1.5 border-b border-white/5 text-[9px] font-mono text-white/40">
                {lang(
                    'Testnet and mainnet events mixed, each line tagged. Includes our own agent paying our own testnet endpoint.',
                    'Eventos de testnet y mainnet mezclados, cada línea con su red. Incluye a nuestro agente pagando nuestro propio endpoint de testnet.')}
            </p>
            <div ref={logContainerRef} className="flex-1 bg-black/50 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar min-h-0">
                <div className="space-y-1.5">
                    {status === 'unavailable' && (
                        <div className="text-yellow-600 italic">{lang("Can't reach the log feed right now.", 'No se pudo leer el feed de logs.')}</div>
                    )}
                    {!onlyTx && collapsedLogs.length === 0 && status === 'online' && (
                        <div className="text-gray-600 italic">{lang('No log entries yet.', 'Todavía no hay entradas.')}</div>
                    )}
                    {/* Sin la promesa anterior de "cada ~10 minutos": el ritmo depende del
                        agente y de la red, y en mainnet no ha habido rebalanceos desde el 6-ago. */}
                    {onlyTx && collapsedLogs.length === 0 && status !== 'unavailable' && (
                        <div className="text-gray-600 italic">
                            {lang('No confirmed executions in this window.', 'Sin ejecuciones confirmadas en esta ventana.')}
                        </div>
                    )}
                    <AnimatePresence mode="popLayout">
                    {collapsedLogs.map(({ log, repeat }, i) => {
                        const rawMsg = (log.message || '');
                        let mainMsg = (rawMsg.split('|')[0] || '').replace(/IPFS:\s*\S+/gi, '').replace(/\s{2,}/g, ' ').trim();
                        // El recorte en '|' oculta el CID de los batches IPFS - re-adjuntarlo para que salga clickeable.
                        const cidMatch = rawMsg.match(/\b(Qm[1-9A-HJ-NP-Za-km-z]{44})\b/);
                        if (cidMatch && !mainMsg.includes(cidMatch[1])) mainMsg += ` - CID: ${cidMatch[1]}`;
                        // Igual para el TX hash: la línea "✅ On-chain execution confirmed" lo lleva tras un '|'.
                        const txMatch = rawMsg.match(/\b([a-f0-9]{64})\b/);
                        if (txMatch && !mainMsg.includes(txMatch[1])) mainMsg += ` - TX: ${txMatch[1]}`;

                        // Detect agent type for branding
                        const isIntelligence = log.agent_id === 'INTELLIGENCE';
                        const isSettlement = log.agent_id === 'x402' || log.agent_id === 'MPP' || log.agent_id === 'SETTLEMENT' || log.source === 'horizon';
                        const isX402 = log.agent_id === 'x402';
                        const isMPP = log.agent_id === 'MPP';
                        const isSystem = log.level === 'system' || log.agent_id === 'Protocol';
                        const isPayment = log.agent_id?.includes('GATEWAY') || log.level === 'payment';
                        
                        return (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={log.id || i} 
                                className={`group relative flex flex-col gap-1.5 py-2 px-3 rounded-lg border-l-2 mb-1 transition-all ${
                                    isSettlement ? 'bg-stellar-teal/5 border-stellar-teal/30 hover:bg-stellar-teal/10' :
                                    isIntelligence ? 'bg-pink-500/5 border-pink-500/30 hover:bg-pink-500/10' :
                                    'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] text-gray-500 font-mono">
                                            [{mounted ? formatTime(log.created_at || log.timestamp) : '--:--:--'}]
                                        </span>

                                        {repeat > 1 && (
                                            <span
                                                title={lang(`${repeat} equivalent events folded`, `${repeat} eventos equivalentes plegados`)}
                                                className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-400 shrink-0"
                                            >
                                                ×{repeat}
                                            </span>
                                        )}

                                        <div className="flex items-center gap-1.5">
                                            {isIntelligence && <Brain className="w-3 h-3 text-pink-400" />}
                                            {(isSettlement || isX402) && <Zap className="w-3 h-3 text-stellar-yellow" />}
                                            {isMPP && <Shield className="w-3 h-3 text-purple-400" />}
                                            {isSystem && <Cpu className="w-3 h-3 text-stellar-teal" />}
                                            {isPayment && <CreditCard className="w-3 h-3 text-blue-400" />}
                                            
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                                isIntelligence ? 'bg-pink-500/20 text-pink-400' :
                                                isSettlement ? 'bg-stellar-yellow/20 text-stellar-yellow' :
                                                'bg-white/10 text-gray-400'
                                            }`}>
                                                {log.agent_id}
                                            </span>
                                            {/* 12-nov-2026: el mensaje se corta en el primer '|', y ahí iba
                                                network=testnet. Sin esto, "x402 payment received" (nuestro agente
                                                de testnet pagándose a sí mismo) se leía como cobro en mainnet. */}
                                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                                explorerNetwork(rawMsg) === 'public' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                                            }`}>
                                                {explorerNetwork(rawMsg) === 'public' ? 'mainnet' : 'testnet'}
                                            </span>
                                        </div>
                                    </div>

                                    <span className={`${
                                        log.level === 'error' ? 'text-red-500' :
                                        log.level === 'warn' ? 'text-yellow-500' :
                                        log.level === 'success' ? 'text-green-400' :
                                        log.level === 'system' ? 'text-stellar-teal' :
                                        'text-blue-400/50'
                                    } font-mono text-[8px] tracking-widest uppercase`}>
                                        {log.level}
                                    </span>
                                </div>

                                <div className="pl-1">
                                    <span className={`leading-relaxed text-[10px] ${
                                        isSettlement ? 'text-stellar-teal font-medium' : 'text-gray-300'
                                    }`}>
                                        {renderMessageWithTxLink(mainMsg.replace(/Soroban Intelligence: /i, ''), explorerNetwork(rawMsg))}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                    </AnimatePresence>
                </div>
            </div>
            {/* Deployed Contracts Footer */}
            <div className="shrink-0 border-t border-white/5 bg-black/30 px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-[7px] font-mono text-white/20 uppercase tracking-[0.2em]">Soroban Testnet</span>
                <div className="h-2 w-px bg-white/10 hidden sm:block" />
                <a
                    href="https://stellar.expert/explorer/testnet/contract/CDMFURE6MYROTA2A6DLD4TN2S4QTN64L2FZ2I2RY2AREONX6DUQOI2S2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 group"
                >
                    {/* La etiqueta decía CBTWMZ…AWSZU y CC2TU5…L5NR5, que no son los
                        contratos a los que llevan estos enlaces (los de lib/sorobanContracts). */}
                    <span className="text-[7px] font-mono text-white/20 group-hover:text-stellar-teal/60 transition-colors">NiriumVault</span>
                    <span className="text-[7px] font-mono text-stellar-teal/40 group-hover:text-stellar-teal transition-colors tracking-wider">CDMFUR…QOI2S2</span>
                </a>
                <div className="h-2 w-px bg-white/10 hidden sm:block" />
                <a
                    href="https://stellar.expert/explorer/testnet/contract/CBKCTMTCCZQIPEESLHHEZKXYSPWNO24NEG33T2XSAAAHPISBND5CNSXX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 group"
                >
                    <span className="text-[7px] font-mono text-white/20 group-hover:text-stellar-teal/60 transition-colors">NiriumProtocol</span>
                    <span className="text-[7px] font-mono text-stellar-teal/40 group-hover:text-stellar-teal transition-colors tracking-wider">CBKCTM…D5CNSXX</span>
                </a>
            </div>
        </motion.div>
    );
}
