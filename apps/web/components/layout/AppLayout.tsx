"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, BarChart2,
    Shield, ShieldCheck, Code2, BookOpen,
    Menu, X, ChevronRight, ChevronDown, Activity, Zap, Globe, Mail,
    Cpu, Send, Building2
, KeyRound, Home, FileCheck
} from "lucide-react";
import { useFreighter } from "@/hooks/useFreighter";
import { usePollarBridge } from "@/context/PollarBridge";
import { useLanguage } from "@/context/LanguageContext";
import { useNetwork } from "@/context/NetworkContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Footer from "@/components/layout/Footer";

export function AppSidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();
    const { address, isConnected, connect, disconnect } = useFreighter();
    // 9-nov-2026: el botón del menú lateral abría directo el selector de Stellar
    // Wallets Kit; ahora ofrece lo mismo que el navbar: wallet de navegador o Pollar.
    const pollar = usePollarBridge();
    const activeAddress = address ?? pollar.address;
    const [walletOpen, setWalletOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const { network, setNetwork } = useNetwork();

    const appNav = [
        {
            label: "CORE",
            items: [
                { href: "/",                 label: t.nav.home,        icon: Home,            accent: "#3B82F6" },
                { href: "/verify",           label: t.nav.verifyAudit, icon: FileCheck,       accent: "#10B981" },
                { href: "/dashboard",        label: t.nav.dashboard,   icon: LayoutDashboard, accent: "#2DEBE8" },
                { href: "/analytics",        label: t.nav.analytics,   icon: BarChart2,       accent: "#2DEBE8", badge: "BETA" },
                { href: "/agents",           label: t.nav.agents,      icon: Cpu,             accent: "#FFD700" },
                { href: "/payouts",          label: t.nav.payroll,     icon: Send,            accent: "#2DEBE8" },
                { href: "/security",         label: t.nav.security,    icon: ShieldCheck,     accent: "#10B981" },
                { href: "/compliance",       label: t.nav.compliance,  icon: Shield,          accent: "#2DEBE8" },
                { href: "/stats",            label: t.nav.stats,       icon: Activity,        accent: "#10B981" },
            ]
        },
        {
            label: "TREASURY",
            items: [
                { href: "/treasury",         label: t.nav.treasury,    icon: Building2,       accent: "#3B82F6" },
                { href: "/treasury/vault",   label: t.nav.vault,       icon: ShieldCheck,     accent: "#2DEBE8" },
                { href: "/treasury/builder", label: t.nav.builder,    icon: Zap,             accent: "#A78BFA", badge: "BETA" },
                { href: "/ramp",             label: t.nav.ramp,        icon: Globe,           accent: "#EC4899" },
            ]
        },
        {
            label: "DEVELOPER",
            items: [
                { href: "/docs",             label: t.nav.docs,        icon: BookOpen,        accent: "#8B5CF6" },
                { href: "/developers",       label: t.nav.developers,  icon: Code2,           accent: "#6366F1" },
                { href: "/keys",             label: t.nav.apikeys,     icon: KeyRound,        accent: "#FFD23F" },
            ]
        }
    ];

    return (
        <aside className="w-64 h-full bg-nirium-obsidian border-r border-white/[0.06] flex flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06] shrink-0">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="overflow-hidden flex items-center">
                        <img src="/brand/icon.svg" alt="Nirium" className="h-7 w-auto object-contain" />
                    </div>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden p-1 text-white/30 hover:text-white">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
                {appNav.map((section) => (
                    <div key={section.label}>
                        <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                            {section.label}
                        </p>
                        <ul className="space-y-0.5">
                            {section.items.map(({ href, label, icon: Icon, accent, badge }: { href: string; label: string; icon: any; accent: string; badge?: string }) => {
                                const isActive = pathname === href || (href !== "/" && href !== "/dashboard" && pathname.startsWith(href));
                                return (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                                                isActive
                                                    ? "bg-white/[0.08] text-white"
                                                    : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                                            }`}
                                        >
                                            {isActive && (
                                                <span
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                                                    style={{ background: accent }}
                                                />
                                            )}
                                            <Icon
                                                size={15}
                                                className="shrink-0 transition-colors"
                                                style={isActive ? { color: accent } : {}}
                                            />
                                            <span className="truncate text-[13px]">{label}</span>
                                            {badge && (
                                                <span className="ml-auto text-[8px] font-black px-1.5 py-0.5 rounded border border-white/10 text-white/30 uppercase tracking-widest shrink-0">
                                                    {badge}
                                                </span>
                                            )}
                                            {isActive && !badge && (
                                                <ChevronRight size={12} className="ml-auto text-white/30" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* 9-nov-2026: aquí había una lista de qué corre en cada red. El aviso de red de
                arriba ya lo dice completo (Payouts y Treasury por invitación), así que
                queda solo el selector de red. */}
            <div className="px-3 pb-3 shrink-0">
                <div className="flex flex-col gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    {/* Pasar a mainnet abre la confirmación (la puerta está en
                        NetworkContext, no aquí). */}
                    <div className="flex items-center gap-1">
                        {(['testnet', 'mainnet'] as const).map((n) => {
                            const on = network === n;
                            return (
                                <button
                                    key={n}
                                    onClick={() => setNetwork(n)}
                                    aria-pressed={on}
                                    data-net={n}
                                    className={`net-toggle flex-1 px-2 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest transition-all ${
                                        on
                                            ? n === 'mainnet'
                                                ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                                                : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                                            : 'text-white/35 hover:text-white/70 border border-transparent'
                                    }`}
                                >
                                    {n === 'mainnet' ? 'Main' : 'Test'}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Language + Theme */}
            <div className="px-3 pb-2 shrink-0 flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] group hover:border-white/10 transition-colors">
                    <Globe size={13} className="text-white/30 group-hover:text-white/60 transition-colors" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="flex-1 bg-transparent text-[10px] text-white/50 font-bold focus:outline-none cursor-pointer uppercase tracking-widest"
                    >
                        <option value="en" className="bg-nirium-obsidian text-white">English</option>
                        <option value="es" className="bg-nirium-obsidian text-white">Español</option>
                    </select>
                </div>
                <ThemeToggle />
            </div>

            {/* Wallet - último elemento del panel ahora que el link redundante
                "Inicio" de hasta abajo se quitó (CORE ya lo tiene arriba) */}
            <div className="px-3 pb-6 shrink-0 border-t border-white/[0.06] pt-3">
                {activeAddress ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-stellar-teal/5 border border-stellar-teal/20">
                        <Activity size={13} className="text-stellar-teal shrink-0 animate-pulse" />
                        <span className="text-[10px] font-mono text-white/60 truncate">
                            {activeAddress.slice(0, 6)}…{activeAddress.slice(-4)}
                        </span>
                        <button
                            onClick={() => (isConnected ? disconnect() : pollar.logout())}
                            className="ml-auto text-[9px] text-red-400/60 hover:text-red-400 font-bold uppercase transition-colors"
                        >
                            {t.nav.disconnect.split(' ')[0]}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {walletOpen && (
                            <div className="p-1.5 rounded-xl bg-[#0a0a0a] border border-white/10">
                                <p className="px-2.5 pt-1 pb-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                                    {t.nav.wallet_menu_label}
                                </p>
                                <button
                                    onClick={() => { connect(); setWalletOpen(false); }}
                                    className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left hover:bg-white/5 transition-colors"
                                >
                                    <Zap className="w-3.5 h-3.5 text-white/50 shrink-0" />
                                    <span>
                                        <span className="block text-[12px] font-semibold text-white">{t.nav.wallet_option_browser}</span>
                                        <span className="block text-[10px] text-white/40">{t.nav.wallet_option_browser_hint}</span>
                                    </span>
                                </button>
                                {pollar.available && (
                                    <button
                                        onClick={() => { pollar.openLogin(); setWalletOpen(false); }}
                                        className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left hover:bg-white/5 transition-colors"
                                    >
                                        <Mail className="w-3.5 h-3.5 text-white/50 shrink-0" />
                                        <span>
                                            <span className="block text-[12px] font-semibold text-white">{t.nav.wallet_option_pollar}</span>
                                            <span className="block text-[10px] text-white/40">{t.nav.wallet_option_pollar_hint}</span>
                                        </span>
                                    </button>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() => setWalletOpen((o) => !o)}
                            aria-expanded={walletOpen}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-stellar-yellow text-[#0b0b0b] text-xs font-black uppercase tracking-tight hover:bg-stellar-yellow/90 transition-all active:scale-95"
                        >
                            <Zap size={13} />
                            {t.nav.auth_session}
                            <ChevronDown size={13} className={`transition-transform ${walletOpen ? "rotate-180" : ""}`} />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { t } = useLanguage();

    useEffect(() => {
        setMobileSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Desktop sidebar. --banner-h = altura del aviso de red (TestnetBanner),
                0 si está cerrado; sin sumarla, el aviso tapaba el logo al hacer scroll. */}
            <div className="hidden lg:block w-64 shrink-0 sticky top-[calc(2.25rem_+_var(--banner-h,0px))] h-[calc(100vh_-_36px_-_var(--banner-h,0px))]">
                <AppSidebar />
            </div>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
                            onClick={() => setMobileSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: -256 }}
                            animate={{ x: 0 }}
                            exit={{ x: -256 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-[var(--top-chrome)] bottom-0 left-0 z-40 lg:hidden"
                        >
                            <AppSidebar onClose={() => setMobileSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Content. pt-9 = la barra de mercado (fixed, 2.25rem); el body ya baja
                --banner-h, pero no esa barra, y tapaba el borde de arriba de cada página. */}
            <div className="flex-1 flex flex-col min-w-0 pt-9">
                {/* Mobile top bar */}
                <header className="lg:hidden sticky top-[var(--top-chrome)] z-20 flex items-center gap-3 px-4 py-3 bg-black/90 backdrop-blur-xl border-b border-white/[0.06]">
                    <button
                        onClick={() => setMobileSidebarOpen(true)}
                        className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white transition-colors"
                    >
                        <Menu size={18} />
                    </button>
                    <img src="/brand/icon.svg" alt="Nirium" className="h-7 w-auto object-contain" />
                    <Link href="/" className="ml-auto text-[9px] font-mono text-white/30 hover:text-white transition-colors uppercase tracking-widest">
                        {t.nav.back_to_marketing}
                    </Link>
                </header>

                <main className="flex-1 overflow-auto">
                    {children}
                    <Footer />
                </main>
            </div>
        </div>
    );
}
