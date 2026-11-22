"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";
import { useLanguage } from "@/context/LanguageContext";
import { CETES_REFERENCE_RATE_PCT, CETES_REFERENCE_DATE_LABEL_EN, CETES_REFERENCE_DATE_LABEL_ES } from "@/lib/cetesReference";

function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">{children}</h2>;
}

export default function DisclaimersPage() {
  const { language } = useLanguage();
  const es = language === "es";
  const t = (en: ReactNode, esText: ReactNode) => (es ? esText : en);

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 md:px-8 bg-black text-zinc-300">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-mono text-amber-500 mb-6 uppercase tracking-widest">
            <AlertTriangle className="w-3 h-3" /> {t("Mandatory Reading", "Lectura obligatoria")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            {t("Legal Disclaimers", "Avisos legales")}
          </h1>
          <p className="text-sm font-mono text-zinc-500">{t("Last updated: November 21, 2026", "Última actualización: 21 de noviembre de 2026")}</p>
        </div>

        <LegalDisclaimer variant="inline" locale={es ? "es" : "en"} className="mb-12" />

        <div className="prose prose-invert prose-zinc max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1">
          <H2>{t("Network Status", "Estado de las redes")}</H2>
          {t(
            <p>Nirium runs across two Stellar networks. The <strong>non-custodial nodes - settlement (x402), audit anchoring and reporting - operate on Stellar Mainnet</strong>; these never hold or move client funds. Autonomous rebalancing runs on mainnet over DeFindex vaults structured so the client owns them (today&rsquo;s live vault is Nirium&rsquo;s own, self-funded), invite-only until we have a written legal opinion. <strong>NiriumVault, Nirium&rsquo;s own contract, operates on Stellar Testnet, audit-gated</strong>, and will only reach mainnet after a formal external security audit. MPP Charge is experimental: verified on testnet, not tested on mainnet; for paid access on mainnet, use x402. The <a href="/ramp" className="text-stellar-teal underline">/ramp</a> page is a demo on Etherfuse&rsquo;s sandbox: the quote and the order are placed with Nirium&rsquo;s test account at Etherfuse and no real money moves. To get real CETES, each person opens their own account at Etherfuse.</p>,
            <p>Nirium corre en dos redes de Stellar. Los <strong>nodos no custodiales (liquidación x402, anclaje de auditoría y reportes) operan en Stellar Mainnet</strong>; nunca guardan ni mueven fondos de clientes. El rebalanceo autónomo corre en mainnet sobre bóvedas de DeFindex pensadas para que sean del cliente (la bóveda activa hoy es de Nirium, con fondos propios), solo por invitación hasta tener una opinión legal por escrito. <strong>NiriumVault, el contrato propio de Nirium, opera en Stellar Testnet</strong> y solo llegará a mainnet después de una auditoría de seguridad externa formal. MPP Charge es experimental: verificado en testnet, sin probar en mainnet; para acceso pagado en mainnet, usa x402. La página <a href="/ramp" className="text-stellar-teal underline">/ramp</a> es una demo en el sandbox de Etherfuse: la cotización y la orden se hacen con la cuenta de pruebas de Nirium en Etherfuse y no se mueve dinero real. Para tener CETES reales, cada persona abre su propia cuenta en Etherfuse.</p>
          )}
          {t(
            <p className="text-sm"><strong>Update, 2026-10-04 (checked against the nirium 0.16.0 changelog that day):</strong> this section used to list MPP as part of the settlement running on mainnet and the treasury vault as testnet-only. Both were wrong: MPP Charge is experimental and not available on mainnet, and the treasury that runs on mainnet is DeFindex-based (testnet-only applies to NiriumVault). Testnet operations use test tokens with no real-world monetary value.</p>,
            <p className="text-sm"><strong>Actualización, 2026-10-04 (revisado ese día contra el changelog de nirium 0.16.0):</strong> esta sección decía que MPP era parte de la liquidación en mainnet y que la bóveda de tesorería era solo de testnet. Las dos cosas estaban mal: MPP Charge es experimental y no está disponible en mainnet, y la tesorería que corre en mainnet usa DeFindex (lo de solo testnet aplica a NiriumVault). Las operaciones en testnet usan tokens de prueba sin valor monetario real.</p>
          )}

          <H2>{t("Rate Data and Displays", "Tasas y datos mostrados")}</H2>
          {t(
            <p>All rate figures displayed within Nirium - the Blend supply rate, the Etherfuse CETES reference rate, network fees - are <strong>public protocol reference data, attributed to their source</strong>. They are not return projections, guarantees, financial promises, or a recommendation to buy, sell or hold anything.</p>,
            <p>Todas las tasas que muestra Nirium (la tasa de suministro de Blend, la tasa de referencia de CETES de Etherfuse, las comisiones de red) son <strong>datos públicos de referencia, atribuidos a su fuente</strong>. No son proyecciones de rendimiento, garantías, promesas financieras ni una recomendación para comprar, vender o mantener nada.</p>
          )}
          <ul>
            {t(
              <li><strong>Blend Protocol Rate:</strong> Shown when the node can read it from Blend&rsquo;s public smart contracts; a value of 0 means no data was available, not a 0% rate.</li>,
              <li><strong>Tasa de Blend:</strong> Se muestra cuando el nodo puede leerla de los contratos públicos de Blend; un valor de 0 significa que no hubo datos, no una tasa de 0%.</li>
            )}
            {t(
              <li><strong>Etherfuse CETES Rate:</strong> The {CETES_REFERENCE_RATE_PCT}% shown is a fixed reference value read from app.etherfuse.com/b/cetes on {CETES_REFERENCE_DATE_LABEL_EN}. It is not updated live and may differ from the current rate.</li>,
              <li><strong>Tasa de CETES de Etherfuse:</strong> El {CETES_REFERENCE_RATE_PCT}% que se muestra es un valor fijo de referencia leído de app.etherfuse.com/b/cetes en {CETES_REFERENCE_DATE_LABEL_ES}. No se actualiza en vivo y puede ser distinto de la tasa actual.</li>
            )}
          </ul>
          <p>{t("These figures are provided strictly for informational and UI demonstration purposes.", "Estas cifras se muestran solo con fines informativos y de demostración de la interfaz.")}</p>

          <H2>{t("Non-Custodial Architecture", "Arquitectura no custodial")}</H2>
          {t(
            <p>Nirium is purely a software infrastructure provider. <strong>We do not custody user funds.</strong> Client private keys never leave the client&rsquo;s side, and signing happens with the client&rsquo;s own wallet (for example, the Freighter extension). The only role Nirium can hold on a client&rsquo;s DeFindex vault is the rebalance role: it can move funds between the vault&rsquo;s own strategies or swap inside it (our code doesn&rsquo;t send swaps), it cannot withdraw them, and the client can revoke it at any time. Outside that role, Nirium cannot access user funds or move them without a transaction the user signed. The one exception is NiriumVault&rsquo;s emergency pause (testnet only): Nirium&rsquo;s admin key can pause the contract, which freezes withdrawals until it is resumed, without moving any funds.</p>,
            <p>Nirium es solo un proveedor de infraestructura de software. <strong>No custodiamos fondos de usuarios.</strong> Las llaves privadas del cliente nunca salen de su lado, y la firma se hace con la wallet del propio cliente (por ejemplo, la extensión Freighter). El único rol que Nirium puede tener en una bóveda de DeFindex de un cliente es el de rebalanceo: puede mover fondos entre las estrategias de la misma bóveda o hacer swaps dentro de ella (nuestro código no los manda), no puede retirarlos, y el cliente puede revocarlo cuando quiera. Fuera de ese rol, Nirium no puede acceder a fondos de usuarios ni moverlos sin una transacción firmada por el usuario. La única excepción es la pausa de emergencia de NiriumVault (solo testnet): la llave admin de Nirium puede pausar el contrato, lo que congela los retiros hasta reanudarlo, sin mover fondos.</p>
          )}
          {t(
            <p className="text-sm"><strong>Update, 2026-11-21 (checked against /security and the DeFindex rebalance instructions that day):</strong> this paragraph said Nirium could not &ldquo;freeze&rdquo; user funds and described the rebalance role as moving funds between strategies only. The admin key can pause NiriumVault on testnet, which freezes withdrawals, and the DeFindex role also allows swaps inside the vault. Both are now stated.</p>,
            <p className="text-sm"><strong>Actualización, 2026-11-21 (revisado ese día contra /security y las instrucciones de rebalanceo de DeFindex):</strong> este párrafo decía que Nirium no podía &ldquo;congelar&rdquo; fondos de usuarios y describía el rol de rebalanceo solo como mover fondos entre estrategias. La llave admin puede pausar NiriumVault en testnet, lo que congela los retiros, y el rol de DeFindex también permite swaps dentro de la bóveda. Ahora se dicen las dos cosas.</p>
          )}

          <H2>{t("Restricted Jurisdictions and Sanctions", "Jurisdicciones restringidas y sanciones")}</H2>
          {t(
            <p>Nirium Protocol operates from Mexico, run by its founders with no incorporated legal entity to date, and <strong>seeks not to offer services where they would constitute regulated activity without the corresponding authorization</strong>; that is why, until it has a written legal opinion, Payouts and Treasury on mainnet are invite-only. Access is prohibited from comprehensively sanctioned jurisdictions, jurisdictions subject to a Financial Action Task Force call for action, and mainland China. In the European Economic Area, the United Kingdom and the United States, pending a written legal opinion, Payouts and the Treasury node are not offered on mainnet; on testnet, where test tokens have no value, both stay available as a demonstration, and withdrawing from a vault you already own is never restricted there.</p>,
            <p>Nirium Protocol opera desde México, a cargo de sus fundadores y sin una persona moral constituida a la fecha, y <strong>busca no ofrecer servicios donde constituirían una actividad regulada sin la autorización correspondiente</strong>; por eso, mientras no tenga una opinión legal por escrito, Payouts y Tesorería en mainnet son solo por invitación. Se prohíbe el acceso desde jurisdicciones con sanciones integrales, jurisdicciones sujetas a un llamado a la acción del Grupo de Acción Financiera Internacional (GAFI) y China continental. En el Espacio Económico Europeo, el Reino Unido y Estados Unidos, mientras no haya una opinión legal por escrito, Payouts y el nodo de Tesorería no se ofrecen en mainnet; en testnet, donde los tokens de prueba no tienen valor, los dos siguen disponibles como demostración, y retirar de una bóveda que ya es tuya nunca está restringido ahí.</p>
          )}
          {t(
            <p className="text-sm"><strong>Update, 2026-11-21:</strong> this paragraph said Nirium &ldquo;does not offer its services into jurisdictions where those services would constitute regulated activity, regardless of how the software is built&rdquo;. Read that way it claimed Nirium already knows its services are not regulated in Mexico, which is the open question below. It now says what Nirium does about it.</p>,
            <p className="text-sm"><strong>Actualización, 2026-11-21:</strong> este párrafo decía que Nirium &ldquo;no ofrece sus servicios en jurisdicciones donde constituirían una actividad regulada, sin importar cómo esté construido el software&rdquo;. Así leído, afirmaba que Nirium ya sabe que en México no es actividad regulada, que es justo la pregunta abierta de abajo. Ahora dice qué hace Nirium al respecto.</p>
          )}
          {t(
            <p>By using any Nirium service you represent, on every occasion of use, that you are not located in or resident of a prohibited jurisdiction and are not a sanctioned person or acting for one. Nirium may block access by technical means, including IP geolocation, and may refuse or terminate service without notice. Because Nirium never holds funds, <strong>termination never strands assets</strong>: your keys, accounts and vaults remain fully usable without us.</p>,
            <p>Al usar cualquier servicio de Nirium declaras, cada vez que lo usas, que no estás ubicado ni resides en una jurisdicción prohibida y que no eres una persona sancionada ni actúas en nombre de una. Nirium puede bloquear el acceso por medios técnicos, incluida la geolocalización por IP, y puede negar o terminar el servicio sin aviso. Como Nirium nunca guarda fondos, <strong>terminar el servicio nunca deja activos atrapados</strong>: tus llaves, cuentas y bóvedas siguen funcionando sin nosotros.</p>
          )}
          <p>
            {t("The full policy governs: ", "La política completa es la que rige: ")}
            <a href="/legal/restricted-jurisdictions-v1.md" className="text-stellar-teal underline">
              {t("Restricted Jurisdictions & Sanctions Policy", "Política de Jurisdicciones Restringidas y Sanciones (en inglés)")}
            </a>.
          </p>

          <H2>{t("Open Source Licensing", "Licencias de código abierto")}</H2>
          <p>{t("The core components of the Nirium ecosystem are open-sourced to ensure transparency:", "Los componentes principales de Nirium son de código abierto, por transparencia:")}</p>
          <ul>
            <li><strong>{t("Smart Contracts, SDK, MCP, and Agent API:", "Contratos inteligentes, SDK, MCP y API del agente:")}</strong> {t("Licensed under the Apache License 2.0.", "Licencia Apache 2.0.")}</li>
            <li><strong>{t("Dashboard Interface:", "Interfaz del dashboard:")}</strong> {t("Licensed under the Apache 2.0 License.", "Licencia Apache 2.0.")}</li>
          </ul>

          <H2>{t("Ecosystem Participation", "Participación en el ecosistema")}</H2>
          <p>{t(
            "Nirium is an independent project in the Stellar developer ecosystem. It has received SCF Instaward grants for technical validation, completed under full KYC procedures. Amounts are not disclosed here. Nirium follows the Stellar Code of Conduct and builds transparently, with on-chain activity verifiable by anyone.",
            "Nirium es un proyecto independiente del ecosistema de desarrolladores de Stellar. Ha recibido Instawards del SCF para validación técnica, con el proceso completo de KYC. Los montos no se publican aquí. Nirium sigue el Código de Conducta de Stellar y construye de forma transparente, con actividad on-chain que cualquiera puede verificar."
          )}</p>

          <H2>{t("Stellar Code of Conduct", "Código de Conducta de Stellar")}</H2>
          <p>
            {t(
              "We are fully committed to fostering a safe, inclusive, and professional environment. By interacting with the Nirium project, community, or software, you agree to abide by the ",
              "Estamos comprometidos con un ambiente seguro, inclusivo y profesional. Al interactuar con el proyecto, la comunidad o el software de Nirium, aceptas cumplir el "
            )}
            <a href="https://stellar.org/foundation/code-of-conduct" target="_blank" rel="noopener noreferrer">
              {t("Stellar Code of Conduct", "Código de Conducta de Stellar")}
            </a>.
          </p>

          <H2>{t("Security Audits", "Auditorías de seguridad")}</H2>
          {t(
            <p>Nirium&rsquo;s own smart contracts (NiriumVault and NiriumProtocol) <strong>have not yet been formally audited by an independent third party</strong>. A full external audit is required before NiriumVault operates on mainnet. Until then, NiriumVault runs on testnet only; the non-custodial settlement, audit and reporting nodes - which never touch client funds - run on mainnet. The mainnet Treasury node runs on third-party contracts that do have independent audits: DeFindex (OtterSec, March 2025) and Blend (a Code4rena audit and two Certora reports, marked as draft). Those audits are theirs, not Nirium&rsquo;s, and do not cover each deployed vault&rsquo;s configuration.</p>,
            <p>Los contratos inteligentes propios de Nirium (NiriumVault y NiriumProtocol) <strong>todavía no tienen una auditoría formal de un tercero independiente</strong>. Se requiere una auditoría externa completa antes de que NiriumVault opere en mainnet. Mientras tanto, NiriumVault corre solo en testnet; los nodos no custodiales de liquidación, auditoría y reportes, que nunca tocan fondos de clientes, corren en mainnet. El nodo de Tesorería en mainnet corre sobre contratos de terceros que sí tienen auditorías independientes: DeFindex (OtterSec, marzo de 2025) y Blend (una auditoría de Code4rena y dos reportes de Certora, marcados como borrador). Esas auditorías son de ellos, no de Nirium, y no cubren la configuración de cada bóveda desplegada.</p>
          )}

          <H2>{t("Mexico Legal & Regulatory Position", "Posición legal y regulatoria en México")}</H2>
          {t(
            <p>Nirium provides software-only infrastructure. It is <strong>not</strong> authorized as, and does not operate as, a Financial Technology Institution (Institución de Tecnología Financiera - ITF): it holds no client balance or electronic payment funds. It does not buy, sell or exchange virtual assets as its own business. The main open question is whether the autonomous Treasury rebalance and Payouts fall under fraction XVI of article 17 of the LFPIORPI, a vulnerable activity in force since 2019. Since 2019 that fraction has covered platforms that facilitate their clients&rsquo; purchases or sales of virtual assets or &ldquo;provide means to [...] transfer&rdquo; virtual assets; since July 2025 it also expressly includes operations with Mexican citizens from another jurisdiction. Article 24 Bis 4 of the SHCP&rsquo;s General Rules under that law (added by Acuerdo 115/2026, applicable from November 30, 2026) defines that facilitation and says it applies even without control of the assets. If it applies, Nirium would be an Obligated Subject (Sujeto Obligado) for that activity. Nirium has not yet obtained a written legal opinion on it. Until it does, both stay invite-only on mainnet and Payouts collects client identification there. Audit anchoring, reporting and x402 settlement of Nirium&rsquo;s own paid endpoints only record or report facts, or charge for Nirium&rsquo;s own service, and are not part of that question. A second, separate question is also open: whether a tokenized CETES counts as a security (valor) under Mexico&rsquo;s Securities Market Law (see the Risk Disclosure). We do not provide financial advice, broker services, or custody of fiat or digital assets.</p>,
            <p>Nirium ofrece infraestructura que es solo software. <strong>No</strong> está autorizada como Institución de Tecnología Financiera (ITF) ni opera como una: no guarda saldos de clientes ni fondos de pago electrónico. No compra, vende ni intercambia activos virtuales como negocio propio. La principal pregunta abierta es si el rebalanceo autónomo de Tesorería y Payouts caen en la fracción XVI del artículo 17 de la LFPIORPI, actividad vulnerable vigente desde 2019. Desde 2019 esa fracción cubre a las plataformas que facilitan compras o ventas de activos virtuales de sus clientes o que &ldquo;provean medios para [...] transferir&rdquo; activos virtuales; desde julio de 2025 incluye también, de forma expresa, las operaciones con ciudadanos mexicanos desde otra jurisdicción. El artículo 24 Bis 4 de las Reglas de Carácter General de la SHCP para esa ley (agregado por el Acuerdo 115/2026, aplicable desde el 30 de noviembre de 2026) define esa facilitación y dice que aplica aun sin tener el control de los activos. Si aplicara, Nirium sería Sujeto Obligado por esa actividad. Nirium todavía no tiene una opinión legal por escrito sobre esto. Mientras no la tenga, los dos siguen solo por invitación en mainnet y Payouts recaba la identificación del cliente ahí. El anclaje de auditoría, los reportes y la liquidación x402 de los endpoints de pago propios de Nirium solo registran o reportan hechos, o cobran por el servicio propio de Nirium, y no son parte de esa pregunta. Hay una segunda pregunta abierta, aparte: si un CETES tokenizado cuenta como valor bajo la Ley del Mercado de Valores (ver el Aviso de riesgos). No damos asesoría financiera, servicios de intermediación ni custodia de dinero fiat o activos digitales.</p>
          )}
          {t(
            <p className="text-sm">This is how Nirium reads its own position, not legal advice to anyone. Each user should consult their own counsel on the law that applies to them.</p>,
            <p className="text-sm">Así lee Nirium su propia posición; no es asesoría legal para nadie. Cada usuario debe consultar a su propio abogado sobre la ley que le aplica.</p>
          )}
        </div>
      </div>
    </div>
  );
}
