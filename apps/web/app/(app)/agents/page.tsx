"use client";

import { motion } from "framer-motion";
import {
    Shield, Cpu, Globe, Lock, CheckCircle, Clock,
    Activity, Server, Zap,
    FileSearch, Send
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import NodeActivity from "@/components/analytics/NodeActivity";
import { useFreighter } from "@/hooks/useFreighter";
import OpsConsole from "@/components/layout/OpsConsole";
import SecurityDisclaimer from "@/components/shared/SecurityDisclaimer";
import { useEffect, useState } from "react";
import { useEloReputation } from "@/hooks/useNiriumContracts";
import { eloGetTotalSentinels } from "@/lib/sorobanContracts";

export default function AgentsPage() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) =>
        language === "es" ? es : en;

    const { address: walletAddress, isConnected } = useFreighter();
    const elo = useEloReputation();
    const [eloScore, setEloScore] = useState<number | null>(null);
    const [totalSentinels, setTotalSentinels] = useState<number | null>(null);

    useEffect(() => {
        eloGetTotalSentinels().then(n => setTotalSentinels(Number(n))).catch(() => {});
        if (walletAddress) {
            elo.getScore(walletAddress).then(s => setEloScore(s)).catch(() => {});
        }
    }, [walletAddress]);

    const nodes = [
        {
            id: "rebalance-node",
            statusLabel: lang("MAINNET · INVITE-ONLY", "MAINNET · POR INVITACIÓN"),
            statusColor: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
            dotColor: "bg-stellar-teal",
            accentBorder: "border-stellar-teal/20",
            icon: Activity,
            iconColor: "text-stellar-teal",
            name: lang(
                "Rebalance Node",
                "Nodo de Rebalanceo"),
            role: lang(
                "Autonomous rebalancing of a vault's idle funds (USDC or CETES, one asset per vault) into the vault's own strategy and back, based on thresholds the vault owner sets, no human approval per call. Designed to run continuously; to date, 4 real rebalances, self-funded, all on 6 Aug 2026, none since.",
                "Rebalanceo autónomo del saldo ocioso de una bóveda (USDC o CETES, un activo por bóveda) hacia la estrategia de esa misma bóveda y de regreso, según umbrales que fija el dueño de la bóveda, sin aprobación humana por llamada. Diseñado para correr de forma continua; a la fecha, 4 rebalanceos reales, autofinanciados, todos el 6-ago-2026, ninguno desde entonces."),
            // Revisado contra rebalanceDecision.ts / scripts/rebalancer.ts (8-nov-2026):
            // no es un spread. Es la tasa de CETES de la bóveda (medida desde su
            // propia posición, o la de referencia declarada si aún no hay historia)
            // contra dos umbrales del dueño, con banda muerta entre ellos.
            cycle: lang("Checks every 10 minutes by default", "Revisa cada 10 minutos por defecto"),
            trigger: lang(
                "The vault's measured yield (or the CETES reference rate, until there is history) reaches the owner's entry threshold (invest idle cash) or drops to the exit threshold (unwind); between the two, it does nothing",
                "El rendimiento medido de la bóveda (o la tasa de referencia de CETES, mientras no hay historial) llega al umbral de entrada del dueño (invierte el efectivo ocioso) o baja al de salida (recoge lo invertido); entre los dos, no hace nada"),
            authorized: lang(
                "Invest and Unwind between the vault's own strategies - no swaps, no destination address",
                "Invest y Unwind entre las estrategias de la propia bóveda - sin swaps y sin dirección de destino"),
            audit: lang(
                "SHA-256 + IPFS anchor when a run is recorded (opt-in)",
                "SHA-256 + anclaje IPFS cuando se registra una corrida (opcional)"),
            metric: lang(
                "Health is public - see /api/public/rebalancer-health; a non-zero problem count there is expected when a dependency hiccups, not a silent failure",
                "Salud pública - ver /api/public/rebalancer-health; un conteo de problemas distinto de cero ahí es esperado cuando falla una dependencia, no una falla silenciosa"),
            locked: false,
        },
        {
            id: "payroll-node",
            statusLabel: lang("MAINNET · EARLY ACCESS · INVITE-ONLY", "MAINNET · ACCESO ANTICIPADO · POR INVITACIÓN"),
            statusColor: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
            dotColor: "bg-stellar-teal",
            accentBorder: "border-stellar-teal/20",
            icon: Send,
            iconColor: "text-stellar-teal",
            name: lang(
                "Disbursement Node (Bulk Payouts)",
                "Nodo de Dispersión (Pagos Masivos)"),
            role: lang(
                "Disburse funds from one company wallet to up to 100 recipients (contractors, freelancers, B2B partners) in a single signed batch payment. Non-custodial - the company signs in its own wallet, Nirium never holds funds.",
                "Dispersa fondos desde una wallet de la empresa a hasta 100 destinatarios (contratistas, freelancers, socios B2B) en un solo lote de pago firmado. Non-custodial - la empresa firma en su propia wallet, Nirium nunca custodia fondos."),
            cycle: lang("On-demand / per run", "Bajo demanda / por corrida"),
            trigger: lang(
                "Company builds and signs a payout run",
                "La empresa arma y firma una corrida de pago"),
            authorized: lang(
                // No es "sponsored": executePayroll.ts (onboardEmployee) arma un
                // changeTrust que firma el propio destinatario y su cuenta paga la
                // reserva. Verificado el 8-nov-2026.
                "Batch USDC/XLM payment (≤100 recipients) + USDC trustline the recipient adds and signs itself",
                "Pago batch USDC/XLM (≤100 destinatarios) + trustline USDC que el propio destinatario agrega y firma"),
            audit: lang(
                "Tamper-evident IPFS receipt per run (optional LCP legal layer - pending a legal opinion)",
                "Recibo IPFS por corrida donde cualquier cambio se nota (capa legal LCP opcional - pendiente de opinión legal)"),
            metric: lang(
                "Mainnet early access · independent service payments only · Freighter-signed",
                "Mainnet early access · solo pagos de servicios independientes · firmado con Freighter"),
            locked: false,
        },
        {
            id: "policy-gate",
            // Reemplaza a "Compliance Sentinel" (2026-11-03): esa tarjeta
            // describía una idea sin construir (el endpoint auditor de
            // coordinationService da 404 en las dos redes) con el mismo
            // nombre que lo que SÍ existe y ya corre en producción: el
            // pre-sign policy hook (#96, packages/sdk/src/x402-policy.ts).
            // Las dos se mezclaban bajo una sola tarjeta y un solo estado -
            // esta es la mitad real. Texto igual al de
            // packages/agent/src/services/nodeRegistry.ts (la fuente real) -
            // si se actualiza uno, actualizar el otro.
            // Sin "SDK" en lo público (regla de AGENTS.md: ese enrutamiento ya
            // costó un prescreen de SCF). Es el paquete `nirium` en npm.
            statusLabel: lang("SHIPPED · NPM PACKAGE", "PUBLICADO · PAQUETE NPM"),
            statusColor: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
            dotColor: "bg-green-400",
            accentBorder: "border-green-500/20",
            icon: Shield,
            iconColor: "text-green-400",
            name: lang(
                "Policy Gate",
                "Compuerta de Políticas"),
            role: lang(
                "Routes every outgoing x402 payment through your own policy engine before it is signed. Binds the ALLOW to the exact authorization (contract, amount, destination, nonce) via initX402({ policy }); a DENY, timeout, stale answer, or anything not bound to that exact payment signs nothing. Not a remote key-custody control: it wraps the signing call inside the same process that holds the key, so code with direct access to that signer can still bypass it.",
                "Hace pasar cada pago x402 saliente por tu propio motor de políticas antes de firmarlo. Ata el ALLOW a la autorización exacta (contrato, monto, destino, nonce) vía initX402({ policy }); un DENY, un timeout, una respuesta vieja, o cualquier cosa no atada a ese pago exacto no firma nada. No es una custodia remota de la llave: envuelve la firma dentro del mismo proceso que la sostiene, así que código con acceso directo a ese firmante puede saltárselo."),
            cycle: lang("Per x402 payment", "Por pago x402"),
            trigger: lang("Every outgoing x402Fetch() call", "Cada llamada saliente a x402Fetch()"),
            authorized: lang(
                "Transfer-only (contract, amount, destination, nonce) - the policy engine never sees anything else",
                "Solo transferencia (contrato, monto, destino, nonce) - el motor de políticas nunca ve nada más"),
            audit: lang(
                "Full decision record via onDecision (ALLOWED/SIGNED/DENY/TIMEOUT/...), kept by the integrator",
                "Registro completo de la decisión vía onDecision (ALLOWED/SIGNED/DENY/TIMEOUT/...), lo conserva quien integra"),
            metric: lang(
                "Shipped in the TypeScript package (nirium on npm) - exercised on testnet only so far, not yet run against mainnet traffic. Not a key-custody control, see the roadmap for that",
                "Publicado en el paquete de TypeScript (nirium en npm) - probado solo en testnet hasta ahora, no se ha corrido todavía contra tráfico de mainnet. No es una custodia remota de la llave, eso está en el roadmap"),
            locked: false,
        },
        {
            id: "settlement-hub",
            statusLabel: "MAINNET",
            statusColor: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
            dotColor: "bg-purple-400",
            accentBorder: "border-purple-500/20",
            icon: Globe,
            iconColor: "text-purple-400",
            name: lang(
                "Settlement Hub",
                "Hub de Liquidación"),
            role: lang(
                "On mainnet, Nirium's own x402 test endpoint (/premium/market, $0.05) settles on-chain; signals and execute answer 501 there without charging. x402Serve() lets you charge for your own API the same way. Third-party use on mainnet is not something we promote until we have a written legal opinion, and compliance is the integrator's own responsibility.",
                "En mainnet, el endpoint x402 de prueba de Nirium (/premium/market, $0.05) liquida en cadena; signals y execute responden 501 ahí sin cobrar. x402Serve() te deja cobrar por tu propia API de la misma forma. No promovemos su uso por terceros en mainnet hasta tener una opinión legal por escrito, y el cumplimiento es responsabilidad de quien integra."),
            cycle: lang("On-demand", "Bajo demanda"),
            trigger: lang("Paid HTTP requests (x402)", "Requests HTTP pagados (x402)"),
            authorized: lang(
                "Payment verification, on-chain settlement",
                "Verificación de pagos, liquidación en cadena"),
            audit: lang(
                "Payment receipt logged per call; the settlement hash is on Horizon",
                "Recibo de pago registrado por llamada; el hash de liquidación está en Horizon"),
            metric: lang(
                "Nirium's own test endpoint on mainnet, last settled payment 29 Sep 2026. x402Serve() for third parties: written legal opinion pending",
                "Endpoint de prueba propio de Nirium en mainnet, último pago liquidado el 29 sep 2026. x402Serve() para terceros: opinión legal por escrito pendiente"),
            locked: false,
        },
        {
            id: "audit-node",
            statusLabel: lang("LIVE · MAINNET", "EN VIVO · MAINNET"),
            statusColor: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
            dotColor: "bg-stellar-yellow",
            accentBorder: "border-stellar-yellow/20",
            icon: FileSearch,
            iconColor: "text-stellar-yellow",
            name: lang(
                "Audit Node",
                "Nodo de Auditoría"),
            role: lang(
                "Anchors a record to IPFS as a tamper-evident, publicly verifiable receipt when the caller asks for it (opt-in per call), and powers institutional-format exports. Optional Legal Context Protocol layer, pending a legal opinion.",
                "Ancla un registro a IPFS como recibo públicamente verificable, donde cualquier cambio posterior se nota, cuando quien llama lo pide (opcional por llamada), y alimenta exportes con formato institucional. Capa opcional Legal Context Protocol, pendiente de opinión legal."),
            cycle: lang("On request", "Bajo demanda"),
            trigger: lang("A POST /api/audit/log call, opt-in per call", "Una llamada POST /api/audit/log, opcional en cada llamada"),
            authorized: lang(
                "IPFS pinning, report generation, signature verification",
                "Pinning en IPFS, generación de reportes, verificación de firmas"),
            audit: lang(
                "Every anchored receipt is verifiable on IPFS by anyone",
                "Cada recibo anclado lo puede verificar cualquiera en IPFS"),
            // No fixed number here (14-nov-2026): /api/reporting/summary without
            // an explicit `from` is a rolling 30-day window, so a hardcoded count
            // drifts out of date in both directions as the window moves - 34 on
            // 12-nov read as 32 two days later with nothing deleted. The live
            // all-time count lives at /stats.
            metric: lang(
                "Mainnet anchors - live count at /stats",
                "Anclajes en mainnet - conteo en vivo en /stats"),
            locked: false,
        },
        {
            // Revisado contra packages/contracts/src/nirium_vault.rs (8-nov-2026).
            // Antes decía que pausa, cambio de cosignatarios y cierre de bóveda
            // requerían multisig 2-de-3. En el contrato: solo pause/unpause usan
            // admin + 1 cosignatario, y solo si hay cosignatarios registrados (si no,
            // el admin solo); set_cosigners es solo del admin; close_vault lo firma
            // el dueño de la bóveda.
            id: "vault-operations",
            statusLabel: lang("TESTNET · CONTRACT ADMIN", "TESTNET · ADMIN DEL CONTRATO"),
            statusColor: "bg-red-500/10 text-red-400 border-red-500/20",
            dotColor: "bg-red-400",
            accentBorder: "border-red-500/20",
            icon: Lock,
            iconColor: "text-red-400",
            name: lang(
                "Vault Operations Node",
                "Nodo de Operaciones de Vault"),
            // Confirmado en la cadena el 8-nov-2026 (instance storage de
            // CARTJI…Q5SICV vía Soroban RPC): solo AdminAddress, Treasury y
            // contadores; ningún Cosigner1/Cosigner2. O sea, hoy pausa el admin solo.
            role: lang(
                "Emergency controls of the NiriumVault contract. The contract supports a 2-of-3 pause (admin plus one cosigner), but the testnet deployment has no cosigners registered yet (checked on-chain, 8 Nov 2026), so today pausing or resuming takes the admin's signature alone. Each owner closes their own vault with their own signature. Never runs autonomously.",
                "Controles de emergencia del contrato NiriumVault. El contrato admite una pausa 2-de-3 (admin más un cosignatario), pero el despliegue de testnet todavía no tiene cosignatarios registrados (revisado en la cadena, 8 nov 2026), así que hoy pausarlo o reanudarlo requiere solo la firma del admin. Cada dueño cierra su propia bóveda con su propia firma. Nunca corre de forma autónoma."),
            cycle: lang("Manual only", "Solo manual"),
            trigger: lang(
                "Admin request (no cosigners registered yet)",
                "Solicitud del admin (aún sin cosignatarios registrados)"),
            authorized: lang(
                "Contract pause/unpause · cosigner changes (admin only)",
                "Pausa/reanudación del contrato · cambio de cosignatarios (solo el admin)"),
            audit: lang(
                "Pause and unpause emit on-chain events",
                "La pausa y la reanudación emiten eventos en la cadena"),
            metric: lang(
                "Human signatures only - no autonomous action",
                "Solo firmas humanas - ninguna acción autónoma"),
            locked: false,
        },
    ];

    return (
        <main className="min-h-screen bg-black text-white">
            {/* Background blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-stellar-teal/4 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/4 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">

                {/* ── HEADER ─────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-4">
                        {lang("Execution Architecture", "Arquitectura de Ejecución")}
                    </h1>
                    <p className="text-white/50 max-w-xl mx-auto text-base">
                        {/* Antes prometía "rastro de auditoría criptográfico" para los 6;
                            Policy Gate y Vault Operations no lo tienen (ver su campo Audit). */}
                        {lang(
                            "6 nodes: what each one does, what it is allowed to sign, and on which network it runs.",
                            "6 nodos: qué hace cada uno, qué puede firmar y en qué red corre.")}
                    </p>
                </motion.div>

                {/* 9-nov-2026: números en vivo por nodo, siguen el switch TEST/MAIN. */}
                <NodeActivity language={language} />

                {/* ── LIVE STATUS BAR ─────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-14 flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-5 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-xs font-mono"
                >
                    {/* Barra de contexto, no de estado: nada aquí se mide en vivo, así que
                        sin punto pulsante ni la palabra "Conexión". */}
                    <div className="flex items-center gap-1.5">
                        <span className="inline-flex rounded-full h-1.5 w-1.5 bg-stellar-teal" />
                        <span className="text-white/40">{lang("Networks", "Redes")}</span>
                        <span className="text-stellar-teal ml-1">Stellar Mainnet + Testnet</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Server className="w-3 h-3 text-white/20" />
                        <span className="text-white/40">{lang("Ledger close", "Cierre de ledger")}</span>
                        <span className="text-white/80 ml-1">~5s</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Cpu className="w-3 h-3 text-white/20" />
                        <span className="text-white/40">{lang("Protocol", "Protocolo")}</span>
                        {/* Verificado 8-nov-2026 contra el último ledger de Horizon: mainnet
                            protocol_version 29, testnet 30. Antes decía 29 para las dos. */}
                        <span className="text-white/80 ml-1">{lang("Soroban · 29 mainnet · 30 testnet", "Soroban · 29 mainnet · 30 testnet")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-white/20" />
                        <span className="text-white/40">{lang("Network", "Red")}</span>
                        <span className="text-white/80 ml-1">Horizon API</span>
                    </div>
                    {eloScore !== null && eloScore > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Activity className="w-3 h-3 text-stellar-teal/60" />
                            <span className="text-white/40">ELO (testnet)</span>
                            <span className="text-stellar-teal ml-1 font-bold">{eloScore}</span>
                        </div>
                    )}
                    {totalSentinels !== null && totalSentinels > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-green-400/60" />
                            <span className="text-white/40">{lang("Sentinels (testnet)", "Centinelas (testnet)")}</span>
                            <span className="text-green-400 ml-1 font-bold">{totalSentinels}</span>
                        </div>
                    )}
                </motion.div>

                {/* ── NODE CARDS ─────────────────────────────────────────── */}
                <div className="space-y-5 mb-16">
                    {nodes.map((node, i) => (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className={`bg-white/[0.03] border ${node.accentBorder} rounded-2xl p-7 ${node.locked ? "opacity-50" : ""}`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                                {/* Icon */}
                                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 shrink-0 ${node.locked ? "opacity-40" : ""}`}>
                                    {node.locked ? (
                                        <Lock className="w-5 h-5 text-white/30" />
                                    ) : (
                                        <node.icon className={`w-5 h-5 ${node.iconColor}`} />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h3 className="text-base font-black text-white">{node.name}</h3>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${node.statusColor}`}>
                                            {node.statusLabel}
                                        </span>
                                    </div>
                                    <p className="text-white/50 text-sm mb-5 leading-relaxed">{node.role}</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                                                {lang("Cycle / Trigger", "Ciclo / Disparador")}
                                            </p>
                                            <p className="text-white/60">{node.cycle} - {node.trigger}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                                                {lang("Authorized Action", "Acción Autorizada")}
                                            </p>
                                            <p className="text-white/60">{node.authorized}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                                                {lang("Audit Trail", "Rastro de Auditoría")}
                                            </p>
                                            <p className="text-white/60">{node.audit}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Metric bar */}
                            <div className={`mt-5 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono ${node.locked ? "text-white/20" : "text-white/40"}`}>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${node.dotColor}`} />
                                {node.metric}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <SecurityDisclaimer />

                {/* ── LIVE ACTIVITY FEED ─────────────────────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-xs font-black uppercase tracking-widest text-white/40 mb-5">
                        {lang("Agent log feed", "Feed de logs del agente")}
                    </h2>
                    <OpsConsole
                        isExpanded={false}
                        onToggleExpand={() => {}}
                        walletAddress={(isConnected && walletAddress) ? walletAddress : undefined}
                        heightClass="h-[300px]"
                    />
                </motion.section>

            </div>
        </main>
    );
}
