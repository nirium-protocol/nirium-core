"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, AlertTriangle } from "lucide-react";

type Variant = "banner" | "footer" | "inline";
type Locale = "en" | "es";

interface LegalDisclaimerProps {
  variant: Variant;
  locale?: Locale;
  className?: string;
}

const SHORT: Record<Locale, string> = {
  en: "Nirium is software-only B2B infrastructure on Stellar (mainnet and testnet). It is software, not a consumer financial product or investment advice, and it never holds your funds. No yields are guaranteed. Use at your own risk.",
  es: "Nirium es infraestructura de software B2B en Stellar (mainnet y testnet). Es software, no un producto financiero para consumidores ni asesoría de inversión, y nunca custodia tus fondos. No garantiza rendimientos. Úsalo bajo tu propio riesgo.",
};

const FULL: Record<Locale, string> = {
  en: "Nirium is software-only B2B infrastructure. It is software, not a consumer financial product, and not investment advice. Nirium never holds or custodies funds. Non-custodial settlement (x402), audit anchoring and reporting run on Stellar mainnet; batch payouts are invite-only early access on mainnet, with no mainnet runs yet. Autonomous rebalancing runs on DeFindex vaults (third-party audited contracts, structured so the client owns the vault; today's live vault is Nirium's own, self-funded), invite-only until we have a written legal opinion; the role Nirium holds cannot withdraw funds, and the client can revoke it at any time. NiriumVault, Nirium’s own contract, runs on Stellar testnet only, audit-gated until a formal external audit. Nirium does not guarantee yields, dividends, or returns. Any rate data shown (e.g., Etherfuse CETES) is public reference information, not a promise of return. MPP Charge is experimental: verified on testnet, not tested on mainnet. Crypto assets are volatile. Financial services are provided by independent third parties, not by Nirium.",
  es: "Nirium es infraestructura de software B2B: solo software. Es software, no un producto financiero para consumidores, ni asesoría de inversión. Nirium nunca custodia fondos. La liquidación no custodial (x402), el anclaje de auditoría y los reportes corren en Stellar mainnet; las dispersiones en lote son acceso anticipado por invitación en mainnet, todavía sin corridas ahí. El rebalanceo autónomo corre sobre bóvedas de DeFindex (contratos de terceros, auditados, pensados para que la bóveda sea del cliente; la bóveda activa hoy es de Nirium, con fondos propios), solo por invitación hasta tener una opinión legal por escrito; el rol que Nirium tiene no puede retirar fondos y el cliente puede revocarlo cuando quiera. NiriumVault, el contrato propio de Nirium, corre únicamente en Stellar testnet y no pasará a mainnet sin una auditoría externa formal. Nirium no garantiza rendimientos, dividendos ni retornos de ningún tipo. Las tasas mostradas (por ejemplo, CETES vía Etherfuse) son información pública de referencia, no promesas de ganancia. MPP Charge es experimental: verificado en testnet, sin probar en mainnet. Los criptoactivos son volátiles. Los servicios financieros los prestan terceros independientes, no Nirium.",
};

const COC_URL = "https://stellar.org/foundation/code-of-conduct";
const STORAGE_KEY = "nirium-disclaimer-dismissed";

export default function LegalDisclaimer({
  variant,
  locale = "en",
  className = "",
}: LegalDisclaimerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (variant === "banner") {
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      setVisible(!dismissed);
    }
  }, [variant]);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (variant === "banner") {
    if (!visible) return null;
    return (
      <div
        role="alert"
        className={`disclaimer-banner relative w-full bg-black backdrop-blur-md border-b border-red-500/20 text-white px-4 py-3 sm:py-2.5 shadow-lg transition-all duration-300 ${className}`}
      >
        <div className="max-w-5xl mx-auto flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
          <p className="text-[11px] sm:text-xs leading-relaxed flex-1 text-white font-medium">
            {SHORT[locale]}{" "}
            <Link
              href="/disclaimers"
              className="underline underline-offset-2 text-red-500 hover:text-red-400 transition-colors font-bold"
            >
              {locale === "es" ? "Leer aviso completo" : "Read full disclaimer"}
            </Link>
            {" · "}
            <a
              href={COC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 text-red-500 hover:text-red-400 transition-colors"
            >
              {locale === "es" ? "Seguimos el Código de Conducta de Stellar ↗" : "We follow the Stellar Code of Conduct ↗"}
            </a>
          </p>
          <button
            onClick={dismiss}
            aria-label={locale === "es" ? "Cerrar aviso" : "Dismiss disclaimer"}
            className="shrink-0 p-1 rounded hover:bg-white/10 text-red-500 hover:text-red-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === "footer") {
    // Short pointer, not a third independently-written full text - the only
    // full version lives on /disclaimers (which itself renders FULL via the
    // "inline" variant below). Duplicating FULL here risked the footer and
    // /disclaimers drifting apart in wording over time.
    return (
      <p
        className={`text-[10px] leading-relaxed text-zinc-500 font-mono italic ${className}`}
      >
        {SHORT[locale]}{" "}
        <Link
          href="/disclaimers"
          className="underline underline-offset-2 text-zinc-400 hover:text-zinc-300 transition-colors font-bold not-italic"
        >
          {locale === "es" ? "Ver aviso legal completo →" : "Read full legal notice →"}
        </Link>
        {" · "}
        <a
          href={COC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-zinc-300 transition-colors"
        >
          {locale === "es" ? "Seguimos el Código de Conducta de Stellar ↗" : "We follow the Stellar Code of Conduct ↗"}
        </a>
      </p>
    );
  }

  // inline - full block for /disclaimers page
  return (
    <div
      className={`rounded-2xl border border-stellar-teal/15 bg-black/40 backdrop-blur-sm p-6 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-stellar-teal shrink-0" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stellar-teal">
          {locale === "es" ? "Aviso Legal Obligatorio" : "Mandatory Legal Disclaimer"}
        </span>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed mb-4">
        {FULL[locale]}
      </p>
      <a
        href={COC_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-stellar-teal hover:text-stellar-teal/80 underline underline-offset-2 transition-colors"
      >
        {locale === "es" ? "Seguimos el Código de Conducta de Stellar ↗" : "We follow the Stellar Code of Conduct ↗"}
      </a>
    </div>
  );
}
