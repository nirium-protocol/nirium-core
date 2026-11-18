"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle, ExternalLink, HeartHandshake } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function CocPage() {
  const { language } = useLanguage();
  const es = language === "es";
  const t = (en: ReactNode, esText: ReactNode) => (es ? esText : en);

  const principles: { title: ReactNode; body: ReactNode }[] = [
    {
      title: t("1. Transparency", "1. Transparencia"),
      body: t(
        <>We build in the open. Payments and rebalances settle on-chain, and anyone can check them on <a href="https://stellar.expert/explorer/public" target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline">Stellar Expert</a>. Audit Trail receipts can be checked by anyone at <Link href="/verify" className="text-stellar-teal hover:underline">/verify</Link>, without trusting our backend.</>,
        <>Construimos a la vista. Los pagos y rebalanceos se liquidan on-chain y cualquiera puede revisarlos en <a href="https://stellar.expert/explorer/public" target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline">Stellar Expert</a>. Los recibos de Audit Trail los puede comprobar cualquiera en <Link href="/verify" className="text-stellar-teal hover:underline">/verify</Link>, sin confiar en nuestro backend.</>
      ),
    },
    {
      title: t("2. Integrity", "2. Integridad"),
      body: t(
        // 9-nov-2026: decía "El LLM sugiere, el contrato decide". El firmante de
        // mainnet no usa un LLM (reglas fijas, ver rebalanceDecision.ts) y sí firma
        // Invest/Unwind; el loop con IA es la demo de testnet.
        <>We do not use deceptive practices, hype marketing or front-running. Where Nirium automates something, the contract sets the limits: the agent can only do what its on-chain role allows. The mainnet rebalancer follows fixed rules set by the vault owner, not an AI model, and its role cannot take funds out of the vault.</>,
        <>No usamos prácticas engañosas, marketing exagerado ni front-running. Donde Nirium automatiza algo, el contrato pone los límites: el agente solo puede hacer lo que su rol on-chain permite. El rebalanceador de mainnet sigue reglas fijas que pone el dueño de la bóveda, no un modelo de IA, y su rol no puede sacar fondos de la bóveda.</>
      ),
    },
    {
      title: t("3. Safety", "3. Seguridad"),
      body: t(
        "User protection comes first. Nirium is non-custodial: it never holds client keys, and the only role it can hold on a client vault cannot withdraw funds. Clients sign with their own wallet and keep their own keys.",
        "La protección del usuario va primero. Nirium es no custodial: nunca guarda las llaves del cliente, y el único rol que puede tener en una bóveda de un cliente no puede retirar fondos. Los clientes firman con su propia wallet y conservan sus llaves."
      ),
    },
    {
      title: t("4. Professionalism", "4. Profesionalismo"),
      body: t(
        "We keep communication clear and respectful on every platform. We do not use speculative language or make yield promises. Official announcements are published on nirium.xyz and our GitHub.",
        "Mantenemos una comunicación clara y respetuosa en todas las plataformas. No usamos lenguaje especulativo ni prometemos rendimientos. Los anuncios oficiales se publican en nirium.xyz y en nuestro GitHub."
      ),
    },
    {
      title: t("5. Open Source", "5. Código abierto"),
      body: t(
        "We contribute back to the ecosystem. Our core smart contracts, SDK, MCP (Model Context Protocol) server and Agent API are published under the permissive Apache 2.0 license.",
        "Le regresamos al ecosistema. Nuestros contratos inteligentes principales, el SDK, el servidor MCP (Model Context Protocol) y la API del agente se publican con la licencia permisiva Apache 2.0."
      ),
    },
  ];

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 md:px-8 bg-black text-zinc-300">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stellar-teal/10 border border-stellar-teal/20 rounded-full text-[10px] font-mono text-stellar-teal mb-6 uppercase tracking-widest">
            <CheckCircle className="w-3 h-3" /> {t("Community Guidelines", "Normas de la comunidad")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            {t("Code of Conduct", "Código de Conducta")}
          </h1>
          <p className="text-sm font-mono text-zinc-500">{t("Last updated: November 9, 2026", "Última actualización: 9 de noviembre de 2026")}</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1">
          <div className="p-6 bg-white/[0.04] border border-white/10 rounded-2xl mb-12">
            <h2 className="text-white font-bold text-xl mb-3 flex items-center gap-2 mt-0">
              <HeartHandshake className="w-5 h-5 text-stellar-teal" />
              {t("Aligned with the Stellar Code of Conduct", "Alineados con el Código de Conducta de Stellar")}
            </h2>
            <p className="text-sm m-0">
              {t(
                <>The Nirium Protocol community, developers and ecosystem follow the <strong>Stellar Code of Conduct</strong>. We want a welcoming, professional and transparent environment for everyone.</>,
                <>La comunidad, los desarrolladores y el ecosistema de Nirium Protocol siguen el <strong>Código de Conducta de Stellar</strong>. Queremos un ambiente acogedor, profesional y transparente para todos.</>
              )}
            </p>
            <a
              href="https://stellar.org/foundation/code-of-conduct"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-stellar-teal mt-4 hover:underline underline-offset-4"
            >
              {t("Read the official Stellar Code of Conduct", "Leer el Código de Conducta oficial de Stellar")} <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <h2 className="text-white font-bold text-2xl mt-12 mb-6 border-b border-white/10 pb-2">
            {t("The 5 Principles in Practice", "Los 5 principios en la práctica")}
          </h2>

          <div className="space-y-8">
            {principles.map((p, i) => (
              <div key={i}>
                <h3 className="text-white font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-sm text-zinc-400">{p.body}</p>
              </div>
            ))}
          </div>

          <h2 className="text-white font-bold text-2xl mt-16 mb-4 border-b border-white/10 pb-2">
            {t("Nirium Community Standards", "Normas de la comunidad de Nirium")}
          </h2>
          <p>{t(
            <>When taking part in our <a href="https://discord.gg/gAAznKrSQZ" target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline">Discord</a>, our GitHub repositories, our events (such as Código 402) or our social channels, everyone is expected to:</>,
            <>Al participar en nuestro <a href="https://discord.gg/gAAznKrSQZ" target="_blank" rel="noopener noreferrer" className="text-stellar-teal hover:underline">Discord</a>, en nuestros repositorios de GitHub, en nuestros eventos (como Código 402) o en nuestras redes, se espera que cada persona:</>
          )}</p>
          <ul>
            <li>{t("Use welcoming and inclusive language.", "Use un lenguaje acogedor e inclusivo.")}</li>
            <li>{t("Be respectful of differing viewpoints and experiences.", "Respete los puntos de vista y experiencias distintas.")}</li>
            <li>{t("Gracefully accept constructive criticism.", "Acepte la crítica constructiva con buena actitud.")}</li>
            <li>{t("Focus on what is best for the community.", "Se enfoque en lo mejor para la comunidad.")}</li>
            <li>{t("Show empathy towards other community members.", "Muestre empatía hacia las demás personas de la comunidad.")}</li>
          </ul>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4 border-b border-white/10 pb-2">
            {t("Reporting Violations", "Cómo reportar una falta")}
          </h2>
          <p>{t(
            "We take code of conduct violations seriously. If you experience or witness unacceptable behavior, please report it through the right channel:",
            "Tomamos en serio las faltas al código de conducta. Si vives o ves un comportamiento inaceptable, repórtalo por el canal que corresponda:"
          )}</p>

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="p-5 bg-white/[0.04] border border-white/10 rounded-xl">
              <div className="font-bold text-white mb-1">{t("SCF & Ecosystem Violations", "Faltas en el SCF y el ecosistema")}</div>
              <p className="text-sm text-zinc-400 mb-3">{t("For issues concerning the broader Stellar ecosystem guidelines.", "Para temas de las normas del ecosistema de Stellar en general.")}</p>
              <a href="mailto:community@stellar.org" className="text-stellar-teal text-sm font-mono hover:underline">community@stellar.org</a>
            </div>
            <div className="p-5 bg-white/[0.04] border border-white/10 rounded-xl">
              <div className="font-bold text-white mb-1">{t("Nirium-Specific Violations", "Faltas en espacios de Nirium")}</div>
              <p className="text-sm text-zinc-400 mb-3">{t("For issues within Nirium's Discord, repositories, events or channels.", "Para temas dentro del Discord, los repositorios, eventos o canales de Nirium.")}</p>
              <a href="mailto:niriumprotocol@gmail.com" className="text-stellar-teal text-sm font-mono hover:underline">niriumprotocol@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
