"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Gift,
    MonitorSmartphone,
    Code2,
    Bot,
    FileCheck2,
    GraduationCap,
    UserCheck,
    Sparkles,
    Server,
    ShoppingCart,
    Network,
    Receipt,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../../context/LanguageContext";
import { posts } from "../posts";

const SLUG = "codigo-402-agentes-que-pagan";
const STEPS = [
    { key: "step1", Icon: Code2 },
    { key: "step2", Icon: Bot },
    { key: "step3", Icon: FileCheck2 },
] as const;

const FACTS = [
    { key: "fact_date", Icon: Calendar },
    { key: "fact_time", Icon: Clock },
    { key: "fact_mode", Icon: MonitorSmartphone },
    { key: "fact_cost", Icon: Gift },
] as const;

const LEARN_ITEMS = ["learn1", "learn2", "learn3", "learn4", "learn5"] as const;

const BUILD_CARDS = [
    { key: "build1", Icon: Server },
    { key: "build2", Icon: ShoppingCart },
    { key: "build3", Icon: Network },
    { key: "build4", Icon: Receipt },
] as const;

export default function Codigo402Post() {
    const { t } = useLanguage();
    const meta = (t.blog.posts as Record<string, any>)[SLUG];
    const postMeta = posts.find((p) => p.slug === SLUG)!;
    const readLabel = `${postMeta.readMinutes} ${t.blog.min_read}`;

    return (
        <main className="min-h-screen bg-black text-white selection:bg-stellar-teal/30">
            <article className="max-w-3xl mx-auto px-6 pt-8 pb-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stellar-teal/5 rounded-full blur-[100px] pointer-events-none -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t.blog.back_to_blog}
                    </Link>

                    <div className="flex items-center gap-3 mb-5 text-[11px] font-mono uppercase tracking-widest text-white/40">
                        <span className="px-2 py-0.5 rounded-full border border-stellar-teal/30 text-stellar-teal/80">
                            {meta.tag}
                        </span>
                        <span>{readLabel}</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[1.02] mb-6">
                        {meta.h1}
                    </h1>

                    <p className="text-xl md:text-2xl text-stellar-teal font-semibold leading-snug mb-6">
                        {meta.hook}
                    </p>

                    {/* Facts strip */}
                    <div className="flex flex-wrap gap-4 mb-10 text-sm text-white/50">
                        {FACTS.map(({ key, Icon }) => (
                            <span key={key} className="inline-flex items-center gap-1.5">
                                <Icon className="w-4 h-4 text-stellar-teal/70" /> {meta[key]}
                            </span>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-6 text-[17px] leading-relaxed text-gray-300 font-light"
                >
                    <p>{meta.p_curiosity}</p>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_why}</h2>
                    <p>{meta.p_why1}</p>
                    <p>{meta.p_why2}</p>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_who}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose my-4">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                            <div className="flex items-center gap-2 mb-3 text-stellar-teal text-xs font-mono uppercase tracking-widest">
                                <Code2 className="w-4 h-4" />
                            </div>
                            <p className="text-white font-semibold text-base mb-1">{meta.who_dev_title}</p>
                            <p className="text-gray-400 text-sm m-0">{meta.who_dev_body}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                            <div className="flex items-center gap-2 mb-3 text-stellar-teal text-xs font-mono uppercase tracking-widest">
                                <UserCheck className="w-4 h-4" />
                            </div>
                            <p className="text-white font-semibold text-base mb-1">{meta.who_nondev_title}</p>
                            <p className="text-gray-400 text-sm m-0">{meta.who_nondev_body}</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_steps}</h2>

                    {/* 3-step diagram */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose my-4">
                        {STEPS.map(({ key, Icon }, i) => (
                            <div
                                key={key}
                                className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                            >
                                <div className="flex items-center gap-2 mb-3 text-stellar-teal text-xs font-mono uppercase tracking-widest">
                                    <Icon className="w-4 h-4" />
                                    {`0${i + 1}`}
                                </div>
                                <p className="text-white font-semibold text-base mb-1">
                                    {meta[`${key}_title`]}
                                </p>
                                <p className="text-gray-400 text-sm m-0">
                                    {meta[`${key}_body`]}
                                </p>
                            </div>
                        ))}
                    </div>

                    <p>{meta.p_risk}</p>
                    <p>{meta.p_identity}</p>

                    <h2 className="text-2xl font-bold text-white pt-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-stellar-teal" />
                        {meta.h_learn}
                    </h2>
                    <ul className="space-y-2 not-prose list-none pl-0 m-0">
                        {LEARN_ITEMS.map((key) => (
                            <li key={key} className="flex items-start gap-2.5">
                                <Sparkles className="w-4 h-4 text-stellar-teal/70 mt-1 shrink-0" />
                                <span className="text-gray-300">{meta[key]}</span>
                            </li>
                        ))}
                    </ul>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_sessions}</h2>
                    <p>{meta.p_sessions}</p>

                    <h2 className="text-2xl font-bold text-white pt-4">{meta.h_build}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose my-4">
                        {BUILD_CARDS.map(({ key, Icon }) => (
                            <div
                                key={key}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                            >
                                <div className="flex items-center gap-2 mb-3 text-stellar-teal text-xs font-mono uppercase tracking-widest">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <p className="text-white font-semibold text-base mb-1">
                                    {meta[`${key}_title`]}
                                </p>
                                <p className="text-gray-400 text-sm m-0">
                                    {meta[`${key}_body`]}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center my-2">
                        <Link
                            href="/developers"
                            className="inline-flex items-center gap-2 h-10 px-5 bg-white text-black text-sm font-bold rounded-full hover:bg-stellar-yellow transition-all uppercase tracking-tight"
                        >
                            <Code2 className="w-4 h-4" />
                            {meta.build_cta_label}
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-stellar-teal/20 bg-stellar-teal/[0.04] p-6 mt-10">
                        <div className="flex items-center gap-2 mb-2 text-stellar-teal text-xs font-mono uppercase tracking-widest">
                            <FileCheck2 className="w-3.5 h-3.5" />
                            {meta.where_label}
                        </div>
                        <p className="text-gray-300 text-base m-0">{meta.where_body}</p>
                    </div>

                    {/* Roadmap note: honest "not built yet" disclosure */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mt-6">
                        <div className="flex items-center gap-2 mb-2 text-white/50 text-xs font-mono uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" />
                            {meta.roadmap_label}
                        </div>
                        <p className="text-gray-400 text-sm m-0">{meta.roadmap_body}</p>
                    </div>

                    {/* Verify CTA + Luma registration, both as plain buttons (the embedded iframe broke under ad-blockers) */}
                    <div className="flex flex-col items-center text-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 mt-6">
                        <p className="text-gray-300 text-sm m-0">{meta.verify_body}</p>
                        <Link
                            href="/verify"
                            className="inline-flex items-center gap-2 h-10 px-5 bg-stellar-teal text-black text-sm font-bold rounded-full hover:opacity-90 transition-all uppercase tracking-tight"
                        >
                            <FileCheck2 className="w-4 h-4" />
                            {meta.verify_cta_label}
                        </Link>
                        <p className="text-sm text-white/50 m-0 mt-4">{meta.cta_urgency}</p>
                        <Link
                            href="https://luma.com/ljzvwv35"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 h-10 px-5 bg-white text-black text-sm font-bold rounded-full hover:bg-stellar-yellow transition-all uppercase tracking-tight"
                        >
                            {meta.cta_label}
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4"
                >
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t.blog.all_articles}
                    </Link>
                    <Link
                        href="/developers"
                        className="inline-flex items-center gap-2 h-10 px-5 bg-white text-black text-sm font-bold rounded-full hover:bg-stellar-yellow transition-all uppercase tracking-tight"
                    >
                        {t.blog.see_product}
                    </Link>
                </motion.div>
            </article>
        </main>
    );
}
