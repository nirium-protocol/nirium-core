"use client";

import Link from "next/link";
import { ExternalLink, ShieldCheck, Github } from "lucide-react";
import LegalDisclaimer from "@/components/legal/LegalDisclaimer";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();
  const lang = (en: string, es: string) => (language === "es" ? es : en);

  return (
    <footer className="w-full bg-background border-t border-white/10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <Link href="/" className="inline-block w-fit">
              <span className="text-xl font-black tracking-tighter text-white">NIRIUM</span>
            </Link>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
              {lang("Payment, audit and execution rails on Stellar. Your keys, your funds.", "Rieles de pago, auditoría y ejecución en Stellar. Tus llaves, tus fondos.")}
            </p>
            <div className="pt-4 flex items-center gap-3">
              <a
                href="https://github.com/nirium-protocol/nirium"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="w-5 h-5" />
              </a>
              {/* lucide-react no trae el logo actual de X (solo el pájaro viejo de
                  Twitter), así que va en SVG propio, del mismo tamaño que el de GitHub. */}
              <a
                href="https://x.com/Niriumstellar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Nirium on X"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Invitación permanente (no expira), verificada contra la API de
                  Discord el 9-nov-2026: servidor "Nirium". Si cambia, actualizar
                  también public/nirium-api.yaml. */}
              <a
                href="https://discord.gg/gAAznKrSQZ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Nirium on Discord"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
                  <path d="M20.317 4.369A19.79 19.79 0 0 0 15.432 2.85a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.1.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.419-2.157 2.419z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Middle Column */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-2">{lang("Navigation", "Navegación")}</h4>
            <ul className="space-y-3">
              <li><Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">{lang("Product Dashboard", "Dashboard del producto")}</Link></li>
              <li><Link href="/developers" className="text-sm text-zinc-400 hover:text-white transition-colors">Developers</Link></li>
              <li><Link href="/docs" className="text-sm text-zinc-400 hover:text-white transition-colors">{lang("Documentation", "Documentación")}</Link></li>
              <li>
                <a href="https://github.com/nirium-protocol/nirium" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://nirium-protocol.github.io/status/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                  Status <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li><Link href="/stats" className="text-sm text-zinc-400 hover:text-white transition-colors">{lang("Usage Stats", "Estadísticas de uso")}</Link></li>
            </ul>
          </div>

          {/* Ecosystem Column */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-2">{lang("Ecosystem", "Ecosistema")}</h4>
            <ul className="space-y-3">
              <li><a href="https://communityfund.stellar.org/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">Stellar Community Fund <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://developers.stellar.org/docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">{lang("Developer Docs", "Docs para desarrolladores")} <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="http://discord.gg/stellardev" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">Stellar Discord <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          {/* Legal Links Right Column */}
          <div className="md:col-span-3 flex flex-col space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-2">{lang("Legal & Compliance", "Legal y Compliance")}</h4>
            <ul className="space-y-3">
              <li><Link href="/disclaimers" className="text-sm text-zinc-400 hover:text-amber-400 transition-colors">{lang("Mandatory Disclaimers", "Avisos obligatorios")}</Link></li>
              <li><Link href="/risk-disclosure" className="text-sm text-zinc-400 hover:text-amber-400 transition-colors">{lang("Risk Disclosure (CETES)", "Aviso de riesgo (CETES)")}</Link></li>
              <li><Link href="/privacy" className="text-sm text-zinc-400 hover:text-white transition-colors">{lang("Privacy Policy (LFPDPPP)", "Aviso de privacidad (LFPDPPP)")}</Link></li>
              <li><Link href="/terms" className="text-sm text-zinc-400 hover:text-white transition-colors">{lang("Terms of Service", "Términos de servicio")}</Link></li>
              <li><Link href="/coc" className="text-sm text-zinc-400 hover:text-white transition-colors">{lang("Code of Conduct", "Código de conducta")}</Link></li>
              <li><Link href="/compliance" className="text-sm text-zinc-400 hover:text-white transition-colors">Compliance Hub</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <LegalDisclaimer variant="footer" locale={language} />
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-[10px] font-mono text-zinc-500">
              <span className="px-2 py-1 rounded bg-white/5 border border-white/10 uppercase tracking-wider text-zinc-300">
                {lang("Apache 2.0 (Protocol & Interface)", "Apache 2.0 (Protocolo e Interfaz)")}
              </span>
              <span className="px-2 py-1 rounded bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 uppercase tracking-wider">
                {lang("Non-custodial · Stellar Mainnet + Testnet", "No custodial · Stellar Mainnet + Testnet")}
              </span>
              <a 
                href="https://communityfund.stellar.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase tracking-wider hover:bg-purple-500/20 transition-colors"
              >
                <ShieldCheck className="w-3 h-3" />
                {lang("Two SCF Instawards, delivered", "Dos SCF Instawards, entregados")}
              </a>
            </div>

            <div className="text-[10px] text-zinc-500 font-mono text-center lg:text-right uppercase tracking-widest">
              &copy; 2026 Nirium Protocol<br />
              {lang("Not financial advice.", "No es asesoría financiera.")}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
