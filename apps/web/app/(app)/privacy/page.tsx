"use client";

import type { ReactNode } from "react";
import { Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const CONTACT = "niriumprotocol@gmail.com";

// Art. 15, fr. I LFPDPPP (Ley nueva, DOF 20-03-2025; texto vigente revisado el
// 9-nov-2026, última reforma DOF 14-11-2025) pide identidad Y DOMICILIO del
// responsable. Pendiente: lo decide el responsable (no se inventa un domicilio).
// Mientras sea null, el aviso lo dice en vez de omitir el requisito en silencio.
const DOMICILIO: string | null = null;

function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-white font-bold text-2xl mt-10 mb-4 border-b border-white/10 pb-2">{children}</h2>;
}

// El aviso en español es el vinculante (LFPDPPP); el inglés es una traducción
// de cortesía y debe seguir diciéndolo.
//
// Reescrito el 9-nov-2026 contra el texto vigente de la ley (art. 15: contenido
// mínimo del aviso; art. 31: plazos ARCO; art. 3, fr. VIII: "días" = hábiles;
// art. 3, fr. XV: la autoridad es la Secretaría Anticorrupción y Buen Gobierno).
// El aviso anterior decía que solo se recababan API keys, webhooks y métricas y
// que no se guardaban datos financieros; el código guarda además la
// identificación del cliente de Payouts en mainnet (razón social, RFC,
// representante), montos y direcciones de cada corrida, solicitudes de acceso,
// y el sitio carga Vercel Analytics.
function AvisoEs() {
  return (
    <>
      <H2>1. Identidad y domicilio del responsable</H2>
      <p>&ldquo;Nirium Protocol&rdquo; (el &ldquo;Proyecto&rdquo;) es el nombre comercial bajo el cual operan sus fundadores, que son los responsables del tratamiento de los datos personales que nos proporcione. A la fecha el Proyecto no opera bajo una persona moral constituida. Contacto: <strong>{CONTACT}</strong>.</p>
      <p>Domicilio del responsable: {DOMICILIO ?? <em>pendiente de publicar en este aviso; mientras tanto, cualquier comunicación se atiende en el correo de arriba.</em>}</p>

      <H2>2. Datos personales que tratamos</H2>
      <p>Según el servicio que uses, tratamos:</p>
      <ul>
        <li><strong>Llaves de API:</strong> la dirección pública de tu wallet de Stellar, el nombre que le pongas a la llave y la propia llave guardada solo como hash.</li>
        <li><strong>Payouts en mainnet:</strong> la razón social, el RFC y el nombre del representante legal del cliente, y por cada corrida las direcciones de los destinatarios, los montos, el activo y el hash de la transacción.</li>
        <li><strong>Solicitudes de acceso y contacto:</strong> los datos que nos envíes para pedir acceso o escribirnos (por ejemplo empresa, RFC, nombre del representante, correo y teléfono).</li>
        <li><strong>Tesorería:</strong> las direcciones de las bóvedas y de sus responsables (Manager), para mostrarte tus bóvedas.</li>
        <li><strong>Demo de CETES (/ramp):</strong> la dirección de Stellar que escribes, que enviamos al ambiente de pruebas de Etherfuse, con la cuenta de prueba de Nirium, para pedir la cotización y la orden.</li>
        <li><strong>Audit Trail:</strong> el hash que anclas y, en modo record, el JSON que envías (hasta 8 KB), que queda publicado en IPFS para cualquiera que tenga el CID. No incluyas datos personales en un registro.</li>
        <li><strong>Pagos x402 a la API de Nirium:</strong> la dirección de Stellar que paga, la ruta, el monto, la red, el hash de la transacción y, si se rechaza, el motivo.</li>
        <li><strong>Datos técnicos:</strong> la dirección IP y algunos encabezados de tu navegador (como el user-agent y el idioma), que se combinan en una huella (hash) para limitar la frecuencia de uso; la huella se guarda solo en memoria y se descarta. La IP también se usa en el momento para aplicar las restricciones por jurisdicción; nuestros proveedores de alojamiento guardan registros de peticiones por un tiempo limitado. También medimos visitas de forma agregada (ver la sección 7).</li>
      </ul>
      <p>No tratamos datos personales sensibles ni biométricos, y no custodiamos fondos: el software es no custodial y cada transacción la firma el propio cliente.</p>

      <H2>3. Finalidades del tratamiento</H2>
      <p>Usamos los datos para estas finalidades, todas necesarias para el servicio que solicitas, por lo que no requieren un consentimiento aparte:</p>
      <ul>
        <li>Emitir y verificar tus llaves de API y autenticarte.</li>
        <li>Construir, transmitir y registrar las corridas de Payouts que tú firmas.</li>
        <li>Registrar y conciliar los cobros por el uso de la API de Nirium.</li>
        <li>Identificar al cliente de Payouts en mainnet, por si esa actividad resulta sujeta a obligaciones de prevención de operaciones con recursos de procedencia ilícita (LFPIORPI).</li>
        <li>Atender tus solicitudes de acceso y responder tus mensajes.</li>
        <li>Limitar la frecuencia de uso, prevenir abusos y aplicar la política de jurisdicciones restringidas.</li>
      </ul>
      <p>Hay una finalidad más que no es necesaria para el servicio: medir de forma agregada cuántas visitas recibe el sitio, para mejorarlo. Esa medición no usa cookies ni arma un perfil tuyo (ver la sección 7). Si aun así te opones, escríbenos a <strong>{CONTACT}</strong>.</p>

      <H2>4. Encargados y transferencias</H2>
      <p>No vendemos tus datos. Los tratan, por cuenta nuestra y solo para operar el servicio, estos proveedores (encargados), que pueden estar fuera de México: Supabase (base de datos), Fly.io (servidores del agente), Vercel (alojamiento del sitio y medición de visitas), Pinata (almacenamiento en IPFS), Filebase (lectura de IPFS), OpenZeppelin (facilitador de x402, verifica y liquida los pagos a la API de Nirium), QuickNode (acceso del agente a la red de Stellar), Etherfuse (su ambiente de pruebas, solo para la demo de CETES) y Google (el correo con el que nos escribes).</p>
      <p>No transferimos tus datos a otros terceros. La única excepción sería una autoridad competente cuando una ley lo exija (artículo 36, fracción I, de la ley), por ejemplo los datos de identificación de un cliente de Payouts en mainnet; esa transferencia no requiere tu consentimiento.</p>
      <p>Hay servicios de terceros que tratan tus datos como responsables independientes, bajo sus propios avisos: Pollar, si inicias sesión con correo o Google; Etherfuse, que hace su propio KYC si contratas CETES con ellos; y tu proveedor de wallet. Nirium no recibe tus datos de inicio de sesión ni tu KYC.</p>
      <p><strong>Información pública por naturaleza:</strong> las direcciones de wallet y las transacciones en Stellar son públicas, y lo que se ancla en IPFS queda disponible para cualquiera que tenga el CID. Nirium no puede modificarla, ni garantizar que se borre de IPFS, porque cualquiera con el CID puede haber guardado una copia.</p>

      <H2>5. Opciones para limitar el uso o la divulgación</H2>
      <p>Puedes pedir que limitemos el uso o la divulgación de tus datos escribiendo a <strong>{CONTACT}</strong>. También puedes revocar tus llaves de API en cualquier momento desde nirium.xyz/keys.</p>
      <p><strong>Revocar tu consentimiento:</strong> puedes revocar en cualquier momento el consentimiento que nos hayas dado, escribiendo al mismo correo. La revocación no tiene efectos retroactivos y no alcanza los datos que debamos conservar por una obligación legal.</p>

      <H2>6. Derechos ARCO y cómo ejercerlos</H2>
      <p>Tienes derecho a conocer qué datos tenemos de ti (Acceso), a pedir que se corrijan (Rectificación), a que se eliminen de nuestros registros (Cancelación) y a oponerte a su uso para fines específicos (Oposición). Para ejercerlos, escribe a <strong>{CONTACT}</strong> indicando tu nombre, el derecho que quieres ejercer y los datos a los que se refiere, y adjunta lo que acredite tu identidad o la de tu representante.</p>
      <p>Te comunicaremos nuestra respuesta en un plazo máximo de 20 días hábiles desde que recibamos la solicitud y, si procede, la haremos efectiva dentro de los 15 días hábiles siguientes; los dos plazos pueden ampliarse una sola vez por un periodo igual cuando el caso lo justifique (artículo 31 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, publicada en el Diario Oficial de la Federación el 20 de marzo de 2025 y vigente desde el día siguiente). La autoridad en la materia es la Secretaría Anticorrupción y Buen Gobierno.</p>
      <p>La cancelación no alcanza lo que ya es público en Stellar o en IPFS (ver la sección 4), porque Nirium no lo controla.</p>

      <H2>7. Cookies, almacenamiento local y medición</H2>
      <p>Usamos una cookie de sesión técnica solo mientras administras tus llaves de API en nirium.xyz/keys; hay otra cookie técnica que solo se crea para los administradores del Proyecto, nunca para visitantes. El sitio guarda en tu navegador (almacenamiento local) preferencias como el idioma, la red y el tema, y borradores que tú creas; esa información no sale de tu navegador. Medimos visitas con Vercel Analytics, que cuenta páginas vistas de forma agregada sin usar cookies. No usamos cookies ni píxeles de publicidad.</p>

      <H2>8. Cambios a este aviso</H2>
      <p>Este aviso puede cambiar por nuevos requisitos legales, por cambios en nuestros servicios o por otras causas. Publicaremos cada versión en esta misma página, con su fecha de actualización arriba.</p>
      <p><strong>Cambios del 21 de noviembre de 2026:</strong> el aviso no mencionaba los datos de los pagos x402 a la API de Nirium, que sí se guardan, ni a OpenZeppelin como encargado; decía que solo se usaba la IP, cuando la huella para limitar la frecuencia también usa encabezados del navegador; y decía que Nirium no puede borrar lo publicado en IPFS, cuando lo preciso es que no puede garantizar que se borre. Ahora dice las cuatro cosas.</p>
    </>
  );
}

function NoticeEn({ onSpanish }: { onSpanish: () => void }) {
  return (
    <>
      <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-sm not-prose mb-8">
        <p className="m-0">
          This English translation is provided for convenience. The Spanish Aviso de Privacidad, issued under Mexico&rsquo;s LFPDPPP, is the binding version and prevails in case of any dispute.{" "}
          <button type="button" onClick={onSpanish} className="text-stellar-teal underline underline-offset-2 font-bold">
            Read it in Spanish
          </button>
        </p>
      </div>

      <H2>1. Identity and address of the data controller</H2>
      <p>&ldquo;Nirium Protocol&rdquo; (the &ldquo;Project&rdquo;) is the commercial name under which its founders operate; they are responsible for processing the personal data you provide. To date the Project does not operate under an incorporated legal entity. Contact: <strong>{CONTACT}</strong>.</p>
      <p>Controller&rsquo;s address: {DOMICILIO ?? <em>pending publication in this notice; meanwhile, any communication is handled at the email above.</em>}</p>

      <H2>2. Personal data we process</H2>
      <p>Depending on the service you use, we process:</p>
      <ul>
        <li><strong>API keys:</strong> your Stellar wallet&rsquo;s public address, the name you give the key, and the key itself stored only as a hash.</li>
        <li><strong>Payouts on mainnet:</strong> the client&rsquo;s legal name, RFC (Mexican tax ID) and legal representative&rsquo;s name, and for each run the recipients&rsquo; addresses, amounts, asset and transaction hash.</li>
        <li><strong>Access requests and contact:</strong> the data you send us to request access or write to us (for example company, RFC, representative&rsquo;s name, email and phone).</li>
        <li><strong>Treasury:</strong> vault addresses and their Manager addresses, to show you your vaults.</li>
        <li><strong>CETES demo (/ramp):</strong> the Stellar address you type, which we send to Etherfuse&apos;s test environment, under Nirium&apos;s test account, to get the quote and the order.</li>
        <li><strong>Audit Trail:</strong> the hash you anchor and, in record mode, the JSON you send (up to 8 KB), which is published on IPFS for anyone with the CID. Do not put personal data in a record.</li>
        <li><strong>x402 payments to Nirium&rsquo;s API:</strong> the paying Stellar address, the route, the amount, the network, the transaction hash and, if it is rejected, the reason.</li>
        <li><strong>Technical data:</strong> the IP address and some of your browser&rsquo;s headers (such as the user-agent and language), combined into a fingerprint (hash) for rate limiting; the fingerprint is kept only in memory and discarded. The IP is also used at that moment to apply jurisdiction restrictions; our hosting providers keep request logs for a limited time. We also measure visits in aggregate (see section 7).</li>
      </ul>
      <p>We do not process sensitive or biometric personal data, and we do not custody funds: the software is non-custodial and every transaction is signed by the client.</p>

      <H2>3. Purposes of processing</H2>
      <p>We use the data for these purposes, all necessary for the service you request, so they do not require separate consent:</p>
      <ul>
        <li>Issuing and verifying your API keys and authenticating you.</li>
        <li>Building, broadcasting and recording the Payouts runs you sign.</li>
        <li>Recording and reconciling the charges for using Nirium&rsquo;s API.</li>
        <li>Identifying the Payouts client on mainnet, in case that activity is subject to Mexico&rsquo;s anti-money-laundering law (LFPIORPI).</li>
        <li>Handling your access requests and replying to your messages.</li>
        <li>Rate limiting, abuse prevention and applying the restricted-jurisdictions policy.</li>
      </ul>
      <p>One more purpose is not necessary for the service: measuring, in aggregate, how many visits the site gets, to improve it. That measurement uses no cookies and builds no profile of you (see section 7). If you still object, write to <strong>{CONTACT}</strong>.</p>

      <H2>4. Processors and transfers</H2>
      <p>We do not sell your data. These providers (processors), which may be located outside Mexico, process it on our behalf and only to run the service: Supabase (database), Fly.io (agent servers), Vercel (site hosting and visit measurement), Pinata (IPFS storage), Filebase (reading from IPFS), OpenZeppelin (x402 facilitator, verifies and settles payments to Nirium&rsquo;s API), QuickNode (the agent&apos;s access to the Stellar network), Etherfuse (its test environment, only for the CETES demo) and Google (the email you write to us at).</p>
      <p>We do not transfer your data to any other third party. The only exception would be a competent authority when a law requires it (article 36, section I, of the law), for example the identification data of a Payouts client on mainnet; that transfer does not need your consent.</p>
      <p>Some third-party services process your data as independent controllers, under their own notices: Pollar, if you sign in with email or Google; Etherfuse, which runs its own KYC if you contract CETES with them; and your wallet provider. Nirium does not receive your sign-in data or your KYC.</p>
      <p><strong>Public by nature:</strong> wallet addresses and transactions on Stellar are public, and what is anchored on IPFS is available to anyone with the CID. Nirium cannot change it, nor guarantee that it is deleted from IPFS, because anyone with the CID may have kept a copy.</p>

      <H2>5. Options to limit use or disclosure</H2>
      <p>You can ask us to limit the use or disclosure of your data by writing to <strong>{CONTACT}</strong>. You can also revoke your API keys at any time at nirium.xyz/keys.</p>
      <p><strong>Withdrawing your consent:</strong> you can withdraw, at any time, the consent you have given us, by writing to the same email. Withdrawal is not retroactive and does not reach data we must keep because of a legal obligation.</p>

      <H2>6. ARCO rights and how to exercise them</H2>
      <p>You have the right to know what data we hold about you (Access), to have it corrected (Rectification), to have it deleted from our records (Cancellation), and to object to its use for specific purposes (Opposition). To exercise them, write to <strong>{CONTACT}</strong> with your name, the right you want to exercise and the data it concerns, and attach proof of your identity or your representative&rsquo;s.</p>
      <p>We will send our answer within 20 business days of receiving the request and, if it is granted, carry it out within the following 15 business days; both periods can be extended once by the same length when the case justifies it (article 31 of Mexico&rsquo;s Federal Law on the Protection of Personal Data Held by Private Parties, published in the Diario Oficial de la Federación on March 20, 2025 and in force from the following day). The competent authority is the Secretaría Anticorrupción y Buen Gobierno.</p>
      <p>Cancellation cannot reach what is already public on Stellar or IPFS (see section 4), because Nirium does not control it.</p>

      <H2>7. Cookies, local storage and measurement</H2>
      <p>We use one technical session cookie, only while you manage your API keys at nirium.xyz/keys; one other technical cookie is set only for the Project&rsquo;s administrators, never for visitors. The site stores preferences such as language, network and theme, and drafts you create, in your browser&rsquo;s local storage; that information does not leave your browser. We measure visits with Vercel Analytics, which counts page views in aggregate without cookies. We do not use advertising cookies or pixels.</p>

      <H2>8. Changes to this notice</H2>
      <p>This notice may change because of new legal requirements, changes to our services or other reasons. We will publish each version on this same page, with its update date at the top.</p>
      <p><strong>Changes on November 21, 2026:</strong> the notice did not mention the data from x402 payments to Nirium&rsquo;s API, which is stored, nor OpenZeppelin as a processor; it said only the IP was used, when the rate-limiting fingerprint also uses browser headers; and it said Nirium cannot delete what is published on IPFS, when the precise statement is that it cannot guarantee it is deleted. It now says all four.</p>
    </>
  );
}

export default function PrivacyPage() {
  const { language, setLanguage } = useLanguage();
  const es = language === "es";

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 md:px-8 bg-black text-zinc-300">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-[10px] font-mono text-zinc-300 mb-6 uppercase tracking-widest">
            <Shield className="w-3 h-3" /> {es ? "Privacidad de datos / LFPDPPP" : "Data Privacy / LFPDPPP"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            {es ? "Aviso de Privacidad" : "Privacy Notice"}
          </h1>
          <p className="text-sm font-mono text-zinc-500">
            {es ? "Última actualización: 21 de noviembre de 2026" : "Last updated: November 21, 2026"}
          </p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1">
          {es ? <AvisoEs /> : <NoticeEn onSpanish={() => setLanguage("es")} />}
        </div>
      </div>
    </div>
  );
}
