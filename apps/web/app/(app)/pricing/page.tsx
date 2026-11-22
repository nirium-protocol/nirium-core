/** Nirium Pricing - Transparent, public **/
'use client';

import Link from "next/link";
import {
    CheckCircle2, ArrowRight, Sparkles, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

type Feature = { en: string; es: string };

const FEATURES_FREE: Feature[] = [
    { en: 'Testnet vault (NiriumVault on Soroban)', es: 'Vault testnet (NiriumVault en Soroban)' },
    { en: 'Free API key: 10 requests/min and 100/day on keyed routes; anchoring and Reporting need no key today', es: 'API key gratis: 10 solicitudes/min y 100/día en rutas con key; anclar y Reporting hoy no piden key' },
    { en: 'Audit trail (SHA-256 · IPFS)',  es: 'Audit trail (SHA-256 · IPFS)' },
    { en: 'Payouts node (batch disbursement)', es: 'Nodo de dispersiones (batch)' },
    { en: 'Package access (npm: nirium)',       es: 'Acceso al paquete (npm: nirium)' },
    { en: 'MCP server (Claude/Cursor)',       es: 'MCP server (Claude/Cursor)' },
    // Estas dos cobran donde existe la capacidad, no donde queda mejor en el
    // copy: la señal la produce el loop autónomo y la ejecución necesita una
    // llave firmante. El box de mainnet no tiene ninguna de las dos y responde
    // 501 sin cobrar, así que anunciarlas allá sería vender una puerta cerrada.
    { en: 'x402 snapshot - $0.02 per call (factual loop data, not a recommendation)', es: 'Snapshot x402 - $0.02 por llamada (datos del loop, no una recomendación)' },
    { en: 'x402 execute - $0.25 per call (execution needs a signing key; mainnet box holds none)', es: 'Execute x402 - $0.25 por llamada (ejecutar necesita llave firmante; el box de mainnet no tiene)' },
];

const FEATURES_MAINNET: Feature[] = [
    // Cada renglón dice QUÉ hace y POR QUÉ es software y no servicio financiero.
    // No es adorno legal: el encuadre se defiende explicando el flujo de fondos,
    // y el mejor lugar para explicarlo es donde alguien decide comprar.
    { en: 'x402 market state - $0.05 per call. Our own test endpoint: Stellar network state, much of it fixed or public, useful to test an x402 client', es: 'Market state x402 - $0.05 por llamada. Nuestro endpoint de prueba: estado de la red Stellar, buena parte fijo o público, útil para probar un cliente x402' },
    { en: 'x402Serve() - charge for YOUR API, same rail. Funds go payer → you; they never touch Nirium. We do not promote third-party use on mainnet until we have a written legal opinion on that use; each integrator complies with the laws that apply to it', es: 'x402Serve() - cobra por TU API, el mismo riel. El dinero va del pagador a ti; nunca toca a Nirium. No promovemos su uso por terceros en mainnet hasta tener una opinión legal por escrito sobre ese uso; cada integrador cumple las leyes que le apliquen' },
    // MPP Charge salió de esta lista el 4-oct-2026: estaba listada como viva en
    // mainnet y no lo está (ver la nota fechada debajo de la tarjeta).
    // "Desplegar y depositar" se quedaba corto y justo donde no conviene: RETIRAR
    // también corre en mainnet y lo firmas tú, sin pedirnos permiso. Es la primera
    // pregunta de cualquiera que va a meter dinero en un contrato, y omitirla se
    // lee como que la salida está gated. El costo va medido, no adjetivado.
    // 9-nov-2026: fuera "~1.4 XLM, medido en mainnet": no se encontró la tx que lo respalde.
    // Los 12.5 XLM son de NiriumVault en testnet (DEPLOYMENT_FEE en nirium_vault.rs).
    { en: 'Treasury vault on DeFindex - deploy, deposit and withdraw, all with your own signature (deploying and depositing from this site are invite-only on mainnet until we have a written legal opinion); the vault is yours, Nirium can never withdraw from it, and you pay only the Stellar network fee, from your own wallet - Nirium charges nothing to deploy it', es: 'Bóveda de tesorería en DeFindex - desplegar, depositar y retirar, todo con tu propia firma (desplegar y depositar desde este sitio son solo por invitación en mainnet hasta tener una opinión legal por escrito); la bóveda es tuya, Nirium nunca puede retirar de ella, y solo pagas el fee de red de Stellar, desde tu propia wallet - Nirium no cobra nada por desplegarla' },
    // El precio de payouts dejó de ser por-destinatario: cobrar por pago procesado
    // es como cobra un procesador de pagos, y contradecía los propios términos.
    // Ahora es licencia mensual por capacidad - misma economía, otra forma jurídica.
    { en: 'Batch payouts - monthly software licence by permitted volume ($99 up to 250 records/mo, $249 up to 1,000), never a per-payment charge and never a percentage of what you disburse; mainnet is private Beta, invite-only (early access: network fee only today)', es: 'Payouts en lote - licencia mensual de software por volumen permitido ($99 hasta 250 registros/mes, $249 hasta 1,000), nunca un cargo por pago ni un porcentaje de lo que dispersas; mainnet en Beta privada, solo por invitación (early access: hoy solo fee de red)' },
    { en: 'Audit anchoring - free during beta. Anchor hashes, not personal data: we can\'t guarantee anything is deleted from IPFS.', es: 'Anclaje de auditoría - gratis en beta. Ancla hashes, no datos personales: no podemos garantizar que algo se borre de IPFS.' },
    { en: 'Reporting API - free (read-only). Institutional format; what you file with a regulator remains yours to decide', es: 'API de reportería - gratis (lectura). Formato institucional; lo que presentes ante un regulador lo decides tú' },
    { en: 'Settled on-chain in USDC, per request', es: 'Liquidado on-chain en USDC, por request' },
    { en: 'Not offered in restricted jurisdictions - see the policy before you integrate', es: 'No se ofrece en jurisdicciones restringidas - revisa la política antes de integrar' },
];

const FEATURES_GROWTH: Feature[] = [
    { en: 'Everything in Free',                 es: 'Todo lo de Free' },
    // Dos bóvedas distintas y hay que decirlo, o se lee como que la audit-gated
    // ya está viva: NiriumVault es contrato nuestro y espera auditoría; la de
    // DeFindex es contrato ajeno ya auditado y del cliente - por eso una puede
    // ir a mainnet hoy y la otra no.
    { en: 'Nirium’s own mainnet vault (planned, after an audit)', es: 'Vault propio de Nirium en mainnet (planeado, después de una auditoría)' },
    { en: 'Treasury node - autonomously moves idle capital into the yield strategy and back out, on a DeFindex vault structured for you to own (early access, no cost during beta - invite-only on mainnet until there is a written legal opinion)', es: 'Nodo de tesorería - mueve solo el capital ocioso hacia la estrategia de rendimiento y de regreso, sobre una bóveda DeFindex pensada para que sea tuya (early access, sin costo durante la beta - solo por invitación en mainnet hasta tener una opinión legal por escrito)' },
    { en: 'Higher API rate limits, set per account', es: 'Límites de API más altos, definidos por cuenta' },
    { en: 'Institutional-format exports (CSV/JSON)', es: 'Exportes formato institucional (CSV/JSON)' },
    { en: 'IPFS anchoring (Pinata)',             es: 'Anclaje IPFS (Pinata)' },
    { en: 'x402 agentic payments',              es: 'Pagos agénticos x402' },
    { en: 'Payouts / batch disbursement',       es: 'Dispersiones / pagos por lote' },
    { en: 'LCP legal layer (planned, switched off today)', es: 'Capa legal LCP (planeada, hoy apagada)' },
    // 9-nov-2026: fuera "Cross-border USDC transfers" (ya lo cubre Payouts, no es
    // otro producto) y "Canal Slack dedicado" (Nirium no tiene Slack; tiene Discord).
    { en: 'CETES and USDC reference rates, attributed to their source', es: 'Tasas de referencia CETES y USDC, con su fuente' },
    { en: 'Visual Strategy Builder (drag & drop; saves drafts, does not execute)', es: 'Strategy Builder visual (drag & drop; guarda borradores, no ejecuta)' },
    { en: 'Priority support (response time by agreement)', es: 'Soporte prioritario (tiempo de respuesta por acuerdo)' },
    { en: 'Dedicated channel on the Nirium Discord', es: 'Canal dedicado en el Discord de Nirium' },
];

const FEATURES_ENTERPRISE: Feature[] = [
    { en: 'Everything in Growth',                           es: 'Todo lo de Growth' },
    { en: 'Volume API pricing',                              es: 'Precios por volumen de API' },
    { en: 'White-label option',                             es: 'Opción white-label' },
    { en: 'Custom Soroban vault logic',                     es: 'Lógica de vault Soroban custom' },
    { en: 'Audit-readiness support',                        es: 'Soporte de preparación para auditorías' },
    { en: 'Support SLA by agreement',                       es: 'SLA de soporte por acuerdo' },
    { en: 'Custom integrations (ERP, Core Banking)',        es: 'Integraciones custom (ERP, Core Banking)' },
    { en: 'Joint go-to-market',                             es: 'Go-to-market conjunto' },
];

type ComparisonRow = {
    feature: Feature;
    free:       string | Feature;
    growth:     string | Feature;
    enterprise: string | Feature;
};

const COMPARISON: ComparisonRow[] = [
    { feature: { en: 'Treasury vault',   es: 'Bóveda de tesorería' }, free: { en: 'NiriumVault (testnet)', es: 'NiriumVault (testnet)' }, growth: { en: 'DeFindex (mainnet, invite-only)', es: 'DeFindex (mainnet, por invitación)' }, enterprise: 'Custom' },
    { feature: { en: 'API rate limit',   es: 'Límite de API'       }, free: { en: '10 req/min · 100/day (keyed routes)', es: '10 req/min · 100/día (rutas con key)' }, growth: { en: 'Higher, per account', es: 'Más alto, por cuenta' }, enterprise: { en: 'By agreement', es: 'Por acuerdo' } },
    { feature: { en: 'Signing model',    es: 'Modelo de firma'     }, free: { en: 'Your key withdraws; the agent spends up to a cap you set (NiriumVault)', es: 'Tu llave retira; el agente gasta hasta un tope que tú fijas (NiriumVault)' }, growth: { en: 'Your keys + revocable rebalance role', es: 'Tus llaves + rol de rebalanceo revocable' }, enterprise: { en: 'Configurable', es: 'Configurable' } },
    { feature: { en: 'Institutional export',      es: 'Export institucional'        }, free: '✓', growth: '✓', enterprise: '✓' },
    { feature: { en: 'IPFS anchoring',   es: 'Anclaje IPFS'        }, free: { en: 'Free during beta', es: 'Gratis en beta' }, growth: '✓', enterprise: '✓' },
    { feature: { en: 'x402',             es: 'x402'             }, free: { en: 'Testnet', es: 'Testnet' }, growth: '✓', enterprise: '✓' },
    { feature: { en: 'API pricing',      es: 'Precio API'         }, free: { en: 'Free (testnet)', es: 'Gratis (testnet)' }, growth: { en: '$0.05/call on mainnet (market state)', es: '$0.05/llamada en mainnet (market state)' }, enterprise: { en: 'Volume discount', es: 'Descuento por volumen' } },
    { feature: { en: 'Support',          es: 'Soporte'             }, free: '✗', growth: { en: 'Priority', es: 'Prioritario' }, enterprise: { en: 'SLA by agreement', es: 'SLA por acuerdo' } },
];

export default function PricingPage() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) =>
        language === 'es' ? es : en;

    const f = (feat: Feature) => language === 'es' ? feat.es : feat.en;
    const cellVal = (v: string | Feature) => typeof v === 'string' ? v : f(v);

    return (
        <main className="min-h-screen bg-black text-white antialiased">
{/* HERO */}
            <section className="relative pt-8 pb-16 sm:pt-8 sm:pb-20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,235,232,0.06),transparent_60%)]" />
                <div className="relative max-w-5xl mx-auto px-6">
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stellar-teal/20 bg-stellar-teal/5 text-stellar-teal text-xs font-mono">
                            <Sparkles className="w-3 h-3" />
                            {lang('Transparent pricing', 'Precios transparentes')}
                        </div>
                    </div>

                    <h1 className="text-center text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
                        {lang('No surprises.', 'Sin sorpresas.')}
                        <br />
                        <span className="bg-gradient-to-r from-stellar-teal to-stellar-yellow bg-clip-text text-transparent">
                            {lang('No fine print.', 'Sin letra chica.')}
                        </span>
                    </h1>
                    <p className="mt-6 text-center text-lg text-white/60 max-w-2xl mx-auto">
                        {lang(
                            'Start free. On mainnet you pay per request - your agent settles in USDC on-chain, no card needed.',
                            'Empieza gratis. En mainnet pagas por request - tu agente liquida en USDC on-chain, sin tarjeta.')}
                    </p>
                </div>
            </section>

            {/* PLANS */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* MAINNET PAY-PER-USE - lo que cobra HOY */}
                        <div className="flex flex-col p-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.04] relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="px-3 py-1 bg-emerald-400 text-[#0b0b0b] text-[10px] font-black uppercase rounded-full tracking-widest inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0b0b0b] animate-pulse" />
                                    {/* "En vivo" exige un pago liquidado reciente (AGENTS.md); el último
                                        a la cuenta de cobro es del 29-sep-2026 (Horizon, 9-nov). */}
                                    {lang('On Mainnet', 'En Mainnet')}
                                </span>
                            </div>
                            <div className="mb-6">
                                <div className="text-xs font-mono uppercase tracking-widest text-emerald-400/70 mb-2">Mainnet · Pay-per-use</div>
                                <div className="text-4xl font-black mb-1">$0<span className="text-lg text-white/40 font-normal">/mo</span></div>
                                <p className="text-sm text-white/50">
                                    {lang('Pay per settled request - no card, no subscription', 'Pagas por request liquidado - sin tarjeta, sin suscripción')}
                                </p>
                                <p className="text-xs text-emerald-400/60 mt-1">
                                    {lang('Your agent pays on-chain via x402 (USDC)', 'Tu agente paga on-chain vía x402 (USDC)')}
                                </p>
                            </div>
                            <ul className="space-y-2.5 flex-1 mb-8">
                                {FEATURES_MAINNET.map((feat) => (
                                    <li key={feat.en} className="flex items-start gap-2 text-sm text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
                                        {f(feat)}
                                    </li>
                                ))}
                            </ul>
                            <p className="mb-3 text-xs text-amber-400/80">
                                {lang('MPP Charge: experimental, untested on mainnet - for paid access, use x402.', 'MPP Charge: experimental, sin probar en mainnet; para acceso pagado usa x402.')}
                            </p>
                            <p className="mb-6 text-[11px] text-white/45 leading-relaxed">
                                <strong className="text-white/70">{lang('Update, 2026-10-04 (checked against the nirium 0.16.0 changelog that day):', 'Actualización, 2026-10-04 (verificado contra el changelog de nirium 0.16.0 ese día):')}</strong>{' '}
                                {lang(
                                    'this card used to list MPP Charge as live on mainnet. That was wrong: MPP Charge has never been verified end to end against our hosted endpoints (the testnet one rejected the payment when tested on 2026-10-01; mainnet was never tested). Use x402 for paid access.',
                                    'esta tarjeta listaba MPP Charge como en vivo en mainnet. Era incorrecto: MPP Charge nunca se verificó de punta a punta contra nuestros endpoints alojados (el de testnet rechazó el pago al probarlo el 2026-10-01; el de mainnet nunca se probó). Usa x402 para acceso pagado.')}
                            </p>
                            <p className="mb-6 -mt-4 text-[11px] text-white/45 leading-relaxed">
                                <strong className="text-white/70">{lang('Update, 2026-10-15 (checked against Horizon testnet that day):', 'Actualización, 2026-10-15 (verificado contra Horizon testnet ese día):')}</strong>{' '}
                                {lang(
                                    'the note above no longer holds for testnet. MPP Charge was verified on testnet on 2026-10-15 with the nirium SDK, in pull and push mode, both settled:',
                                    'la nota de arriba ya no aplica para testnet. MPP Charge se verificó en testnet el 2026-10-15 con el SDK de nirium, en modo pull y push, ambos liquidados:')}{' '}
                                <a href="https://stellar.expert/explorer/testnet/tx/b8c4ed568f6eb41321b97d251d7f3727c57570a226d187e3675a9df03496e3ed" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/70">b8c4ed56…</a>,{' '}
                                <a href="https://stellar.expert/explorer/testnet/tx/96d43d6f4cf38fbd3a4df2c2bb6625e650c0d0509184d86c1e42c7e6ebdf242c" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/70">96d43d6f…</a>.{' '}
                                {lang('These were internal tests, not customer usage. Mainnet is untested.', 'Fueron pruebas internas, no uso de clientes. Mainnet sigue sin probarse.')}
                            </p>
                            <Link href="/developers">
                                <Button variant="premium" className="w-full">
                                    {lang('Make your first paid call', 'Haz tu primera llamada pagada')}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>

                        {/* FREE */}
                        <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                            <div className="mb-6">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Testnet</div>
                                <div className="text-4xl font-black mb-1">$0</div>
                                <p className="text-sm text-white/50">
                                    {lang('Free forever on testnet', 'Para siempre en testnet')}
                                </p>
                            </div>
                            <ul className="space-y-2.5 flex-1 mb-8">
                                {FEATURES_FREE.map((feat) => (
                                    <li key={feat.en} className="flex items-start gap-2 text-sm text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
                                        {f(feat)}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/keys">
                                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
                                    {lang('Start free', 'Empezar gratis')}
                                </Button>
                            </Link>
                        </div>

                        {/* GROWTH - highlighted */}
                        <div className="flex flex-col p-6 rounded-2xl border border-stellar-teal/30 bg-stellar-teal/[0.04] relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                {/* Antes "Más popular": ningún cliente paga este plan todavía. */}
                                <span className="px-3 py-1 bg-stellar-teal text-[#0b0b0b] text-[10px] font-black uppercase rounded-full tracking-widest">
                                    {lang('Early access', 'Acceso anticipado')}
                                </span>
                            </div>
                            <div className="mb-6">
                                <div className="text-xs font-mono uppercase tracking-widest text-stellar-teal/60 mb-2">Growth</div>
                                <div className="text-4xl font-black mb-1">
                                    $299
                                    <span className="text-lg text-white/40 font-normal">/mo</span>
                                </div>
                                <p className="text-sm text-white/50">
                                    {lang('+ x402 per call ($0.05 on mainnet)', '+ x402 por llamada ($0.05 en mainnet)')}
                                </p>
                                <p className="text-xs text-white/30 mt-1">
                                    {lang('Software license - no % of capital', 'Licencia de software - sin % del capital')}
                                </p>
                                <p className="text-xs text-white/30 mt-1">
                                    {lang('By agreement - there is no in-app billing yet', 'Por acuerdo - todavía no hay cobro dentro del sitio')}
                                </p>
                            </div>
                            <ul className="space-y-2.5 flex-1 mb-8">
                                {FEATURES_GROWTH.map((feat) => (
                                    <li key={feat.en} className="flex items-start gap-2 text-sm text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-stellar-teal/80 shrink-0 mt-0.5" />
                                        {f(feat)}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/keys">
                                <Button variant="premium" className="w-full">
                                    {lang('Try on testnet', 'Probar en testnet')}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>

                        {/* ENTERPRISE */}
                        <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                            <div className="mb-6">
                                <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Enterprise</div>
                                <div className="text-4xl font-black mb-1">Custom</div>
                                <p className="text-sm text-white/50">
                                    {lang('For regulated fintechs, banks, and DAOs', 'Para fintechs reguladas, bancos y DAOs')}
                                </p>
                            </div>
                            <ul className="space-y-2.5 flex-1 mb-8">
                                {FEATURES_ENTERPRISE.map((feat) => (
                                    <li key={feat.en} className="flex items-start gap-2 text-sm text-white/70">
                                        <CheckCircle2 className="w-4 h-4 text-stellar-yellow/80 shrink-0 mt-0.5" />
                                        {f(feat)}
                                    </li>
                                ))}
                            </ul>
                            <a href="mailto:niriumprotocol@gmail.com">
                                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
                                    {lang('Talk to the team', 'Hablar con el equipo')}
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEE BREAKDOWN */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Fee breakdown', 'Desglose de fees')}
                    </h2>
                    <p className="mt-3 text-center text-white/50 text-sm">
                        {lang('Who charges what? Full transparency.', '¿Cuánto cobra quién? Transparencia total.')}
                    </p>

                    <div className="mt-10 space-y-4">
                        {[
                            {
                                label: lang('Nirium Software License', 'Licencia de Software Nirium'),
                                rows: [
                                    { who: lang('Platform fee (Growth)', 'Cuota plataforma (Growth)'), fee: '$299/mo', note: lang('Flat monthly - no % of capital', 'Mensual fijo - sin % del capital'), highlight: true, total: false },
                                    // Antes una sola fila lumpeaba "execution, market, signals" bajo un
                                    // rango $0.02-0.25 sin decir red - solo market corre en mainnet;
                                    // signals y execute son testnet-only por diseño (ver FEATURES_FREE
                                    // arriba). Separado en dos filas para que el fee no implique más
                                    // disponibilidad de la real.
                                    { who: lang('x402 market state - mainnet', 'x402 market state - mainnet'), fee: '$0.05', note: lang('The only x402 endpoint that charges on mainnet (last settled payment 18 Nov 2026, an integration test)', 'El único endpoint x402 que cobra en mainnet (último pago liquidado: 18 nov 2026, una prueba de integración)'), highlight: false, total: false },
                                    { who: lang('x402 snapshot + execute - testnet only', 'x402 snapshot + execute - solo testnet'), fee: '$0.02 / $0.25', note: lang('Need the autonomous loop / a signing key the mainnet box does not hold', 'Necesitan el loop autónomo / una llave firmante que el box de mainnet no tiene'), highlight: false, total: false },
                                ],
                            },
                            {
                                // 9-nov-2026: antes "Fees del Partner Regulado" con una fila de "ITF/casa
                                // de bolsa". Nirium no trabaja con ninguna ITF ni casa de bolsa; los
                                // terceros reales son Etherfuse, DeFindex y la red.
                                label: lang('Third-party costs (not Nirium)', 'Costos de terceros (no Nirium)'),
                                rows: [
                                    { who: lang('Etherfuse (CETES issuance and redemption)', 'Etherfuse (emisión y canje de CETES)'), fee: 'etherfuse.com', feeLink: 'https://etherfuse.com', note: lang('Charged by Etherfuse under its own terms - Nirium does not receive or manage this fee', 'Lo cobra Etherfuse con sus propios términos - Nirium no recibe ni administra ese cobro'), highlight: false, total: false },
                                    { who: lang('DeFindex vault fee', 'Comisión de la bóveda DeFindex'), fee: lang('Set by the vault owner', 'La fija el dueño de la bóveda'), note: lang('0 on our evidence vault; DeFindex takes half of whatever the vault fee is', '0 en nuestra bóveda de evidencia; DeFindex se queda la mitad de lo que sea esa comisión'), highlight: false, total: false },
                                    { who: lang('Stellar network (gas)', 'Red Stellar (gas)'), fee: '<$0.01', note: lang('Per transaction', 'Por transacción'), highlight: false, total: false },
                                ],
                            },
                        ].map((section) => (
                            <div key={section.label} className="rounded-xl border border-white/10 overflow-hidden">
                                <div className="px-4 py-3 bg-white/[0.03] border-b border-white/5">
                                    <span className="text-sm font-bold">{section.label}</span>
                                </div>
                                <table className="w-full">
                                    <tbody className="divide-y divide-white/5">
                                        {section.rows.map((row) => (
                                            <tr key={row.who} className={row.total ? 'bg-stellar-teal/5' : ''}>
                                                <td className={`px-4 py-2.5 text-sm ${row.total ? 'font-bold text-stellar-teal' : 'text-white/70'}`}>{row.who}</td>
                                                <td className={`px-4 py-2.5 text-sm font-mono ${row.total ? 'font-black text-stellar-teal' : row.highlight ? 'text-white' : 'text-white/60'}`}>
                                                    {(row as any).feeLink ? (
                                                        <a href={(row as any).feeLink} target="_blank" rel="noopener noreferrer" className="text-stellar-teal/70 hover:text-stellar-teal underline underline-offset-2 transition-colors">
                                                            {row.fee} ↗
                                                        </a>
                                                    ) : row.fee}
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-white/40 hidden sm:table-cell">{row.note}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FULL COMPARISON TABLE */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        {lang('Comparison table', 'Tabla comparativa')}
                    </h2>

                    <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="text-left px-4 py-3 text-xs text-white/40 uppercase tracking-wider font-mono">
                                        {lang('Feature', 'Característica')}
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs text-white/40 uppercase tracking-wider font-mono">Free</th>
                                    <th className="text-center px-4 py-3 text-xs text-stellar-teal/60 uppercase tracking-wider font-mono">Growth</th>
                                    <th className="text-center px-4 py-3 text-xs text-white/40 uppercase tracking-wider font-mono">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {COMPARISON.map((row) => (
                                    <tr key={row.feature.en} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-3 text-white/70 text-xs">{f(row.feature)}</td>
                                        <td className="px-4 py-3 text-center text-xs text-white/60">{cellVal(row.free)}</td>
                                        <td className="px-4 py-3 text-center text-xs text-stellar-teal/80 font-medium">{cellVal(row.growth)}</td>
                                        <td className="px-4 py-3 text-center text-xs text-white/60">{cellVal(row.enterprise)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">FAQ</h2>

                    <div className="mt-10 space-y-4">
                        {[
                            {
                                q: lang('Why flat pricing instead of % of capital?', '¿Por qué precio fijo y no % del capital?'),
                                a: lang(
                                    'Nirium is software, not a fund manager: we charge for the software, never a share of your money. Any cost tied to the assets themselves (issuing or redeeming CETES, a vault fee, network fees) is charged by that third party under its own terms, not by us.',
                                    'Nirium es software, no una administradora de fondos: cobramos por el software, nunca una parte de tu dinero. Cualquier costo ligado a los activos (emitir o canjear CETES, la comisión de una bóveda, el fee de red) lo cobra ese tercero con sus propios términos, no nosotros.'),
                            },
                            {
                                q: lang('What is on mainnet today and how is it billed?', '¿Qué está en mainnet hoy y cómo se cobra?'),
                                a: lang(
                                    "Settlement (x402), audit anchoring and reporting run on Stellar mainnet now. MPP Charge is experimental and untested on mainnet; for paid access, use x402. Of the three x402 premium endpoints, only market state ($0.05) actually runs on mainnet - it only reads public rate data, so it needs neither a live signal loop nor a signing key. Snapshot signals ($0.02) and strategy execution ($0.25) run on testnet only, by design: signals need the autonomous loop, which does not run on the mainnet box (receive-only), and execution needs a signing key the mainnet box deliberately does not hold. Every mainnet call settles on-chain before the response - every payment is a verifiable transaction. Audit anchoring is free during beta; the reporting API is free read-only.",
                                    'La liquidación (x402), el anclaje de auditoría y la reportería ya corren en Stellar mainnet. MPP Charge es experimental y no se ha probado en mainnet; para acceso pagado usa x402. De los tres endpoints premium x402, solo el market state ($0.05) corre de verdad en mainnet - solo lee datos públicos de tasas, así que no necesita ni el loop de señales ni una llave firmante. El snapshot de señales ($0.02) y la ejecución de estrategia ($0.25) corren solo en testnet, por diseño: las señales necesitan el loop autónomo, que no corre en el box de mainnet (receive-only), y la ejecución necesita una llave firmante que el box de mainnet deliberadamente no tiene. Cada llamada en mainnet liquida on-chain antes de responder - cada pago es una transacción verificable. El anclaje de auditoría es gratis en beta; el API de reportería es gratis en lectura.'),
                            },
                            {
                                q: lang('What does the treasury node cost?', '¿Cuánto cuesta el nodo de tesorería?'),
                                a: lang(
                                    'On mainnet the vault is a DeFindex vault you own: deploying it pays nothing to Nirium, only the Stellar network fee, from your own wallet - the vault is yours from the first block. On mainnet, deploying and depositing through Nirium (this site or the API) is invite-only; withdrawing from your vault is always open. On testnet, creating a vault with NiriumVault, our own proof-of-concept contract, charges 12.5 testnet XLM that go to Nirium’s testnet treasury; testnet XLM has no value. Autonomous rebalancing is early access and carries no cost during the beta. On mainnet it is invite-only, and not because of a technical limit: the signer runs, but whether rebalancing someone else’s vault is regulated activity is an open question with no written legal opinion yet, so we do not open it before there is one. The vault fee is set by you as the vault owner; on our evidence vault it is 0, and DeFindex takes half of whatever that fee is, so today nobody takes a cut of the yield. Nirium never takes a percentage of your capital.',
                                    'En mainnet la bóveda es una bóveda de DeFindex que es tuya: desplegarla no le paga nada a Nirium, solo el fee de red de Stellar, desde tu propia wallet - la bóveda es tuya desde el primer bloque. En mainnet, desplegar y depositar a través de Nirium (este sitio o la API) es solo por invitación; retirar de tu bóveda siempre está abierto. En testnet, crear una bóveda con NiriumVault, nuestro contrato de prueba de concepto, cobra 12.5 XLM de testnet que van a la tesorería de testnet de Nirium; el XLM de testnet no tiene valor. El rebalanceo autónomo es early access y no tiene costo durante la beta. En mainnet es solo por invitación, y no por un límite técnico: el firmante corre, pero si reacomodar la bóveda de otra persona es actividad regulada es una pregunta abierta, todavía sin opinión legal por escrito, así que no lo abrimos antes de tenerla. La comisión de la bóveda la fijas tú como dueño; en nuestra bóveda de evidencia es 0, y DeFindex se queda la mitad de esa comisión, así que hoy nadie se lleva una parte del rendimiento. Nirium nunca cobra un porcentaje de tu capital.'),
                            },
                            {
                                q: lang('How do I pay $0.05 if there is no card on file?', '¿Cómo pago $0.05 si no hay tarjeta?'),
                                // El cierre decía que los developers nuevos reciben un starter credit
                                // patrocinado. No existe: nada lo emite ni lo redime. Se reemplaza por lo
                                // que sí es gratis de verdad - testnet - que además responde mejor la
                                // pregunta real detrás de la pregunta: "¿puedo probar sin gastar?".
                                // El monto de ejemplo es $0.05 (market state) porque es el único de los
                                // tres endpoints x402 que corre de verdad en mainnet - usar $0.02
                                // (snapshot, testnet-only) aquí habría implicado que ese precio también
                                // aplica en mainnet, que es justo el error que esta página tenía.
                                a: lang(
                                    'Your agent pays, not your finance team: the API replies 402, the SDK signs a USDC payment from your wallet, the facilitator settles it on-chain (network fees sponsored), and the API responds. One request, one payment, one receipt. That $0.05 call is market state - the endpoint that actually runs on mainnet. To try it without spending, the same market-state endpoint also runs on testnet with free faucet USDC.',
                                    'Paga tu agente, no tu equipo de finanzas: el API responde 402, el SDK firma un pago USDC desde tu wallet, el facilitador lo liquida on-chain (fees de red patrocinados) y el API responde. Un request, un pago, un recibo. Esa llamada de $0.05 es market state - el endpoint que de verdad corre en mainnet. Para probarlo sin gastar, el mismo endpoint de market state también corre en testnet con USDC de faucet.'),
                            },
                            {
                                q: lang('When does the treasury vault reach mainnet?', '¿Cuándo llega el vault de tesorería a mainnet?'),
                                // 21-nov-2026 (PRC3): "ya auditadas" iba sin fuente.
                                a: (
                                    <>
                                        {lang(
                                            'NiriumVault, Nirium’s own vault contract, stays on testnet until it clears a formal external Soroban audit - by design, not by limitation. Treasury rebalancing on mainnet runs over DeFindex vaults (third-party, ',
                                            'NiriumVault, el contrato de bóveda propio de Nirium, permanece en testnet hasta pasar una auditoría externa formal de Soroban - por diseño, no por limitación. El rebalanceo de tesorería en mainnet corre sobre bóvedas de DeFindex (de terceros, ')}
                                        <a href="https://github.com/paltalabs/defindex/blob/main/audits/2025_03_18_ottersec_defindex_audit.pdf" target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline">
                                            {lang('audited by OtterSec, March 2025', 'auditadas por OtterSec, marzo de 2025')}
                                        </a>
                                        {lang(
                                            '), invite-only. The non-custodial nodes above did not need that gate because they never hold funds.',
                                            '), solo por invitación. Los nodos no custodiales de arriba no requieren esa compuerta porque nunca custodian fondos.')}
                                    </>
                                ),
                            },
                            {
                                q: lang('Does Nirium custody my funds?', '¿Nirium custodia mis fondos?'),
                                a: lang(
                                    "No. Nirium never holds your keys and cannot withdraw your funds. The only role it can hold on your vault moves funds, or swaps them, inside that same vault - never out of it - and you can revoke it at any time.",
                                    'No. Nirium nunca tiene tus llaves y no puede retirar tus fondos. El único rol que puede tener en tu bóveda mueve fondos, o hace swaps, dentro de esa misma bóveda - nunca hacia afuera - y puedes revocarlo cuando quieras.'),
                            },
                            {
                                q: lang('Who charges the financial commissions?', '¿Quién cobra las comisiones financieras?'),
                                a: lang(
                                    'The third party that provides each asset or protocol, under its own terms: Etherfuse for issuing and redeeming tokenized CETES (see etherfuse.com), DeFindex and the vault owner for the vault fee, and the Stellar network for transaction fees. Nirium only charges software license fees, plus per-request x402 charges in USDC for its own API.',
                                    'El tercero que da cada activo o protocolo, con sus propios términos: Etherfuse por emitir y canjear CETES tokenizados (ver etherfuse.com), DeFindex y el dueño de la bóveda por la comisión de la bóveda, y la red Stellar por el fee de cada transacción. Nirium solo cobra licencias de software, más cargos x402 por request en USDC por su propia API.'),
                            },
                            {
                                q: lang('Are there volume discounts?', '¿Hay descuentos por volumen?'),
                                a: lang(
                                    'Yes on Enterprise. For high API volume or multi-tenant deployments, pricing is negotiable. Contact niriumprotocol@gmail.com.',
                                    'Sí en Enterprise. Para alto volumen de API o despliegues multi-tenant, los precios son negociables. Contacta a niriumprotocol@gmail.com.'),
                            },
                        ].map((faq) => (
                            <div key={faq.q} className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                                <h3 className="text-sm font-bold mb-2">{faq.q}</h3>
                                <p className="text-sm text-white/60 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DISCLAIMER */}
            <section className="py-8 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-white/70 leading-relaxed">
                                {language === 'es' ? (
                                    <>La liquidación x402, el anclaje de auditoría y los reportes corren en <strong>Stellar Mainnet</strong>; NiriumVault y algunas funciones siguen solo en testnet. Los precios son indicativos y pueden cambiar. La tasa de CETES que muestra el sitio es un valor de referencia fijo (12-nov-2026), no una lectura en vivo ni una garantía de Nirium. No es asesoría financiera.</>
                                ) : (
                                    <>x402 settlement, audit anchoring and reporting run on <strong>Stellar Mainnet</strong>; NiriumVault and some features are still testnet-only. Prices are indicative and may change. The CETES rate shown on the site is a fixed reference value (12 Nov 2026), not a live reading or a Nirium guarantee. Not financial advice.</>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        {lang('Start today.', 'Empieza hoy.')}
                    </h2>
                    <p className="mt-4 text-white/60">
                        {/* "Cancela cuando quieras" no tenía qué cancelar: no hay suscripción en el sitio. */}
                        {lang('No card. Free on testnet.', 'Sin tarjeta. Gratis en testnet.')}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/keys">
                            <Button size="lg" variant="premium">
                                {lang('Get a free API key', 'Obtén una API key gratis')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/developers">
                            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
                                {lang('View docs', 'Ver documentación')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
