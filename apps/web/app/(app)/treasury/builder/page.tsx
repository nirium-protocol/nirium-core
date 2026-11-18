'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Panel,
    Connection,
    Edge,
    ReactFlowProvider,
    Node,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Link from "next/link";
import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";
import { useLanguage } from "@/context/LanguageContext";
import { useNetwork } from "@/context/NetworkContext";
import {
    Plus, Play, Save, Box, Activity, Zap, ArrowRight, Trash2,
    Settings, Search, ZoomIn, ZoomOut, Undo, Redo,
    LayoutGrid, Cpu, History, Clock, Landmark, Coins, Shield, Database,
    Twitter, MessageSquare, Bell, Share2, BarChart3, Fingerprint, Lock, Repeat, RefreshCw,
    Layers, MousePointer2, Info, ChevronRight, Download, Upload, X, Menu, Bolt,
    FlaskConical, KeyRound, TrendingUp, Terminal, Mail, Send, Smartphone, ArrowLeftRight, CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useFreighter } from "@/hooks/useFreighter";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import CustomNode from './CustomNode';

const nodeTypes: any = { niriumNode: CustomNode };

const ICON_MAP: any = {
    Plus, Play, Save, Box, Activity, Zap, ArrowRight, Trash2,
    Settings, Search, ZoomIn, ZoomOut, Undo, Redo,
    LayoutGrid, Cpu, History, Clock, Landmark, Coins, Shield, Database,
    Twitter, MessageSquare, Bell, Share2, BarChart3, Fingerprint, Lock, Repeat, RefreshCw,
    Layers, MousePointer2, Info, ChevronRight, Download, Bolt, FlaskConical, KeyRound, TrendingUp,
    Mail, Send, Smartphone, ArrowLeftRight, CheckSquare
};

const initialNodes: Node[] = [
    {
        id: 'start-0',
        type: 'niriumNode',
        data: { label: 'START', icon: 'Play', type: 'trigger', color: 'from-stellar-teal to-blue-500' },
        position: { x: 100, y: 100 },
    },
];

const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `node_${Date.now()}_${id++}`;

function StrategyBuilderInner() {
    const { t, language } = useLanguage();
    const { network } = useNetwork();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [strategyName, setStrategyName] = useState(t.treasury.header.title);
    const [strategyId, setStrategyId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState<'USDC' | 'CETES'>('USDC');
    const [draggedTemplate, setDraggedTemplate] = useState<any>(null);
    const [dropHint, setDropHint] = useState<{ x: number, y: number, label: string, desc: string, targetNode?: string, position?: 'before' | 'after' } | null>(null);

    const { address: accountStr, isConnected } = useFreighter();
    const account = isConnected ? { address: accountStr, chains: ['stellar:testnet'] } : null;
    const router = useRouter();

    // PALETA RECONSTRUIDA SOBRE LO QUE CORRE (7-ago-2026).
    //
    // Se retiraron cinco bloques, y cuatro no por estar sin construir sino
    // porque contradecían la posición legal que el sitio publica:
    //
    //   SPEI_DEPOSIT     - Nirium no toca fiat, nunca. Es restricción dura.
    //   KYC_VERIFY       - no somos Sujeto Obligado y no hacemos KYC. Ofrecerlo
    //                      es declararse ejecutor de una función regulada.
    //   OFAC_SCREENING   - la política dice, con todas sus letras, que solo se
    //                      screenean las direcciones operativas propias y NUNCA
    //                      usuarios finales, "porque esto no es una institución
    //                      financiera y no debe actuar como una".
    //   SOROSWAP_HEDGE / DEX_SWAP - los swaps se retiraron del nodo de tesorería
    //                      el 6-ago por la fracc. XVI de la LFPIORPI. Seguir
    //                      ofreciéndolos en el lienzo reintroduce el verbo.
    //
    // Ponerlos tras el plan de $299 sería peor, no mejor: pasaría de anunciar
    // una función regulada a cobrarla.
    //
    // Lo que queda es el flujo real de DeFindex, que además es mejor demo.
    const NODE_TEMPLATES = [
        {
            category: t.treasury.sidebar.categories.bank,
            color: 'from-blue-400 to-cyan-500',
            items: [
                { type: 'trigger', label: 'X402_SETTLEMENT', icon: 'Coins' },
                { type: 'trigger', label: 'MPP_CHARGE', icon: 'RefreshCw' },
            ]
        },
        {
            category: t.treasury.sidebar.categories.triggers,
            color: 'from-stellar-teal to-blue-500',
            items: [
                { type: 'trigger', label: 'RATE_THRESHOLD', icon: 'Activity' },
                { type: 'trigger', label: 'IDLE_MINIMUM', icon: 'Database' },
                { type: 'trigger', label: 'SCHEDULE', icon: 'Clock' },
                { type: 'trigger', label: 'BALANCE_CHECK', icon: 'LayoutGrid' },
            ]
        },
        {
            category: t.treasury.sidebar.categories.actions,
            color: 'from-emerald-400 to-green-600',
            items: [
                { type: 'action', label: 'VAULT_DEPLOY', icon: 'Box' },
                { type: 'action', label: 'VAULT_DEPOSIT', icon: 'TrendingUp' },
                { type: 'action', label: 'INVEST', icon: 'Zap' },
                { type: 'action', label: 'UNWIND', icon: 'History' },
                { type: 'action', label: 'MPP_FUNDING', icon: 'Send' },
            ]
        },
        {
            category: t.treasury.sidebar.categories.safety,
            color: 'from-purple-500 to-indigo-600',
            items: [
                { type: 'condition', label: 'CLIENT_SIGNATURE', icon: 'Shield' },
                { type: 'condition', label: 'TEAM_APPROVAL', icon: 'CheckSquare' },
                { type: 'action', label: 'ONCHAIN_AUDIT', icon: 'Fingerprint' },
            ]
        },
        {
            category: t.treasury.sidebar.categories.alerts,
            color: 'from-orange-400 to-rose-500',
            items: [
                { type: 'action', label: 'TELEGRAM_ALERTS', icon: 'Send' },
                { type: 'action', label: 'EMAIL_REPORT', icon: 'Mail' },
            ]
        },
    ];

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setSidebarOpen(false);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#2DEBE8' } }, eds)),
        [setEdges]
    );

    const onDragStart = (event: React.DragEvent, nodeData: any) => {
        setDraggedTemplate(nodeData);
        event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
        event.dataTransfer.effectAllowed = 'move';
        
        // Custom drag ghost
        const ghost = document.createElement('div');
        ghost.style.opacity = '0';
        document.body.appendChild(ghost);
        event.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => document.body.removeChild(ghost), 0);
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';

        if (!draggedTemplate || !reactFlowInstance) return;

        const bounds = reactFlowWrapper.current?.getBoundingClientRect();
        if (!bounds) return;

        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        // Find nearest node
        let nearestNode: Node | null = null;
        let minDistance = 150;

        nodes.forEach(node => {
            const dx = node.position.x - position.x;
            const dy = node.position.y - position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestNode = node;
            }
        });

        if (nearestNode) {
            const isBefore = position.x < (nearestNode as Node).position.x;
            const locNode = t.treasury.nodes[draggedTemplate.label.toLowerCase() as keyof typeof t.treasury.nodes] || { label: draggedTemplate.label, desc: '' };
            
            setDropHint({
                x: event.clientX,
                y: event.clientY,
                label: locNode.label,
                desc: locNode.desc,
                targetNode: (nearestNode as Node).data.label as string,
                position: isBefore ? 'before' : 'after'
            });
        } else {
            const locNode = t.treasury.nodes[draggedTemplate.label.toLowerCase() as keyof typeof t.treasury.nodes] || { label: draggedTemplate.label, desc: '' };
            setDropHint({
                x: event.clientX,
                y: event.clientY,
                label: locNode.label,
                desc: locNode.desc
            });
        }
    }, [draggedTemplate, reactFlowInstance, nodes, t.treasury.nodes]);

    const onAddNode = useCallback((template: any) => {
        let position = { x: 300, y: 300 };
        if (reactFlowInstance) {
            const { x, y, zoom } = reactFlowInstance.getViewport();
            const wrapper = reactFlowWrapper.current?.getBoundingClientRect();
            if (wrapper) {
                position = {
                    x: (wrapper.width / 2 - x) / zoom,
                    y: (wrapper.height / 2 - y) / zoom,
                };
            }
        }
        const newId = getId();
        const newNode: Node = {
            id: newId,
            type: 'niriumNode',
            position,
            data: {
                label: template.label,
                icon: template.icon,
                type: template.type,
                color: NODE_TEMPLATES.find(c => c.items.some(i => i.label === template.label))?.color
            },
        };
        setNodes((nds) => {
            const lastNode = nds[nds.length - 1];
            if (lastNode) {
                setEdges((eds) => {
                    const edgeId = `edge_${lastNode.id}_to_${newId}`;
                    if (eds.some((e) => e.id === edgeId)) return eds;
                    return [
                        ...eds,
                        {
                            id: edgeId,
                            source: lastNode.id,
                            target: newId,
                            animated: true,
                            style: { stroke: '#2DEBE8' }
                        }
                    ];
                });
            }
            return [...nds, newNode];
        });
        toast.success(`${template.label}`);
    }, [reactFlowInstance, setNodes, setEdges]);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            setDraggedTemplate(null);
            setDropHint(null);
            
            const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
            const rawData = event.dataTransfer.getData('application/reactflow');
            if (!rawData || !reactFlowBounds) return;
            const template = JSON.parse(rawData);
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            
            // Find nearest node for connection logic
            let nearestDropNode: Node | null = null;
            let minDistance = 150;
            nodes.forEach(node => {
                const dx = node.position.x - position.x;
                const dy = node.position.y - position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestDropNode = node;
                }
            });

            const newId = getId();
            const newNode: Node = {
                id: newId,
                type: 'niriumNode',
                position,
                data: {
                    label: template.label,
                    icon: template.icon,
                    type: template.type,
                    color: NODE_TEMPLATES.find(c => c.items.some(i => i.label === template.label))?.color
                },
            };
            setNodes((nds) => {
                const lastNode = nearestDropNode || nds[nds.length - 1];
                if (lastNode) {
                    setEdges((eds) => {
                        const edgeId = `edge_${lastNode.id}_to_${newId}`;
                        if (eds.some((e) => e.id === edgeId)) return eds;
                        return [
                            ...eds,
                            {
                                id: edgeId,
                                source: lastNode.id,
                                target: newId,
                                animated: true,
                                style: { stroke: '#2DEBE8' }
                            }
                        ];
                    });
                }
                return [...nds, newNode];
            });
        },
        [reactFlowInstance, setNodes, setEdges, nodes]
    );

    // ─── Borradores: solo en este navegador (8-nov-2026) ───────────────────
    // Antes se escribían también en la tabla nirium_protocol_records, cuya política
    // es "Allow all for anon": cualquiera con la llave pública (va en el sitio) podía
    // leer, cambiar o borrar los borradores de cualquier wallet. Nada ejecuta estos
    // diagramas, así que no hace falta una tabla: se guardan aquí y se respaldan con
    // Exportar / Importar. No pide wallet: el dibujo vive en el navegador de quien lo hizo.
    const DRAFTS_KEY = 'nirium-builder-drafts';
    const readDrafts = (): any[] => {
        try {
            const own = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
            // Borradores viejos guardados por wallet: se siguen mostrando para no perderlos.
            const legacy = account?.address
                ? JSON.parse(localStorage.getItem(`nirium-fleet-${account.address}`) || '[]')
                    .filter((d: any) => d?.config?.nodes)
                : [];
            const seen = new Set<string>();
            return [...(Array.isArray(own) ? own : []), ...legacy].filter((d: any) => {
                const k = d?.id || d?.strategy_id;
                if (!k || seen.has(k)) return false;
                seen.add(k);
                return true;
            });
        } catch { return []; }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const flow = reactFlowInstance.toObject();
            const sid = strategyId || `custom-${Date.now()}`;
            if (!strategyId) setStrategyId(sid);
            const draft = {
                id: sid,
                strategy_id: sid,
                name: strategyName,
                emoji: '🏗️',
                status: 'DRAFT',
                rate: '-',
                asset: selectedAsset,
                created_at: new Date().toISOString(),
                config: flow,
            };
            const own = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
            const rest = (Array.isArray(own) ? own : []).filter((d: any) => d.id !== sid);
            localStorage.setItem(DRAFTS_KEY, JSON.stringify([draft, ...rest].slice(0, 50)));
            toast.success(language === 'es'
                ? 'Guardado en este navegador. Usa Exportar para tener una copia.'
                : 'Saved in this browser. Use Export to keep a copy.');
            fetchHistory();
        } catch {
            toast.error(t.toasts.broadcast_failed);
        } finally {
            setIsSaving(false);
        }
    };

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        setHistory(readDrafts());
        setIsLoadingHistory(false);
    };

    const handleExport = () => {
        if (!reactFlowInstance) return;
        const flow = reactFlowInstance.toObject();
        const schema = {
            version: '0.0.7',
            exported_at: new Date().toISOString(),
            kernel_name: strategyName,
            kernel_id: strategyId || `custom-${Date.now()}`,
            asset: selectedAsset,
            node_count: flow.nodes?.length || 0,
            edge_count: flow.edges?.length || 0,
            flow,
        };
        const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${strategyName.toLowerCase().replace(/\s+/g, '_')}_kernel.json`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(t.marketplace.custom_builder.export);
    };

    // Lee un archivo hecho con Exportar. Solo acepta la forma que Exportar produce;
    // cualquier otra cosa se rechaza con un mensaje, no se intenta adivinar.
    const importInputRef = useRef<HTMLInputElement>(null);
    const handleImport = async (file: File) => {
        try {
            const schema = JSON.parse(await file.text());
            const flow = schema?.flow;
            if (!flow || !Array.isArray(flow.nodes) || !Array.isArray(flow.edges)) throw new Error('shape');
            setNodes(flow.nodes);
            setEdges(flow.edges);
            if (typeof schema.kernel_name === 'string') setStrategyName(schema.kernel_name);
            if (typeof schema.kernel_id === 'string') setStrategyId(schema.kernel_id);
            if (schema.asset === 'USDC' || schema.asset === 'CETES') setSelectedAsset(schema.asset);
            setTimeout(() => { reactFlowInstance?.fitView({ duration: 800 }); }, 100);
            toast.success(language === 'es' ? 'Esquema importado.' : 'Schema imported.');
        } catch {
            toast.error(language === 'es'
                ? 'Ese archivo no es un esquema exportado desde aquí.'
                : 'That file is not a schema exported from here.');
        }
    };

    // "Publicar" se quitó el 8-nov-2026: subía el diagrama por /api/pinata (abierto,
    // sin login ni límite) y lo listaba en un mercado de estrategias de testnet con
    // suscripción de 1 USDC. El contrato tenía 0 estrategias publicadas, y vender
    // estrategias por suscripción roza la asesoría de inversión que la política dice
    // que no damos.

    const loadKernel = (strat: any) => {
        if (strat.config && strat.config.nodes) {
            setNodes(strat.config.nodes || []);
            setEdges(strat.config.edges || []);
            setStrategyName(strat.name);
            setStrategyId(strat.strategy_id || strat.id);
            if (strat.asset === 'USDC' || strat.asset === 'CETES') setSelectedAsset(strat.asset);
            setShowHistory(false);
            toast.success(strat.name);
            setTimeout(() => { reactFlowInstance?.fitView({ duration: 800 }); }, 100);
        }
    };

    if (!mounted) return null;

    const filteredTemplates = NODE_TEMPLATES.map(cat => ({
        ...cat,
        items: cat.items.filter(i => {
            const loc = t.treasury.nodes[i.label.toLowerCase() as keyof typeof t.treasury.nodes] || { label: i.label };
            return loc.label.toLowerCase().includes(searchQuery.toLowerCase());
        })
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="flex-1 flex overflow-hidden relative">
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 z-[55] lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!sidebarOpen && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden absolute top-6 left-4 sm:left-6 z-50 bg-[#121212]/90 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-stellar-teal hover:border-stellar-teal/50 shadow-[0_0_20px_rgba(45,235,232,0.2)] transition-all"
                    >
                        <Menu size={18} className="sm:w-5 sm:h-5" />
                    </motion.button>
                )}
            </AnimatePresence>

            <aside className={`
                ${sidebarOpen ? 'translate-x-0 shadow-[0_0_40px_rgba(0,0,0,0.8)]' : '-translate-x-full'}
                fixed lg:relative lg:translate-x-0
                w-full sm:w-80 h-full bg-[#0d0d0d] border-r border-white/5 flex flex-col z-[60] lg:z-40
                transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            `}>
                <div className="p-3 pt-2 sm:pt-3 border-b border-white/5 space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-end lg:hidden">
                        <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">{t.treasury.sidebar.asset_selector}</label>
                        <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setSelectedAsset('USDC')}
                                className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${selectedAsset === 'USDC'
                                    ? 'bg-stellar-teal/10 text-stellar-teal border border-stellar-teal/30 shadow-[0_0_15px_rgba(45,235,232,0.2)]'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                USDC
                            </button>
                            <button
                                onClick={() => setSelectedAsset('CETES')}
                                className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${selectedAsset === 'CETES'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                CETES
                            </button>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-stellar-teal/5 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <Search className="absolute left-3 top-2.5 text-gray-700 group-focus-within:text-stellar-teal transition-colors" size={12} />
                        <input
                            type="text"
                            placeholder={t.treasury.sidebar.search_placeholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#151515] border border-white/5 rounded-xl pl-9 pr-3 py-2.5 text-[11px] text-white focus:outline-none focus:border-stellar-teal/30 focus:ring-1 focus:ring-stellar-teal/20 transition-all font-mono placeholder:text-gray-800"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-6">
                    {filteredTemplates.map((category, idx) => (
                        <div key={idx} className="space-y-3">
                            <div className="flex items-center justify-between group-hover:opacity-100 transition-opacity">
                                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                                    {category.category}
                                </h3>
                                <div className={`h-px flex-1 ml-4 bg-gradient-to-r ${category.color} to-transparent opacity-20`}></div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {category.items.map((item, i) => {
                                    const locNode = t.treasury.nodes[item.label.toLowerCase() as keyof typeof t.treasury.nodes] || { label: item.label, desc: '' };
                                    return (
                                        <div
                                            key={i}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, item)}
                                            className="relative group p-3.5 bg-[#121212] border border-white/5 rounded-2xl cursor-grab active:cursor-grabbing hover:border-white/20 hover:bg-[#161616] transition-all overflow-hidden"
                                        >
                                            <div className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b ${category.color} opacity-30 group-hover:opacity-100 transition-opacity`}></div>
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 group-hover:text-white transition-colors">
                                                    {ICON_MAP[item.icon] ? React.createElement(ICON_MAP[item.icon], { size: 16 }) : <Box size={16} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[11px] font-black text-white uppercase tracking-tight font-mono mb-0.5">{locNode.label}</div>
                                                    <div className="text-[9px] text-gray-600 uppercase font-mono leading-tight">{locNode.desc}</div>
                                                </div>
                                                <button
                                                    onClick={() => onAddNode(item)}
                                                    className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-stellar-teal hover:bg-stellar-teal/10 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-6 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hover:text-white transition-colors border-t border-white/5 flex items-center justify-center gap-2 group"
                >
                    {t.treasury.sidebar.collapse} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </aside>

            <div className="flex-1 relative bg-[#080808]" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                    colorMode="dark"
                    snapToGrid
                    snapGrid={[20, 20]}
                >
                    <Background variant={BackgroundVariant.Lines} color="#151515" gap={40} size={1} />
                    <Controls className="!bg-[#121212] !border-white/10 !rounded-xl !shadow-2xl overflow-hidden" showInteractive={false} />

                    <Panel position="top-left" className={`
                        transition-all duration-500 pt-3 sm:pt-4
                        ${sidebarOpen ? '!ml-4' : '!ml-[4.5rem] sm:!ml-24'}
                    `}>
                        <div className="bg-[#121212]/90 backdrop-blur-xl border border-white/10 p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center gap-3 sm:gap-4 max-w-[calc(100vw_-_9.5rem)] sm:max-w-[min(560px,36vw)] overflow-hidden">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-stellar-teal/10 border border-stellar-teal/20 flex items-center justify-center text-stellar-teal shadow-inner shrink-0">
                                <Cpu size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="inline-flex items-start sm:items-center gap-1.5 px-2 py-1 sm:py-0.5 mb-1.5 bg-stellar-yellow/10 border border-stellar-yellow/20 rounded-lg sm:rounded-full text-stellar-yellow text-[8px] leading-tight font-black uppercase tracking-wider sm:tracking-widest">
                                    <Clock className="w-2.5 h-2.5 shrink-0 mt-px sm:mt-0" />
                                    {/* Nada lee este diagrama: el agente decide con los umbrales de la bóveda
                                        (REBALANCE_VAULTS / rebalanceDecision.ts), no con lo que se dibuja aquí. */}
                                    <span>{language === "es" ? "VISTA PREVIA · NO SE EJECUTA: EL AGENTE USA LOS UMBRALES DE TU BÓVEDA" : "PREVIEW · NOT EXECUTED: THE AGENT USES YOUR VAULT'S THRESHOLDS"}</span>
                                </div>
                                <input
                                    value={strategyName}
                                    onChange={(e) => setStrategyName(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none font-black text-sm sm:text-xl tracking-tighter text-white uppercase font-mono italic w-full truncate"
                                />
                                {/* 8-nov-2026: se quitaron "OPERATIVO" (con punto pulsante) y "Ética
                                    alineada". El lienzo no corre nada; eran decorado con forma de estado. */}
                            </div>
                        </div>
                    </Panel>

                    {/* Apilado hasta 2xl: en pantallas medianas (sidebar del sitio
                        + paleta del builder abiertos) los tres botones en fila no
                        caben junto a la tarjeta del esquema y el último se corta. */}
                    <Panel position="top-right" className="pt-3 sm:pt-4 flex flex-col 2xl:flex-row gap-2 sm:gap-3 items-end 2xl:items-center">
                        <button
                            onClick={() => handleSave()}
                            disabled={isSaving}
                            aria-label={t.treasury.controls.save_draft}
                            title={t.treasury.controls.save_draft}
                            className="bg-[#121212]/90 backdrop-blur-xl border border-white/10 px-3 sm:px-6 py-2 sm:py-3.5 rounded-lg sm:rounded-2xl font-mono text-[8px] sm:text-[10px] font-black tracking-[0.1em] sm:tracking-[0.25em] text-gray-500 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 sm:gap-3 shadow-2xl active:scale-95"
                        >
                            {/* En celular solo el ícono: el texto se montaba sobre la tarjeta del esquema. */}
                            <Save size={14} className="sm:w-4 sm:h-4" /> <span className="hidden xl:inline">{t.treasury.controls.save_draft}</span>
                        </button>
                        {/* "EJECUTAR" (8-nov-2026) no ejecutaba nada y "PUBLICAR" se quitó:
                            ver el comentario junto a handleImport. */}
                    </Panel>

                    <Panel position="bottom-right" className="flex flex-col gap-2 sm:gap-3 mb-12 sm:mb-0">
                        <button onClick={() => { fetchHistory(); setShowHistory(true); }} className="w-10 h-10 sm:w-14 sm:h-14 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-500 hover:text-stellar-teal hover:border-stellar-teal/30 shadow-2xl transition-all hover:scale-110 active:scale-90 group relative">
                            <History size={16} className="sm:w-5 sm:h-5" />
                            <span className="absolute right-full mr-4 bg-black text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest hidden sm:block">{t.treasury.controls.history_tooltip}</span>
                        </button>
                        <input
                            ref={importInputRef}
                            type="file"
                            accept="application/json,.json"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ''; }}
                        />
                        <button onClick={() => importInputRef.current?.click()} className="w-10 h-10 sm:w-14 sm:h-14 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-500 hover:text-white shadow-2xl transition-all hover:scale-110 active:scale-90 group relative">
                            <Upload size={16} className="sm:w-5 sm:h-5" />
                            <span className="absolute right-full mr-4 bg-black text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest hidden sm:block">{language === 'es' ? 'Importar' : 'Import'}</span>
                        </button>
                        <button onClick={handleExport} className="w-10 h-10 sm:w-14 sm:h-14 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-500 hover:text-white shadow-2xl transition-all hover:scale-110 active:scale-90 group relative">
                            <Download size={16} className="sm:w-5 sm:h-5" />
                            <span className="absolute right-full mr-4 bg-black text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest hidden sm:block">{t.treasury.controls.export_tooltip}</span>
                        </button>
                    </Panel>
                </ReactFlow>

                <AnimatePresence>
                    {dropHint && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            style={{ 
                                position: 'fixed',
                                left: dropHint.x + 24,
                                top: dropHint.y + 24,
                                pointerEvents: 'none',
                                zIndex: 9999
                            }}
                            className="bg-black/95 backdrop-blur-3xl border border-stellar-teal/30 p-6 rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,1),0_0_50px_rgba(45,235,232,0.15)] w-80 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-stellar-teal/5 blur-3xl rounded-full -mr-16 -mt-16" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-stellar-teal/10 border border-stellar-teal/20 rounded-2xl shadow-inner transform -rotate-12">
                                        <MousePointer2 className="w-6 h-6 text-stellar-teal" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-black text-stellar-teal uppercase tracking-[0.3em] mb-0.5">{t.treasury.controls?.creating}</div>
                                        <div className="text-base font-black text-white uppercase tracking-tighter truncate font-mono italic">{dropHint.label}</div>
                                    </div>
                                </div>
                                
                                <p className="text-[11px] text-gray-400 mb-5 leading-relaxed font-medium italic opacity-80">
                                    "{dropHint.desc}"
                                </p>

                                {dropHint.targetNode ? (
                                    <div className="pt-8 border-t border-white/5 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-stellar-yellow rounded-full animate-ping" />
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                                {t.treasury.controls?.logic_mapping}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                                            <div className="text-[11px] text-white leading-snug">
                                                {dropHint.position === 'before' ? (
                                                    <>{t.treasury.controls?.place_before.replace('{node}', '')} <span className="text-stellar-teal font-black underline decoration-stellar-teal/30 underline-offset-4">BEFORE</span> node <span className="text-white font-mono font-black italic">{dropHint.targetNode}</span></>
                                                ) : (
                                                    <>{t.treasury.controls?.place_after.replace('{node}', '')} <span className="text-stellar-yellow font-black underline decoration-stellar-yellow/30 underline-offset-4">AFTER</span> node <span className="text-white font-mono font-black italic">{dropHint.targetNode}</span></>
                                                )}
                                            </div>
                                            <div className="text-[9px] text-gray-500 mt-2 font-mono uppercase tracking-tighter">
                                                {dropHint.position === 'before' ? 
                                                    t.treasury.controls?.pre_executes : 
                                                    t.treasury.controls?.awaiting_output}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] text-gray-500 font-mono italic">
                                        <div className="w-2 h-2 bg-gray-700 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                                        {t.treasury.controls?.drop_hint}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showHistory && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0d0d0d] border-l border-white/5 z-[101] flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]"
                        >
                            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-stellar-teal/5 to-transparent flex items-center justify-between">
                                <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">{t.treasury.history.title}</h2>
                                <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"><X size={24} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                {isLoadingHistory ? (
                                    <div className="flex flex-col items-center justify-center h-40 space-y-4">
                                        <div className="w-8 h-8 border-2 border-stellar-teal/20 border-t-stellar-teal rounded-full animate-spin" />
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{t.treasury.history.loading}</p>
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <p className="text-xs font-black text-gray-600 uppercase tracking-widest leading-relaxed">{t.treasury.history.empty}</p>
                                    </div>
                                ) : history.map((strat, i) => (
                                    <button
                                        key={strat.id || i}
                                        onClick={() => loadKernel(strat)}
                                        className="w-full p-6 bg-[#121212] border border-white/5 rounded-[2rem] hover:border-stellar-teal/30 hover:bg-[#161616] transition-all flex items-center gap-5 group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-stellar-teal/10 text-stellar-teal text-[8px] font-black uppercase tracking-tighter rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity">{t.treasury.history.deploy_hub}</div>
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
                                            {strat.emoji || '🤖'}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="text-sm font-black text-white truncate uppercase mb-1.5 tracking-tight group-hover:text-stellar-teal transition-colors font-mono">{strat.name}</div>
                                            <div className="flex items-center gap-3 text-[10px] font-black font-mono text-gray-600 uppercase tracking-tighter">
                                                <span className="text-white/80">{strat.asset}</span>
                                                <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
                                                <span className="text-stellar-teal font-black">{strat.rate || strat.yield || '-'} {t.treasury.history.rate}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-800 group-hover:text-stellar-teal transition-transform group-hover:translate-x-1" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function StrategyBuilderPro() {
    const { t } = useLanguage();

    return (
        // w-full, no w-screen: la página vive dentro de AppLayout, que ya resta
        // el sidebar de 256px; 100vw empujaba los botones de la derecha fuera
        // de la pantalla. La altura deja aire para el TestnetBanner (no es
        // fixed) y para la barra superior en móvil, así la tarjeta de abajo y
        // los controles de zoom no quedan cortados.
        // 9-nov-2026: AppLayout ya baja la barra de mercado (pt-9) y el body baja el
        // aviso de red, así que el espaciador h-9 de aquí sobraba y dejaba un hueco.
        // La altura resta barra (2.25rem), aviso (--banner-h) y, en móvil, la barra
        // superior del layout (3.75rem).
        <main className="h-[calc(100dvh_-_var(--top-chrome)_-_3.75rem)] lg:h-[calc(100dvh_-_2.25rem_-_var(--banner-h,0px))] min-h-[560px] w-full bg-black text-white flex flex-col font-sans selection:bg-stellar-teal/30 overflow-hidden">

            {/* Growth plan preview banner */}
            <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2 bg-stellar-yellow/10 border-b border-stellar-yellow/20">
                <div className="flex items-center gap-2 text-xs text-stellar-yellow">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>
                        {t.strategy_builder.upgrade_banner.preview}
                    </span>
                </div>
                <Link
                    href="/pricing"
                    className="shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#0b0b0b] bg-stellar-yellow px-2.5 py-1 rounded-full hover:bg-stellar-yellow/90 transition-colors"
                >
                    {t.strategy_builder.upgrade_banner.upgrade}
                    <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                <ReactFlowProvider>
                    <StrategyBuilderInner />
                </ReactFlowProvider>

                {/* Bottom fade + upgrade card - blocks "run in production" affordance */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-transparent z-50" />
                <div className="absolute bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto z-50 w-max max-w-[calc(100vw-2rem)]">
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-stellar-yellow/30 bg-[#080808]/90 backdrop-blur-md shadow-[0_0_30px_rgba(255,200,0,0.1)]">
                        <Lock className="w-4 h-4 text-stellar-yellow shrink-0" />
                        <span className="text-xs text-white/70">
                            {t.strategy_builder.deploy_gate.title}
                        </span>
                        <Link
                            href="/pricing"
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0b0b0b] bg-stellar-yellow px-3 py-1.5 rounded-full hover:bg-stellar-yellow/90 transition-colors"
                        >
                            {t.strategy_builder.deploy_gate.plan}
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
