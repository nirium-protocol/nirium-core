"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

interface Message {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
}

const ChatBot = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial greeting with SCF compliance disclaimer
    useEffect(() => {
        if (messages.length === 0) {
            let greeting = "";
            if (language === 'es') {
                greeting = "¡Hola! Soy Nirium Guide. Respondo con una base de respuestas preparadas, no soy un modelo de lenguaje. Te ayudo a encontrar lo que buscas en el sitio. Recuerda: no doy asesoría financiera.";
            } else {
                greeting = "Hi! I'm Nirium Guide. I answer from a prepared set of responses, not a language model. I can help you find your way around the site. Remember: I do not provide financial advice.";
            }
            
            setMessages([
                {
                    id: '1',
                    role: 'assistant',
                    content: greeting,
                    timestamp: new Date()
                }
            ]);
        }
    }, [language, messages.length]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (overrideText?: string) => {
        const textToSend = overrideText || input;
        if (!textToSend.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        if (!overrideText) setInput('');
        setIsTyping(true);

        // Keyword-matched canned response, not a real LLM call - see getAIResponse below.
        setTimeout(() => {
            const aiContent = getAIResponse(textToSend, language);
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiContent,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1000);
    };

    const getAIResponse = (query: string, lang: string) => {
        const q = query.toLowerCase();
        
        // Canned answers, last checked against the site 12 Nov 2026
        const kb: Record<string, any> = {
            es: {
                home: "**Nirium** son rieles no custodiales de pago, auditoría y ejecución sobre Stellar.\n\nEl usuario controla sus llaves. Impulsado por **x402 + Soroban**.\n\n→ [Inicio](/) · [Treasury](/treasury) · [Docs](/docs)",
                dashboard: "El [Dashboard](/dashboard) muestra el estado de cada nodo.\n\nLos datos salen en vivo de la API del agente, no de una maqueta.",
                marketplace: "Un marketplace de plantillas de política para tesorería es solo una idea: **no está construido y no tiene fecha**.\n\nLo que sí existe hoy está en [Tesorería](/treasury).",
                treasury: "La sección de [Tesorería](/treasury) mueve el saldo ocioso de una bóveda de DeFindex pensada para que sea tuya (USDC o CETES, un solo activo por bóveda) hacia su estrategia y de regreso. Nunca cambia un activo por otro.\n\nNirium solo tiene el rol de rebalanceo: no puede retirar fondos y tú puedes revocarlo. En mainnet es **solo por invitación** hasta tener una opinión legal por escrito; la bóveda activa hoy es de Nirium, con fondos propios.",
                analytics: "La sección de [Analytics](/analytics) enlaza transacciones reales de mainnet en Stellar Expert, junto a vistas de ejemplo marcadas como tales.",
                fiat: "Para obtener CETES tokenizados contratas directamente con **Etherfuse**, operador independiente: tú le transfieres a su CLABE y ellos emiten el token a tu wallet.\n\n**Nirium nunca recibe, sostiene ni convierte fiat** - solo muestra la instrucción y lee el saldo. El KYC lo hace Etherfuse. Hoy en entorno de pruebas: [ver flujo](/ramp).",
                devs: "La sección de [Developers](/developers) expone una **API REST** (las rutas principales están listadas ahí), SDK TypeScript/Python, servidor MCP para Claude/Cursor, y soporte nativo para **x402** (cliente MPP Charge: experimental).",
                docs: {
                    overview: "Documentación de Nirium: [Ver Documentación](/docs).",
                    api: "API: obtén una key gratis en [/keys](/keys) y sigue el [Inicio rápido](/docs#quickstart).",
                    blueprints: "Ejemplo de vendedor x402 listo para copiar en [Docs > Vendedores x402](/docs#x402-sellers).",
                    architecture: "Qué es Nirium y cómo encaja cada pieza: [Docs > Resumen](/docs#what-it-is).",
                    contracts: "Contrato y capacidades de la bóveda: [Security](/security).",
                    agent: "Estado real de cada nodo: [Agents](/agents).",
                    builder: "Treasury Builder (vista previa): [/treasury/builder](/treasury/builder).",
                    frontend: "SDK y ejemplos de integración: [Developers](/developers).",
                    reporting: "Resúmenes y exportes de recibos anclados: [Docs > Reportes](/docs#reporting).",
                    security: "Seguridad y límites: [Docs > Seguridad y límites](/docs#security-limits)."
                },
                scf: "Nirium ha recibido dos Instawards del SCF y sigue:\n\n**· Código de Conducta de Stellar**\n**· Sin garantías de rendimiento**\n\nMás info en [Código de Conducta](/coc).",
                compliance: "La página de [Compliance](/compliance) reúne la evidencia verificable de Nirium.\n\nAnclar un registro es **opcional, por llamada**: hash SHA-256 del registro → anclado en IPFS → exportable JSON, con firma ed25519 opcional de quién lo declaró. Cualquiera lo comprueba en [/verify](/verify).",
                default: "Soy el asistente técnico de Nirium. Puedo guiarte a:\n\n[Dashboard](/dashboard) · [Treasury](/treasury) · [Developers](/developers) · [Docs](/docs) · [Compliance](/compliance)\n\n¿Qué necesitas?"
            },
            en: {
                home: "**Nirium** is non-custodial payment, audit and execution rails on Stellar.\n\nUsers control their keys. Powered by **x402 + Soroban**.\n\n→ [Home](/) · [Treasury](/treasury) · [Docs](/docs)",
                dashboard: "The [Dashboard](/dashboard) shows the status of each node.\n\nThe data is pulled live from the agent's API, not a mock.",
                marketplace: "A marketplace of treasury policy templates is only an idea: **it is not built and has no date**.\n\nWhat exists today is on [Treasury](/treasury).",
                treasury: "The [Treasury](/treasury) section moves a DeFindex vault's idle funds (USDC or CETES, one asset per vault) into its strategy and back. The vault is structured for you to own, and it never swaps one asset for the other.\n\nNirium holds only the rebalance role: it cannot withdraw funds and you can revoke it. On mainnet it is **invite-only** until we have a written legal opinion; today's live vault is Nirium's own, self-funded.",
                analytics: "The [Analytics](/analytics) section links real mainnet transactions on Stellar Expert, next to sample views that are labeled as such.",
                fiat: "To get tokenized CETES you contract directly with **Etherfuse**, an independent operator: you transfer to their CLABE and they issue the token to your wallet.\n\n**Nirium never receives, holds or converts fiat** - we only show the instruction and read the balance. KYC is done by Etherfuse. Test environment today: [see the flow](/ramp).",
                devs: "The [Developers](/developers) section exposes a **REST API** (the main routes are listed there), TypeScript/Python SDK, MCP server for Claude/Cursor, and native **x402** support (MPP Charge client: experimental).",
                docs: {
                    overview: "Nirium documentation: [View Documentation](/docs).",
                    api: "API: get a free key at [/keys](/keys) and follow the [Quickstart](/docs#quickstart).",
                    blueprints: "A copy-ready x402 seller example: [Docs > x402 Sellers](/docs#x402-sellers).",
                    architecture: "What Nirium is and how the pieces fit: [Docs > Overview](/docs#what-it-is).",
                    contracts: "Vault contract and capabilities: [Security](/security).",
                    agent: "Real status of each node: [Agents](/agents).",
                    builder: "Treasury Builder (preview): [/treasury/builder](/treasury/builder).",
                    frontend: "SDK and integration examples: [Developers](/developers).",
                    reporting: "Summaries and exports of anchored receipts: [Docs > Reporting](/docs#reporting).",
                    security: "Security and limits: [Docs > Security & Limits](/docs#security-limits)."
                },
                scf: "Nirium has received two SCF Instawards and follows:\n\n**· The Stellar Code of Conduct**\n**· No yield guarantees**\n\nRead more at [Code of Conduct](/coc).",
                compliance: "The [Compliance](/compliance) page gathers Nirium's verifiable evidence.\n\nAnchoring a record is **opt-in, per call**: SHA-256 hash of the record → IPFS-anchored → JSON export, with an optional ed25519 signature attesting who declared it. Anyone can check it at [/verify](/verify).",
                default: "I'm Nirium's technical assistant. I can guide you to:\n\n[Dashboard](/dashboard) · [Treasury](/treasury) · [Developers](/developers) · [Docs](/docs) · [Compliance](/compliance)\n\nWhat do you need?"
            }
        };

        const currentKB = kb[lang as keyof typeof kb] || kb.en;

        if (q.includes('qué es') || q.includes('que es') || q.includes('what is')) return currentKB.home;

        // Documentation sub-topics
        if (q.includes('doc') || q.includes('guía') || q.includes('guide')) {
            if (q.includes('api') || q.includes('key')) return currentKB.docs.api;
            if (q.includes('arch') || q.includes('fleet') || q.includes('kernel')) return currentKB.docs.architecture;
            if (q.includes('contrat') || q.includes('soroban') || q.includes('direcc')) return currentKB.docs.contracts;
            if (q.includes('report')) return currentKB.docs.reporting;
            if (q.includes('agent') || q.includes('node') || q.includes('nodo')) return currentKB.docs.agent;
            if (q.includes('build') || q.includes('regla') || q.includes('visual')) return currentKB.docs.builder;
            if (q.includes('secur') || q.includes('segur') || q.includes('audit')) return currentKB.docs.security;
            if (q.includes('front') || q.includes('react') || q.includes('ui')) return currentKB.docs.frontend;
            return currentKB.docs.overview;
        }

        if (q.includes('dash') || q.includes('panel')) return currentKB.dashboard;
        if (q.includes('market') || q.includes('estrat') || q.includes('strat') || q.includes('kernel')) return currentKB.marketplace;
        if (q.includes('treas') || q.includes('tesor') || q.includes('vault') || q.includes('bóveda')) return currentKB.treasury;
        if (q.includes('analyt') || q.includes('analit') || q.includes('data')) return currentKB.analytics;
        if (q.includes('fiat') || q.includes('ramp') || q.includes('hub') || q.includes('cetes') || q.includes('spei') || q.includes('mxn')) return currentKB.fiat;
        if (q.includes('compli') || q.includes('cnbv') || q.includes('audit') || q.includes('hmac')) return currentKB.compliance;
        if (q.includes('dev') || q.includes('sdk') || q.includes('endpoint')) return currentKB.devs;
        if (q.includes('api') || q.includes('prueb')) return currentKB.docs.api;
        if (q.includes('build') || q.includes('blueprint') || q.includes('construir') || q.includes('visual')) return currentKB.docs.builder;
        if (q.includes('scf') || q.includes('award') || q.includes('conducta') || q.includes('norma') || q.includes('rule') || q.includes('conduct')) return currentKB.scf;

        return currentKB.default;
    };

    const renderMessage = (content: string) => {
        const lines = content.split('\n');
        return lines.map((line, lineIdx) => {
            const segments: React.ReactNode[] = [];
            const pattern = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
            let lastIndex = 0;
            let segIdx = 0;
            let match;

            while ((match = pattern.exec(line)) !== null) {
                if (match.index > lastIndex) {
                    segments.push(line.slice(lastIndex, match.index));
                }
                const seg = match[0];
                if (seg.startsWith('**')) {
                    segments.push(
                        <strong key={`b-${segIdx++}`} className="text-white font-bold">
                            {seg.slice(2, -2)}
                        </strong>
                    );
                } else {
                    const lm = seg.match(/\[(.*?)\]\((.*?)\)/);
                    if (lm) {
                        segments.push(
                            <Link
                                key={`l-${segIdx++}`}
                                href={lm[2]}
                                className="text-stellar-teal underline font-semibold hover:opacity-70 transition-opacity"
                                onClick={() => setIsOpen(false)}
                            >
                                {lm[1]}
                            </Link>
                        );
                    }
                }
                lastIndex = match.index + seg.length;
            }

            if (lastIndex < line.length) segments.push(line.slice(lastIndex));

            return (
                <React.Fragment key={`ln-${lineIdx}`}>
                    {segments.length > 0 ? segments : line}
                    {lineIdx < lines.length - 1 && <br />}
                </React.Fragment>
            );
        });
    };

    return (
        <>
            {/* Floating Trigger Button (Nano) */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="nirium-chat fixed bottom-4 right-4 z-[100] w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-stellar-yellow text-[#0b0b0b] shadow-lg flex items-center justify-center border border-white/10"
            >
                {isOpen ? <X size={18} /> : <MessageSquare size={18} />}
            </motion.button>

            {/* Chat Window (Nano & Minimalist) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="nirium-chat fixed bottom-20 sm:bottom-16 right-4 z-[100] w-[88vw] max-w-[280px] sm:w-[260px] h-[380px] sm:h-[320px] bg-[#0A0A0A]/98 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <img src="/brand/icon.svg" alt="Nirium Logo" className="w-full h-full object-contain" />
                                </div>
                                <h3 className="text-[11px] font-bold uppercase text-white tracking-tighter">Nirium Guide</h3>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-white/5 border border-white/10 rounded p-0.5">
                                    {(['en', 'es'] as const).map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => setLanguage(lang)}
                                            className={`px-1.5 py-0.5 text-[8px] font-black rounded uppercase ${
                                                language === lang ? 'bg-stellar-yellow text-[#0b0b0b]' : 'text-zinc-600'
                                            }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar"
                        >
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[92%] p-2 rounded-lg text-[11px] leading-[1.4] ${
                                        msg.role === 'assistant'
                                            ? 'bg-white/5 border border-white/10 text-gray-300'
                                            : 'bg-stellar-yellow text-[#0b0b0b] font-bold'
                                    }`}>
                                        {renderMessage(msg.content)}
                                    </div>
                                </div>
                            ))}
                            {isTyping && <div className="w-2 h-2 bg-stellar-yellow/40 rounded-full animate-pulse ml-2" />}
                        </div>

                        {/* Input Area */}
                        <div className="p-2.5 bg-black/80 border-t border-white/5">
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={language === 'es' ? 'Pregunta sobre el sitio…' : 'Ask about the site…'}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-[11px] focus:outline-none text-white"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    className="w-7 h-7 rounded-md bg-stellar-yellow text-[#0b0b0b] flex items-center justify-center"
                                >
                                    <Send size={12} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
};

export default ChatBot;
