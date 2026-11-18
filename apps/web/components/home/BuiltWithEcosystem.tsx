/** Built with Nirium - moved out of the home page into its own /ecosystem route
 * (2026-10-09) so it has a real nav entry instead of living mid-scroll on home.
 * Data/markup unchanged from the home page version it replaced. **/
'use client';

import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// "Built with Nirium": tres grupos fijos (Integraciones / Construido sobre
// Nirium / Nirium usa). Cada ficha entra solo cuando el equipo dueño del
// proyecto aprobó su propio texto - nunca antes. Fuente: BUILT_WITH_CARDS.md
// (2026-10-09). Reverificar hashes/versiones contra la fuente real antes de
// volver a tocar este contenido - puede quedar desactualizado.
type BuiltWithCard = {
    name: string;
    logo?: string;
    tone: 'live' | 'gated' | 'experimental' | 'merged';
    badge: { en: string; es: string };
    tags: string[];
    description: { en: string; es: string };
    evidenceUrl?: string;
    evidenceLabel?: { en: string; es: string };
    // Optional second verifiable reference, rendered as its own link instead
    // of folding the whole card into one href. Used when there's a second
    // artifact worth linking directly (e.g. the npm package itself, next to
    // a PR that's evidence of something else).
    secondaryEvidenceUrl?: string;
    secondaryEvidenceLabel?: { en: string; es: string };
    // Optional third reference, same style as the second (e.g. a partner's own
    // documentation that cites Nirium).
    tertiaryEvidenceUrl?: string;
    tertiaryEvidenceLabel?: { en: string; es: string };
    // Optional live demo anyone can open and try. Rendered as a button, apart
    // from the evidence links: a demo shows how it works, it is not proof of use.
    demoUrl?: string;
    demoLabel?: { en: string; es: string };
};
type BuiltWithGroup = { title: { en: string; es: string }; layout: 'featured' | 'dense'; cards: BuiltWithCard[] };
const BUILT_WITH_GROUPS: BuiltWithGroup[] = [
    {
        title: { en: 'Integrations', es: 'Integraciones' },
        layout: 'featured',
        cards: [
            {
                name: 'Pollar',
                logo: '/partners/pollar.png',
                tone: 'experimental',
                badge: { en: 'v0.6.5, testnet proven', es: 'v0.6.5, probado en testnet' },
                tags: ['Wallets', 'Social login', 'x402'],
                description: {
                    en: "Social-login wallets (email/Google), no seed phrase. nirium-pollar-adapter v0.6.5 translates Pollar's signature into a SEP-43 auth entry to pay via x402, and can auto-anchor an Audit Trail receipt whenever a Pollar transaction settles. Checked live on testnet (2026-11-01): a real payment produced a verifiable receipt, with its transaction hash and IPFS CID both published. Before that, on 2026-08-30, Pollar's CTO paid 0.05 USDC via x402 from his own Pollar wallet through the testnet demo (tx 2ca4a89a...), and confirmed it in writing. No evidence it runs in Pollar's own production today. A letter of intent was signed on 2026-10-08: a statement of intent, not a pilot, and no paid use.",
                    es: 'Wallets con login social (correo/Google), sin frase semilla. nirium-pollar-adapter v0.6.5 traduce su firma a un auth entry SEP-43 para pagar por x402, y puede anclar automáticamente un recibo de Audit Trail cada vez que una transacción de Pollar se liquida. Verificado en vivo en testnet (1-nov-2026): un pago real produjo un recibo verificable, con su hash de transacción y CID de IPFS publicados. Antes, el 30-ago-2026, el CTO de Pollar pagó 0.05 USDC por x402 desde su propia wallet de Pollar con el demo de testnet (tx 2ca4a89a...), y lo confirmó por escrito. Sin evidencia de que corra en producción de Pollar hoy. Se firmó una carta de intención el 2026-10-08: es una declaración de intención, no un piloto, y no hay uso de pago.',
                },
                evidenceUrl: 'https://github.com/pollar-xyz/pollar-apps/pull/30',
                evidenceLabel: { en: 'pollar-xyz/pollar-apps#30 - merged 2026-08-31', es: 'pollar-xyz/pollar-apps#30 - merged 2026-08-31' },
                secondaryEvidenceUrl: 'https://stellar.expert/explorer/testnet/tx/2ca4a89aa56504dcd7f6e17472a6662eaed6bb00e134806defb674673b369038',
                secondaryEvidenceLabel: { en: 'Pollar CTO payment, testnet tx 2ca4a89a... - 2026-08-30', es: 'Pago del CTO de Pollar, tx testnet 2ca4a89a... - 30-ago-2026' },
                tertiaryEvidenceUrl: 'https://docs.pollar.xyz/docs/guides/x402-payments',
                tertiaryEvidenceLabel: { en: "Pollar's x402 guide uses Nirium as its example (docs, not product use) - checked 2026-11-14", es: 'La guía x402 de Pollar usa Nirium como ejemplo (documentación, no uso en su producto) - revisada 14-nov-2026' },
                demoUrl: 'https://nirium-pollar-x402-demo.vercel.app/',
                demoLabel: { en: 'Try the live demo (testnet)', es: 'Probar el demo en vivo (testnet)' },
            },
            {
                name: 'AgentLedger',
                logo: '/partners/agentledger.png',
                tone: 'experimental',
                badge: { en: 'Policy hook: testnet proven, mainnet pending', es: 'Hook de políticas: probado en testnet, mainnet pendiente' },
                tags: ['Agent governance', 'Policy hook', 'x402'],
                description: {
                    en: "Spend governance for AI agent wallets: caps, human approvals, a decision log. Uses the policy hook in x402Fetch() to approve, hold or reject each payment before it's signed: ALLOW and WAIT-then-approval settled on testnet, and a concurrent DENY was refused - all on testnet; the same policy-hook test on mainnet hasn't run yet. Separately, its wallet made 15 integration-test payments to Nirium on mainnet (Aug to Sep 2026), governed by its own engine before the hook existed; that wallet was initially funded by Nirium's founder. Its founder, Fer Mendoza, joined the Nirium team in October 2026.",
                    es: 'Gobernanza de gasto para wallets de agentes de IA: topes, aprobaciones humanas, bitácora de decisiones. Usa el hook policy de x402Fetch() para aprobar, retener o rechazar cada pago antes de firmarlo: ALLOW y WAIT-luego-aprobación se liquidaron en testnet, y un DENY concurrente fue rechazado - todo en testnet; la misma prueba del hook de políticas en mainnet todavía no corre. Aparte, su wallet hizo 15 pagos de prueba de integración a Nirium en mainnet (ago a sep 2026), gobernados por su propio motor antes de que existiera el hook; esa wallet la fondeó al inicio el fundador de Nirium. Su fundador, Fer Mendoza, se unió al equipo de Nirium en octubre de 2026.',
                },
                evidenceUrl: 'https://stellar.expert/explorer/testnet/tx/63fe315ad191c12d8baab4e7d146dc4b8cd7bb0c0ce97261799021eb5163b71d',
                evidenceLabel: { en: 'tx 63fe315a... - successful, 2026-10-09', es: 'tx 63fe315a... - successful, 2026-10-09' },
            },
            {
                name: 'TIA',
                logo: '/partners/tia.jpg',
                tone: 'experimental',
                badge: { en: 'Audit Trail, 7 real anchors', es: 'Audit Trail, 7 anclajes reales' },
                tags: ['Audit Trail', 'x402Serve'],
                description: {
                    en: "An external integrator (TIA) anchors a signed receipt of its quotes in the Audit Trail - 7 real anchors to date (2026-10-18, 2026-10-23, two on 2026-11-02, two on 2026-11-06 and 2026-11-12, mainnet), signed with two TIA keys of its own. It also sells with Nirium: its public backend charges 0.10 USDC per call on mainnet with x402Serve() (endpoint /premium/fx), paid straight to TIA's own account - Nirium is not in the path. The wallets behind its x402 payments are TIA's own test accounts, confirmed by its founder - not a real client.",
                    es: 'Un integrador externo (TIA) ancla un recibo firmado de sus cotizaciones en el Audit Trail - 7 anclajes reales a la fecha (18-oct-2026, 23-oct-2026, dos el 2-nov-2026, dos el 6-nov-2026 y 12-nov-2026, mainnet), firmados con dos llaves propias de TIA. También vende con Nirium: su backend público cobra 0.10 USDC por llamada en mainnet con x402Serve() (endpoint /premium/fx), y el pago llega directo a la cuenta de TIA, sin pasar por Nirium. Las wallets detrás de sus pagos x402 son cuentas de prueba propias de TIA, confirmadas por su fundador - no un cliente real.',
                },
                evidenceUrl: 'https://gateway.pinata.cloud/ipfs/QmZ9bQxXLqoCvAQ6AtRChd18MS9YkjBF6MbT9k5e84PTTv',
                evidenceLabel: { en: 'CID QmZ9bQxX... - anchored 2026-11-12', es: 'CID QmZ9bQxX... - anclado 12-nov-2026' },
                secondaryEvidenceUrl: 'https://github.com/Edgadafi/remesa-liquidez/blob/bb9d14b53c37b0662697a8a4c8a4c9c62826764a/backend/src/app.ts#L165',
                secondaryEvidenceLabel: { en: 'x402Serve() in TIA\'s public backend', es: 'x402Serve() en el backend público de TIA' },
            },
        ],
    },
    {
        title: { en: 'Built on Nirium', es: 'Construido sobre Nirium' },
        layout: 'featured',
        cards: [],
    },
    {
        title: { en: 'Nirium uses', es: 'Nirium usa' },
        layout: 'dense',
        cards: [
            {
                name: 'OpenZeppelin',
                tone: 'live',
                badge: { en: 'Every x402 settlement', es: 'Cada liquidación x402' },
                tags: ['x402 facilitator', 'Mainnet'],
                description: {
                    en: 'x402 payment facilitator - verifies and settles on-chain, with sponsored fees. Every x402 payment route on the agent, testnet and mainnet, delegates verify/settle to their hosted facilitator. Last mainnet settlement through it: 29 Sep 2026.',
                    es: 'Facilitador de pagos x402 - verifica y liquida en cadena, con fees patrocinados. Toda ruta de pago x402 del agente, en testnet y mainnet, delega verify/settle a su facilitador hospedado. Última liquidación en mainnet a través de él: 29-sep-2026.',
                },
                evidenceUrl: 'https://stellar.expert/explorer/public/tx/b34630f6637d6773ad4f7378dac8690ae6d1809173ff9c9541d22165aeef5788',
                evidenceLabel: { en: 'mainnet tx b34630f6... - 2026-09-29', es: 'tx mainnet b34630f6... - 29-sep-2026' },
            },
            {
                name: 'DeFindex',
                tone: 'gated',
                badge: { en: 'Mainnet, test vault only', es: 'Mainnet, bóveda de prueba' },
                tags: ['Treasury', 'Soroban vaults'],
                description: {
                    en: "Yield vaults on Soroban, with roles separated by contract design. The agent holds only the RebalanceManager role of a vault structured for the client to own (today's is our own test vault) - that role can't withdraw funds or change roles, by contract. 4 real rebalances, all on 2026-08-06, none since - mainnet, test vault only, no clients yet.",
                    es: 'Bóvedas de rendimiento en Soroban, con roles separados por diseño de contrato. El agente sostiene solo el rol RebalanceManager de una bóveda pensada para que sea del cliente (hoy es nuestra bóveda de prueba) - ese rol no puede retirar fondos ni cambiar roles, por contrato. 4 rebalanceos reales, todos el 6-ago-2026, ninguno desde entonces - mainnet, bóveda de prueba, sin clientes.',
                },
                evidenceUrl: 'https://nirium-agent-mainnet.fly.dev/api/treasury/vault/CAMDXG6L4LXLXXV675KZSHM3BMSETZ4NVMC7JYIQCZ2JTG54OMSK57MH',
                evidenceLabel: { en: 'vault roles, live API', es: 'roles de la bóveda, API en vivo' },
            },
            {
                name: 'Etherfuse',
                tone: 'gated',
                badge: { en: 'Test environment only', es: 'Solo entorno de pruebas' },
                tags: ['CETES', 'Onramp'],
                description: {
                    en: "Issues tokenized CETES and runs the MXN -> CETES SPEI onramp. Test environment quotes power /ramp; the mainnet link is indirect, via DeFindex's own strategy - not a direct Nirium integration.",
                    es: 'Emite CETES tokenizados y opera el onramp MXN -> CETES vía SPEI. Las cotizaciones del entorno de pruebas alimentan /ramp; la relación con mainnet es indirecta, vía la estrategia de DeFindex - no una integración directa de Nirium.',
                },
                evidenceUrl: 'https://api.etherfuse.com/lookup/stablebonds',
                evidenceLabel: { en: 'api.etherfuse.com/lookup/stablebonds - verified 2026-10-09', es: 'api.etherfuse.com/lookup/stablebonds - verificado 2026-10-09' },
            },
            {
                name: 'Trustless Work',
                tone: 'gated',
                badge: { en: 'Mixed, testnet proven', es: 'Mixto, probado en testnet' },
                tags: ['Escrow', 'Soroban', 'Payouts'],
                description: {
                    en: "Programmable milestone-based escrows on Soroban. 9 of our research PRs merged by their maintainer, plus a Multi-Release escrow integration for Payouts tested end to end on testnet. Deploy also tested on mainnet, but the automatic approve/release signer never ran there - full rollout on hold pending the same written legal opinion on Art. 24 Bis 4 as Treasury. A letter of intent was signed in October 2026: a statement of intent, not a paid pilot. A testnet pilot gates milestone release on anchored evidence: an agent checks the record's hash, its milestone and the service provider's signature before approving and releasing, and refused one milestone that failed. Written up as a research note, backed by 6 on-chain testnet transaction hashes.",
                    es: 'Escrows de pago programables en Soroban (milestone-based). 9 PRs de investigación propios mergeados por su maintainer, más una integración del escrow Multi-Release para Payouts probada de punta a punta en testnet. El deploy también se probó en mainnet, pero el firmante automático de approve/release nunca corrió ahí - rollout completo en pausa hasta tener la misma opinión legal por escrito sobre el Art. 24 Bis 4 que Treasury. Se firmó una carta de intención en octubre de 2026: es una declaración de intención, no un piloto de pago. Un piloto en testnet condiciona la liberación de milestones a evidencia anclada: un agente revisa el hash del registro, su milestone y la firma del proveedor de servicio antes de aprobar y liberar, y rechazó un milestone que no pasó. Documentado como nota de investigación, respaldada por 6 hashes de transacciones on-chain en testnet.',
                },
                evidenceUrl: 'https://github.com/Trustless-Work/agentic-escrow-research/pull/13',
                evidenceLabel: { en: 'PRs #1-4 merged 2026-09-21, #9 merged 2026-11-02, #10-11 merged 2026-11-04, #12-13 merged 2026-11-05', es: 'PRs #1-4 mergeados 2026-09-21, #9 mergeado 2026-11-02, #10-11 mergeados 2026-11-04, #12-13 mergeados 2026-11-05' },
            },
            {
                name: 'Stellar MPP SDK (@stellar/mpp)',
                tone: 'experimental',
                badge: { en: 'Testnet', es: 'Testnet' },
                tags: ['MPP Charge', 'USDC'],
                description: {
                    en: 'MPP Charge on testnet: per-request USDC transfers the server verifies itself, no facilitator. Verified with settled payments on 2026-10-15; mainnet not tested.',
                    es: 'MPP Charge en testnet: transferencias USDC por request que el propio servidor verifica, sin facilitador. Verificado con pagos liquidados el 2026-10-15; mainnet sin probar.',
                },
                evidenceUrl: 'https://stellar.expert/explorer/testnet/tx/b8c4ed568f6eb41321b97d251d7f3727c57570a226d187e3675a9df03496e3ed',
                evidenceLabel: { en: 'testnet tx b8c4ed56... - successful, 2026-10-15', es: 'tx testnet b8c4ed56... - successful, 2026-10-15' },
            },
            {
                // 12-nov-2026: packages/agent/src/services/ipfsAuditBridge.ts fija en Pinata
                // (pinJSONToIPFS); apps/web/lib/auditVerify.ts y /api/ipfs leen primero del
                // gateway dedicado de Filebase; el CLI (nirium verify) también lo usa primero.
                name: 'IPFS: Pinata + Filebase',
                tone: 'live',
                badge: { en: 'Every Audit Trail receipt', es: 'Cada recibo de Audit Trail' },
                tags: ['IPFS', 'Audit Trail'],
                description: {
                    en: "Pinata pins every Audit Trail receipt to IPFS. Filebase's dedicated gateway is the first one /verify, this site and the CLI's nirium verify read from, with Pinata, ipfs.io and dweb.link as fallbacks. The CID is the hash of the content, so every gateway has to serve the same bytes.",
                    es: 'Pinata fija en IPFS cada recibo de Audit Trail. El gateway dedicado de Filebase es el primero del que leen /verify, este sitio y nirium verify del CLI, con Pinata, ipfs.io y dweb.link de respaldo. El CID es el hash del contenido, así que cualquier gateway tiene que servir los mismos bytes.',
                },
                evidenceUrl: 'https://nirium.myfilebase.com/ipfs/QmZ9bQxXLqoCvAQ6AtRChd18MS9YkjBF6MbT9k5e84PTTv',
                evidenceLabel: { en: 'A receipt via the Filebase gateway', es: 'Un recibo por el gateway de Filebase' },
            },
        ],
    },
];
const BUILT_WITH_TONE_CLASS: Record<BuiltWithCard['tone'], string> = {
    live: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400',
    gated: 'border-stellar-teal/25 bg-stellar-teal/10 text-stellar-teal',
    experimental: 'border-amber-400/25 bg-amber-400/10 text-amber-400',
    merged: 'border-white/20 bg-white/[0.06] text-white/55',
};
function BuiltWithLogo({ name, logo }: { name: string; logo?: string }) {
    if (!logo) return null;
    return (
        <div className="w-11 h-11 shrink-0 rounded-lg bg-white/5 border border-white/10 p-1.5 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt={`${name} logo`} className="w-full h-full object-contain" />
        </div>
    );
}

export default function BuiltWithEcosystem({ heading = true }: { heading?: boolean }) {
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === 'es' ? es : en);

    return (
        <section className="py-16 sm:py-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
                {heading && (
                    <>
                        <h2 className="text-2xl sm:text-3xl font-bold">{lang('Built with Nirium', 'Hecho con Nirium')}</h2>
                        <p className="mt-4 text-white/55 max-w-xl mx-auto text-sm">
                            {lang("What's integrated with Nirium, what's built on it, and what Nirium itself depends on.", 'Qué se integra con Nirium, qué se construye sobre él, y de qué depende Nirium mismo.')}
                        </p>
                    </>
                )}
                <div className="mt-10 space-y-12">
                    {BUILT_WITH_GROUPS.map((group) => (
                        <div key={group.title.en}>
                            <h3 className="text-left text-xs font-semibold uppercase tracking-wider text-white/40 mb-5">
                                {lang(group.title.en, group.title.es)}
                            </h3>
                            {group.cards.length > 0 ? (
                                <div className={`grid gap-5 text-left ${group.layout === 'featured' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                                    {group.cards.map((card) => {
                                        const body = (
                                            <>
                                                <div className="flex items-start justify-between gap-3">
                                                    <BuiltWithLogo name={card.name} logo={card.logo} />
                                                    <span className={`shrink-0 ml-auto inline-flex px-2 py-1 rounded-full border text-[10px] font-semibold leading-none text-right ${BUILT_WITH_TONE_CLASS[card.tone]}`}>
                                                        {lang(card.badge.en, card.badge.es)}
                                                    </span>
                                                </div>
                                                <h4 className="mt-3 text-base font-bold">{card.name}</h4>
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    {card.tags.map((tag) => (
                                                        <span key={tag} className="px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.04] text-[10px] text-white/50">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="mt-3 text-xs text-white/60 leading-relaxed line-clamp-3">
                                                    {lang(card.description.en, card.description.es)}
                                                </p>
                                            </>
                                        );
                                        // Most cards fold into one clickable link. A card with a
                                        // second verifiable reference (e.g. the npm package next
                                        // to the PR that's evidence of something else) instead
                                        // renders as a non-link wrapper with two labeled links.
                                        if (card.secondaryEvidenceUrl) {
                                            return (
                                                <div
                                                    key={card.name}
                                                    className="min-w-0 flex flex-col p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.035] transition-colors"
                                                >
                                                    {body}
                                                    <div className="mt-auto pt-4 flex flex-col gap-1.5 text-xs">
                                                        <a
                                                            href={card.evidenceUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-stellar-teal/80 hover:text-stellar-teal"
                                                        >
                                                            {card.evidenceLabel ? lang(card.evidenceLabel.en, card.evidenceLabel.es) : lang('View details', 'Ver detalles')} <ArrowRight className="w-3 h-3 shrink-0" />
                                                        </a>
                                                        <a
                                                            href={card.secondaryEvidenceUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-white/50 hover:text-white/70"
                                                        >
                                                            {card.secondaryEvidenceLabel ? lang(card.secondaryEvidenceLabel.en, card.secondaryEvidenceLabel.es) : lang('View details', 'Ver detalles')} <ArrowRight className="w-3 h-3 shrink-0" />
                                                        </a>
                                                        {card.tertiaryEvidenceUrl && (
                                                            <a
                                                                href={card.tertiaryEvidenceUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1.5 text-white/50 hover:text-white/70"
                                                            >
                                                                {card.tertiaryEvidenceLabel ? lang(card.tertiaryEvidenceLabel.en, card.tertiaryEvidenceLabel.es) : lang('View details', 'Ver detalles')} <ArrowRight className="w-3 h-3 shrink-0" />
                                                            </a>
                                                        )}
                                                        {card.demoUrl && (
                                                            <a
                                                                href={card.demoUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="mt-2 self-start inline-flex items-center gap-1.5 rounded-full border border-stellar-teal/40 bg-stellar-teal/10 px-3 py-1.5 font-semibold text-stellar-teal hover:bg-stellar-teal/20"
                                                            >
                                                                {card.demoLabel ? lang(card.demoLabel.en, card.demoLabel.es) : lang('Try the demo', 'Probar el demo')} <ArrowRight className="w-3 h-3 shrink-0" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <a
                                                key={card.name}
                                                href={card.evidenceUrl}
                                                target={card.evidenceUrl ? '_blank' : undefined}
                                                rel={card.evidenceUrl ? 'noopener noreferrer' : undefined}
                                                className="min-w-0 flex flex-col p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.035] transition-colors"
                                            >
                                                {body}
                                                <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs text-stellar-teal/80">
                                                    {lang('View details', 'Ver detalles')} <ArrowRight className="w-3 h-3" />
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-white/15 px-6 py-8 text-sm text-white/40 text-left">
                                    {lang('None yet.', 'Ninguna por ahora.')}{' '}
                                    <a href="mailto:niriumprotocol@gmail.com" className="text-stellar-teal/80 hover:text-stellar-teal underline underline-offset-2">
                                        {lang('Built something on Nirium? Tell us.', '¿Construiste algo sobre Nirium? Cuéntanos.')}
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <p className="mt-8 max-w-2xl mx-auto text-xs leading-relaxed text-white/55">
                    {lang(
                        'Listed projects are independent. Nirium does not operate them and is not their partner or guarantor; being listed does not imply endorsement, partnership or customer usage. Each project is solely responsible for its own legal, tax and regulatory compliance. Nirium does not provide legal advice.',
                        'Los proyectos listados son independientes. Nirium no los opera, no es su socio ni su garante, y estar aquí no implica respaldo, alianza ni uso por clientes. Cada proyecto es responsable de su propio cumplimiento legal, fiscal y regulatorio. Nirium no da asesoría legal.'
                    )}
                </p>
            </div>
        </section>
    );
}
