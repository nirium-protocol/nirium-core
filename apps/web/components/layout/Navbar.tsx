"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFreighter } from "@/hooks/useFreighter";
import {
    Menu, X, Zap, Shield, Activity,
    LogOut, CreditCard, Building2, Code2, ArrowUpRight, Newspaper, KeyRound, Mail,
    ChevronDown, Send, ShieldCheck, Cpu, Network, FileCheck, BookOpen
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { useNetwork } from "../../context/NetworkContext";
import { usePollarBridge } from "../../context/PollarBridge";
import { Globe, Home } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Navbar() {
    const pathname = usePathname();
    const { address, isConnected, connect, disconnect } = useFreighter();
    const pollar = usePollarBridge();
    // La identidad es la dirección, no la wallet: cualquiera de las dos puertas
    // sirve para las pantallas que solo necesitan saber quién eres.
    const activeAddress = address ?? pollar.address;
    const hasIdentity = !!activeAddress;
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProductOpen, setIsProductOpen] = useState(false);
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const [isMobileWalletOpen, setIsMobileWalletOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const { network, setNetwork } = useNetwork();

    const handleScroll = useCallback(() => { setIsScrolled(window.scrollY > 20); }, []);

    // 15-nov-2026: con el menú móvil abierto, el botón flotante del chat (fixed,
    // abajo a la derecha) quedaba encima del menú y tapaba opciones como
    // "Vault Console" y "Launch app". Se marca <html data-mobile-menu="open">
    // y globals.css esconde el chat mientras tanto. En desktop el menú móvil
    // no existe, así que nada cambia ahí.
    useEffect(() => {
        const root = document.documentElement;
        if (isMobileMenuOpen) root.dataset.mobileMenu = "open";
        else delete root.dataset.mobileMenu;
        return () => { delete root.dataset.mobileMenu; };
    }, [isMobileMenuOpen]);
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // Marketing nav - mismas 3 categorías que el sidebar de la app (CORE /
    // TREASURY / DEVELOPER), para que quien entra por la home y quien entra
    // por la app tengan el mismo mapa mental del producto. Precios y Blog
    // no tienen equivalente en la app (son marketing-only) y quedan aparte.
    // Logo → / | "Launch app" → /dashboard
    const productGroups = [
        {
            label: t.nav.group_core,
            items: [
                { name: t.nav.agents,     href: "/agents",     icon: Cpu },
                { name: t.nav.payroll,    href: "/payouts",    icon: Send },
                { name: t.nav.security,   href: "/security",   icon: ShieldCheck },
                { name: t.nav.compliance, href: "/compliance", icon: Shield },
                { name: t.nav.ecosystem,  href: "/ecosystem",  icon: Network },
            ],
        },
        {
            label: t.nav.group_treasury,
            items: [
                { name: t.nav.treasury, href: "/treasury",         icon: Building2 },
                { name: t.nav.vault,    href: "/treasury/vault",   icon: ShieldCheck },
                { name: t.nav.builder,  href: "/treasury/builder", icon: Zap },
                { name: t.nav.ramp,     href: "/ramp",             icon: Globe },
            ],
        },
        {
            label: t.nav.group_developer,
            items: [
                { name: t.nav.docs,       href: "/docs",       icon: Newspaper },
                { name: t.nav.developers, href: "/developers", icon: Code2 },
                { name: t.nav.api,        href: "/keys",       icon: KeyRound },
                { name: t.nav.verifyAudit, href: "/verify",    icon: FileCheck },
            ],
        },
    ];
    const productHrefs = productGroups.flatMap(g => g.items.map(i => i.href));
    const isProductActive = productHrefs.some(href => pathname === href || pathname.startsWith(href + "/"));

    const navLinks = [
        { name: t.nav.home,    href: "/"        },
        { name: t.nav.build,   href: "/build"   },
        { name: t.nav.pricing, href: "/pricing" },
        { name: t.nav.blog,    href: "/blog"    },
    ];

    return (
        <nav className={`fixed left-0 right-0 z-[100] transition-all duration-500 ${isScrolled
            // Dropping backdrop-blur-2xl here while the mobile menu is open: filter/
            // backdrop-filter on this element makes it a new containing block for its
            // fixed-position children (the mobile menu panel below), and nesting that
            // panel's own backdrop-blur-3xl inside it renders see-through on mobile
            // Safari/Chrome once the page is scrolled. bg-black/95 alone is solid
            // enough; the blur only matters while the menu is closed.
            // --banner-h la fija TestnetBanner con su altura real (0 si está cerrado),
            // para que el menú quede debajo del aviso en vez de taparlo.
            ? `top-[var(--top-chrome)] py-2 bg-black/95 border-b border-white/5 ${isMobileMenuOpen ? "" : "backdrop-blur-2xl"}`
            : "top-[var(--top-chrome)] sm:top-[calc(var(--top-chrome)_+_8px)] px-0 sm:px-4 py-2 bg-transparent"
        }`}>
            <div className={`relative z-[60] max-w-[1600px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-500 ${
                !isScrolled ? "bg-black/50 sm:rounded-2xl border border-white/5 sm:border-white/10 backdrop-blur-md py-3 sm:py-4" : ""
            }`}>

                {/* ── Logo ── */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <div className="relative">
                        <div className="absolute inset-0 bg-stellar-teal/10 blur-xl rounded-full group-hover:bg-stellar-teal/30 transition-all" />
                        <div className="relative bg-transparent transition-all group-hover:scale-105 overflow-hidden w-14 xs:w-20 sm:w-28 h-8 xs:h-10 sm:h-12 flex items-center justify-center">
                            <img src="/brand/icon.svg" alt="Nirium" className="w-full h-full object-contain" />
                        </div>
                    </div>
                </Link>

                {/* ── Desktop nav - full labels (xl+) ── */}
                <div className="hidden xl:flex items-center gap-1 mx-4">
                    <Link
                        href="/"
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all ${
                            pathname === "/"
                                ? "text-white bg-white/8 border border-white/10"
                                : "text-white/50 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        {t.nav.home}
                    </Link>

                    {/* Product - mismas 3 categorías del sidebar de la app */}
                    <div
                        className="relative"
                        onMouseEnter={() => setIsProductOpen(true)}
                        onMouseLeave={() => setIsProductOpen(false)}
                    >
                        <button
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all ${
                                isProductActive
                                    ? "text-white bg-white/8 border border-white/10"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {t.nav.product_menu}
                            <ChevronDown className={`w-3 h-3 transition-transform ${isProductOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                            {isProductOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 4 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-0 top-full pt-2 w-[560px]"
                                >
                                    <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-black/95 border border-white/10 backdrop-blur-2xl shadow-2xl">
                                        {productGroups.map((group) => (
                                            <div key={group.label}>
                                                <p className="px-2 mb-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                                                    {group.label}
                                                </p>
                                                <ul className="space-y-0.5">
                                                    {group.items.map(({ href, name, icon: Icon }) => (
                                                        <li key={href}>
                                                            <Link
                                                                href={href}
                                                                onClick={() => setIsProductOpen(false)}
                                                                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                                                                    pathname === href
                                                                        ? "text-white bg-white/8"
                                                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                                                }`}
                                                            >
                                                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                                                <span className="truncate">{name}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {navLinks.slice(1).map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all ${
                                    isActive
                                        ? "text-white bg-white/8 border border-white/10"
                                        : "text-white/50 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* ── Desktop nav - icons only (lg-xl) ── */}
                <div className="hidden lg:flex xl:hidden items-center gap-1 mx-2">
                    {[
                        { href: "/",           Icon: Home,       name: t.nav.home       },
                        { href: "/developers", Icon: Code2,      name: t.nav.developers },
                        { href: "/docs",       Icon: Newspaper,  name: t.nav.docs       },
                        { href: "/treasury",   Icon: Building2,  name: t.nav.treasury   },
                        { href: "/keys",       Icon: KeyRound,   name: t.nav.api        },
                        { href: "/pricing",    Icon: CreditCard, name: t.nav.pricing    },
                        // Docs ya usa Newspaper; en este tamaño solo hay íconos,
                        // así que el Blog necesita uno propio para distinguirse.
                        { href: "/blog",       Icon: BookOpen,   name: t.nav.blog       },
                    ].map(({ href, Icon, name }) => (
                        <Link
                            key={href}
                            href={href}
                            title={name}
                            className={`p-2 rounded-lg transition-all ${
                                pathname === href
                                    ? "text-white bg-white/8"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                        </Link>
                    ))}
                </div>

                {/* ── Right actions ── */}
                <div className="flex items-center gap-2 sm:gap-3">

                    {/* Language */}
                    <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 hover:bg-white/[0.06] transition-colors">
                        <Globe className="hidden xs:block w-3 h-3 text-white/30" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="bg-transparent text-[9px] sm:text-[10px] text-white/50 font-bold focus:outline-none cursor-pointer uppercase tracking-tight"
                        >
                            <option value="en" className="bg-[#0A0A0A] text-white">EN</option>
                            <option value="es" className="bg-[#0A0A0A] text-white">ES</option>
                        </select>
                    </div>

                    {/* Network Switcher */}
                    <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-lg p-1 hover:bg-white/[0.06] transition-colors select-none">
                        <button
                            onClick={() => setNetwork("testnet")}
                            className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold tracking-wider uppercase transition-all ${
                                network === "testnet"
                                    ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                                    : "text-white/40 hover:text-white/70"
                            }`}
                        >
                            Test
                        </button>
                        <button
                            onClick={() => setNetwork("mainnet")}
                            className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold tracking-wider uppercase transition-all ${
                                network === "mainnet"
                                    ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/30"
                                    : "text-white/40 hover:text-white/70"
                            }`}
                        >
                            Main
                        </button>
                    </div>

                    {/* 9-nov-2026: aquí iba el botón "AI Sovereignty" (AISettingsModal).
                        Para un visitante nunca guardaba nada (la ruta exige admin), pedía
                        llaves de API de terceros y sugería que el usuario elige la IA del
                        protocolo, cuando el rebalanceador de mainnet no usa IA. Quitado. */}

                    {/* Wallet - dos puertas: Freighter (extensión) o Pollar (cuenta) */}
                    {hasIdentity ? (
                        <div className="hidden sm:flex h-8 items-center gap-1.5 pl-3 pr-1 bg-white/[0.03] border border-white/10 rounded-full">
                            <Activity className="w-2.5 h-2.5 text-stellar-teal animate-pulse" />
                            <span className="text-[10px] font-mono font-bold text-white/70">
                                {activeAddress?.slice(0, 4)}<span className="text-white/20">…</span>{activeAddress?.slice(-4)}
                            </span>
                            <button
                                onClick={() => (isConnected ? disconnect() : pollar.logout())}
                                className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
                                title={t.nav.disconnect}
                            >
                                <LogOut className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        // 9-nov-2026: antes eran dos botones sueltos (Freighter y Pollar),
                        // que se leían como dos formas distintas de entrar al sitio
                        // (reportado por Oscar/Pollar). Siguen siendo dos integraciones
                        // separadas por dentro - fusionarlas de verdad choca con que
                        // StellarWalletsKit es un singleton global que useFreighter.ts ya
                        // inicializa fijo en testnet, y pisarlo arriesgaría la red de firma
                        // de todo el sitio. Lo que cambia aquí es solo la presentación: un
                        // botón que abre un menú con las dos opciones adentro.
                        <div
                            className="hidden sm:block relative"
                            onMouseEnter={() => setIsWalletOpen(true)}
                            onMouseLeave={() => setIsWalletOpen(false)}
                        >
                            <button
                                className="flex items-center gap-1.5 h-8 px-3 sm:px-4 bg-white/[0.03] text-white/60 border border-white/10 rounded-full text-[10px] font-bold hover:bg-white/[0.06] hover:text-white transition-all uppercase tracking-tight"
                            >
                                <Zap className="w-3 h-3" />
                                {t.nav.login_session}
                                <ChevronDown className={`w-3 h-3 transition-transform ${isWalletOpen ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {isWalletOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full pt-2 w-64"
                                    >
                                        <div className="p-1.5 rounded-2xl bg-black/95 border border-white/10 backdrop-blur-2xl shadow-2xl">
                                            <p className="px-3 pt-1.5 pb-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                                                {t.nav.wallet_menu_label}
                                            </p>
                                            <button
                                                onClick={() => { connect(); setIsWalletOpen(false); }}
                                                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-left hover:bg-white/5 transition-colors"
                                            >
                                                <Zap className="w-3.5 h-3.5 text-white/50 shrink-0" />
                                                <span>
                                                    <span className="block text-[12px] font-semibold text-white">{t.nav.wallet_option_browser}</span>
                                                    <span className="block text-[10px] text-white/40">{t.nav.wallet_option_browser_hint}</span>
                                                </span>
                                            </button>
                                            {pollar.available && (
                                                <button
                                                    onClick={() => { pollar.openLogin(); setIsWalletOpen(false); }}
                                                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-left hover:bg-white/5 transition-colors"
                                                >
                                                    <Mail className="w-3.5 h-3.5 text-white/50 shrink-0" />
                                                    <span>
                                                        <span className="block text-[12px] font-semibold text-white">{t.nav.wallet_option_pollar}</span>
                                                        <span className="block text-[10px] text-white/40">{t.nav.wallet_option_pollar_hint}</span>
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* ── Launch app - primary CTA ── */}
                    <Link
                        href="/dashboard"
                        className="hidden sm:flex items-center gap-1.5 h-8 sm:h-9 px-4 sm:px-5 bg-white text-black text-[10px] sm:text-[11px] font-bold rounded-full hover:bg-stellar-yellow transition-all uppercase tracking-tight shadow-[0_4px_16px_rgba(255,255,255,0.12)]"
                    >
                        {t.nav.launch_app}
                        <ArrowUpRight className="w-3 h-3" />
                    </Link>

                    {/* Theme toggle - desktop + mobile */}
                    <ThemeToggle className="!w-8 !h-8" />

                    {/* Mobile toggle */}
                    <button
                        className="lg:hidden p-1.5 text-white/40 hover:text-white transition-colors shrink-0 relative z-[200]"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen
                            ? (language === "es" ? "Cerrar menú" : "Close menu")
                            : (language === "es" ? "Abrir menú" : "Open menu")}
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* ── Mobile menu ── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    // 9-nov-2026: entraba con opacity 0 -> 1 y fondo bg-black/98 +
                    // backdrop-blur-3xl; mientras corría la animación y el navegador
                    // aplicaba el blur, se veía la página detrás. Ahora el fondo es
                    // sólido y solo se desliza, sin desvanecerse.
                    <motion.div
                        initial={{ y: -8 }}
                        animate={{ y: 0 }}
                        exit={{ y: -8, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        // El panel es fixed: sin tope de altura ni scroll propio, en
                        // teléfonos chicos (320x568) se corta en "Blog" y todo lo de
                        // abajo - Launch App, las dos puertas de wallet - queda
                        // inalcanzable, porque scrollear la página no lo mueve.
                        className="fixed inset-x-0 top-0 mt-[calc(var(--top-chrome)_+_24px)] sm:mt-[calc(var(--top-chrome)_+_36px)] mx-3 sm:mx-5 max-h-[calc(100dvh_-_var(--top-chrome)_-_40px)] sm:max-h-[calc(100dvh_-_var(--top-chrome)_-_52px)] overflow-y-auto overscroll-contain rounded-2xl bg-[#0a0a0a] z-[150] lg:hidden p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                    >
                        <div className="flex flex-col gap-2">
                            {/* Close */}
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="self-end p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-colors mb-1"
                            >
                                <X size={16} />
                            </button>

                            {/* Home - top level */}
                            <Link
                                href="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold border transition-all ${
                                    pathname === "/"
                                        ? "bg-white text-black border-white"
                                        : "bg-white/[0.03] text-white/60 border-white/5 hover:text-white hover:bg-white/[0.06]"
                                }`}
                            >
                                {t.nav.home}
                            </Link>

                            {/* Product - mismas 3 categorías del sidebar de la app */}
                            {productGroups.map((group) => (
                                <div key={group.label} className="mt-1">
                                    <p className="px-4 mb-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                                        {group.label}
                                    </p>
                                    <div className="flex flex-col gap-1.5">
                                        {group.items.map(({ href, name, icon: Icon }) => {
                                            const isActive = pathname === href;
                                            return (
                                                <Link
                                                    key={href}
                                                    href={href}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                                                        isActive
                                                            ? "bg-white text-black border-white"
                                                            : "bg-white/[0.03] text-white/60 border-white/5 hover:text-white hover:bg-white/[0.06]"
                                                    }`}
                                                >
                                                    <Icon className="w-4 h-4 shrink-0" />
                                                    {name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Precios / Blog - marketing-only, sin equivalente en la app */}
                            {navLinks.slice(1).map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold border transition-all ${
                                            isActive
                                                ? "bg-white text-black border-white"
                                                : "bg-white/[0.03] text-white/60 border-white/5 hover:text-white hover:bg-white/[0.06]"
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}

                            {/* Launch app - prominent in mobile */}
                            <Link
                                href="/dashboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mt-2 flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-stellar-yellow text-[#0b0b0b] text-sm font-black uppercase tracking-tight"
                            >
                                {t.nav.launch_app}
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>

                            {/* Wallet connect (mobile) - las mismas dos puertas que en desktop */}
                            {hasIdentity ? (
                                <button
                                    onClick={() => { isConnected ? disconnect() : pollar.logout(); setIsMobileMenuOpen(false); }}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold"
                                >
                                    <LogOut className="w-4 h-4" />
                                    {t.nav.disconnect_session}
                                </button>
                            ) : (
                                // 9-nov-2026: un solo botón, como en escritorio y en el menú
                                // lateral; las dos opciones se abren debajo al tocarlo.
                                <div className="space-y-1.5">
                                    <button
                                        onClick={() => setIsMobileWalletOpen((o) => !o)}
                                        aria-expanded={isMobileWalletOpen}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white/[0.03] text-white/80 border border-white/10 text-sm font-bold hover:bg-white/[0.06]"
                                    >
                                        <Zap className="w-4 h-4" />
                                        {t.nav.login_session}
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isMobileWalletOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    {isMobileWalletOpen && (
                                        <div className="p-1.5 rounded-xl bg-[#111111] border border-white/10">
                                            <p className="px-3 pt-1.5 pb-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                                                {t.nav.wallet_menu_label}
                                            </p>
                                            <button
                                                onClick={() => { connect(); setIsMobileWalletOpen(false); setIsMobileMenuOpen(false); }}
                                                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-left hover:bg-white/5 transition-colors"
                                            >
                                                <Zap className="w-4 h-4 text-white/50 shrink-0" />
                                                <span>
                                                    <span className="block text-sm font-semibold text-white">{t.nav.wallet_option_browser}</span>
                                                    <span className="block text-[11px] text-white/40">{t.nav.wallet_option_browser_hint}</span>
                                                </span>
                                            </button>
                                            {pollar.available && (
                                                <button
                                                    onClick={() => { pollar.openLogin(); setIsMobileWalletOpen(false); setIsMobileMenuOpen(false); }}
                                                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-left hover:bg-white/5 transition-colors"
                                                >
                                                    <Mail className="w-4 h-4 text-white/50 shrink-0" />
                                                    <span>
                                                        <span className="block text-sm font-semibold text-white">{t.nav.wallet_option_pollar}</span>
                                                        <span className="block text-[11px] text-white/40">{t.nav.wallet_option_pollar_hint}</span>
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Status strip. Decía "SYSTEM READY v0.18.0": un estado que
                                nadie comprobaba y una versión escrita a mano que se
                                desfasa en cada release. Queda solo lo verificable. */}
                            <div className="mt-3 pt-4 border-t border-white/5 flex items-center justify-center text-[9px] font-mono text-white/20 uppercase tracking-widest">
                                <div className="flex items-center gap-1 text-stellar-teal/60">
                                    <Shield className="w-2.5 h-2.5" />
                                    {t.footer.scf_verified}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
