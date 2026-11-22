"use client";

import {
    BookOpen,
    ChevronRight,
    ArrowRight,
    Zap,
    Shield,
    Cpu,
    Wallet,
    MousePointer2,
    Settings,
    LayoutDashboard,
    Play,
    Terminal,
    CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";

export default function HowToUsePage() {
    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-stellar-teal/30">
{/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-stellar-teal/10 to-transparent opacity-50" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-stellar-yellow/5 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 pt-8 pb-20">
                <div className="max-w-5xl mx-auto px-6">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-12 mb-20 section-lift">
                        <SectionBrandLogo className="!justify-start mb-0" size="w-32 lg:w-48" />
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stellar-teal/10 border border-stellar-teal/30 rounded-full text-stellar-teal text-xs font-mono mb-6 self-center lg:self-start">
                                <BookOpen size={14} />
                                GETTING STARTED
                            </div>
                            <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 leading-none uppercase">
                                HOW TO <span className="text-gradient">OPERATE</span>
                            </h1>
                            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                                What's actually real today: x402 pay-per-request, an opt-in Treasury rebalancer (self-funded test vault, invite-only until we have a written legal opinion), and Audit Trail receipts anyone can verify.
                            </p>
                        </div>
                    </div>

                    {/* Step by Step Guide */}
                    <div className="space-y-12">
                        {STEPS.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all group section-lift"
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="shrink-0">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-transform`}>
                                            <step.icon size={32} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-stellar-teal font-mono text-sm tracking-widest uppercase opacity-50">Step {i + 1}</span>
                                            <h2 className="text-2xl font-bold">{step.title}</h2>
                                        </div>
                                        <p className="text-gray-400 leading-relaxed mb-6">
                                            {step.description}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {step.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                                                    <CheckCircle2 size={16} className="text-stellar-teal shrink-0" />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>

                                        {step.actionLabel && (
                                            <Link
                                                href={step.actionHref}
                                                className="inline-flex items-center gap-2 mt-8 text-stellar-teal font-bold hover:gap-3 transition-all"
                                            >
                                                {step.actionLabel} <ArrowRight size={18} />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pro Tips Section */}
                    <div className="mt-32 section-lift">
                        <div className="glass-panel p-12 rounded-3xl border border-stellar-yellow/20 bg-gradient-to-br from-stellar-yellow/5 to-transparent relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Zap size={120} className="text-stellar-yellow" />
                            </div>

                            <h3 className="text-3xl font-bold mb-8 flex items-center gap-4">
                                <Settings className="text-stellar-yellow" />
                                FOR DEVELOPERS
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-white font-bold flex items-center gap-2">
                                        <Shield size={18} className="text-stellar-teal" />
                                        Stellar Code of Conduct
                                    </h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Nirium aligns with the <span className="text-white font-bold">Stellar Code of Conduct</span>: non-custodial by design, and the usage numbers on this site link to a transaction, a CID or a GitHub PR you can check yourself.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-white font-bold flex items-center gap-2">
                                        <Terminal size={18} className="text-stellar-yellow" />
                                        CLI
                                    </h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Install <code className="bg-white/5 px-1 rounded text-stellar-teal">npm install -g nirium-cli</code> for <code className="bg-white/5 px-1 rounded text-stellar-teal">anchor</code>, <code className="bg-white/5 px-1 rounded text-stellar-teal">verify</code>, <code className="bg-white/5 px-1 rounded text-stellar-teal">status</code> and <code className="bg-white/5 px-1 rounded text-stellar-teal">doctor</code>. Anchoring a record is opt-in per call, not automatic.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Footer */}
                    <div className="mt-32 text-center section-lift">
                        <h3 className="text-3xl font-bold mb-8">Ready to try it?</h3>
                        <div className="flex flex-wrap justify-center gap-6">
                            <Link
                                href="/treasury/builder"
                                className="bg-stellar-yellow text-[#0b0b0b] font-bold px-10 py-4 rounded-full hover:shadow-[0_0_30px_rgba(255,200,0,0.4)] transition-all flex items-center gap-2"
                            >
                                <Zap size={20} /> Open Treasury Builder
                            </Link>
                            <Link
                                href="/agents"
                                className="border border-stellar-yellow/40 text-stellar-yellow font-bold px-10 py-4 rounded-full hover:bg-stellar-yellow/10 transition-all"
                            >
                                Agents Console
                            </Link>
                            <Link
                                href="/docs"
                                className="border border-white/10 text-white font-bold px-10 py-4 rounded-full hover:bg-white/5 transition-all"
                            >
                                Technical Specs
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}

const STEPS = [
    {
        title: "Get an API key",
        description: "Issue a free key for the Nirium agent - audit anchoring, reporting and authenticated endpoints. One key works on testnet and mainnet for audit anchoring and reporting; on mainnet, Payouts and Treasury need a key Nirium authorizes (invite-only). No wallet connection required to get started.",
        icon: Wallet,
        color: "from-blue-400 to-cyan-400",
        features: [
            "Free tier: 20 requests/min",
            "Works on testnet and mainnet",
            "No seed phrase needed to start",
            "Higher tiers by invitation"
        ],
        actionLabel: "Get a key",
        actionHref: "/keys"
    },
    {
        title: "Pay for an API call with x402",
        description: "Charge or pay per request over HTTP 402. A seller returns a 402 challenge, the buyer signs a Stellar authorization entry, a facilitator verifies and settles on-chain. Nirium's own endpoint answers 402 on mainnet (last payment settled 18 Nov 2026); third-party sellers are supported on testnet.",
        icon: Shield,
        color: "from-stellar-teal to-teal-500",
        features: [
            "Testnet: open to everyone",
            "x402Serve() for sellers",
            "Any x402 client works as a buyer",
            "Settled on Stellar, verifiable on Horizon"
        ],
        actionLabel: "See the quickstart",
        actionHref: "/developers"
    },
    {
        title: "Try the Treasury rebalancer",
        description: "The agent moves a DeFindex vault's idle funds (USDC or CETES, one asset per vault) into the vault's own strategy and back. It holds only the RebalanceManager role: it cannot withdraw funds, by contract, and it does not convert one asset into the other. Today's live vault is our own team's, self-funded; real-client onboarding is invite-only until we have a written legal opinion on a specific question (LFPIORPI art. 17 fraction XVI, as Art. 24 Bis 4 of its General Rules defines it).",
        icon: Cpu,
        color: "from-stellar-yellow to-purple-600",
        features: [
            "4 real rebalances to date, all 6 Aug 2026",
            "RebalanceManager role: no withdrawal, by contract",
            "Self-funded test vault, invite-only for real clients",
            "Read-only vault state via the live API"
        ],
        actionLabel: "Open the builder",
        actionHref: "/treasury/builder"
    },
    {
        title: "Anchor and verify a receipt",
        description: "Audit Trail hashes a record, anchors it to IPFS, and optionally signs it with your own Stellar key. Anyone can paste the resulting CID at /verify and check it independently, without trusting Nirium's backend.",
        icon: MousePointer2,
        color: "from-pink-500 to-rose-500",
        features: [
            "Opt-in per call, not automatic logging",
            "ed25519 signature, optional but recommended",
            "Verifiable by anyone, no account needed",
            "Live mainnet anchor count at /stats"
        ],
        actionLabel: "Try /verify",
        actionHref: "/verify"
    },
    {
        title: "Pay a team with a Payouts batch",
        description: "Send USDC to many recipients in one Stellar transaction. Nirium builds the batch unsigned; your company signs it with its own wallet, and only then is it sent - Nirium never holds the funds. Testnet is open; mainnet is invite-only and every run requires accepting the Payouts Terms.",
        icon: Zap,
        color: "from-emerald-400 to-teal-500",
        features: [
            "One signature, every transfer in a single transaction",
            "POST /api/payroll/run, then /submit with your signed XDR",
            "Testnet: live run count on /stats",
            "Mainnet: invite-only, 0 runs to date"
        ],
        actionLabel: "Open Payouts",
        actionHref: "/payouts"
    },
    {
        title: "Pull a report",
        description: "Reporting summarizes what is already recorded - payments by gateway, anchored receipts and payout runs - per network and period, and exports it. It is read-only: it cannot sign or move anything.",
        icon: LayoutDashboard,
        color: "from-blue-500 to-indigo-500",
        features: [
            "GET /api/reporting/summary?network=testnet or mainnet",
            "GET /api/reporting/export for a full export",
            "Also from the CLI: nirium report summary / export",
            "Same numbers as the node row on /analytics"
        ],
        actionLabel: "See it on Analytics",
        actionHref: "/analytics"
    },
    {
        title: "Watch it in the Agents console",
        description: "The dashboard and Agents console show real-time status for each node (Settlement, Treasury, Audit Trail, Payouts), pulled live from the agent's own API - not a static mock.",
        icon: Terminal,
        color: "from-amber-400 to-orange-500",
        features: [
            "Live status per node",
            "Links to the real evidence behind each claim",
            "Same data as /api/stats",
            "No action required, read-only view"
        ],
        actionLabel: "Agents Console",
        actionHref: "/agents"
    }
];
