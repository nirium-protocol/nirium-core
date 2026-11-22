'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, DollarSign, Wallet, CheckCircle, Loader2, ArrowDown, ExternalLink, Shield } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";

// 8-nov-2026: todo este flujo corre contra el SANDBOX de Etherfuse (precio y TVL en
// vivo coinciden con api.sand.etherfuse.com, no con producción). Los textos lo dicen
// y ya no prometen lo que el sandbox no hace: nada se "firma", no hay "bóveda" de
// destino (los CETES van a la dirección que se escribe) y el "éxito" solo aparece si
// el simulador de Etherfuse de verdad respondió bien.
const STELLAR_ACCOUNT = /^G[A-Z2-7]{55}$/;

// 21-nov-2026 (R1): el tipo de cambio se mostraba al revés. `exchangeRate` de Etherfuse viene en
// tokens por peso (500 MXN → 433.91 CETES da 0.8678), y la página lo pintaba como pesos por token.
// Se calcula de los montos de la propia cotización: pesos que pagas / tokens que recibes.
function fiatPerToken(quote: any): string | null {
    const src = parseFloat(quote?.sourceAmount ?? quote?.fromAmount);
    const dst = parseFloat(quote?.destinationAmount ?? quote?.toAmount ?? quote?.targetAmount);
    return src > 0 && dst > 0 ? (src / dst).toFixed(4) : null;
}

// 21-nov-2026 (R3): la hora local sin zona era ambigua. "en N min (hh:mm, zona)".
function expiresLabel(iso: string, lang: (en: string, es: string) => string): string {
    const at = new Date(iso);
    if (Number.isNaN(at.getTime())) return '-';
    const mins = Math.max(0, Math.round((at.getTime() - Date.now()) / 60000));
    const clock = at.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
    return lang(`in ${mins} min (${clock})`, `en ${mins} min (${clock})`);
}

export default function FiatRamp() {
    const { t, language } = useLanguage();
    const lang = (en: string, es: string) => (language === 'es' ? es : en);
    const [amount, setAmount] = useState<string>('500');
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [selectedBond, setSelectedBond] = useState<string>('CETES');
    const [status, setStatus] = useState<'idle' | 'onboarding' | 'kyc_pending' | 'quoting' | 'quoted' | 'ordering' | 'wiring' | 'success'>('idle');

    // Sin tasa fija: la referencia de jun-2026 (5.57%) se quitó el 8-nov-2026, igual que
    // en /treasury. Lo que se muestra es el precio y el TVL que Etherfuse devuelve en
    // vivo desde el mismo ambiente donde se ejecutan las órdenes (sandbox hoy).
    const BONDS = [
        { id: 'CETES', name: 'CETES', fiat: 'MXN' }
    ];
    const [liveLookup, setLiveLookup] = useState<Record<string, { tvl: string; cost: string }>>({});
    useEffect(() => {
        let cancelled = false;
        BONDS.forEach(async (b) => {
            try {
                const res = await fetch('/api/etherfuse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'lookup', bondId: b.id }),
                });
                const data = await res.json();
                if (cancelled || !data?.tokenPriceDecimal || !data?.netValueDecimal) return;
                setLiveLookup((prev) => ({
                    ...prev,
                    [b.id]: {
                        cost: `MX$${Number(data.tokenPriceDecimal).toFixed(5)}`,
                        tvl: `MX$${Math.round(Number(data.netValueDecimal)).toLocaleString('en-US')}`,
                    },
                }));
            } catch {
                // Entorno de pruebas o red caída - se deja sin dato en vez de mostrar un número viejo.
            }
        });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [quote, setQuote] = useState<any>(null);
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState<string>('');
    const [kycUrl, setKycUrl] = useState<string>('');
    const [kycCustomerId, setKycCustomerId] = useState<string>('');
    const [depositClabe, setDepositClabe] = useState<string>('');
    const [depositBankName, setDepositBankName] = useState<string>('');
    const [depositAccountHolder, setDepositAccountHolder] = useState<string>('');

    const handleGetQuote = async (_overrideCustomerId?: string) => {
        if (!amount || isNaN(Number(amount)) || Number(amount) < 1 || Number(amount) > 10000) {
            setError(t.ramp.component.errors.amount);
            return;
        }
        if (!STELLAR_ACCOUNT.test(walletAddress.trim())) {
            setError(t.ramp.component.errors.wallet);
            return;
        }

        setError('');
        setStatus('quoting');
        try {
            const bond = BONDS.find(b => b.id === selectedBond);
            const res = await fetch('/api/etherfuse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'quote', amount, walletAddress, bondId: bond?.id, fiat: bond?.fiat })
            });
            const data = await res.json();

            if (res.status === 403) {
                setStatus('onboarding');
                const onbRes = await fetch('/api/etherfuse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'onboarding', walletAddress })
                });
                const onbData = await onbRes.json();
                const url = onbData.presigned_url || onbData.kycDashboard || '';
                if (url) {
                    setKycUrl(url);
                    setKycCustomerId(onbData.customerId || '');
                    setStatus('kyc_pending');
                } else {
                    throw new Error(onbData.error || 'Onboarding failed');
                }
                return;
            }

            if (data.error) {
                const detail = data.details?.error || data.details?.message;
                const code = data.status ?? res.status;
                throw new Error(`${typeof data.error === 'string' ? data.error : JSON.stringify(data.error)} (HTTP ${code})${detail ? `: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}` : ''}`);
            }

            setQuote(data);
            setStatus('quoted');
        } catch (e: any) {
            setError(e.message);
            setStatus('idle');
        }
    };

    const handleConfirmOrder = async () => {
        setError('');
        setStatus('ordering');
        try {
            const res = await fetch('/api/etherfuse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'order', quoteId: quote.quoteId, walletAddress })
            });
            const data = await res.json();
            if (data.error) {
                const msg = typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error));
                if (data.code === 'WALLET_NOT_REGISTERED') {
                    // 21-nov-2026 (R2): antes salía el error crudo en inglés.
                    throw new Error(lang(
                        "Etherfuse couldn't register this address in its test environment. Check that it is a testnet address and try again.",
                        'Etherfuse no pudo registrar esta dirección en su entorno de pruebas. Revisa que sea una dirección de testnet y vuelve a intentar.'));
                }
                if (data.code === 'QUOTE_EXPIRED' || res.status === 409) {
                    setError(msg);
                    setQuote(null);
                    setStatus('idle');
                    return;
                }
                throw new Error(msg);
            }

            setOrder(data);
            const onramp = data.onramp || data;
            setDepositClabe(onramp.depositClabe || onramp.clabe || '');
            setDepositBankName(onramp.depositBankName || onramp.bankName || '');
            setDepositAccountHolder(onramp.depositAccountHolder || onramp.accountHolder || '');
            setStatus('wiring');

            // Antes marcaba "éxito" aunque la simulación fallara (también en el catch).
            setTimeout(async () => {
                try {
                    const sim = await fetch('/api/etherfuse', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'simulate_fiat', orderId: data.orderId || data.id || data.order_id })
                    });
                    if (!sim.ok) throw new Error(String(sim.status));
                    setStatus('success');
                } catch {
                    setError(lang(
                        "Etherfuse's sandbox did not confirm the simulated transfer. The order exists at Etherfuse; try a new quote.",
                        'El sandbox de Etherfuse no confirmó la transferencia simulada. La orden existe en Etherfuse; pide una nueva cotización.'));
                    setStatus('idle');
                }
            }, 3000);

        } catch (e: any) {
            setError(e.message);
            setStatus('quoted');
        }
    };

    return (
        <>
            <div className="bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-xl border border-white/10 p-5 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

                <div className="flex items-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mr-4 shrink-0">
                        <DollarSign className="text-emerald-400 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent uppercase italic tracking-tighter">{t.ramp.component.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{t.ramp.component.powered_by}</p>
                        </div>
                    </div>
                </div>

                {/* Opción A (8-nov-2026): la demo ordena con la cuenta de pruebas de Nirium en
                    Etherfuse; se dice aquí, antes de que alguien escriba nada. La ruta
                    /api/etherfuse se niega a cotizar u ordenar fuera del sandbox. */}
                <div className="mb-5 rounded-lg border border-amber-400/25 bg-amber-400/[0.05] px-3 py-2.5 text-[11px] leading-relaxed text-amber-300/90">
                    {lang(
                        "Demo on Etherfuse's sandbox: in this test the quote and the order are placed with Nirium's test account at Etherfuse, and no real money moves. In real use, each person opens their own account at Etherfuse and orders there; Nirium only shows the instructions and reads the resulting balance.",
                        'Demo en el sandbox de Etherfuse: en esta prueba la cotización y la orden se hacen con la cuenta de pruebas de Nirium en Etherfuse, y no se mueve dinero real. En uso real, cada persona abre su propia cuenta en Etherfuse y ordena ahí; Nirium solo muestra las instrucciones y lee el saldo que llega.')}
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {status === 'idle' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="mb-6">
                                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">{t.ramp.component.select_bond}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {BONDS.map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => setSelectedBond(b.id)}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedBond === b.id ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`font-black text-sm ${selectedBond === b.id ? 'text-emerald-400' : 'text-white'}`}>{b.name}</span>
                                                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">{lang('Etherfuse sandbox', 'Sandbox de Etherfuse')}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-mono mb-1">{lang('Token price in the sandbox', 'Precio del token en el sandbox')}: {liveLookup[b.id]?.cost ?? '…'}</div>
                                            {/* 19-nov-2026: se quitó el TVL del sandbox de Etherfuse. Aunque decía "no es dinero
                                                real", un MX$1,000 millones en una captura se lee como tracción y no ayuda a cotizar. */}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 block">
                                    {t.ramp.component.form.amount_label} ({BONDS.find(b => b.id === selectedBond)?.fiat})
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-lg focus:outline-none focus:border-emerald-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 block">{t.ramp.component.form.wallet_label}</label>
                                <div className="relative">
                                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={walletAddress}
                                        onChange={e => setWalletAddress(e.target.value)}
                                        placeholder={t.ramp.component.form.wallet_placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => handleGetQuote()}
                                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold rounded-lg py-3 mt-2 transition-all flex items-center justify-center space-x-2 group"
                            >
                                <span>{t.ramp.component.form.button}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}

                    {(status === 'quoting' || status === 'onboarding') && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                            <p className="text-sm text-gray-400 animate-pulse">
                                {status === 'onboarding' ? t.ramp.component.status.registering : t.ramp.component.status.requesting}
                            </p>
                        </motion.div>
                    )}

                    {status === 'kyc_pending' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white mb-1">{t.ramp.component.status.kyc_title}</h3>
                                <p className="text-xs text-gray-400">{t.ramp.component.status.kyc_desc}</p>
                            </div>
                            <a
                                href={kycUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full flex items-center justify-center space-x-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold rounded-lg py-3 transition-all"
                            >
                                <span>{t.ramp.component.status.kyc_button}</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                                onClick={() => { setStatus('idle'); setKycUrl(''); handleGetQuote(kycCustomerId || undefined); }}
                                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {t.ramp.component.status.kyc_retry}
                            </button>
                        </motion.div>
                    )}

                    {status === 'quoted' && quote && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">{t.ramp.component.quote.source}</span>
                                    <span className="text-white font-mono font-medium">{quote.sourceAmount || quote.fromAmount || amount} {BONDS.find(b => b.id === selectedBond)?.fiat}</span>
                                </div>
                                <div className="flex justify-center -my-1">
                                    <ArrowDown className="w-4 h-4 text-emerald-500/50" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">{t.ramp.component.quote.target}</span>
                                    <span className="text-emerald-400 font-mono font-bold text-lg">{(quote.destinationAmount || quote.toAmount || quote.targetAmount || 0)} {selectedBond}</span>
                                </div>
                                <div className="pt-2 mt-2 border-t border-white/10 flex justify-between">
                                    <span className="text-xs text-gray-500">{t.ramp.component.quote.rate}: 1 {selectedBond} = {fiatPerToken(quote) ?? '-'} {BONDS.find(b => b.id === selectedBond)?.fiat}</span>
                                    {/* Antes decía siempre "expira en 2m", sin dato que lo respaldara. */}
                                    {quote.expiresAt && (
                                        <span className="text-xs text-gray-500">{lang('Expires', 'Expira')}: {expiresLabel(quote.expiresAt, lang)}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button onClick={() => setStatus('idle')} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors">
                                    {t.ramp.component.quote.cancel}
                                </button>
                                <button onClick={handleConfirmOrder} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg py-2 transition-colors">
                                    {t.ramp.component.quote.confirm}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {status === 'ordering' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                            <p className="text-sm text-emerald-400 font-medium">{t.ramp.component.status.securing}</p>
                        </motion.div>
                    )}

                    {status === 'wiring' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="flex items-center space-x-3 mb-2">
                                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin flex-shrink-0" />
                                <p className="text-sm text-emerald-400 font-medium">{t.ramp.component.status.awaiting}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{t.ramp.component.wiring.title}</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">{t.ramp.component.wiring.clabe}</span>
                                        <span className="font-mono text-sm text-white font-bold tracking-wider">{depositClabe || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">{t.ramp.component.wiring.bank}</span>
                                        <span className="text-sm text-gray-300">{depositBankName || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">{t.ramp.component.wiring.beneficiary}</span>
                                        <span className="text-sm text-gray-300">{depositAccountHolder || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                        <span className="text-xs text-gray-500">{t.ramp.component.wiring.amount}</span>
                                        <span className="text-sm text-white font-mono font-medium">{amount} {BONDS.find(b => b.id === selectedBond)?.fiat}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 text-center">{t.ramp.component.status.simulating}</p>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">{t.ramp.component.success.title}</h3>
                            <p className="text-sm text-gray-400">
                                {t.ramp.component.success.desc}
                            </p>
                            <button onClick={() => setStatus('idle')} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm border border-white/10 mt-4 transition-colors">
                                {t.ramp.component.success.button}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Enlaces de Etherfuse: es su KYC, su custodia y sus términos, no los de Nirium. */}
            <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 lg:grid-cols-4 gap-8 text-[10px] text-gray-500 max-w-3xl mx-auto px-4">
                <div className="flex flex-col space-y-2.5">
                    <span className="font-black text-gray-400 mb-2 uppercase tracking-widest">{t.ramp.component.legal.infrastructure}</span>
                    <a href="https://devnet.etherfuse.com/legal/stablebonds-overview" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Stablebonds Overview</a>
                    <a href="https://devnet.etherfuse.com/legal/dev-docs" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Developer Docs</a>
                </div>
                <div className="flex flex-col space-y-2.5">
                    <span className="font-black text-gray-400 mb-2 uppercase tracking-widest">{t.ramp.component.legal.compliance}</span>
                    <a href="https://devnet.etherfuse.com/legal/compliance-and-audits" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Audits & KYC</a>
                    <a href="https://devnet.etherfuse.com/legal/proof-of-reserves" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Proof of Reserves</a>
                </div>
                <div className="flex flex-col space-y-2.5">
                    <span className="font-black text-gray-400 mb-2 uppercase tracking-widest">{t.ramp.component.legal.security}</span>
                    <a href="https://devnet.etherfuse.com/legal/asset-security" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Asset Security</a>
                    <a href="https://devnet.etherfuse.com/legal/legal-qa" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Legal Support (QA)</a>
                </div>
                <div className="flex flex-col space-y-2.5">
                    <span className="font-black text-gray-400 mb-2 uppercase tracking-widest">{t.ramp.component.legal.agreements}</span>
                    <a href="https://etherfuse.com/legal/terms-and-conditions" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors uppercase font-mono">Terms & Conditions</a>
                </div>
            </div>
        </>
    );
}
