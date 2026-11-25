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
                greeting = "¡Hola! Soy Nirium Guide. Respondo con una base de respuestas preparadas, no soy un modelo de lenguaje. Te ayudo a encontrar lo que buscas en el sitio. Pregúntame por: verificar un recibo, Audit Trail, x402, Payouts, Treasury, precios o en qué países funciona. Recuerda: no doy asesoría financiera.";
            } else {
                greeting = "Hi! I'm Nirium Guide. I answer from a prepared set of responses, not a language model. I can help you find your way around the site. Ask me about: verifying a receipt, Audit Trail, x402, Payouts, Treasury, pricing or where it works. Remember: I do not provide financial advice.";
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

        // Canned answers, last checked against the site 19 Nov 2026. Each one only repeats
        // what the linked page already says - this guide never states a fact of its own.
        const kb: Record<string, any> = {
            es: {
                home: "El ledger de Stellar ya prueba quién pagó, cuánto y cuándo. **Audit Trail registra lo que falta**: para qué fue cada pago, los pagos que tu política rechazó y nunca firmó, los registros fuera de la cadena y quién responde por ellos.\n\nSon rieles de pago, auditoría y ejecución para apps, backends y agentes de IA. No custodial: tus llaves, tus fondos.\n\n→ [Verifica un recibo](/verify) · [Docs](/docs)",
                verify: "Pega un CID en [/verify](/verify), sin cuenta. Comprueba que el registro **no cambió** desde que se ancló y, si viene firmado, **qué llave lo firmó**. No prueba que su contenido sea verdad. Si guardaste tu copia del recibo, `nirium cid recibo.json --expect <CID>` demuestra que es el original.\n\nAhí hay un ejemplo de un pago que nunca ocurrió: su política lo bloqueó, no hay transacción, y solo el recibo guarda la decisión.\n\nCómo anclar los tuyos: [Docs](/docs).",
                payouts: "[Payouts](/payouts) paga hasta **100 destinatarios** (contratistas, freelancers, pagos B2B; no es nómina de empleados) desde la wallet de una empresa, en un solo lote que **tú firmas**. Cada corrida se ancla en IPFS.\n\nEn testnet está abierto. En mainnet es **solo por invitación**.",
                pricing: "Planes y precios en [/pricing](/pricing). Nirium **nunca cobra un porcentaje** del dinero que mueves o guardas.",
                x402: "Con **x402** una API cobra por request en Stellar: responde 402 con el precio, el cliente paga en USDC y repite la llamada.\n\nNirium tiene endpoints x402 en mainnet y SDKs para pagar o cobrar: [Developers](/developers) · [Docs > Vendedores x402](/docs#x402-sellers). MPP Charge es experimental: verificado en testnet, no en mainnet.",
                jurisdictions: "Audit Trail, Reporting y x402 corren en mainnet. **Payouts y Treasury en mainnet** son por invitación y no se ofrecen en el EEE, el Reino Unido ni EE.UU.; en **testnet** siguen abiertos ahí como demostración.\n\nEl acceso está bloqueado desde jurisdicciones con sanciones integrales, las que tienen un llamado a la acción del GAFI y China continental. Detalle en [Avisos legales](/disclaimers).",
                stats: "Las cifras en vivo están en [/stats](/stats), cada una con su fuente para que la compruebes.",
                dashboard: "El [Dashboard](/dashboard) muestra el estado de cada nodo.\n\nLos datos salen en vivo de la API del agente, no de una maqueta.",
                // 21-nov-2026 (CB5): números de packages/agent (rateLimit.ts 'aggressive' = 20/min en
                // /api/audit/log; auth.ts TIER_QUOTAS.free = 10/min y 100/día).
                limits: "Anclar un recibo (`POST /api/audit/log`) hoy no pide key: 20 por minuto por cliente, y cada respuesta trae `x-ratelimit-limit` y `x-ratelimit-remaining`. Con una key gratis, las rutas que la piden permiten 10 por minuto y 100 por día. Detalle: [Docs](/docs).",
                marketplace: "Un marketplace de plantillas de política para tesorería es solo una idea: **no está construido y no tiene fecha**.\n\nLo que sí existe hoy está en [Tesorería](/treasury).",
                treasury: "La sección de [Tesorería](/treasury) mueve el saldo ocioso de una bóveda de DeFindex pensada para que sea tuya (USDC o CETES, un solo activo por bóveda) hacia su estrategia y de regreso. Nuestro código nunca cambia un activo por otro; el rol de DeFindex también permite swaps dentro de la bóveda, nunca hacia afuera (Security).\n\nNirium solo tiene el rol de rebalanceo: no puede retirar fondos y tú puedes revocarlo. En mainnet es **solo por invitación** hasta tener una opinión legal por escrito; la bóveda activa hoy es de Nirium, con fondos propios.",
                builder: "El [Treasury Builder](/treasury/builder) es una **vista previa**: arma el esquema de la automatización, y la ejecución corre en el nodo. En mainnet es por invitación.",
                analytics: "La sección de [Analytics](/analytics) enlaza transacciones reales de mainnet en Stellar Expert, junto a vistas de ejemplo marcadas como tales.",
                fiat: "Para obtener CETES tokenizados contratas directamente con **Etherfuse**, operador independiente: tú le transfieres a su CLABE y ellos emiten el token a tu wallet.\n\n**Nirium nunca recibe, sostiene ni convierte fiat** - solo muestra la instrucción y lee el saldo. El KYC lo hace Etherfuse. Hoy en entorno de pruebas: [ver flujo](/ramp).",
                devs: "La sección de [Developers](/developers) expone una **API REST** (las rutas principales están listadas ahí), SDK TypeScript/Python, servidor MCP para Claude/Cursor, y soporte nativo para **x402** (cliente MPP Charge: experimental).",
                docs: {
                    overview: "Documentación de Nirium: [Ver Documentación](/docs).",
                    api: "API: obtén una key gratis en [/keys](/keys) y sigue el [Inicio rápido](/docs#quickstart).",
                    architecture: "Qué es Nirium y cómo encaja cada pieza: [Docs > Resumen](/docs#what-it-is).",
                    contracts: "Contrato y capacidades de la bóveda: [Security](/security).",
                    agent: "Estado real de cada nodo: [Agents](/agents).",
                    builder: "Treasury Builder (vista previa): [/treasury/builder](/treasury/builder).",
                    frontend: "SDK y ejemplos de integración: [Developers](/developers).",
                    reporting: "Resúmenes y exportes de recibos anclados: [Docs > Reportes](/docs#reporting).",
                    security: "Seguridad y límites: [Docs > Seguridad y límites](/docs#security-limits)."
                },
                scf: "Nirium ha recibido dos Instawards del SCF y sigue:\n\n**· Código de Conducta de Stellar**\n**· Sin garantías de rendimiento**\n\nMás info en [Código de Conducta](/coc).",
                compliance: "La página de [Compliance](/compliance) reúne la evidencia verificable de Nirium.\n\nAnclar un registro es **opcional, por llamada**: hash SHA-256 del registro → anclado en IPFS → exportable JSON, con firma ed25519 opcional que muestra qué llave lo firmó. Cualquiera lo comprueba en [/verify](/verify).",
                default: "Soy Nirium Guide. Puedo llevarte a:\n\n[Verifica un recibo](/verify) · [Payouts](/payouts) · [Treasury](/treasury) · [Developers](/developers) · [Docs](/docs) · [Precios](/pricing)\n\n¿Qué necesitas?"
            },
            en: {
                home: "Stellar's ledger already proves who paid, how much and when. **Audit Trail records what it can't**: what each payment was for, the payments your policy refused and never signed, off-chain records, and who stands behind them.\n\nPayment, audit and execution rails for apps, backends and AI agents. Non-custodial: your keys, your funds.\n\n→ [Verify a receipt](/verify) · [Docs](/docs)",
                verify: "Paste a CID at [/verify](/verify), no account needed. It checks the record **has not changed** since it was anchored and, if it is signed, **which key signed it**. It does not prove its contents are true. If you kept your copy of the receipt, `nirium cid receipt.json --expect <CID>` proves it's the original.\n\nThere's an example of a payment that never happened: its policy blocked it, there is no transaction, and only the receipt records the decision.\n\nHow to anchor your own: [Docs](/docs).",
                payouts: "[Payouts](/payouts) pays up to **100 recipients** (contractors, freelancers, B2B payouts; not employee payroll) from one company wallet, in a single batch **you sign**. Every run is anchored to IPFS.\n\nOpen on testnet. On mainnet it is **invite-only**.",
                pricing: "Plans and prices are at [/pricing](/pricing). Nirium **never charges a percentage** of the money you move or hold.",
                x402: "With **x402** an API charges per request on Stellar: it answers 402 with the price, the client pays in USDC and retries.\n\nNirium runs x402 endpoints on mainnet and has SDKs to pay or charge: [Developers](/developers) · [Docs > x402 Sellers](/docs#x402-sellers). MPP Charge is experimental: verified on testnet, not on mainnet.",
                jurisdictions: "Audit Trail, Reporting and x402 run on mainnet. **Payouts and Treasury on mainnet** are invite-only and not offered in the EEA, the UK or the US; on **testnet** they stay open there as a demonstration.\n\nAccess is blocked from comprehensively sanctioned jurisdictions, those under a FATF call for action, and mainland China. Details in [Legal Disclaimers](/disclaimers).",
                stats: "Live counts are at [/stats](/stats), each with its source so you can check it.",
                dashboard: "The [Dashboard](/dashboard) shows the status of each node.\n\nThe data is pulled live from the agent's API, not a mock.",
                limits: "Anchoring a receipt (`POST /api/audit/log`) needs no key today: 20 per minute per client, and every response carries `x-ratelimit-limit` and `x-ratelimit-remaining`. With a free key, the routes that ask for one allow 10 per minute and 100 per day. Details: [Docs](/docs).",
                marketplace: "A marketplace of treasury policy templates is only an idea: **it is not built and has no date**.\n\nWhat exists today is on [Treasury](/treasury).",
                treasury: "The [Treasury](/treasury) section moves a DeFindex vault's idle funds (USDC or CETES, one asset per vault) into its strategy and back. The vault is structured for you to own. Our code never swaps one asset for the other; the DeFindex role also allows swaps inside the vault, never out of it (Security).\n\nNirium holds only the rebalance role: it cannot withdraw funds and you can revoke it. On mainnet it is **invite-only** until we have a written legal opinion; today's live vault is Nirium's own, self-funded.",
                builder: "The [Treasury Builder](/treasury/builder) is a **preview**: it composes the automation schema, and execution runs in the node. Mainnet is invite-only.",
                analytics: "The [Analytics](/analytics) section links real mainnet transactions on Stellar Expert, next to sample views that are labeled as such.",
                fiat: "To get tokenized CETES you contract directly with **Etherfuse**, an independent operator: you transfer to their CLABE and they issue the token to your wallet.\n\n**Nirium never receives, holds or converts fiat** - we only show the instruction and read the balance. KYC is done by Etherfuse. Test environment today: [see the flow](/ramp).",
                devs: "The [Developers](/developers) section exposes a **REST API** (the main routes are listed there), TypeScript/Python SDK, MCP server for Claude/Cursor, and native **x402** support (MPP Charge client: experimental).",
                docs: {
                    overview: "Nirium documentation: [View Documentation](/docs).",
                    api: "API: get a free key at [/keys](/keys) and follow the [Quickstart](/docs#quickstart).",
                    architecture: "What Nirium is and how the pieces fit: [Docs > Overview](/docs#what-it-is).",
                    contracts: "Vault contract and capabilities: [Security](/security).",
                    agent: "Real status of each node: [Agents](/agents).",
                    builder: "Treasury Builder (preview): [/treasury/builder](/treasury/builder).",
                    frontend: "SDK and integration examples: [Developers](/developers).",
                    reporting: "Summaries and exports of anchored receipts: [Docs > Reporting](/docs#reporting).",
                    security: "Security and limits: [Docs > Security & Limits](/docs#security-limits)."
                },
                scf: "Nirium has received two SCF Instawards and follows:\n\n**· The Stellar Code of Conduct**\n**· No yield guarantees**\n\nRead more at [Code of Conduct](/coc).",
                compliance: "The [Compliance](/compliance) page gathers Nirium's verifiable evidence.\n\nAnchoring a record is **opt-in, per call**: SHA-256 hash of the record → IPFS-anchored → JSON export, with an optional ed25519 signature attesting which key signed it. Anyone can check it at [/verify](/verify).",
                default: "I'm Nirium Guide. I can take you to:\n\n[Verify a receipt](/verify) · [Payouts](/payouts) · [Treasury](/treasury) · [Developers](/developers) · [Docs](/docs) · [Pricing](/pricing)\n\nWhat do you need?"
            }
        };

        const currentKB = kb[lang as keyof typeof kb] || kb.en;
        const has = (...words: string[]) => words.some((w) => q.includes(w));
        // Short country codes need word boundaries: "us" is inside "use", "uk" inside other words.
        const country = /\b(us|usa|uk|eu|eea)\b/.test(q) || has('estados unidos', 'ee.uu', 'eeuu', 'europ', 'reino unido', 'united states', 'jurisdic', 'sanction', 'sanción', 'sancion', 'geobloq', 'geoblock', 'país', 'pais', 'country', 'countries');

        // 21-nov-2026 (CB1): "qué es" iba primero y tapaba cualquier tema ("qué es x402" daba la
        // respuesta general). Ahora se busca el tema primero; la respuesta general va al final.
        if (country) return currentKB.jurisdictions;
        if (has('verif', 'receipt', 'recibo', 'audit trail', 'anchor', 'ancla') || /cid/.test(q)) return currentKB.verify;

        // Documentation sub-topics
        if (has('doc', 'guía', 'guide')) {
            if (has('api', 'key')) return currentKB.docs.api;
            if (has('architec', 'arquitec')) return currentKB.docs.architecture;
            if (has('contrat', 'contract', 'soroban')) return currentKB.docs.contracts;
            if (has('report')) return currentKB.docs.reporting;
            if (has('agent', 'node', 'nodo')) return currentKB.docs.agent;
            if (has('build', 'regla', 'visual')) return currentKB.docs.builder;
            if (has('secur', 'segur', 'audit')) return currentKB.docs.security;
            if (has('front', 'react') || /ui/.test(q)) return currentKB.docs.frontend;
            return currentKB.docs.overview;
        }

        if (has('payout', 'payroll', 'nómina', 'nomina', 'dispers', 'disburs', 'contractor', 'contratista', 'batch', 'lote')) return currentKB.payouts;
        if (has('price', 'pricing', 'precio', 'cost', 'cuesta', 'tarifa', 'plans', 'planes')) return currentKB.pricing;
        if (has('límite', 'limite', 'limit', 'rate limit', 'cuota', 'quota', 'por minuto', 'per minute')) return currentKB.limits;
        if (has('marketplace', 'plantilla', 'template')) return currentKB.marketplace;
        if (has('x402', '402', 'mpp', 'charge', 'cobrar', 'per request', 'por request', 'market')) return currentKB.x402;
        if (has('builder', 'schema', 'esquema')) return currentKB.builder;
        if (has('dash', 'panel')) return currentKB.dashboard;
        if (has('treas', 'tesor', 'vault', 'bóveda', 'boveda', 'strat', 'estrat', 'rebal')) return currentKB.treasury;
        if (has('stats', 'estadíst', 'estadist', 'download', 'descarga')) return currentKB.stats;
        if (has('analyt', 'analít', 'analit')) return currentKB.analytics;
        if (has('fiat', 'ramp', 'cetes', 'spei', 'mxn', 'etherfuse')) return currentKB.fiat;
        if (has('mainnet', 'testnet')) return currentKB.jurisdictions;
        if (has('compli', 'cnbv', 'audit')) return currentKB.compliance;
        if (has('dev', 'sdk', 'endpoint', 'mcp')) return currentKB.devs;
        if (has('api', 'key', 'llave')) return currentKB.docs.api;
        if (has('build', 'construir', 'visual')) return currentKB.docs.builder;
        if (has('scf', 'award', 'conducta', 'norma', 'rule', 'conduct')) return currentKB.scf;
        if (has('qué es', 'que es', 'what is', 'nirium')) return currentKB.home;

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
