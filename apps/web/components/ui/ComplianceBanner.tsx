'use client';
import { Shield, CheckCircle, Heart } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";

export function ComplianceBanner() {
    const { t } = useLanguage();

    // El texto de "Aviso Regulatorio" que vivía aquí se quitó a propósito
    // (21-ago-2026): era una variante corta y distinta del disclaimer real
    // (LegalDisclaimer.tsx, footer sitewide) - dos versiones del mismo aviso
    // legal en paralelo, una de ellas sin actualizar cuando la otra se
    // corrigió. El footer ya aparece en cada página; no hace falta duplicarlo
    // aquí. Los badges de abajo no son un claim legal, se quedan.
    // 8-nov-2026: se quitó "COC COMPLIANT". Nadie certifica ese cumplimiento; seguir el
    // Código de Conducta de Stellar es un compromiso nuestro y así lo dice el aviso
    // (LegalDisclaimer.tsx), no una insignia de cumplimiento.
    return (
        <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: t.common.non_custodial, icon: Shield, color: 'text-stellar-teal' },
                    { label: t.common.scf_7, icon: Heart, color: 'text-pink-400' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                        <item.icon size={12} className={item.color} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AtomicProofBadge({ txHash }: { txHash?: string }) {
    const { t } = useLanguage();
    if (!txHash) return null;

    return (
        <a 
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[8px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all"
        >
            <CheckCircle size={8} />
            Atomic Proof
        </a>
    );
}
