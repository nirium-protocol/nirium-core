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
                badge: { en: 'v0.6.0, testnet proven', es: 'v0.6.0, probado en testnet' },
                tags: ['Wallets', 'Social login', 'x402'],
                description: {
                    en: "Social-login wallets (email/Google), no seed phrase. nirium-pollar-adapter v0.6.1 translates Pollar's signature into a SEP-43 auth entry to pay via x402, and can auto-anchor an Audit Trail receipt whenever a Pollar transaction settles. Checked live on testnet (2026-11-01): a real payment produced a verifiable receipt, with its transaction hash and IPFS CID both published. No evidence it runs in Pollar's own production today. A letter of intent was signed on 2026-10-08: a statement of intent, not a pilot, and no paid use.",
                    es: 'Wallets con login social (correo/Google), sin frase semilla. nirium-pollar-adapter v0.6.1 traduce su firma a un auth entry SEP-43 para pagar por x402, y puede anclar automáticamente un recibo de Audit Trail cada vez que una transacción de Pollar se liquida. Verificado en vivo en testnet (1-nov-2026): un pago real produjo un recibo verificable, con su hash de transacción y CID de IPFS publicados. Sin evidencia de que corra en producción de Pollar hoy. Se firmó una carta de intención el 2026-10-08: es una declaración de intención, no un piloto, y no hay uso de pago.',
                },
                evidenceUrl: 'https://github.com/pollar-xyz/pollar-apps/pull/30',
                evidenceLabel: { en: 'pollar-xyz/pollar-apps#30 - merged 2026-08-31', es: 'pollar-xyz/pollar-apps#30 - merged 2026-08-31' },
                secondaryEvidenceUrl: 'https://www.npmjs.com/package/nirium-pollar-adapter',
                secondaryEvidenceLabel: { en: 'nirium-pollar-adapter@0.6.1 on npm', es: 'nirium-pollar-adapter@0.6.1 en npm' },
            },
            {
                name: 'AgentLedger',
                logo: '/partners/agentledger.png',
                tone: 'experimental',
                badge: { en: 'Policy hook: testnet proven, mainnet pending', es: 'Hook de políticas: probado en testnet, mainnet pendiente' },
                tags: ['Agent governance', 'Policy hook', 'x402'],
                description: {
                    en: "Spend governance for AI agent wallets: caps, human approvals, a decision log. Uses the policy hook in x402Fetch() to approve, hold or reject each payment before it's signed: ALLOW and WAIT-then-approval settled on testnet, and a concurrent DENY was refused - all on testnet; the same policy-hook test on mainnet hasn't run yet. Separately, its gate already handled 15 real integration-test payments to Nirium on mainnet (Aug to Sep 2026). Its founder, Fer Mendoza, joined the Nirium team in October 2026.",
                    es: 'Gobernanza de gasto para wallets de agentes de IA: topes, aprobaciones humanas, bitácora de decisiones. Usa el hook policy de x402Fetch() para aprobar, retener o rechazar cada pago antes de firmarlo: ALLOW y WAIT-luego-aprobación se liquidaron en testnet, y un DENY concurrente fue rechazado - todo en testnet; la misma prueba del hook de políticas en mainnet todavía no corre. Aparte, su gate ya gestionó 15 pagos reales de prueba de integración a Nirium en mainnet (ago a sep 2026). Su fundador, Fer Mendoza, se unió al equipo de Nirium en octubre de 2026.',
                },
                evidenceUrl: 'https://stellar.expert/explorer/testnet/tx/63fe315ad191c12d8baab4e7d146dc4b8cd7bb0c0ce97261799021eb5163b71d',
                evidenceLabel: { en: 'tx 63fe315a... - successful, 2026-10-09', es: 'tx 63fe315a... - successful, 2026-10-09' },
            },
            {
                name: 'TIA',
                logo: '/partners/tia.jpg',
                tone: 'experimental',
                badge: { en: 'Audit Trail, 2 real anchors', es: 'Audit Trail, 2 anclajes reales' },
                tags: ['Audit Trail'],
                description: {
                    en: "An external integrator (TIA) anchors a signed receipt of its quotes in the Audit Trail - 2 real anchors to date (2026-10-18 and 2026-10-23, mainnet), both signed with its own key. The wallets behind its x402 payments are TIA's own test accounts, confirmed by its founder - not a real client.",
                    es: 'Un integrador externo (TIA) ancla un recibo firmado de sus cotizaciones en el Audit Trail - 2 anclajes reales a la fecha (18-oct-2026 y 23-oct-2026, mainnet), ambos firmados con su propia llave. Las wallets detrás de su pago x402 son cuentas de prueba propias de TIA, confirmadas por su fundador - no un cliente real.',
                },
                evidenceUrl: 'https://gateway.pinata.cloud/ipfs/QmWnt7mQNYB6RgFW9AUPxHsw1B5GerR6bJPHiCZXQLKdCH',
                evidenceLabel: { en: 'CID QmWnt7mQ... - anchored 2026-10-23', es: 'CID QmWnt7mQ... - anclado 23-oct-2026' },
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
                badge: { en: 'Live in production', es: 'En producción' },
                tags: ['x402 facilitator', 'Mainnet'],
                description: {
                    en: 'x402 payment facilitator - verifies and settles on-chain, with sponsored fees. Every x402 payment route on the agent, testnet and mainnet, delegates verify/settle to their hosted facilitator. In production use, confirmed live.',
                    es: 'Facilitador de pagos x402 - verifica y liquida en cadena, con fees patrocinados. Toda ruta de pago x402 del agente, en testnet y mainnet, delega verify/settle a su facilitador hospedado. En uso, confirmado en vivo.',
                },
                evidenceUrl: 'https://stellar.expert/explorer/public/tx/bf9a1ca6b9b157c7010f0774107e4140f8a7b0e3c6c0227908936447de9aac24',
                evidenceLabel: { en: 'mainnet tx bf9a1ca6...', es: 'tx mainnet bf9a1ca6...' },
            },
            {
                name: 'DeFindex',
                tone: 'gated',
                badge: { en: 'Mainnet, test vault only', es: 'Mainnet, bóveda de prueba' },
                tags: ['Treasury', 'Soroban vaults'],
                description: {
                    en: "Yield vaults on Soroban, with roles separated by contract design. The agent holds only the RebalanceManager role of a client-owned vault - that role can't withdraw funds or change roles, by contract. 4 real rebalances, all on 2026-08-06, none since - mainnet, test vault only, no clients yet.",
                    es: 'Bóvedas de rendimiento en Soroban, con roles separados por diseño de contrato. El agente sostiene solo el rol RebalanceManager de una bóveda que controla el cliente - ese rol no puede retirar fondos ni cambiar roles, por contrato. 4 rebalanceos reales, todos el 6-ago-2026, ninguno desde entonces - mainnet, bóveda de prueba, sin clientes.',
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
                    en: "Programmable milestone-based escrows on Soroban. 5 of our research PRs merged by their maintainer, plus a Multi-Release escrow integration for Payouts tested end to end on testnet. Deploy also tested on mainnet, but the automatic approve/release signer never ran there - full rollout on hold pending the same Art. 24 Bis 4 legal review as Treasury. A letter of intent was signed in October 2026: a statement of intent, not a paid pilot. A testnet pilot gates milestone release on anchored evidence: an agent checks the record's hash, its milestone and the service provider's signature before approving and releasing, and refused one milestone that failed. Written up as a research note, under review, backed by 6 on-chain testnet transaction hashes. 4 more research PRs are open since October, unreviewed.",
                    es: 'Escrows de pago programables en Soroban (milestone-based). 5 PRs de investigación propios mergeados por su maintainer, más una integración del escrow Multi-Release para Payouts probada de punta a punta en testnet. El deploy también se probó en mainnet, pero el firmante automático de approve/release nunca corrió ahí - rollout completo en pausa por la misma revisión legal del Art. 24 Bis 4 que Treasury. Se firmó una carta de intención en octubre de 2026: es una declaración de intención, no un piloto de pago. Un piloto en testnet condiciona la liberación de milestones a evidencia anclada: un agente revisa el hash del registro, su milestone y la firma del proveedor de servicio antes de aprobar y liberar, y rechazó un milestone que no pasó. Documentado como nota de investigación, en revisión, respaldada por 6 hashes de transacciones on-chain en testnet. Hay 4 PRs de investigación más abiertos desde octubre, sin revisar.',
                },
                evidenceUrl: 'https://github.com/Trustless-Work/agentic-escrow-research/pull/10',
                evidenceLabel: { en: 'agentic-escrow-research#10 (under review); PRs #1-4 merged 2026-09-21, #9 merged 2026-11-02', es: 'agentic-escrow-research#10 (en revisión); PRs #1-4 mergeados 2026-09-21, #9 mergeado 2026-11-02' },
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
                            {lang("What's integrated with Nirium, what's built on it, and what Nirium itself depends on. Each listing goes up once its owning team approves the text.", 'Qué se integra con Nirium, qué se construye sobre él, y de qué depende Nirium mismo. Cada ficha se publica cuando su equipo aprueba el texto.')}
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
