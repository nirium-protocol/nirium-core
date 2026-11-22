'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Search, Shield, ShieldCheck, ShieldAlert, ShieldQuestion, Info,
    Copy, CheckCircle2, ExternalLink, RefreshCw, Hash, Clock, Tag as TagIcon,
    FileCode2, AlertTriangle, Loader2, ArrowRight, Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
    extractCid, checkRecordIntegrity, declaredNetwork, explorerTxUrl, explorerAccountUrl, checkSignerAccount,
    rawGatewayUrl, formatAnchoredAtUtc,
    type AnchoredDoc, type RecordCheck, type SignerAccount,
} from '@/lib/auditVerify';

const MAX_ATTEMPTS = 10;
const RETRY_DELAY_MS = 9000; // 10 attempts * 9s ≈ the 60-90s gateway propagation window

// Nirium's own signed mainnet anchor (agent.id "selftest-nirium") - a
// deliberate self-test, not a partner's evidence, so it's safe to point
// visitors at from this page and always resolves to the full green result.
const EXAMPLE_CID = 'QmaAXCmpqaptjDTJoRPcyFBUywrvuA7GfLyArVaQwd5VDM';
// A partner's (TIA) own signed quote on mainnet - a record that never touches the chain.
const EXAMPLE_TIA_CID = 'QmVWZM1i9qusiTfNAT9QdSFYJNEwQUXtnWuSkrCqRAnGEu';
// A Nirium self-test payment receipt on testnet that links its settled transaction.
const EXAMPLE_PAYMENT_CID = 'QmboKKkuwck3zvRx2bqnzUdDFkrEtc1VUHo6rrzm9nyBtD';
// AgentLedger's mainnet receipt for a payment its policy blocked (18 Nov 2026): no transaction exists.
const EXAMPLE_REFUSED_CID = 'QmS5q2NvZ2K2StLB3KCWRdkBtnZ5rHAJrQAez2PnKAPwTk';

type Phase = 'idle' | 'searching' | 'found' | 'error_invalid' | 'error_not_found' | 'error_not_audit_doc' | 'error_generic';
type AttestationState = 'checking' | 'valid' | 'invalid' | 'none' | 'error';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function VerifyContent() {
    const { t, language } = useLanguage();
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
    const [signerAccount, setSignerAccount] = useState<SignerAccount>('unknown');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    // Comparar un anclaje de solo hash con la evidencia original (9-nov-2026).
    // El archivo se lee y se hashea EN EL NAVEGADOR (crypto.subtle); nunca se sube.
    // Mismo cálculo que `nirium verify --evidence`: sha-256 de los bytes del archivo.
    const [evidence, setEvidence] = useState<{ name: string; sha256: string; match: boolean } | null>(null);
    const [evidenceBusy, setEvidenceBusy] = useState(false);
    const [pastedHash, setPastedHash] = useState('');

    const cancelledRef = useRef(false);
    const signerKeyRef = useRef<string | null>(null);
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
            const res = await fetch(`/api/ipfs?cid=${encodeURIComponent(targetCid)}`, { signal: AbortSignal.timeout(25_000) });
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

            if (data.agent?.key) {
                const key = data.agent.key;
                signerKeyRef.current = key;
                checkSignerAccount(key, data.network).then(s => {
                    if (!cancelledRef.current && signerKeyRef.current === key) setSignerAccount(s);
                });
            }
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

    const compareEvidenceFile = async (file: File) => {
        if (!doc) return;
        setEvidenceBusy(true);
        try {
            const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
            const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
            setEvidence({ name: file.name, sha256: hex, match: hex === doc.content_sha256.toLowerCase() });
        } finally {
            setEvidenceBusy(false);
        }
    };

    const comparePastedHash = () => {
        if (!doc) return;
        const hex = pastedHash.trim().toLowerCase().replace(/^sha-?256:/, '');
        if (!/^[0-9a-f]{64}$/.test(hex)) {
            setEvidence({ name: '', sha256: hex, match: false });
            return;
        }
        setEvidence({ name: '', sha256: hex, match: hex === doc.content_sha256.toLowerCase() });
    };

    const startLookup = (raw: string) => {
        const extracted = extractCid(raw);
        if (!extracted) {
            setPhase('error_invalid');
            return;
        }
        setEvidence(null);
        setPastedHash('');
        setDoc(null);
        setRecordCheck(null);
        setAttestation('none');
        setSignerAccount('unknown');
        signerKeyRef.current = null;
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
        setSignerAccount('unknown');
        setEvidence(null);
        setPastedHash('');
        signerKeyRef.current = null;
        router.replace('/verify', { scroll: false });
    };

    const copy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success(tv.result.copied);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const isSearching = phase === 'searching';
    // null = el documento no declara red: se dice, no se asume testnet.
    const network = declaredNetwork(doc?.network);

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

                <div className="text-center mb-8 -mt-2 space-y-2">
                    <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-gray-500">
                        <span>{tv.example_intro}</span>
                        <button
                            type="button"
                            onClick={() => { setCidInput(EXAMPLE_CID); startLookup(EXAMPLE_CID); }}
                            disabled={isSearching}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-40"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            {tv.example_button}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setCidInput(EXAMPLE_TIA_CID); startLookup(EXAMPLE_TIA_CID); }}
                            disabled={isSearching}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-40"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            {tv.example_tia_button}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setCidInput(EXAMPLE_PAYMENT_CID); startLookup(EXAMPLE_PAYMENT_CID); }}
                            disabled={isSearching}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-40"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            {tv.example_payment_button}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setCidInput(EXAMPLE_REFUSED_CID); startLookup(EXAMPLE_REFUSED_CID); }}
                            disabled={isSearching}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-40"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            {tv.example_refused_button}
                        </button>
                        <span>
                            {tv.example_or}{' '}
                            <Link href="/docs#quickstart" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                {tv.example_anchor_link}
                            </Link>
                            {' '}{tv.example_guide_suffix}
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-600">{tv.example_note}</p>
                </div>

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

                            {/* Comparar con la evidencia original: solo para anclajes de solo hash. */}
                            {recordCheck === 'no_record' && (
                                <div className="bg-[#121212] border border-white/5 rounded-[1.5rem] p-6 sm:p-8 space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                        {language === 'es' ? 'Comparar con tu archivo' : 'Compare with your file'}
                                    </h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        {language === 'es'
                                            ? 'Si tienes la evidencia original, elígela aquí. Tu navegador calcula su SHA-256 y lo compara con el hash del recibo. El archivo no sale de tu computadora: no se sube a Nirium ni a ningún otro lado.'
                                            : 'If you have the original evidence, pick it here. Your browser computes its SHA-256 and compares it with the receipt’s hash. The file never leaves your computer: it is not uploaded to Nirium or anywhere else.'}
                                    </p>
                                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl cursor-pointer transition-all">
                                        {evidenceBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCode2 className="w-3.5 h-3.5" />}
                                        {language === 'es' ? 'Elegir archivo' : 'Choose file'}
                                        <input
                                            type="file"
                                            className="hidden"
                                            data-testid="evidence-file"
                                            onChange={(e) => { const f = e.target.files?.[0]; if (f) void compareEvidenceFile(f); e.target.value = ''; }}
                                        />
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={pastedHash}
                                            onChange={(e) => setPastedHash(e.target.value)}
                                            placeholder={language === 'es' ? 'o pega un SHA-256 (64 caracteres hex)' : 'or paste a SHA-256 (64 hex characters)'}
                                            className="flex-1 bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-white font-mono text-xs focus:outline-none focus:border-emerald-500/40 placeholder:text-gray-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={comparePastedHash}
                                            disabled={!pastedHash.trim()}
                                            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl disabled:opacity-40"
                                        >
                                            {language === 'es' ? 'Comparar' : 'Compare'}
                                        </button>
                                    </div>
                                    {evidence && (
                                        <div
                                            data-testid="evidence-result"
                                            className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-bold ${
                                                evidence.match ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
                                            }`}
                                        >
                                            {evidence.match ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                                            <span className="min-w-0">
                                                {evidence.match
                                                    ? (language === 'es'
                                                        ? `Coincide: ${evidence.name || 'el hash que pegaste'} es exactamente la evidencia que se ancló.`
                                                        : `Match: ${evidence.name || 'the hash you pasted'} is exactly the evidence that was anchored.`)
                                                    : !/^[0-9a-f]{64}$/.test(evidence.sha256)
                                                        ? (language === 'es' ? 'Eso no es un SHA-256 de 64 caracteres hex.' : 'That is not a 64-character hex SHA-256.')
                                                        : (language === 'es'
                                                            ? `No coincide: ${evidence.name || 'ese hash'} no es la evidencia que se ancló (o cambió después).`
                                                            : `No match: ${evidence.name || 'that hash'} is not the evidence that was anchored (or it changed afterwards).`)}
                                                {/^[0-9a-f]{64}$/.test(evidence.sha256) && (
                                                    <span className="block mt-1 font-mono font-normal text-[10px] opacity-70 break-all">sha256: {evidence.sha256}</span>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

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
                                        {network ?? (language === 'es' ? 'no declarada' : 'not declared')}
                                    </span>
                                </FieldRow>
                                {doc.anchoredAt && (
                                    <FieldRow icon={Clock} label={tv.result.field_anchored_at}>
                                        <span className="text-sm text-white font-mono" title={doc.anchoredAt}>
                                            {formatAnchoredAtUtc(doc.anchoredAt, language)}
                                        </span>
                                        {/* 12-nov-2026: anchoredAt es el reloj del servidor de Nirium (auditRoutes: new Date()),
                                            no una hora del ledger. En el ejemplo, record.at (reloj del cliente) queda 0.3 s
                                            después: sin esta nota parece que el registro se creó después de anclarse. */}
                                        <span className="block text-[10px] text-white/40 mt-0.5">
                                            {language === 'es'
                                                ? 'Reloj del servidor de Nirium al anclar, no una hora del ledger de Stellar.'
                                                : "Nirium's server clock when anchoring, not a Stellar ledger time."}
                                        </span>
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
                                    <>
                                        <FieldRow icon={ExternalLink} label={tv.result.field_tx}>
                                            <a
                                                href={explorerTxUrl(doc.txHash, doc.network)}
                                                target="_blank" rel="noopener noreferrer"
                                                className="text-sm text-emerald-400 hover:text-emerald-300 font-mono truncate inline-flex items-center gap-1.5"
                                            >
                                                {doc.txHash.slice(0, 16)}…<ExternalLink className="w-3 h-3" />
                                            </a>
                                        </FieldRow>
                                        <p className="text-[11px] text-gray-600 -mt-2 pb-2">{tv.result.tx_note}</p>
                                    </>
                                )}

                                <div className="pt-2">
                                    <a
                                        href={rawGatewayUrl(cid)}
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
                                            {signerAccount === 'missing' ? (
                                                <span className="text-sm text-white font-mono truncate">{doc.agent.key}</span>
                                            ) : (
                                                <a
                                                    href={explorerAccountUrl(doc.agent.key, doc.network)}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="text-sm text-emerald-400 hover:text-emerald-300 font-mono truncate inline-flex items-center gap-1.5"
                                                >
                                                    {doc.agent.key}<ExternalLink className="w-3 h-3 shrink-0" />
                                                </a>
                                            )}
                                        </div>
                                        {signerAccount === 'missing' && (
                                            <p className="text-xs text-gray-500 leading-relaxed">{tv.result.signer_no_account}</p>
                                        )}
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

                {/* What a receipt proves vs. what Stellar already proves */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="bg-[#121212] border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 mb-8"
                >
                    <h2 className="text-sm font-black text-white uppercase tracking-widest mb-5">
                        {tv.proves_title}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">
                                {tv.ledger_title}
                            </h3>
                            <ul className="space-y-2">
                                {tv.ledger_items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-emerald-400/80 uppercase tracking-[0.2em] mb-3">
                                {tv.receipt_title}
                            </h3>
                            <ul className="space-y-2">
                                {tv.receipt_items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/70 shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed mt-6 pt-5 border-t border-white/5">
                        {tv.proves_footer}
                    </p>
                    <a
                        href="https://github.com/nirium-protocol/nirium/blob/main/docs/DESIGN-FAQ.md"
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors mt-3"
                    >
                        {tv.design_notes_link}<ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </motion.div>

                {/* Planned - not built yet, kept visually apart from what already works */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.07 }}
                    className="border border-dashed border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 mb-8"
                >
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                        <Clock className="w-3 h-3" />
                        {tv.planned_label}
                    </div>
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                        {tv.planned_title}
                    </h2>
                    <ul className="space-y-2 mb-5">
                        {tv.planned_items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                                <span className="w-1 h-1 rounded-full bg-gray-600 shrink-0 mt-1.5" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-[11px] text-gray-600 leading-relaxed pt-4 border-t border-dashed border-white/10">
                        {tv.planned_footer}
                    </p>
                </motion.div>
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
