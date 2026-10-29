'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Search, Shield, ShieldCheck, ShieldAlert, ShieldQuestion, Info,
    Copy, CheckCircle2, ExternalLink, RefreshCw, Hash, Clock, Tag as TagIcon,
    FileCode2, AlertTriangle, Loader2, ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
    extractCid, checkRecordIntegrity, networkLabel, explorerTxUrl, explorerAccountUrl,
    type AnchoredDoc, type RecordCheck,
} from '@/lib/auditVerify';

const MAX_ATTEMPTS = 10;
const RETRY_DELAY_MS = 9000; // 10 attempts * 9s ≈ the 60-90s gateway propagation window

type Phase = 'idle' | 'searching' | 'found' | 'error_invalid' | 'error_not_found' | 'error_not_audit_doc' | 'error_generic';
type AttestationState = 'checking' | 'valid' | 'invalid' | 'none' | 'error';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const GATEWAY = (process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway.pinata.cloud').replace(/\/$/, '');
const gatewayUrl = (cid: string) => `${GATEWAY.startsWith('http') ? GATEWAY : `https://${GATEWAY}`}/ipfs/${cid}`;

function VerifyContent() {
    const { t } = useLanguage();
    const tv = t.verifyAudit;
    const router = useRouter();
    const searchParams = useSearchParams();

    const [cidInput, setCidInput] = useState('');
    const [phase, setPhase] = useState<Phase>('idle');
    const [attempt, setAttempt] = useState(0);
    const [cid, setCid] = useState('');
    const [doc, setDoc] = useState<AnchoredDoc | null>(null);
    const [recordCheck, setRecordCheck] = useState<RecordCheck | null>(null);
    const [attestation, setAttestation] = useState<AttestationState>('none');
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const cancelledRef = useRef(false);
    useEffect(() => {
        cancelledRef.current = false;
        return () => { cancelledRef.current = true; };
    }, []);

    const runAttestationCheck = async (targetDoc: AnchoredDoc) => {
        if (!targetDoc.agent?.key || !targetDoc.agent?.signature) {
            setAttestation('none');
            return;
        }
        setAttestation('checking');
        try {
            const res = await fetch('/api/audit/verify-signature', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: targetDoc.agent.key,
                    signature: targetDoc.agent.signature,
                    contentSha256: targetDoc.content_sha256,
                }),
            });
            const data = await res.json();
            if (cancelledRef.current) return;
            setAttestation(data?.valid ? 'valid' : 'invalid');
        } catch {
            if (cancelledRef.current) return;
            // Network/server error — NOT the same as "signature invalid". Never
            // claim a verdict we couldn't actually check.
            setAttestation('error');
        }
    };

    const runLookup = async (targetCid: string, attemptNum: number) => {
        setPhase('searching');
        setAttempt(attemptNum);
        try {
            const res = await fetch(`/api/ipfs?cid=${encodeURIComponent(targetCid)}`, { signal: AbortSignal.timeout(12_000) });
            if (cancelledRef.current) return;
            if (!res.ok) {
                if (attemptNum < MAX_ATTEMPTS) {
                    await sleep(RETRY_DELAY_MS);
                    if (cancelledRef.current) return;
                    return runLookup(targetCid, attemptNum + 1);
                }
                setPhase('error_not_found');
                return;
            }
            const data = await res.json();
            if (cancelledRef.current) return;
            if (!data || typeof data.content_sha256 !== 'string') {
                setPhase('error_not_audit_doc');
                return;
            }

            setDoc(data);
            setCid(targetCid);
            setPhase('found');
            router.replace(`/verify?cid=${encodeURIComponent(targetCid)}`, { scroll: false });

            const rc = await checkRecordIntegrity(data);
            if (cancelledRef.current) return;
            setRecordCheck(rc);

            await runAttestationCheck(data);
        } catch {
            if (cancelledRef.current) return;
            if (attemptNum < MAX_ATTEMPTS) {
                await sleep(RETRY_DELAY_MS);
                if (cancelledRef.current) return;
                return runLookup(targetCid, attemptNum + 1);
            }
            setPhase('error_not_found');
        }
    };

    const startLookup = (raw: string) => {
        const extracted = extractCid(raw);
        if (!extracted) {
            setPhase('error_invalid');
            return;
        }
        setDoc(null);
        setRecordCheck(null);
        setAttestation('none');
        void runLookup(extracted, 1);
    };

    // Shareable links: /verify?cid=Qm... auto-runs the lookup once.
    const autoRanRef = useRef(false);
    useEffect(() => {
        if (autoRanRef.current) return;
        const fromUrl = searchParams.get('cid');
        if (fromUrl) {
            autoRanRef.current = true;
            setCidInput(fromUrl);
            startLookup(fromUrl);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startLookup(cidInput);
    };

    const handleReset = () => {
        cancelledRef.current = false;
        setPhase('idle');
        setDoc(null);
        setCid('');
        setCidInput('');
        setRecordCheck(null);
        setAttestation('none');
        router.replace('/verify', { scroll: false });
    };

    const copy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success(tv.result.copied);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const isSearching = phase === 'searching';
    const network = doc?.network ? networkLabel(doc.network) : 'testnet';

    return (
        <main className="min-h-screen pt-8 pb-24 relative bg-black">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
                        <Shield className="w-3.5 h-3.5" />
                        <span>{tv.badge}</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black mb-5 tracking-tighter uppercase italic leading-[0.9]">
                        {tv.title_pre} <span className="text-emerald-400">{tv.title_span}</span>
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-xl mx-auto mb-4">
                        {tv.subtitle}
                    </p>
                    <p className="text-[11px] text-gray-600 leading-relaxed max-w-xl mx-auto italic">
                        {tv.scope_note}
                    </p>
                </motion.div>

                {/* Input */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-[#121212] border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-2xl mb-8"
                >
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 block mb-2.5">
                        {tv.input_label}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
                            <input
                                type="text"
                                value={cidInput}
                                onChange={e => setCidInput(e.target.value)}
                                placeholder={tv.input_placeholder}
                                disabled={isSearching}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/40 transition-all placeholder:text-gray-700 disabled:opacity-50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching || !cidInput.trim()}
                            className="px-8 py-4 bg-white text-black font-black uppercase tracking-[0.15em] text-xs rounded-2xl hover:bg-emerald-400 transition-all disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95 shrink-0"
                        >
                            {isSearching
                                ? <><Loader2 className="w-4 h-4 animate-spin" />{tv.button_loading}</>
                                : <>{tv.button}<ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </div>
                </motion.form>

                {/* Status / results */}
                <AnimatePresence mode="wait">
                    {phase === 'searching' && (
                        <motion.div
                            key="searching"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="bg-[#121212] border border-white/5 rounded-[1.5rem] p-10 flex flex-col items-center gap-4 text-center"
                        >
                            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                            <p className="text-sm font-bold text-white uppercase tracking-widest">{tv.searching_title}</p>
                            {attempt > 1 && (
                                <p className="text-xs text-gray-500 font-mono">
                                    {tv.searching_hint.replace('{attempt}', String(attempt)).replace('{max}', String(MAX_ATTEMPTS))}
                                </p>
                            )}
                        </motion.div>
                    )}

                    {(phase === 'error_invalid' || phase === 'error_not_found' || phase === 'error_not_audit_doc' || phase === 'error_generic') && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="bg-red-500/5 border border-red-500/20 rounded-[1.5rem] p-8 flex flex-col items-center gap-4 text-center"
                        >
                            <ShieldAlert className="w-8 h-8 text-red-400" />
                            <p className="text-sm text-red-300/90 leading-relaxed max-w-md">
                                {phase === 'error_invalid' && tv.error_invalid_cid}
                                {phase === 'error_not_found' && tv.error_not_found}
                                {phase === 'error_not_audit_doc' && tv.error_not_audit_doc}
                                {phase === 'error_generic' && tv.error_generic}
                            </p>
                            {phase !== 'error_invalid' && (
                                <button
                                    onClick={() => startLookup(cidInput)}
                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />{tv.retry_button}
                                </button>
                            )}
                        </motion.div>
                    )}

                    {phase === 'found' && doc && (
                        <motion.div
                            key="found"
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="space-y-5"
                        >
                            {/* Verdict banner */}
                            <div className={`rounded-[1.5rem] p-6 border flex items-start gap-4 ${
                                recordCheck === 'mismatch'
                                    ? 'bg-red-500/5 border-red-500/20'
                                    : recordCheck === 'match'
                                        ? 'bg-emerald-500/5 border-emerald-500/20'
                                        : 'bg-sky-500/5 border-sky-500/20'
                            }`}>
                                {recordCheck === 'mismatch'
                                    ? <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                                    : recordCheck === 'match'
                                        ? <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                                        : <ShieldQuestion className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />}
                                <div>
                                    <p className={`text-sm font-black uppercase tracking-wide ${
                                        recordCheck === 'mismatch' ? 'text-red-300' : recordCheck === 'match' ? 'text-emerald-300' : 'text-sky-300'
                                    }`}>
                                        {recordCheck === 'mismatch' && tv.result.verdict_mismatch}
                                        {recordCheck === 'match' && tv.result.verdict_match}
                                        {(recordCheck === 'no_record' || recordCheck === null) && tv.result.verdict_no_record}
                                    </p>
                                    {recordCheck === 'no_record' && (
                                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{tv.result.no_record_note}</p>
                                    )}
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="bg-[#121212] border border-white/5 rounded-[1.5rem] p-6 sm:p-8 space-y-4">
                                <FieldRow icon={Hash} label={tv.result.field_cid}>
                                    <MonoCopyValue value={cid} onCopy={() => copy(cid, 'cid')} copied={copiedField === 'cid'} />
                                </FieldRow>
                                <FieldRow icon={Hash} label={tv.result.field_hash}>
                                    <MonoCopyValue value={doc.content_sha256} onCopy={() => copy(doc.content_sha256, 'hash')} copied={copiedField === 'hash'} />
                                </FieldRow>
                                <FieldRow icon={Shield} label={tv.result.field_network}>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                        network === 'mainnet' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                    }`}>
                                        {network}
                                    </span>
                                </FieldRow>
                                {doc.anchoredAt && (
                                    <FieldRow icon={Clock} label={tv.result.field_anchored_at}>
                                        <span className="text-sm text-white font-mono">{new Date(doc.anchoredAt).toLocaleString()}</span>
                                    </FieldRow>
                                )}
                                {doc.tag && (
                                    <FieldRow icon={TagIcon} label={tv.result.field_tag}>
                                        <span className="text-sm text-white font-mono">{doc.tag}</span>
                                    </FieldRow>
                                )}
                                {doc.version && (
                                    <FieldRow icon={FileCode2} label={tv.result.field_schema}>
                                        <span className="text-sm text-gray-500 font-mono">v{doc.version}</span>
                                    </FieldRow>
                                )}
                                {doc.txHash && (
                                    <FieldRow icon={ExternalLink} label={tv.result.field_tx}>
                                        <a
                                            href={explorerTxUrl(doc.txHash, doc.network)}
                                            target="_blank" rel="noopener noreferrer"
                                            className="text-sm text-emerald-400 hover:text-emerald-300 font-mono truncate inline-flex items-center gap-1.5"
                                        >
                                            {doc.txHash.slice(0, 16)}…<ExternalLink className="w-3 h-3" />
                                        </a>
                                    </FieldRow>
                                )}

                                <div className="pt-2">
                                    <a
                                        href={gatewayUrl(cid)}
                                        target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors"
                                    >
                                        {tv.result.view_raw}<ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>

                            {/* Embedded record */}
                            {doc.record && (
                                <div className="bg-[#121212] border border-white/5 rounded-[1.5rem] p-6 sm:p-8">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">
                                        {tv.result.record_label}
                                    </h4>
                                    <pre className="bg-black/60 border border-white/5 rounded-xl p-4 text-xs text-white/70 font-mono whitespace-pre-wrap break-all max-h-[320px] overflow-y-auto">
                                        {JSON.stringify(doc.record, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Attestation */}
                            <div className="bg-[#121212] border border-white/5 rounded-[1.5rem] p-6 sm:p-8">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">
                                    {tv.result.attestation_title}
                                </h4>
                                {doc.agent ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-3 flex-wrap">
                                            <span className="text-[11px] text-gray-500 uppercase tracking-widest font-mono">{tv.result.attested_by}</span>
                                            <a
                                                href={explorerAccountUrl(doc.agent.key, doc.network)}
                                                target="_blank" rel="noopener noreferrer"
                                                className="text-sm text-emerald-400 hover:text-emerald-300 font-mono truncate inline-flex items-center gap-1.5"
                                            >
                                                {doc.agent.key}<ExternalLink className="w-3 h-3 shrink-0" />
                                            </a>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold ${
                                            attestation === 'valid' ? 'bg-emerald-500/10 text-emerald-300' :
                                            attestation === 'invalid' ? 'bg-red-500/10 text-red-300' :
                                            attestation === 'error' ? 'bg-amber-500/10 text-amber-300' :
                                            'bg-white/5 text-gray-400'
                                        }`}>
                                            {attestation === 'checking' && <><Loader2 className="w-3.5 h-3.5 animate-spin" />{tv.result.attestation_checking}</>}
                                            {attestation === 'valid' && <><CheckCircle2 className="w-3.5 h-3.5" />{tv.result.attestation_valid}</>}
                                            {attestation === 'invalid' && <><AlertTriangle className="w-3.5 h-3.5" />{tv.result.attestation_invalid}</>}
                                            {attestation === 'error' && (
                                                <>
                                                    <Info className="w-3.5 h-3.5" />
                                                    <span className="flex-1">{tv.error_generic}</span>
                                                    <button onClick={() => runAttestationCheck(doc)} className="underline shrink-0">{tv.retry_button}</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 leading-relaxed">{tv.result.attestation_none}</p>
                                )}
                            </div>

                            <button
                                onClick={handleReset}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all"
                            >
                                {tv.new_lookup}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

function FieldRow({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest font-mono shrink-0 pt-0.5">
                <Icon className="w-3.5 h-3.5" />
                {label}
            </div>
            <div className="text-right min-w-0 flex-1">{children}</div>
        </div>
    );
}

function MonoCopyValue({ value, onCopy, copied }: { value: string; onCopy: () => void; copied: boolean }) {
    return (
        <div className="flex items-center justify-end gap-2 min-w-0">
            <span className="text-sm text-white font-mono truncate">{value}</span>
            <button onClick={onCopy} className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors">
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
            </button>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
