"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { track } from "@vercel/analytics";
import { captureRef, getRef, niriumtoberHit, niriumtoberViewOnce, trackFunnel } from "@/lib/attribution";
import {
    ArrowRight, CalendarClock, Check, ChevronDown, Copy, FileCheck2, GitPullRequest,
    Mail, ShieldCheck, Sparkles, Github, Trophy, Crown, Ban, Send, Repeat, Users,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import MinimalNav from "@/components/layout/MinimalNav";
import { NIRIUMTOBER_START, NIRIUMTOBER_END } from "@/lib/niriumtober";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.55, delay },
});

const REPO = "https://github.com/nirium-protocol/nirium";
const CONTACT = "niriumprotocol@gmail.com";
const TESTNET_BOX = "https://nirium-agent.fly.dev";
const MAINNET_BOX = "https://nirium-agent-mainnet.fly.dev";
const AGENDA_URL = "https://calendly.com/vaiogioss/nirium-mentoring";
const KEYS_URL = "https://nirium.xyz/keys";
const SKILL_URL = "https://github.com/nirium-protocol/nirium/blob/main/skills/nirium-agentic-payments/SKILL.md";
// Probado el 21-oct-2026 con un HOME temporal: deja el archivo idéntico al del repo,
// en la ruta de skills personales que documenta Claude Code.
const SKILL_INSTALL = "mkdir -p ~/.claude/skills/nirium-agentic-payments && curl -fsSL https://raw.githubusercontent.com/nirium-protocol/nirium/main/skills/nirium-agentic-payments/SKILL.md -o ~/.claude/skills/nirium-agentic-payments/SKILL.md";
const PAGE_URL = "nirium.xyz/build/niriumtober";
const EVIDENCE_ISSUE_URL = `${REPO}/issues/new?template=niriumtober-evidence.yml&title=${encodeURIComponent("Niriumtober evidence: ")}`;
const SPRINT_START = NIRIUMTOBER_START;
const SPRINT_END = NIRIUMTOBER_END;
// ?ref= de los links que compartimos (x, baf, stellarmx, pollar, tw). Se pasa
// al campo `heard` de la plantilla de evidencia; cualquier otro valor se ignora.
const REF_RX = /^[a-z0-9_-]{1,32}$/i;

// `@16`, no la última: con la 17 arriba, @stellar/mpp (que pide ^15) toma la 17
// y MPP Charge truena con "toEnvelope(...).v1 is not a function". Probado el
// 21-oct-2026: con @16 corren todos los snippets de esta página.
const INSTALL = "npm i nirium @stellar/stellar-sdk@16";

// Probado de punta a punta en testnet el 21-oct-2026 desde una instalación
// limpia (`npm i nirium @stellar/stellar-sdk`, nirium 0.16.1): llave nueva sin
// fondos, CID QmVymjvTHKb2j7KARhVKJQK4FxKFHZqbUcANv5myYHaQza.
const AUDIT_TESTNET = `import { Agent } from 'nirium';
import { Keypair } from '@stellar/stellar-sdk';
import { createHash } from 'node:crypto';

const kp = Keypair.random(); // a new testnet key, no funds needed. Save kp.secret() to reuse it
const sha = createHash('sha256').update('my first Niriumtober receipt').digest('hex');
const signature = Buffer.from(kp.sign(Buffer.from(\`nirium-audit-v1:\${sha}\`))).toString('base64');

const agent = new Agent({ baseUrl: '${TESTNET_BOX}' });
const { cid } = await agent.anchorAuditRecord({ hash: sha, tag: 'niriumtober', agent: { key: kp.publicKey(), signature } });
console.log('CID:', cid);
console.log('Your public key:', kp.publicKey());`;

// Probado en testnet el 21-oct-2026 (tx 9c2cfbb5...), misma instalación limpia.
const X402_PAY_TESTNET = `import { Agent } from 'nirium';

const agent = new Agent({ baseUrl: '${TESTNET_BOX}' });
agent.initX402({ secretKey: process.env.STELLAR_SECRET, network: 'stellar:testnet' }); // a testnet key holding testnet USDC
const res = await agent.x402Fetch('${TESTNET_BOX}/api/v1/premium/market'); // 0.05 testnet USDC
console.log(res.status, JSON.parse(atob(res.headers.get('payment-response'))).transaction); // tx hash`;

// Los snippets de abajo se generaron leyendo los archivos que se corrieron en
// testnet el 21-oct-2026 (instalación limpia, nirium 0.16.1 + stellar-sdk@16).
// Copiar a mano estos textos es como se cuelan los errores: regenerar, no editar.
const X402_SERVE_TESTNET = "import express from 'express';\nimport { x402Serve } from 'nirium';\n\nconst app = express();\napp.use('/premium', x402Serve({\n  payTo: process.env.PAY_TO,                      // your testnet address, where payments land\n  routes: { 'GET /signals': '$0.01' },\n  network: 'stellar:testnet',\n  facilitatorApiKey: process.env.FACILITATOR_KEY, // free: channels.openzeppelin.com/testnet/gen\n}));\napp.get('/premium/signals', (req, res) => res.json({ hello: 'paid world' }));\napp.listen(3000);";
const X402_SERVE_INSTALL = "npm i express @x402/express @x402/core @x402/stellar";
// Leídos de los archivos que se corrieron en testnet el 22-oct-2026 con la misma
// instalación limpia: NiriumVault (create_vault 8de99e3e..., deposit 8cee8b54...)
// y Treasury con API key de otra wallet (deploy 85bfba5b..., deposit ade89e6c...,
// propuesta firmada por el RebalanceManager e8032fa3...).
const VAULT_TESTNET = "import { Keypair, Horizon, rpc, Contract, TransactionBuilder, Operation, Asset, Networks, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';\n\nconst kp = Keypair.random(); // a new testnet key. Save kp.secret() to reuse it\nconst NET = Networks.TESTNET;\nconst horizon = new Horizon.Server('https://horizon-testnet.stellar.org');\nconst server = new rpc.Server('https://soroban-testnet.stellar.org');\nconst vaults = new Contract('CARTJIASVFHS4JJ24GVRO3XFQD37JCJEAXVPS7SPIWB3HLBXAYQ5SICV'); // NiriumVault\nconst CETES = new Asset('CETES', 'GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4');\nconst addr = (a) => nativeToScVal(a, { type: 'address' });\n\nawait fetch(`https://friendbot.stellar.org?addr=${kp.publicKey()}`);\n// Testnet CETES from the DEX: trustline plus a 20 XLM swap, in one transaction\nconst swap = new TransactionBuilder(await horizon.loadAccount(kp.publicKey()), { fee: '1000', networkPassphrase: NET })\n    .addOperation(Operation.changeTrust({ asset: CETES }))\n    .addOperation(Operation.pathPaymentStrictSend({ sendAsset: Asset.native(), sendAmount: '20', destination: kp.publicKey(), destAsset: CETES, destMin: '1' }))\n    .setTimeout(60).build();\nswap.sign(kp);\nawait horizon.submitTransaction(swap);\n\nasync function invoke(fn, ...args) {\n    let tx = new TransactionBuilder(await server.getAccount(kp.publicKey()), { fee: '1000000', networkPassphrase: NET })\n        .addOperation(vaults.call(fn, ...args)).setTimeout(60).build();\n    tx = await server.prepareTransaction(tx);\n    tx.sign(kp); // you sign every step\n    const { hash } = await server.sendTransaction(tx);\n    const done = await server.pollTransaction(hash);\n    if (done.status !== 'SUCCESS') throw new Error(`${fn} failed: ${hash}`);\n    console.log(fn, hash);\n    return done.returnValue && scValToNative(done.returnValue);\n}\n\n// Creating the vault costs 12.5 testnet XLM, paid from your Friendbot XLM\nconst { vault_id } = await invoke('create_vault', addr(kp.publicKey()), addr(CETES.contractId(NET)),\n    nativeToScVal('my niriumtober vault', { type: 'string' }), addr(Asset.native().contractId(NET)));\nawait invoke('deposit', nativeToScVal(vault_id, { type: 'u64' }), nativeToScVal(10_000_000n, { type: 'i128' })); // 1 CETES\n\n// Read your vault back (a simulation: no fee, nothing to sign)\nconst read = await server.simulateTransaction(new TransactionBuilder(await server.getAccount(kp.publicKey()), { fee: '100', networkPassphrase: NET })\n    .addOperation(vaults.call('get_vault', nativeToScVal(vault_id, { type: 'u64' }))).setTimeout(30).build());\nconst vault = scValToNative(read.result.retval);\nconsole.log('Vault', String(vault.vault_id), 'balance:', Number(vault.balance) / 1e7, 'CETES');\nconsole.log('Your public key:', kp.publicKey());";
const TREASURY_TESTNET = "import { Agent } from 'nirium';\nimport { Keypair, Horizon, TransactionBuilder, Operation, Asset, Networks } from '@stellar/stellar-sdk';\n\n// Two keys, both yours: the API rejects the same key as Manager and RebalanceManager.\nconst manager = Keypair.random(), rebalancer = Keypair.random(); // save both .secret() to reuse them\nconst NET = Networks.TESTNET;\nconst horizon = new Horizon.Server('https://horizon-testnet.stellar.org');\nconst CETES = new Asset('CETES', 'GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4');\nconst agent = new Agent({ apiKey: process.env.NIRIUM_API_KEY, baseUrl: 'https://nirium-agent.fly.dev' }); // key from nirium.xyz/keys\n\nawait Promise.all([manager, rebalancer].map((k) => fetch(`https://friendbot.stellar.org?addr=${k.publicKey()}`)));\n// Testnet CETES from the DEX for the Manager: trustline plus a 20 XLM swap\nconst swap = new TransactionBuilder(await horizon.loadAccount(manager.publicKey()), { fee: '1000', networkPassphrase: NET })\n    .addOperation(Operation.changeTrust({ asset: CETES }))\n    .addOperation(Operation.pathPaymentStrictSend({ sendAsset: Asset.native(), sendAmount: '20', destination: manager.publicKey(), destAsset: CETES, destMin: '1' }))\n    .setTimeout(60).build();\nswap.sign(manager);\nawait horizon.submitTransaction(swap);\n\nconst signAndSubmit = (xdr, kp) => { const tx = TransactionBuilder.fromXDR(xdr, NET); tx.sign(kp); return agent.submitTreasuryTx(tx.toXDR()); };\n\nconst deploy = await agent.deployTreasuryVault({\n    caller: manager.publicKey(), manager: manager.publicKey(), rebalanceManager: rebalancer.publicKey(),\n    name: 'My Niriumtober vault', symbol: 'MNV',\n    assets: [{ address: CETES.contractId(NET), strategies: [{ address: 'CCP4RBDWPRNO2LWO23XFU4BBLGA73J5N3BK7EHRJUHVN33YEMMFB2MBE', name: 'blend-autocompound' }] }],\n});\nconst { contract: vault, hash } = await signAndSubmit(deploy.xdr, manager);\nconsole.log('deploy', hash, 'vault', vault);\nconst deposit = await agent.depositToTreasuryVault({ vault, from: manager.publicKey(), amounts: ['10000000'] }); // 1 CETES\nconsole.log('deposit', (await signAndSubmit(deposit.xdr, manager)).hash);\n\n// Ask for a proposal; your RebalanceManager key decides whether to sign it\nconst proposal = await agent.proposeTreasuryRebalance({ vault, caller: rebalancer.publicKey(), enterAt: 2.5, exitAt: 2.0 });\nconsole.log('proposal', JSON.stringify(proposal.instructions));\nif (proposal.xdr) console.log('rebalance', (await signAndSubmit(proposal.xdr, rebalancer)).hash);\nconsole.log('Manager:', manager.publicKey(), 'RebalanceManager:', rebalancer.publicKey());";
// "Prepara tu cuenta", leído del archivo que se corrió en testnet el 22-oct-2026
// (trustlines y swaps en 27a8056b...; la rama sin ruta a USDC, en 03269cfb...).
const SETUP_TESTNET = "import { Keypair, Horizon, TransactionBuilder, Operation, Asset, Networks } from '@stellar/stellar-sdk';\nimport { existsSync, readFileSync, writeFileSync } from 'node:fs';\n\nconst FILE = 'niriumtober-testnet.key';\nconst horizon = new Horizon.Server('https://horizon-testnet.stellar.org');\nconst USDC = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'); // Circle\nconst CETES = new Asset('CETES', 'GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4');\n\n// 1. A new testnet key, saved next to this script (run it again and it reuses the same key)\nif (!existsSync(FILE)) writeFileSync(FILE, Keypair.random().secret(), { mode: 0o600 });\nconst kp = Keypair.fromSecret(readFileSync(FILE, 'utf8').trim());\n\n// 2. Testnet XLM from Friendbot\nconst funded = await horizon.loadAccount(kp.publicKey()).then(() => true, () => false);\nif (!funded) await fetch(`https://friendbot.stellar.org?addr=${kp.publicKey()}`);\n\n// 3. Trustlines for USDC and CETES, and 4. swap 20 XLM into each on the testnet DEX\nconst tx = new TransactionBuilder(await horizon.loadAccount(kp.publicKey()), { fee: '1000', networkPassphrase: Networks.TESTNET })\n    .addOperation(Operation.changeTrust({ asset: USDC }))\n    .addOperation(Operation.changeTrust({ asset: CETES }));\nconst toAsset = (a) => (a.asset_type === 'native' ? Asset.native() : new Asset(a.asset_code, a.asset_issuer));\nfor (const asset of [USDC, CETES]) {\n    const [route] = (await horizon.strictSendPaths(Asset.native(), '20', [asset]).call()).records;\n    if (!route) {\n        console.log(asset === USDC ? 'No DEX route to USDC: now ask for USDC at https://faucet.circle.com' : 'No DEX route to CETES right now, try again later');\n        continue;\n    }\n    tx.addOperation(Operation.pathPaymentStrictSend({\n        sendAsset: Asset.native(), sendAmount: '20', destination: kp.publicKey(), destAsset: asset,\n        destMin: (Number(route.destination_amount) * 0.9).toFixed(7), path: route.path.map(toAsset),\n    }));\n}\nconst built = tx.setTimeout(60).build();\nbuilt.sign(kp);\nconsole.log('Transaction:', (await horizon.submitTransaction(built)).hash);\n\n// 5. What you have now\nconsole.log('Public key:', kp.publicKey());\nfor (const b of (await horizon.loadAccount(kp.publicKey())).balances) console.log(`  ${b.asset_code ?? 'XLM'}: ${b.balance}`);\nconsole.log(`Secret key saved in ./${FILE}. Keep it out of git and never share it.`);";
const FRIENDBOT_URL = "https://friendbot.stellar.org/?addr=";
const CIRCLE_FAUCET_URL = "https://faucet.circle.com";
const PUBKEY_RX = /^G[A-Z2-7]{55}$/;
const MPP_TESTNET = "import { Agent } from 'nirium';\n\nconst agent = new Agent({ baseUrl: 'https://nirium-agent.fly.dev' });\nagent.initMpp({ secretKey: process.env.STELLAR_SECRET, network: 'stellar:testnet', mode: 'pull' }); // needs testnet USDC\nconst res = await agent.mppFetch('https://nirium-agent.fly.dev/api/v1/mpp/signals'); // 0.02 testnet USDC\nconsole.log(res.status, res.headers.get('payment-receipt'));";
const PAYOUTS_TESTNET = "import { Agent } from 'nirium';\nimport { Keypair, TransactionBuilder, Networks } from '@stellar/stellar-sdk';\n\nconst kp = Keypair.fromSecret(process.env.STELLAR_SECRET); // pays: needs testnet USDC\nconst agent = new Agent({ apiKey: process.env.NIRIUM_API_KEY, baseUrl: 'https://nirium-agent.fly.dev' }); // free key: nirium.xyz/keys\nconst run = await agent.createPayoutRun({ treasury: kp.publicKey(), acknowledgeTerms: true,\n  recipients: [{ wallet: process.env.TO_1, amount: '0.5' }, { wallet: process.env.TO_2, amount: '0.5' }] }); // each needs a USDC trustline\nconst tx = TransactionBuilder.fromXDR(run.xdr, Networks.TESTNET); tx.sign(kp); // you sign, Nirium never does\nconst done = await agent.submitPayout(run.runId, tx.toXDR());\nconsole.log(done.txHash, done.cid);";
const REPORTING_TESTNET = "import { Agent } from 'nirium';\n\nconst agent = new Agent({ baseUrl: 'https://nirium-agent.fly.dev' });\nconst summary = await agent.getReportingSummary({ network: 'testnet' }); // read-only, no key\nconsole.log('anchors:', summary.anchors.count, '| payments:', summary.payments.count, '| payouts:', summary.payroll.settledRuns);";

const AUDIT_MAINNET = `import { Agent } from 'nirium';
import { Keypair } from '@stellar/stellar-sdk';
import { createHash } from 'node:crypto';

const kp = Keypair.fromSecret(process.env.STELLAR_SECRET); // your own key
const sha = createHash('sha256').update('my evidence').digest('hex');
const signature = Buffer.from(kp.sign(Buffer.from(\`nirium-audit-v1:\${sha}\`))).toString('base64');
const agent = new Agent({ baseUrl: '${MAINNET_BOX}' });
const { cid } = await agent.anchorAuditRecord({ hash: sha, tag: 'niriumtober', agent: { key: kp.publicKey(), signature } });
console.log('CID:', cid);`;

const X402_MAINNET = `import { Agent } from 'nirium';

const agent = new Agent({ baseUrl: '${MAINNET_BOX}' });
agent.initX402({ secretKey: process.env.STELLAR_SECRET, network: 'stellar:pubnet' }); // your own key, with USDC
const res = await agent.x402Fetch('${MAINNET_BOX}/api/v1/premium/market'); // 0.05 USDC
console.log(res.status, JSON.parse(atob(res.headers.get('payment-response'))).transaction); // tx hash`;

type Status = "available" | "in_progress" | "under_review" | "done";

const STATUS_STYLE: Record<Status, string> = {
    available: "bg-emerald-400/10 border-emerald-400/30 text-emerald-300",
    in_progress: "bg-amber-400/10 border-amber-400/30 text-amber-300",
    under_review: "bg-sky-400/10 border-sky-400/30 text-sky-300",
    done: "bg-white/5 border-white/15 text-gray-400",
};

type NodeRow = {
    name: string;
    endpoint: string;
    testnet: boolean;
    mainnet: "points" | "no_points" | "testnet_only";
    note: [string, string];
};

// Estado verificado contra los boxes en vivo el 21-oct-2026.
const NODES: NodeRow[] = [
    {
        name: "x402 Market",
        endpoint: "GET /api/v1/premium/market",
        testnet: true,
        mainnet: "points",
        note: ["0.05 USDC per call, paid from your account", "0.05 USDC por llamada, pagado desde tu cuenta"],
    },
    {
        name: "Audit Trail",
        endpoint: "POST /api/audit/log",
        testnet: true,
        mainnet: "points",
        note: ["Free during beta. Counts when the anchor carries `agent` signed with your key", "Gratis durante la beta. Cuenta cuando el anclaje lleva `agent` firmado con tu llave"],
    },
    {
        name: "Reporting",
        endpoint: "GET /api/reporting/summary",
        testnet: true,
        mainnet: "no_points",
        note: ["Live on mainnet, but read-only: it returns Nirium's own totals and leaves no record tied to your key, so it adds no points alone", "Vivo en mainnet, pero de solo lectura: devuelve los totales de Nirium y no deja registro ligado a tu llave, así que solo no suma puntos"],
    },
    {
        name: "MPP Charge",
        endpoint: "GET /api/v1/mpp/signals",
        testnet: true,
        mainnet: "testnet_only",
        note: ["Verified on testnet. Never tested on mainnet", "Verificado en testnet. Nunca probado en mainnet"],
    },
    {
        name: "Payouts",
        endpoint: "POST /api/payroll/run",
        testnet: true,
        mainnet: "testnet_only",
        note: ["Testnet only for Niriumtober", "Solo testnet para Niriumtober"],
    },
    {
        name: "Treasury Rebalance",
        endpoint: "POST /api/treasury/rebalance/propose",
        testnet: true,
        mainnet: "testnet_only",
        note: ["Testnet only for Niriumtober", "Solo testnet para Niriumtober"],
    },
];


type Issue = {
    // Número del issue en nirium-protocol/nirium (creados el 21-oct-2026). Sin
    // número no se muestra: la sección no enseña borradores en producción.
    number?: number;
    title: string;
    area: string;
    paths: string[];
    status: Status;
    desc: [string, string];
    done: [string, string];
};

// Issues para entrar en una tarde. Se revisan a mano: sin hash ni CID.
// Un archivo por PR para que dos PRs nunca choquen en el mismo archivo.
const FUN_ISSUES: Issue[] = [
    {
        number: 168,
        title: "Write a short agent horror story",
        area: "Community · writing",
        paths: ["community/horror-stories/"],
        status: "available",
        desc: [
            "Halloween edition: a short, original horror story about an AI agent, a payment or a Stellar transaction that goes wrong. The key that signed at midnight, the receipt that was never anchored, the facilitator that answered 402 forever. Add `community/horror-stories/<your-github-handle>.md`. English or Spanish.",
            "Edición Halloween: un cuento de terror corto y original sobre un agente de IA, un pago o una transacción de Stellar que sale mal. La llave que firmó a medianoche, el recibo que nunca se ancló, el facilitador que respondía 402 para siempre. Agrega `community/horror-stories/<tu-usuario-de-github>.md`. En inglés o en español.",
        ],
        done: [
            "One file, 100 to 300 words, your name or handle at the end. Fictional characters only, never a real person or project.",
            "Un archivo, de 100 a 300 palabras, tu nombre o usuario al final. Solo personajes ficticios, nunca una persona o proyecto real.",
        ],
    },
    {
        number: 169,
        title: "ASCII art: a jack-o'-lantern, the Nirium logo or a Halloween theme",
        area: "Community · ASCII",
        paths: ["community/ascii/"],
        status: "available",
        desc: [
            "Add `community/ascii/<your-github-handle>-<name>.txt` with one piece: a jack-o'-lantern, the Nirium mark, a ghost, a bat, a haunted node. Plain ASCII characters only.",
            "Agrega `community/ascii/<tu-usuario-de-github>-<nombre>.txt` con una pieza: una calabaza de Halloween, el logo de Nirium, un fantasma, un murciélago, un nodo embrujado. Solo caracteres ASCII simples.",
        ],
        done: [
            "One file, at most 80 columns and 40 lines, and the PR pastes what `cat` prints in a terminal.",
            "Un archivo, máximo 80 columnas y 40 líneas, y el PR pega lo que imprime `cat` en una terminal.",
        ],
    },
    {
        number: 170,
        title: "Translate examples/go-x402/README.md to Spanish",
        area: "Docs · español",
        paths: ["examples/go-x402/README.md"],
        status: "available",
        desc: [
            "It is the shortest README under `examples/`. Add `examples/go-x402/README.es.md` and a one-line link to it at the top of the English README.",
            "Es el README más corto de `examples/`. Agrega `examples/go-x402/README.es.md` y un link de una línea al inicio del README en inglés.",
        ],
        done: [
            "Commands, code blocks and header names like `PAYMENT-SIGNATURE` are unchanged, and nothing is added that the English text does not say.",
            "Comandos, bloques de código y nombres de headers como `PAYMENT-SIGNATURE` quedan sin cambios, y no se agrega nada que el texto en inglés no diga.",
        ],
    },
];

const ISSUES: Issue[] = [
    {
        number: 171,
        title: "Example: anchor and verify an Audit Trail receipt from Python",
        area: "Python · Audit Trail",
        paths: ["examples/", "packages/sdk-python/src/nirium/client.py"],
        status: "available",
        desc: [
            "`anchor_audit_record()` exists in the Python package, but `examples/` has no Python example for Audit Trail. Add `examples/python-audit-anchor`: hash a file, anchor it on testnet, fetch the CID back and check the hash.",
            "`anchor_audit_record()` existe en el paquete de Python, pero `examples/` no tiene un ejemplo de Audit Trail en Python. Agrega `examples/python-audit-anchor`: hashea un archivo, ánclalo en testnet, recupera el CID y revisa el hash.",
        ],
        done: [
            "README with exact commands, and the PR shows a real testnet CID produced by running it.",
            "README con los comandos exactos, y el PR muestra un CID real de testnet que salió de correrlo.",
        ],
    },
    {
        number: 172,
        title: "Tests for anchor_audit_record() in the Python package",
        area: "Python · tests",
        paths: ["packages/sdk-python/tests/"],
        status: "available",
        desc: [
            "`packages/sdk-python/tests/` only covers the LangChain tool and the WebSocket client. Add tests for `anchor_audit_record()`: payload shape, `hash` vs `record`, and the error when neither is given. Mock HTTP, no network.",
            "`packages/sdk-python/tests/` solo cubre la herramienta de LangChain y el cliente WebSocket. Agrega tests para `anchor_audit_record()`: forma del payload, `hash` vs `record` y el error cuando no viene ninguno. HTTP simulado, sin red.",
        ],
        done: [
            "`pytest` passes locally and the PR pastes the output.",
            "`pytest` pasa en local y el PR pega la salida.",
        ],
    },
    {
        number: 173,
        title: "Docs: verify an Audit Trail CID by hand",
        area: "Docs · Audit Trail",
        paths: ["docs/", "actions/verify-audit-cid/src/verify.ts"],
        status: "available",
        desc: [
            "The verification model is only written up in the GitHub Action's README. Add `docs/verify-audit-cid.md`: fetch the document, recompute sha-256 over `record`, rebuild `nirium-audit-v1:<sha256>` and check the ed25519 signature against `agent.key`.",
            "El modelo de verificación solo está escrito en el README de la GitHub Action. Agrega `docs/verify-audit-cid.md`: baja el documento, recalcula el sha-256 de `record`, reconstruye `nirium-audit-v1:<sha256>` y verifica la firma ed25519 contra `agent.key`.",
        ],
        done: [
            "Every step is a copy-paste command, and it is checked against a real testnet CID cited in the doc.",
            "Cada paso es un comando que se copia y pega, comprobado contra un CID real de testnet citado en el documento.",
        ],
    },
    {
        number: 174,
        title: "Docs (ES): Spanish version of the x402 quickstart",
        area: "Docs · español",
        paths: ["docs/quickstart-x402.md"],
        status: "available",
        desc: [
            "There is no Spanish file in the repo. Translate `docs/quickstart-x402.md` to `docs/es/quickstart-x402.md` and link both ways.",
            "No hay ningún archivo en español en el repo. Traduce `docs/quickstart-x402.md` a `docs/es/quickstart-x402.md` y enlaza en los dos sentidos.",
        ],
        done: [
            "Commands and code blocks are unchanged, and you ran the quickstart on testnet while translating it (hash in the PR).",
            "Comandos y bloques de código sin cambios, y corriste el quickstart en testnet mientras lo traducías (hash en el PR).",
        ],
    },
    {
        number: 175,
        title: "Docs (ES): Spanish README for the Python package",
        area: "Docs · español",
        paths: ["packages/sdk-python/README.md"],
        status: "available",
        desc: [
            "Add `packages/sdk-python/README.es.md` with a link at the top of the English README. Keep the known limits it states (for example, MPP Charge in Python) exactly as written.",
            "Agrega `packages/sdk-python/README.es.md` con un link al inicio del README en inglés. Conserva tal cual los límites que declara (por ejemplo, MPP Charge en Python).",
        ],
        done: [
            "Same sections as the English README, nothing added that the English one does not say.",
            "Mismas secciones que el README en inglés, sin agregar nada que el inglés no diga.",
        ],
    },
    {
        number: 176,
        title: "Example: x402Serve() on plain Express, testnet",
        area: "TypeScript · x402",
        paths: ["examples/express-x402/src/server.ts", "examples/deploy-x402-vercel/lib/x402-handler.ts"],
        status: "available",
        desc: [
            "`examples/express-x402` wires `@x402/express` by hand; only the Vercel example uses `x402Serve()`. Add a minimal Express server that charges for one route with `x402Serve()` on `stellar:testnet`.",
            "`examples/express-x402` arma `@x402/express` a mano; solo el ejemplo de Vercel usa `x402Serve()`. Agrega un servidor Express mínimo que cobre una ruta con `x402Serve()` en `stellar:testnet`.",
        ],
        done: [
            "A paid request settles on testnet and the PR includes the settlement tx hash.",
            "Una petición pagada liquida en testnet y el PR incluye el hash de la tx de liquidación.",
        ],
    },
    {
        number: 177,
        title: "Python: make mpp_fetch() pay an MPP Charge server on testnet",
        area: "Python · MPP",
        paths: ["packages/sdk-python/src/nirium/client.py", "packages/sdk-python/README.md"],
        status: "available",
        desc: [
            "The Python README says `init_mpp()`/`mpp_fetch()` cannot pay an MPP Charge server today. Fix it for testnet only, matching what the TypeScript client already does.",
            "El README de Python dice que `init_mpp()`/`mpp_fetch()` hoy no pueden pagar un servidor MPP Charge. Arréglalo solo para testnet, igual que ya lo hace el cliente de TypeScript.",
        ],
        done: [
            "A real payment to the hosted testnet `/api/v1/mpp/signals` with its tx hash, plus a test. The README note is updated in the same PR.",
            "Un pago real al `/api/v1/mpp/signals` de testnet con su hash, más un test. La nota del README se actualiza en el mismo PR.",
        ],
    },
    {
        number: 178,
        title: "Example: a Payouts run on testnet",
        area: "Payouts",
        paths: ["examples/", "packages/sdk-python/src/nirium/client.py"],
        status: "available",
        desc: [
            "No example covers Payouts. Add one that builds a two-recipient run on testnet with `acknowledgeTerms`, signs it with a throwaway testnet key and submits it.",
            "Ningún ejemplo cubre Payouts. Agrega uno que arme una corrida de dos destinatarios en testnet con `acknowledgeTerms`, la firme con una llave desechable de testnet y la envíe.",
        ],
        done: [
            "Testnet tx hash in the PR. The example never asks for a mainnet key.",
            "Hash de la tx de testnet en el PR. El ejemplo nunca pide una llave de mainnet.",
        ],
    },
    {
        number: 179,
        title: "Example: Reporting summary and CSV export",
        area: "Reporting",
        paths: ["examples/", "packages/sdk-python/src/nirium/client.py"],
        status: "available",
        desc: [
            "`get_reporting_summary()` and `get_reporting_export()` have no example. Add a short script that prints the testnet summary and saves the export to a file.",
            "`get_reporting_summary()` y `get_reporting_export()` no tienen ejemplo. Agrega un script corto que imprima el resumen de testnet y guarde la exportación en un archivo.",
        ],
        done: [
            "Runs against testnet; the PR pastes the command and the first lines of output.",
            "Corre contra testnet; el PR pega el comando y las primeras líneas de la salida.",
        ],
    },
    {
        number: 180,
        title: "examples/README.md: an index of the examples",
        area: "Docs",
        paths: ["examples/"],
        status: "available",
        desc: [
            "`examples/` has twelve folders and no index. Add `examples/README.md` with one line per example: what it shows, language, and network.",
            "`examples/` tiene doce carpetas y ningún índice. Agrega `examples/README.md` con una línea por ejemplo: qué muestra, lenguaje y red.",
        ],
        done: [
            "Every folder is listed and every link resolves.",
            "Todas las carpetas aparecen y todos los links funcionan.",
        ],
    },
    // Creados el 22-oct-2026.
    {
        number: 181,
        title: "Research: aggregate spending caps for the pre-sign policy hook",
        area: "Research · x402 policy",
        paths: ["docs/research/"],
        status: "available",
        desc: [
            "The pre-sign policy hook decides one payment at a time. Write a design note on spending caps per time window, per destination and per asset, built on top of it. Related: #127.",
            "El hook de política previo a la firma decide un pago a la vez. Escribe una nota de diseño sobre topes de gasto por ventana de tiempo, por destino y por activo, encima del hook. Relacionado: #127.",
        ],
        done: [
            "`docs/research/aggregate-spending-caps.md` with at least 3 designs compared, a policy in pseudocode and the edge cases: retries, concurrent payments, a restart mid-window.",
            "`docs/research/aggregate-spending-caps.md` con al menos 3 diseños comparados, una política en pseudocódigo y los casos borde: reintentos, pagos simultáneos, un reinicio a mitad de la ventana.",
        ],
    },
    {
        number: 182,
        title: "Research: a multi-asset DeFindex vault on testnet (USDC, XLM, CETES)",
        area: "Research · Treasury",
        paths: ["docs/research/"],
        status: "available",
        desc: [
            "Can one DeFindex vault on testnet hold USDC, XLM and CETES at once? Find out, with sources.",
            "¿Una bóveda de DeFindex en testnet puede tener USDC, XLM y CETES a la vez? Averígualo, con fuentes.",
        ],
        done: [
            "`docs/research/defindex-multi-asset-testnet.md` with a table of testnet contract ids, each with a stellar.expert link or a read-only call, and a clear yes or no with what is missing.",
            "`docs/research/defindex-multi-asset-testnet.md` con una tabla de contract ids de testnet, cada uno con link a stellar.expert o una llamada de lectura, y un sí o no claro con lo que falta.",
        ],
    },
    {
        number: 183,
        title: "Research: Audit Trail receipts vs W3C Verifiable Credentials and C2PA",
        area: "Research · Audit Trail",
        paths: ["docs/research/"],
        status: "available",
        desc: [
            "Compare an Audit Trail receipt (a signed hash on IPFS) with W3C Verifiable Credentials and C2PA.",
            "Compara un recibo de Audit Trail (un hash firmado en IPFS) con W3C Verifiable Credentials y C2PA.",
        ],
        done: [
            "`docs/research/audit-receipts-vs-vc-c2pa.md` with a comparison table, one real testnet CID mapped field by field to a credential, and the gaps on each side.",
            "`docs/research/audit-receipts-vs-vc-c2pa.md` con una tabla comparativa, un CID real de testnet mapeado campo por campo a una credencial, y las brechas de cada lado.",
        ],
    },
    {
        number: 184,
        title: "Python: port the pre-sign policy hook (ALLOW, DENY, WAIT)",
        area: "Python · x402",
        paths: ["packages/sdk-python/src/nirium/", "packages/sdk-python/tests/"],
        status: "available",
        desc: [
            "Port the TypeScript pre-sign policy hook to the Python package: ALLOW, DENY or WAIT, with `contextHash` and `expiresAt`. Anything but a valid ALLOW signs nothing.",
            "Porta al paquete de Python el hook de política previo a la firma de TypeScript: ALLOW, DENY o WAIT, con `contextHash` y `expiresAt`. Todo lo que no sea un ALLOW válido no firma nada.",
        ],
        done: [
            "`pytest` passes for each verdict, a wrong `contextHash` and an expired `expiresAt`, plus a testnet tx hash of a payment allowed by the policy.",
            "`pytest` pasa para cada veredicto, un `contextHash` incorrecto y un `expiresAt` vencido, más el hash de testnet de un pago que la política permitió.",
        ],
    },
    {
        number: 185,
        title: "verify-audit-cid: try more than one IPFS gateway",
        area: "GitHub Action · Audit Trail",
        paths: ["actions/verify-audit-cid/"],
        status: "available",
        desc: [
            "The Action fetches from one IPFS gateway, and today its default answers 429. Try several gateways in order and report which one answered. Related: #135.",
            "La Action consulta un solo gateway de IPFS, y hoy el de por defecto responde 429. Prueba varios gateways en orden y reporta cuál respondió. Relacionado: #135.",
        ],
        done: [
            "Tests for a downed first gateway and for a real testnet CID pass, and `dist/index.js` is rebuilt.",
            "Pasan los tests de un primer gateway caído y de un CID real de testnet, y `dist/index.js` está reconstruido.",
        ],
    },
];

// Texto de reglas fijado por el equipo; el inglés va tal cual.
const RULES_EN = {
    lead: "AI is welcome, unreviewed AI is not. Use any tool you like, but your PR must show you understood and ran it:",
    items: [
        "Say what you used AI for in the PR description.",
        "Include how you tested it (command + output, or a testnet tx hash / Audit Trail CID).",
        "Keep the diff to what the issue asks. Unrelated rewrites are closed.",
        "PRs that look like unedited generic output are closed without review.",
    ],
};
const RULES_ES = {
    lead: "La IA es bienvenida; la IA sin revisar, no. Usa la herramienta que quieras, pero tu PR tiene que mostrar que lo entendiste y lo corriste:",
    items: [
        "Di para qué usaste IA en la descripción del PR.",
        "Incluye cómo lo probaste (comando + salida, o un hash de tx de testnet / CID de Audit Trail).",
        "Limita el diff a lo que pide el issue. Las reescrituras ajenas al issue se cierran.",
        "Los PRs que parecen salida genérica sin editar se cierran sin revisión.",
    ],
};

function Code({ children }: { children: string }) {
    // Renderiza `fragmentos` como código en línea.
    const parts = children.split(/(`[^`]+`)/g);
    return (
        <>
            {parts.map((p, i) =>
                p.startsWith("`") && p.endsWith("`") ? (
                    <code key={i} className="font-mono text-[0.85em] px-1 py-0.5 rounded bg-white/5 border border-white/10 text-orange-200 break-words">
                        {p.slice(1, -1)}
                    </code>
                ) : (
                    <span key={i}>{p}</span>
                )
            )}
        </>
    );
}

function CodeBlock({ code, label, copyLabel, copiedLabel }: { code: string; label: string; copyLabel: string; copiedLabel: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch { /* sin portapapeles: el código sigue visible para copiarlo a mano */ }
        track("niriumtober_copy", { snippet: label });
        niriumtoberHit("copy");
    };
    return (
        <div className="relative min-w-0">
            <button
                type="button"
                onClick={copy}
                className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-md border border-white/15 bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:border-orange-400/60 hover:text-white"
            >
                {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                {copied ? copiedLabel : copyLabel}
            </button>
            <pre className="text-[11px] sm:text-xs leading-relaxed font-mono text-gray-200 bg-black/70 border border-white/10 rounded-xl p-4 pt-10 sm:pt-4 sm:pr-20 whitespace-pre-wrap [overflow-wrap:anywhere] overflow-x-auto max-w-full [scrollbar-width:thin] [scrollbar-color:rgba(249,115,22,0.45)_transparent]"><code>{code}</code></pre>
        </div>
    );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
    return (
        <details className="group rounded-xl border border-white/10 bg-[#0A0A0A] open:border-white/20">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 sm:px-5 py-4 text-sm sm:text-base font-bold text-white">
                <span>{q}</span>
                <ChevronDown className="w-4 h-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 sm:px-5 pb-5 text-sm text-gray-300 leading-relaxed space-y-3">{children}</div>
        </details>
    );
}

// Barra de secciones: una sola página, sin pestañas. Marca la sección que está
// a media pantalla. En móvil la fila hace scroll dentro de la barra.
function SectionNav({ items }: { items: { id: string; label: string }[] }) {
    const [active, setActive] = useState<string | null>(null);
    useEffect(() => {
        const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
            { rootMargin: "-45% 0px -50% 0px" },
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [items]);
    return (
        <nav aria-label="Sections" className="sticky top-0 z-40 bg-black/85 backdrop-blur border-y border-white/10">
            <div className="container mx-auto px-4 max-w-5xl overflow-x-auto [scrollbar-width:none]">
                <ul className="flex gap-1 py-2 whitespace-nowrap w-max">
                    {items.map((i) => (
                        <li key={i.id}>
                            <a
                                href={`#${i.id}`}
                                aria-current={active === i.id ? "true" : undefined}
                                className={`inline-block px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-colors ${active === i.id ? "bg-orange-500/20 text-orange-200 border border-orange-400/50" : "text-gray-400 border border-transparent hover:text-white"}`}
                            >
                                {i.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}

// Botón fijo en móvil hacia el paso 1. Se oculta mientras los pasos 1 y 2 están
// en pantalla, y mientras el hero (que ya tiene el suyo) se ve.
function StickyStart({ label }: { label: string }) {
    const [hidden, setHidden] = useState(true);
    useEffect(() => {
        const watched = ["hero", "step-1", "step-2"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
        const visible = new Set<string>();
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
            setHidden(visible.size > 0);
        });
        watched.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);
    if (hidden) return null;
    return (
        <a
            href="#start"
            onClick={() => { track("niriumtober_start", { source: "sticky" }); niriumtoberHit("start"); }}
            className="sm:hidden fixed bottom-4 left-4 right-4 z-50 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-orange-500 text-black font-black text-sm shadow-[0_10px_30px_rgba(249,115,22,0.4)]"
        >
            {label} <ArrowRight className="w-4 h-4" />
        </a>
    );
}

export default function NiriumtoberPage() {
    const { language } = useLanguage();
    const lang = (en: string, es: string) => (language === "es" ? es : en);
    const pick = (pair: [string, string]) => (language === "es" ? pair[1] : pair[0]);
    const rules = language === "es" ? RULES_ES : RULES_EN;

    const [tab, setTab] = useState<"audit" | "pay" | "serve">("audit");
    const [pubkey, setPubkey] = useState("");
    const pubkeyOk = PUBKEY_RX.test(pubkey);
    const [ref, setRef] = useState<string | null>(null);
    // Solo el primer play cuenta: pausar y volver a darle play no es otra vista.
    const videoPlayed = useRef(false);
    const onVideoPlay = () => {
        if (videoPlayed.current) return;
        videoPlayed.current = true;
        track("niriumtober_video_play", { ref: getRef() ?? "none" });
        niriumtoberHit("video_play");
    };
    const [countdown, setCountdown] = useState<string | null>(null);

    // En el cliente, después de montar: así el HTML del servidor y el primer
    // render coinciden (la fecha y la URL no existen en el servidor).
    useEffect(() => {
        const r = new URLSearchParams(window.location.search).get("ref");
        if (r && REF_RX.test(r)) setRef(r.toLowerCase());
        captureRef();
        niriumtoberViewOnce();
    }, []);
    useEffect(() => {
        const now = Date.now();
        const day = 86_400_000;
        if (now < SPRINT_START) {
            const d = Math.ceil((SPRINT_START - now) / day);
            setCountdown(lang(`Starts in ${d} day${d === 1 ? "" : "s"}`, `Empieza en ${d} día${d === 1 ? "" : "s"}`));
        } else if (now < SPRINT_END) {
            const d = Math.ceil((SPRINT_END - now) / day);
            setCountdown(d <= 1 ? lang("Last day", "Último día") : lang(`${d} days left`, `Quedan ${d} días`));
        } else {
            setCountdown(lang("Niriumtober has ended", "Niriumtober terminó"));
        }
    }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

    const proofUrl = EVIDENCE_ISSUE_URL + (ref ? `&heard=${encodeURIComponent(ref)}` : "");
    const shareText = `I just anchored my first agent receipt on Stellar with @Niriumstellar 🎃 #Niriumtober ${PAGE_URL}?ref=x`;
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    const copyLabels = { copyLabel: lang("Copy", "Copiar"), copiedLabel: lang("Copied", "Copiado") };

    const statusLabel: Record<Status, string> = {
        available: lang("Available", "Disponible"),
        in_progress: lang("In progress", "En curso"),
        under_review: lang("Under review", "En revisión"),
        done: lang("Done", "Hecho"),
    };
    const mainnetLabel = {
        points: "Mainnet · +3",
        no_points: "Mainnet · 0",
        testnet_only: lang("Testnet only", "Solo testnet"),
    } as const;
    const mainnetStyle = {
        points: "bg-yellow-400/10 border-yellow-400/40 text-yellow-300",
        no_points: "bg-white/5 border-white/15 text-gray-400",
        testnet_only: "bg-white/5 border-white/10 text-gray-500",
    } as const;

    const badges = [
        { file: "badge-builder", name: "Builder", how: lang("Anchor a receipt on testnet from your project.", "Ancla un recibo en testnet desde tu proyecto."), alt: lang("Builder badge, teal medal with a hammer", "Badge Builder, medalla turquesa con un martillo") },
        { file: "badge-contributor", name: "Contributor", how: lang("Get a PR merged from the issue list.", "Logra que te acepten un PR de la lista de issues."), alt: lang("Contributor badge, copper medal with a wrench", "Badge Contributor, medalla de cobre con una llave inglesa") },
        { file: "badge-mainnet-builder", name: "Mainnet Builder", how: lang("Use Audit Trail or x402 Market on mainnet with your key. Needs a public repo.", "Usa Audit Trail o x402 Market en mainnet con tu llave. Pide un repo público."), alt: lang("Mainnet Builder badge, gold medal with a trophy", "Badge Mainnet Builder, medalla dorada con un trofeo") },
        { file: "badge-champion", name: "Champion", how: lang("The best project wins it. One only. Needs a public repo.", "Lo gana el mejor proyecto. Uno solo. Pide un repo público."), alt: lang("Champion badge, gold and purple medal with a crown", "Badge Champion, medalla dorada y morada con una corona") },
    ];

    const points: [string, string][] = [
        [lang("Accepted PR from the list (technical or fun)", "PR aceptado de la lista (técnico o fun)"), "1"],
        [lang("Any node on testnet, from your own project", "Cualquier nodo en testnet, desde tu propio proyecto"), "2"],
        [lang("Audit Trail or x402 Market on mainnet, with your key", "Audit Trail o x402 Market en mainnet, con tu llave"), lang("+3 per node", "+3 por nodo")],
        [lang("Mainnet use on 2 or more different days (UTC)", "Uso en mainnet en 2 días distintos o más (UTC)"), "+2"],
    ];

    const perks: string[] = [
        lang("Priority for issues in future GrantFox campaigns. Each campaign sets its own reward.", "Prioridad en issues de futuras campañas de GrantFox. Cada campaña define su recompensa."),
        lang("First invite to our next hackathons, events and workshops.", "Invitación primero a nuestros próximos hackathones, eventos y talleres."),
        lang("A spot in Built with Nirium, if your project uses Nirium.", "Un lugar en Built with Nirium, si tu proyecto usa Nirium."),
        lang("A shoutout from @Niriumstellar.", "Un shoutout desde @Niriumstellar."),
        lang("Early access to new nodes on testnet.", "Acceso anticipado a nodos nuevos en testnet."),
    ];

    const evidenceFields: [string, string][] = [
        [lang("Project", "Proyecto"), lang("name and one line on what it does", "nombre y una línea de qué hace")],
        [lang("Repo", "Repo"), lang("public URL where the integration lives. Optional for Builder, required for Mainnet Builder and Champion", "URL pública donde vive la integración. Opcional para Builder, obligatorio para Mainnet Builder y Champion")],
        [lang("Nodes used", "Nodos usados"), "Audit Trail, x402 Market, Payouts…"],
        [lang("Network", "Red"), "testnet / mainnet"],
        [lang("CID(s) or tx hash(es)", "CID(s) o hash(es) de tx"), lang("one per line", "uno por línea")],
        [lang("Public key", "Llave pública"), lang("the G... address that signed or paid", "la dirección G... que firmó o pagó")],
    ];

    const receiptFields: [string, string][] = [
        ["event", '"niriumtober-2026"'],
        ["badge", '"contributor" | "builder" | "mainnet-builder" | "champion"'],
        ["github", '"@handle"'],
        ["project", lang("repo URL", "URL del repo")],
        ["nodes", '["audit", "x402-market"]'],
        ["network", '"testnet" | "mainnet"'],
        ["evidence", lang("your CIDs, tx hashes or PR URL", "tus CIDs, hashes de tx o URL del PR")],
        ["participant_key", lang("your G... address", "tu dirección G...")],
        ["issued_at", "ISO-8601"],
    ];

    const tabs = [
        { id: "audit" as const, label: lang("Audit Trail · free", "Audit Trail · gratis"), code: AUDIT_TESTNET, note: lang("Save it as receipt.mjs and run node receipt.mjs. It prints your CID and your public key. No account and no funds needed.", "Guárdalo como receipt.mjs y corre node receipt.mjs. Imprime tu CID y tu llave pública. No necesitas cuenta ni fondos.") },
        { id: "pay" as const, label: lang("x402 · pay", "x402 · pagar"), code: X402_PAY_TESTNET, note: lang("Needs testnet USDC on your key. Run STELLAR_SECRET=S... node pay.mjs. It prints the tx hash.", "Necesita USDC de testnet en tu llave. Corre STELLAR_SECRET=S... node pay.mjs. Imprime el hash de la tx.") },
        { id: "serve" as const, label: lang("x402Serve · charge", "x402Serve · cobrar"), code: X402_SERVE_TESTNET, note: lang(`Charge for your own API. Also run ${X402_SERVE_INSTALL}. Needs a free facilitator key, and testnet USDC to test a payment.`, `Cobra por tu propia API. Corre también ${X402_SERVE_INSTALL}. Necesita una llave gratuita de facilitador, y USDC de testnet para probar un pago.`) },
    ];
    const current = tabs.find((t) => t.id === tab)!;

    // En el orden de la página (lo que convierte arriba, lo técnico abajo), para que la sección marcada no salte.
    const navItems = useMemo(() => [
        { id: "start", label: lang("Start", "Empieza") },
        { id: "video", label: "Video" },
        { id: "badges", label: "Badges" },
        { id: "tokens", label: "Tokens" },
        { id: "nodes", label: lang("Nodes", "Nodos") },
        { id: "packages", label: lang("Packages", "Paquetes") },
        { id: "issues", label: "Issues" },
        { id: "faq", label: "FAQ" },
    ], [language]); // eslint-disable-line react-hooks/exhaustive-deps
    const [allNodes, setAllNodes] = useState(false);

    // Sin versiones en el texto: se quedarían viejas. Las cifras vivas están en /stats.
    const packages: { name: string; registry: "npm" | "PyPI" | "Skill"; href: string; install: string; what: string; note?: React.ReactNode; id?: string; chip?: string; links?: { label: string; href: string }[] }[] = [
        { name: "nirium", registry: "npm", href: "https://www.npmjs.com/package/nirium", install: INSTALL, what: lang("Add payments, receipts and payouts to your app or agent in TypeScript.", "Agrega pagos, recibos y payouts a tu app o agente en TypeScript.") },
        { name: "nirium", registry: "PyPI", href: "https://pypi.org/project/nirium/", install: "pip install nirium", what: lang("The same, from Python.", "Lo mismo, desde Python.") },
        { name: "nirium-mcp", registry: "npm", href: "https://www.npmjs.com/package/nirium-mcp", install: "npx nirium-mcp", what: lang("Let Claude, Cursor or any MCP assistant use Nirium for you.", "Deja que Claude, Cursor o cualquier asistente con MCP use Nirium por ti."),
            note: <>{lang("Set the environment variables from its ", "Configura las variables de entorno de su ")}<a href="https://www.npmjs.com/package/nirium-mcp#environment-variables" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">README</a>{lang(". The free tools work without them.", ". Las herramientas gratuitas funcionan sin ellas.")}</> },
        { id: "skill", name: lang("Nirium skill for AI assistants", "Skill de Nirium para asistentes de IA"), registry: "Skill", href: SKILL_URL, install: SKILL_INSTALL, chip: "Builder",
            what: lang("Give it to Claude, Cursor or your AI assistant and it builds a paid x402 API for you, in one command.", "Dásela a Claude, Cursor o tu asistente de IA y te arma una API de pago x402 en un comando."),
            links: [{ label: lang("Listed on skills.stellar.org", "En el catálogo skills.stellar.org"), href: "https://skills.stellar.org" }, { label: lang("View the skill", "Ver la skill"), href: SKILL_URL }],
            note: lang("The command above installs it for Claude Code. With other assistants, paste the link to the skill.", "El comando de arriba la instala en Claude Code. Con otros asistentes, pega el link de la skill.") },
        { name: "nirium-cli", registry: "npm", href: "https://www.npmjs.com/package/nirium-cli", install: "npm i -g nirium-cli", what: lang("Start a project and check your agent from the terminal.", "Arranca un proyecto y revisa tu agente desde la terminal.") },
        { name: "nirium-pollar-adapter", registry: "npm", href: "https://www.npmjs.com/package/nirium-pollar-adapter", install: "npm i nirium-pollar-adapter", what: lang("Pay and anchor receipts with a wallet created through Pollar.", "Paga y ancla recibos con una wallet creada con Pollar.") },
    ];

    // Solo nodos probados de punta a punta en testnet (21 y 22-oct-2026), cada
    // uno con su CID o hash. Treasury entró tras el arreglo de /rebalance/propose (#45).
    const nodeCards: { name: string; what: string; nets: ("Testnet" | "Mainnet")[]; needs: string; points: string; code: string; run: string; label: string; keysLink?: boolean; tokens?: ("usdc" | "cetes")[]; notes?: string[] }[] = [
        { name: "Audit Trail", label: "node-audit", what: lang("Anchor a signed receipt of anything your agent did. Anyone can verify it.", "Ancla un recibo firmado de lo que hizo tu agente. Cualquiera lo puede verificar."), nets: ["Testnet", "Mainnet"], needs: lang("Free", "Gratis"), points: lang("Builder · +3 on mainnet", "Builder · +3 en mainnet"), code: AUDIT_TESTNET, run: "node receipt.mjs" },
        { name: "x402 Market", label: "node-x402", what: lang("Pay per request for market data, from your own key.", "Paga por consulta datos de mercado, desde tu propia llave."), nets: ["Testnet", "Mainnet"], needs: lang("Needs testnet USDC", "Pide USDC de testnet"), points: lang("Builder · +3 on mainnet", "Builder · +3 en mainnet"), code: X402_PAY_TESTNET, run: "STELLAR_SECRET=S... node pay.mjs", tokens: ["usdc"] },
        { name: "Payouts", label: "node-payouts", what: lang("Pay several people in one run. You sign it, Nirium never does.", "Paga a varias personas en una sola corrida. Tú firmas, Nirium nunca."), nets: ["Testnet"], needs: lang("Needs testnet USDC and a free API key", "Pide USDC de testnet y una API key gratis"), points: "Builder", code: PAYOUTS_TESTNET, run: "STELLAR_SECRET=S... NIRIUM_API_KEY=sk_... TO_1=G... TO_2=G... node payouts.mjs", keysLink: true, tokens: ["usdc"] },
        { name: "x402Serve", label: "node-x402serve", what: lang("Charge other people and agents for your own API.", "Cobra a otras personas y agentes por tu propia API."), nets: ["Testnet"], needs: lang("Needs testnet USDC and a free facilitator key", "Pide USDC de testnet y una llave gratuita de facilitador"), points: "Builder", code: X402_SERVE_TESTNET, run: `${X402_SERVE_INSTALL} && PAY_TO=G... FACILITATOR_KEY=... node serve.mjs`, tokens: ["usdc"] },
        { name: "MPP Charge", label: "node-mpp", what: lang("Pay per request with a USDC transfer signed inside the request.", "Paga por consulta con una transferencia de USDC firmada dentro de la petición."), nets: ["Testnet"], needs: lang("Needs testnet USDC", "Pide USDC de testnet"), points: "Builder", code: MPP_TESTNET, run: "STELLAR_SECRET=S... node mpp.mjs", tokens: ["usdc"] },
        { name: "NiriumVault", label: "node-niriumvault", what: lang("Create your own vault, deposit testnet CETES and read your balance. You sign everything.", "Crea tu propia bóveda, deposita CETES de testnet y lee tu saldo. Tú firmas todo."), nets: ["Testnet"], needs: lang("Testnet XLM and CETES", "XLM y CETES de testnet"), points: "Builder", code: VAULT_TESTNET, run: "node vault.mjs", tokens: ["cetes"],
            notes: [lang("Creating the vault costs 12.5 testnet XLM.", "Crear la bóveda cuesta 12.5 XLM de testnet."), lang("Testnet CETES from the DEX with Friendbot XLM, one transaction in the snippet.", "CETES de testnet desde el DEX con XLM de friendbot, una transacción en el snippet."), lang("Nirium's own contract, not externally audited.", "Contrato propio de Nirium, sin auditoría externa.")] },
        { name: "Treasury (DeFindex)", label: "node-treasury", what: lang("Deploy your vault, deposit and ask for a rebalance proposal. You sign everything with your two keys; Nirium holds no role in your vault.", "Despliega tu bóveda, deposita y pide una propuesta de rebalanceo. Tú firmas todo con tus dos llaves; Nirium no tiene ningún rol en tu bóveda."), nets: ["Testnet"], needs: lang("Testnet XLM, CETES and a free API key", "XLM y CETES de testnet y una API key gratis"), points: "Builder", code: TREASURY_TESTNET, run: "NIRIUM_API_KEY=sk_... node treasury.mjs", keysLink: true, tokens: ["cetes"],
            notes: [lang("Needs two keys of yours, Manager and RebalanceManager: the API rejects the same key for both.", "Necesita dos llaves tuyas, Manager y RebalanceManager: la API rechaza que sean la misma."), lang("The testnet CETES comes from the DEX, inside the snippet.", "El CETES de testnet sale del DEX, dentro del snippet.")] },
        { name: "Reporting", label: "node-reporting", what: lang("Read totals of anchors, payments and payouts.", "Lee los totales de anclajes, pagos y corridas."), nets: ["Testnet", "Mainnet"], needs: lang("Read-only", "Solo lectura"), points: lang("Read-only: no points on its own", "Solo lectura: no suma puntos por sí solo"), code: REPORTING_TESTNET, run: "node reporting.mjs" },
    ];
    const publishedIssues = [...FUN_ISSUES, ...ISSUES].filter((i) => i.number);

    const sectionTitle = "text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter";
    const card = "rounded-2xl bg-[#0A0A0A] border border-white/10 p-5 sm:p-6";
    const btnPrimary = "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-orange-500 text-black font-black text-sm hover:bg-orange-400 transition-colors shadow-[0_10px_30px_rgba(249,115,22,0.3)]";
    const btnGhost = "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/5 border border-white/15 text-white font-bold text-sm hover:bg-white/10 transition-colors";

    return (
        // overflow-x-clip, no -hidden: -hidden vuelve al div un contenedor de scroll y rompe la barra sticky.
        <div className="min-h-screen bg-black text-white selection:bg-orange-400/30 overflow-x-clip">
            {/* Página independiente, sin el AppLayout: el selector de idioma vive aquí. */}
            <MinimalNav />
            <SectionNav items={navItems} />
            <StickyStart label={lang("Start in 5 min", "Empieza en 5 min")} />

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <section id="hero" className="relative pt-4 pb-14 sm:pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] max-w-full h-[360px] bg-[radial-gradient(ellipse,rgba(249,115,22,0.14),transparent_70%)] pointer-events-none" />
                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        <Image
                            src="/niriumtober/hero-pumpkin.webp"
                            alt={lang("A carved pumpkin with a glowing Nirium N", "Una calabaza tallada con la N de Nirium brillando")}
                            width={1124}
                            height={1026}
                            priority
                            sizes="(min-width: 768px) 288px, 144px"
                            className="w-36 md:w-72 h-auto shrink-0 drop-shadow-[0_0_40px_rgba(249,115,22,0.35)]"
                        />
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-5 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-bold">
                                <span className="text-orange-300">{lang("🎃 Niriumtober · Oct 22 to Nov 2", "🎃 Niriumtober · 22 oct al 2 nov")}</span>
                                {countdown && (
                                    <span className="px-2 py-0.5 rounded-full bg-orange-400/10 border border-orange-400/30 text-orange-200">{countdown}</span>
                                )}
                                <span className="px-2 py-0.5 rounded-full bg-violet-400/10 border border-violet-400/30 text-violet-200">{lang("🏆 Champion wins a Niriumtober hoodie", "🏆 Champion gana una sudadera de Niriumtober")}</span>
                            </div>
                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.02]">
                                {lang("Ship your first agent receipt on Stellar this Halloween", "Ancla tu primer recibo de agente en Stellar este Halloween")}
                            </h1>
                            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl md:max-w-none">
                                {lang(
                                    "Copy one snippet, run it on testnet in 5 minutes, earn a 3D badge. Free, no funds needed.",
                                    "Copia un snippet, córrelo en testnet en 5 minutos y gana un badge 3D. Gratis, sin fondos."
                                )}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                <a href="#start" onClick={() => { track("niriumtober_start"); niriumtoberHit("start"); }} className={btnPrimary}>
                                    {lang("Start in 5 minutes", "Empieza en 5 minutos")} <ArrowRight className="w-4 h-4" />
                                </a>
                                <a href={AGENDA_URL} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                                    <CalendarClock className="w-4 h-4" /> {lang("Book office hours", "Agenda office hours")}
                                </a>
                            </div>
                            <div className="space-y-1 text-xs text-gray-400">
                                <p>{lang("10K+ package downloads on npm and PyPI · 2 SCF Instawards · Open source", "10K+ descargas de paquetes en npm y PyPI · 2 SCF Instawards · Open source")}</p>
                                <p className="text-gray-500">{lang("No cash prizes. The Champion gets a hoodie.", "Sin premios en dinero. Champion se lleva una sudadera.")}</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── VIDEO ─────────────────────────────────────────────────────── */}
            {/* preload="none": no se baja nada del video hasta que alguien le da
                play; antes solo carga el póster. Los subtítulos van quemados. */}
            <section id="video" className="pb-14 sm:pb-20 scroll-mt-20">
                <div className="container mx-auto px-4 max-w-5xl space-y-3">
                    <h2 className={sectionTitle}>{lang("Watch in 60 seconds", "Míralo en 60 segundos")}</h2>
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video">
                        <video
                            controls
                            playsInline
                            preload="none"
                            poster="/niriumtober/video/niriumtober-60s-en-poster.jpg"
                            width={1280}
                            height={720}
                            onPlay={onVideoPlay}
                            aria-label={lang("Niriumtober in 60 seconds", "Niriumtober en 60 segundos")}
                            className="block w-full h-full"
                        >
                            <source src="/niriumtober/video/niriumtober-60s-en-web.mp4" type="video/mp4" />
                        </video>
                    </div>
                    <p className="text-xs text-gray-500">{lang("English voiceover with captions.", "Voz en inglés con subtítulos.")}</p>
                </div>
            </section>

            {/* ── 3 PASOS ───────────────────────────────────────────────────── */}
            <section id="start" className="pb-14 sm:pb-20 scroll-mt-20">
                <div className="container mx-auto px-4 max-w-5xl space-y-6">
                    <div className="flex items-end justify-between gap-4">
                        <div className="space-y-2 min-w-0">
                            <h2 className={sectionTitle}>{lang("Your badge in 3 steps", "Tu badge en 3 pasos")}</h2>
                            <p className="text-sm text-gray-400">{lang("Everything runs on testnet. Your key, your receipt.", "Todo corre en testnet. Tu llave, tu recibo.")}</p>
                        </div>
                        <Image
                            src="/niriumtober/use-nirium-cauldron.webp"
                            alt={lang("A cauldron with coins and a receipt floating out of it", "Un caldero del que salen monedas y un recibo")}
                            width={768}
                            height={1002}
                            loading="lazy"
                            sizes="(min-width: 768px) 112px, 72px"
                            className="w-[72px] md:w-28 h-auto shrink-0"
                        />
                    </div>

                    <ol className="space-y-4">
                        <li id="step-1" className={`${card} space-y-3`}>
                            <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-full bg-orange-500 text-black font-black text-sm flex items-center justify-center shrink-0">1</span>
                                <h3 className="font-bold text-white">{lang("Install", "Instala")}</h3>
                            </div>
                            <CodeBlock code={INSTALL} label="install" {...copyLabels} />
                        </li>

                        <li id="step-2" className={`${card} space-y-3`}>
                            <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-full bg-orange-500 text-black font-black text-sm flex items-center justify-center shrink-0">2</span>
                                <h3 className="font-bold text-white">{lang("Anchor a receipt", "Ancla un recibo")}</h3>
                            </div>
                            <div role="tablist" className="flex flex-wrap gap-2">
                                {tabs.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={tab === t.id}
                                        onClick={() => setTab(t.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${tab === t.id ? "bg-orange-500/15 border-orange-400/60 text-orange-200" : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-white"}`}
                                    >
                                        {t.label}
                                        {t.id !== "audit" && <span className="ml-1 text-[10px] font-normal text-gray-500">{lang("needs testnet USDC", "pide USDC de testnet")}</span>}
                                    </button>
                                ))}
                                <a href="#nodes" className="px-3 py-1.5 rounded-full text-xs font-bold border border-dashed border-white/15 text-gray-400 hover:text-white hover:border-white/30">
                                    {lang("More nodes →", "Más nodos →")}
                                </a>
                            </div>
                            <CodeBlock code={current.code} label={current.id} {...copyLabels} />
                            <p className="text-xs text-gray-400">{current.note}</p>
                            <a href="#skill" className="inline-flex items-center gap-1 text-xs font-bold text-orange-300 hover:text-orange-200">
                                {lang("Using Claude or Cursor? Give it the Nirium skill and let it build this for you", "¿Usas Claude o Cursor? Dale la skill de Nirium y que lo arme por ti")} <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </li>

                        <li className={`${card} space-y-3`}>
                            <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-full bg-orange-500 text-black font-black text-sm flex items-center justify-center shrink-0">3</span>
                                <h3 className="font-bold text-white">{lang("Send your proof", "Manda tu prueba")}</h3>
                            </div>
                            <p className="text-sm text-gray-300">
                                {lang("Open the form, paste your CID and your public key. It is public, so never paste your secret key.", "Abre el formulario y pega tu CID y tu llave pública. Es público, así que nunca pegues tu llave secreta.")}
                                <span className="block mt-1 text-xs text-gray-400">{lang("A repo is optional for Builder. Mainnet Builder and Champion need a public repo.", "El repo es opcional para Builder. Mainnet Builder y Champion piden un repo público.")}</span>
                            </p>
                            <a href={proofUrl} target="_blank" rel="noopener noreferrer" onClick={() => { track("niriumtober_proof", { ref: ref ?? "none" }); niriumtoberHit("proof"); }} className={btnPrimary}>
                                <Send className="w-4 h-4" /> {lang("Send your proof", "Manda tu prueba")}
                            </a>
                        </li>
                    </ol>
                    <p className="text-lg sm:text-xl font-black text-white">{lang("That's it: you just earned Builder 🔨", "Listo: acabas de ganar Builder 🔨")}</p>
                </div>
            </section>

            {/* ── LOS 4 BADGES ──────────────────────────────────────────────── */}
            <section id="badges" className="pb-14 sm:pb-20 scroll-mt-20">
                <div className="container mx-auto px-4 max-w-5xl space-y-6">
                    <h2 className={sectionTitle}>{lang("Collect all 4", "Junta los 4")}</h2>
                    <div className={`${card} grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8`}>
                        {badges.map((b) => (
                            <figure key={b.file} className="flex flex-col items-center text-center gap-2 min-w-0">
                                <div className="relative w-full aspect-[1473/1057]">
                                    <Image src={`/niriumtober/badges/${b.file}.webp`} alt={b.alt} fill loading="lazy" sizes="(min-width: 1024px) 220px, 45vw" className="object-contain" />
                                </div>
                                <figcaption className="space-y-1">
                                    <div className="font-black tracking-tight text-white text-base sm:text-lg leading-none">{b.name}</div>
                                    <div className="text-xs text-gray-400 leading-snug">{b.how}</div>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CHAMPION ──────────────────────────────────────────────────── */}
            <section id="champion" className="pb-14 sm:pb-20 scroll-mt-20">
                <div className="container mx-auto px-4 max-w-5xl">
                    <motion.div {...fadeUp()} className="rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent p-5 sm:p-7 space-y-5">
                        <div className="space-y-2">
                            <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-black text-violet-200">
                                <Crown className="w-6 h-6" /> Champion
                            </h2>
                            <p className="text-base sm:text-lg font-bold text-white leading-snug">
                                {lang("The recognition for the best project or contribution of all Niriumtober. One only.", "El reconocimiento al mejor proyecto o contribución de todo Niriumtober. Uno solo.")}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300 leading-relaxed">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-violet-300">{lang("How it is chosen", "Cómo se elige")}</div>
                                    <p>{lang(
                                        "The Nirium team picks it at the close, on Nov 2, among every project and contribution with valid evidence. If none deserves it, it is not awarded.",
                                        "Lo elige el equipo de Nirium al cierre, el 2 de noviembre, entre todos los proyectos y contribuciones con evidencia válida. Si ninguno lo merece, queda desierto."
                                    )}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-violet-300">{lang("Public criteria", "Criterio público")}</div>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>{lang("Real use with your own key, above all on mainnet with Audit Trail or x402 Market.", "Uso real con tu propia llave, sobre todo en mainnet con Audit Trail o x402 Market.")}</li>
                                        <li>{lang("Quality, and a real integration in your product.", "Calidad e integración real en tu producto.")}</li>
                                        <li>{lang("What it gives the community: code, docs, useful feedback.", "Lo que aporta a la comunidad: código, docs, feedback útil.")}</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-violet-300">{lang("What it gets", "Qué recibe")}</div>
                                <div className="flex items-center gap-4">
                                    <figure className="shrink-0 w-28 sm:w-36 text-center">
                                        <Image
                                            src="/niriumtober/champion-hoodie.webp"
                                            alt={lang("Niriumtober Champion hoodie", "Sudadera Champion de Niriumtober")}
                                            width={1158}
                                            height={963}
                                            loading="lazy"
                                            sizes="(min-width: 640px) 144px, 112px"
                                            className="w-full h-auto"
                                        />
                                        <figcaption className="mt-1 text-[10px] text-gray-500 leading-tight">{lang("Render. Final hoodie may vary slightly.", "Render. La sudadera final puede variar un poco.")}</figcaption>
                                    </figure>
                                    <p className="font-bold text-white">{lang("🎃 An official Niriumtober hoodie, shipped to you.", "🎃 Una sudadera oficial de Niriumtober, te la enviamos.")}</p>
                                </div>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>{lang("Featured first in Built with Nirium on nirium.xyz.", "Primero en Built with Nirium en nirium.xyz.")}</li>
                                    <li>{lang("A dedicated post from @Niriumstellar.", "Un post dedicado desde @Niriumstellar.")}</li>
                                    <li>{lang("A 30-minute call with the team to review your integration.", "Una llamada de 30 minutos con el equipo para revisar tu integración.")}</li>
                                    <li>{lang("The same perks as everyone, first in line.", "Los mismos beneficios que todos, primero en la fila.")}</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-gray-500 leading-relaxed border-t border-white/5 pt-4">
                            <p>{lang(
                                "One hoodie, for the Champion only. Chosen by the Nirium team on Nov 2 on the public criteria above. No chance involved, and no purchase or payment of any kind is needed to compete: Audit Trail on testnet is free.",
                                "Una sola sudadera, solo para Champion. La elige el equipo de Nirium el 2 de noviembre con el criterio público de arriba. No interviene el azar, y no hace falta comprar ni pagar nada para competir: Audit Trail en testnet es gratis."
                            )}</p>
                            <p>{lang(
                                "Free shipping within Mexico. Outside Mexico, the Champion chooses: cover international shipping, or get a one-of-one 3D Champion badge with their project's name, made by the team.",
                                "Envío gratis dentro de México. Fuera de México, Champion elige: cubre el envío internacional, o recibe un badge 3D de Champion único, con el nombre de su proyecto, hecho por el equipo."
                            )}</p>
                            <p><Code>{lang(
                                "Champion adds no points: it is awarded apart from the points table. Its badge uses the same issuer key and tag `niriumtober-2026`, with `badge: \"champion\"`.",
                                "Champion no suma puntos: se otorga aparte de la tabla de puntos. Su badge usa la misma llave emisora y el tag `niriumtober-2026`, con `badge: \"champion\"`."
                            )}</Code></p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── MAINNET ───────────────────────────────────────────────────── */}
            <section className="pb-14 sm:pb-20">
                <div className="container mx-auto px-4 max-w-5xl">
                    <motion.div {...fadeUp()} className="rounded-2xl border border-yellow-400/40 bg-gradient-to-br from-yellow-400/10 via-amber-400/5 to-transparent p-5 sm:p-7">
                        {/* El trofeo va en la cabecera: arriba en móvil, a la derecha en escritorio, nunca junto al código. */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                            <Image
                                src="/niriumtober/mainnet-builder-trophy.webp"
                                alt={lang("A gold Nirium trophy for the Mainnet Builder badge", "Un trofeo dorado de Nirium para el badge Mainnet Builder")}
                                width={1298}
                                height={1353}
                                loading="lazy"
                                sizes="(min-width: 640px) 144px, 96px"
                                className="order-first sm:order-last w-24 sm:w-36 h-auto mx-auto sm:mx-0 shrink-0 drop-shadow-[0_0_30px_rgba(255,215,0,0.25)]"
                            />
                            <div className="space-y-4 min-w-0 flex-1">
                                <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-black text-yellow-200">
                                    <Trophy className="w-6 h-6 shrink-0" /> {lang("Level up: go mainnet", "Sube de nivel: pasa a mainnet")}
                                </h2>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-200">
                                    <li><Code>{lang("Audit Trail: anchor a receipt on mainnet with `agent` signed by your key. Free during the beta.", "Audit Trail: ancla un recibo en mainnet con `agent` firmado por tu llave. Gratis durante la beta.")}</Code></li>
                                    <li>{lang("x402 Market: one paid call (0.05 USDC) from your own account.", "x402 Market: una llamada pagada (0.05 USDC) desde tu propia cuenta.")}</li>
                                </ol>
                                <p className="text-xs text-gray-400">
                                    {lang(
                                        "Optional, with your own funds and at your own risk. We never fund or refund mainnet transactions.",
                                        "Opcional, con tus propios fondos y bajo tu propio riesgo. Nunca fondeamos ni reembolsamos transacciones en mainnet."
                                    )}
                                </p>
                            </div>
                        </div>

                        <details className="group mt-5">
                            <summary className="cursor-pointer list-none inline-flex items-center gap-1 text-xs font-bold text-yellow-200">
                                {lang("Show the mainnet code", "Ver el código de mainnet")} <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="mt-4 space-y-6">
                                <div className="space-y-2">
                                    <h3 className="font-bold text-white">{lang("1 · Audit Trail (free in beta)", "1 · Audit Trail (gratis en beta)")}</h3>
                                    <p className="text-xs text-gray-300"><Code>{lang("Use your own mainnet key in `STELLAR_SECRET`. Never paste your secret key anywhere.", "Usa tu propia llave de mainnet en `STELLAR_SECRET`. Nunca pegues tu llave secreta en ningún sitio.")}</Code></p>
                                    <CodeBlock code={AUDIT_MAINNET} label="audit-mainnet" {...copyLabels} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-white">{lang("2 · x402 Market (0.05 USDC)", "2 · x402 Market (0.05 USDC)")}</h3>
                                    <p className="text-xs text-gray-300"><Code>{lang("Use your own mainnet key in `STELLAR_SECRET`. Never paste your secret key anywhere. Your account needs a USDC trustline and a USDC balance on mainnet.", "Usa tu propia llave de mainnet en `STELLAR_SECRET`. Nunca pegues tu llave secreta en ningún sitio. Tu cuenta necesita trustline y saldo de USDC en mainnet.")}</Code></p>
                                    <CodeBlock code={X402_MAINNET} label="x402-mainnet" {...copyLabels} />
                                </div>
                            </div>
                        </details>

                        <div className="mt-6 space-y-1">
                            <a href={proofUrl} target="_blank" rel="noopener noreferrer" onClick={() => { track("niriumtober_proof", { ref: ref ?? "none", step: "mainnet" }); niriumtoberHit("proof"); }} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-yellow-400 text-black font-black text-sm hover:bg-yellow-300 transition-colors shadow-[0_10px_30px_rgba(250,204,21,0.25)]">
                                <Send className="w-4 h-4" /> {lang("Send your mainnet proof", "Envía tu prueba de mainnet")}
                            </a>
                            <p className="text-[11px] text-gray-400">{lang("Mainnet Builder needs a public repo.", "Mainnet Builder pide repo público.")}</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── VUELVE MAÑANA + COMPARTE ──────────────────────────────────── */}
            <section className="pb-14 sm:pb-20">
                <div className="container mx-auto px-4 max-w-5xl grid md:grid-cols-2 gap-4">
                    <div className={`${card} space-y-2`}>
                        <h2 className="flex items-center gap-2 text-lg font-black text-white"><Repeat className="w-5 h-5 text-orange-300" /> {lang("Come back tomorrow", "Vuelve mañana")}</h2>
                        <p className="text-sm text-gray-300">{lang("Anchor again on mainnet on a second day: +2 points.", "Ancla otra vez en mainnet en un segundo día: +2 puntos.")}</p>
                    </div>
                    <div className={`${card} space-y-3`}>
                        <h2 className="flex items-center gap-2 text-lg font-black text-white"><Users className="w-5 h-5 text-orange-300" /> {lang("Share it", "Compártelo")}</h2>
                        <a href={shareUrl} target="_blank" rel="noopener noreferrer" onClick={() => { trackFunnel("share_click", { source: "niriumtober" }); niriumtoberHit("share"); }} className={btnGhost}>
                            {lang("Post on X", "Publicar en X")} <ArrowRight className="w-4 h-4" />
                        </a>
                        <p className="text-sm text-gray-400">{lang("Bring a teammate. Teams are welcome.", "Trae a alguien de tu equipo. Los equipos son bienvenidos.")}</p>
                    </div>
                </div>
            </section>

            {/* ── POR QUÉ ───────────────────────────────────────────────────── */}
            <section className="pb-14 sm:pb-20">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className={`${card} space-y-3`}>
                        <h2 className={sectionTitle}>{lang("Why join", "Por qué entrar")}</h2>
                        <ul className="space-y-2">
                            {perks.map((p) => (
                                <li key={p} className="flex gap-2 text-sm sm:text-base text-gray-200 leading-relaxed">
                                    <Sparkles className="w-4 h-4 mt-1 shrink-0 text-fuchsia-300" />
                                    <span>{p}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-[11px] text-gray-500">{lang("Priorities, not promises.", "Son prioridades, no promesas.")}</p>
                    </div>
                </div>
            </section>

            {/* ── TOKENS DE TESTNET ─────────────────────────────────────────── */}
            <section id="tokens" className="pb-14 sm:pb-20 scroll-mt-20">
                <div className="container mx-auto px-4 max-w-5xl space-y-6">
                    <div className="space-y-2">
                        <h2 className={sectionTitle}>{lang("Get testnet tokens", "Consigue tokens de testnet")}</h2>
                        <p className="text-sm sm:text-base text-gray-300">
                            {lang("Testnet tokens are free and have no real value. This page only ever asks for your public key, never your secret key.", "Los tokens de testnet son gratis y no tienen valor real. Esta página solo te pide tu llave pública, nunca la secreta.")}
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className={`${card} space-y-3 min-w-0`}>
                            <h3 className="text-lg font-black text-white">XLM</h3>
                            <label htmlFor="nt-pubkey" className="block text-xs text-gray-400">{lang("Your public key (G...)", "Tu llave pública (G...)")}</label>
                            <input id="nt-pubkey" value={pubkey} onChange={(e) => setPubkey(e.target.value.trim())} placeholder="G..." spellCheck={false} autoComplete="off"
                                className="w-full rounded-xl bg-black border border-white/15 px-3 py-2.5 font-mono text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-400/60" />
                            {pubkey && !pubkeyOk && <p className="text-xs text-amber-300">{lang("That is not a Stellar public key. It starts with G and has 56 characters.", "Esa no es una llave pública de Stellar. Empieza con G y tiene 56 caracteres.")}</p>}
                            <a href={pubkeyOk ? FRIENDBOT_URL + pubkey : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!pubkeyOk}
                                className={`${btnGhost} ${pubkeyOk ? "" : "opacity-40 pointer-events-none"}`}>
                                {lang("Get testnet XLM (Friendbot)", "Pide XLM de testnet (Friendbot)")} <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                        <div className={`${card} space-y-3 min-w-0`}>
                            <h3 className="text-lg font-black text-white">USDC</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                                <li>{lang("Add the USDC trustline first (the script below does it).", "Agrega primero la trustline de USDC (el script de abajo lo hace).")}</li>
                                <li>{lang("In the Circle faucet, choose Stellar.", "En el faucet de Circle, elige Stellar.")}</li>
                                <li>{lang("Paste your address and request it.", "Pega tu dirección y pídelo.")}</li>
                            </ol>
                            <a href={CIRCLE_FAUCET_URL} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                                {lang("Get testnet USDC (Circle faucet)", "Pide USDC de testnet (faucet de Circle)")} <ArrowRight className="w-4 h-4" />
                            </a>
                            <p className="text-xs text-gray-500">{lang("CETES has no faucet: it comes from the DEX, in the script.", "CETES no tiene faucet: sale del DEX, en el script.")}</p>
                        </div>
                    </div>
                    <div className={`${card} space-y-3 min-w-0`}>
                        <h3 className="text-lg font-black text-white">{lang("Set up your account", "Prepara tu cuenta")}</h3>
                        <p className="text-sm text-gray-300">
                            {lang("One run: it creates a key, funds it with Friendbot, adds the USDC and CETES trustlines and swaps 20 XLM into each on the testnet DEX. If the DEX has no USDC route, it adds the trustline and sends you to the Circle faucet.", "En una sola corrida: crea una llave, la fondea con Friendbot, agrega las trustlines de USDC y CETES y cambia 20 XLM por cada uno en el DEX de testnet. Si el DEX no tiene ruta a USDC, agrega la trustline y te manda al faucet de Circle.")}
                        </p>
                        <CodeBlock code={SETUP_TESTNET} label="setup" {...copyLabels} />
                        <p className="text-xs text-gray-400">
                            <Code>{lang("Save it as `setup.mjs` and run `node setup.mjs` (same install as step 1). It prints your public key and balances, and keeps the secret key in `niriumtober-testnet.key`, out of git.", "Guárdalo como `setup.mjs` y corre `node setup.mjs` (misma instalación del paso 1). Imprime tu llave pública y tus saldos, y guarda la secreta en `niriumtober-testnet.key`, fuera de git.")}</Code>
                        </p>
                    </div>
                </div>
            </section>

            {/* ── TODOS LOS NODOS ───────────────────────────────────────────── */}
            <section id="nodes" className="pb-14 sm:pb-20 scroll-mt-20">
                <div className="container mx-auto px-4 max-w-5xl space-y-6">
                    <div className="space-y-2">
                        <h2 className={sectionTitle}>{lang("Explore every node", "Explora todos los nodos")}</h2>
                        <p className="text-sm sm:text-base text-gray-300">
                            {lang("Any node on testnet earns you Builder. Use several: Champion is decided by real use.", "Cualquier nodo en testnet te da Builder. Usa varios: el Champion se decide por uso real.")}
                        </p>
                        <p className="text-xs text-gray-500"><Code>{lang(`Same install as step 1: \`${INSTALL}\`. Every snippet below was run on testnet.`, `Misma instalación del paso 1: \`${INSTALL}\`. Cada snippet de abajo se corrió en testnet.`)}</Code></p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {(allNodes ? nodeCards : nodeCards.slice(0, 3)).map((n) => (
                            <div key={n.name} className={`${card} space-y-3 min-w-0`}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-lg font-black text-white">{n.name}</h3>
                                    <div className="flex gap-1.5">
                                        {n.nets.map((net) => (
                                            <span key={net} className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${net === "Mainnet" ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-300" : "bg-emerald-400/10 border-emerald-400/30 text-emerald-300"}`}>{net}</span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-300">{n.what}</p>
                                <div className="flex flex-wrap gap-1.5 text-[11px]">
                                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">{n.needs}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-orange-400/10 border border-orange-400/30 text-orange-200">{n.points}</span>
                                </div>
                                {n.notes && (
                                    <ul className="space-y-1 text-xs text-gray-400 list-disc list-inside">
                                        {n.notes.map((t) => <li key={t}>{t}</li>)}
                                    </ul>
                                )}
                                {n.tokens && (
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        {n.tokens.map((t) => (
                                            <a key={t} href="#tokens" className="inline-flex items-center gap-1 text-xs font-bold text-orange-300 hover:text-orange-200">
                                                {t === "usdc" ? lang("Get testnet USDC", "Pide USDC de testnet") : lang("Get testnet CETES", "Pide CETES")} <ArrowRight className="w-3.5 h-3.5" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                                {n.keysLink && (
                                    <a href={KEYS_URL} className="inline-flex items-center gap-1 text-xs font-bold text-orange-300 hover:text-orange-200">
                                        {lang("Get your free API key", "Obtén tu API key gratis")} <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                )}
                                <CodeBlock code={n.code} label={n.label} {...copyLabels} />
                                <p className="text-[11px] text-gray-500 font-mono break-all">{n.run}</p>
                            </div>
                        ))}
                    </div>
                    {!allNodes && (
                        <button type="button" onClick={() => setAllNodes(true)} className={btnGhost}>
                            {lang(`Show all ${nodeCards.length}`, `Ver los ${nodeCards.length}`)} <ChevronDown className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </section>

            {/* ── PAQUETES Y LLAVES ─────────────────────────────────────────── */}
            <section id="packages" className="pb-14 sm:pb-20 scroll-mt-20">
                <div className="container mx-auto px-4 max-w-5xl space-y-6">
                    <h2 className={sectionTitle}>{lang("Packages and keys", "Paquetes y llaves")}</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {packages.map((pk) => (
                            <div key={`${pk.registry}-${pk.name}`} id={pk.id} className={`${card} space-y-3 min-w-0 scroll-mt-20`}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <a href={pk.href} target="_blank" rel="noopener noreferrer" className="text-lg font-black text-white hover:text-orange-200 [overflow-wrap:anywhere]">{pk.name}</a>
                                    <div className="flex gap-1.5">
                                        {pk.chip && <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border bg-orange-400/10 border-orange-400/30 text-orange-200">{pk.chip}</span>}
                                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border bg-white/5 border-white/15 text-gray-300">{pk.registry}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-300">{pk.what}</p>
                                {pk.links && (
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        {pk.links.map((l) => (
                                            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-orange-300 hover:text-orange-200">{l.label} <ArrowRight className="w-3.5 h-3.5" /></a>
                                        ))}
                                    </div>
                                )}
                                <CodeBlock code={pk.install} label={`install-${pk.registry}-${pk.name}`} {...copyLabels} />
                                {pk.note && <p className="text-[11px] text-gray-500">{pk.note}</p>}
                            </div>
                        ))}
                        <div className="rounded-2xl border border-orange-400/40 bg-orange-500/10 p-5 sm:p-6 space-y-3 flex flex-col justify-center">
                            <h3 className="text-lg font-black text-white">{lang("API keys", "API keys")}</h3>
                            <p className="text-sm text-gray-200">{lang("Some nodes (like Payouts) need a free API key. Get it in a minute.", "Algunos nodos (como Payouts) piden una API key gratis. La sacas en un minuto.")}</p>
                            <a href={KEYS_URL} className={btnPrimary}>{lang("Get your free API key", "Obtén tu API key gratis")} <ArrowRight className="w-4 h-4" /></a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ISSUES: solo los que ya existen en GitHub ─────────────────── */}
            {publishedIssues.length > 0 && (
                <section id="issues" className="pb-14 sm:pb-20 scroll-mt-20">
                    <div className="container mx-auto px-4 max-w-5xl space-y-4">
                        <h2 className={sectionTitle}>{lang("Prefer code? Pick an issue", "¿Prefieres código? Elige un issue")}</h2>
                        <p className="text-sm text-gray-400">
                            {lang("How to claim an issue: comment with a plan for that specific issue, the files you will touch and how you will test it. A bare “I'll take it” or a generic template does not count. The first valid plan gets it, one active issue per person. If there is no draft PR within 48 hours of assignment, the issue goes back to the pool. A merged PR earns Contributor.", "Cómo reclamar un issue: comenta con un plan para ese issue en concreto, los archivos que vas a tocar y cómo lo vas a probar. Un “lo tomo” o una plantilla genérica no cuentan. Se asigna al primer plan válido, un issue activo por persona. Si no hay PR en borrador 48 horas después de la asignación, el issue se libera. Un PR aceptado te da Contributor.")}
                        </p>
                        <ol className="space-y-3">
                            {publishedIssues.map((it) => (
                                <li key={it.title} className="rounded-xl bg-[#0A0A0A] border border-white/10 p-4 sm:p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                        <a href={`${REPO}/issues/${it.number}`} target="_blank" rel="noopener noreferrer" className="text-base sm:text-lg font-bold leading-snug text-white hover:text-orange-200">
                                            <span className="text-gray-500 font-mono mr-2">#{it.number}</span>
                                            <Code>{it.title}</Code>
                                        </a>
                                        <span className={`self-start shrink-0 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLE[it.status]}`}>{statusLabel[it.status]}</span>
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed mb-2"><Code>{pick(it.desc)}</Code></p>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        <span className="font-bold text-emerald-300">{lang("Done when: ", "Hecho cuando: ")}</span>
                                        <Code>{pick(it.done)}</Code>
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            )}

            {/* ── FAQ ───────────────────────────────────────────────────────── */}
            <section id="faq" className="pb-14 sm:pb-20 scroll-mt-20">
                <div className="container mx-auto px-4 max-w-5xl space-y-3">
                    <h2 className={`${sectionTitle} mb-2`}>FAQ</h2>

                    <Faq q={lang("Which parts of Nirium count, and on which network?", "¿Qué partes de Nirium cuentan y en qué red?")}>
                        <ul className="divide-y divide-white/5 rounded-xl border border-white/10">
                            {NODES.map((n) => (
                                <li key={n.name} className="p-3 sm:p-4 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-white">{n.name}</span>
                                        <code className="text-[10px] font-mono text-gray-500 break-all">{n.endpoint}</code>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border bg-emerald-400/10 border-emerald-400/30 text-emerald-300">{n.mainnet === "no_points" ? "Testnet · 0" : "Testnet · 2"}</span>
                                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${mainnetStyle[n.mainnet]}`}>{mainnetLabel[n.mainnet]}</span>
                                    </div>
                                    <p className="text-xs text-gray-400"><Code>{pick(n.note)}</Code></p>
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-gray-500">
                            {lang("Testnet points (2) are earned once, whatever nodes you use. Mainnet points are per node.", "Los puntos de testnet (2) se ganan una vez, sin importar cuántos nodos uses. Los de mainnet son por nodo.")}
                        </p>
                    </Faq>

                    <Faq q={lang("How do points work?", "¿Cómo funcionan los puntos?")}>
                        <table className="w-full text-sm">
                            <tbody>
                                {points.map(([what, pts]) => (
                                    <tr key={what} className="border-b border-white/5 last:border-0">
                                        <td className="py-2 pr-3 text-gray-300">{what}</td>
                                        <td className="py-2 text-right font-mono font-black text-orange-300 whitespace-nowrap">{pts}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-xs text-gray-500">
                            {lang("Points only set the order of the perks. There is no public leaderboard. Champion is awarded apart.", "Los puntos solo ordenan los beneficios. No hay tabla pública de posiciones. Champion se otorga aparte.")}
                        </p>
                    </Faq>

                    <Faq q={lang("What do I send as proof?", "¿Qué mando como prueba?")}>
                        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                            {evidenceFields.map(([k, v]) => (
                                <div key={k} className="flex flex-col border-b border-white/5 pb-2">
                                    <dt className="font-bold text-white">{k}</dt>
                                    <dd className="text-gray-400 text-xs">{v}</dd>
                                </div>
                            ))}
                        </dl>
                        <p className="text-xs text-gray-500">{lang("Everything in the form is public, so never paste a secret key.", "Todo lo que pongas en el formulario es público, así que nunca pegues una llave secreta.")}</p>
                    </Faq>

                    <Faq q={lang("How do I claim an issue?", "¿Cómo reclamo un issue?")}>
                        <p>{lang("How to claim an issue: comment with a plan for that specific issue, the files you will touch and how you will test it. A bare “I'll take it” or a generic template does not count. The first valid plan gets it, one active issue per person. If there is no draft PR within 48 hours of assignment, the issue goes back to the pool. A merged PR earns Contributor.", "Cómo reclamar un issue: comenta con un plan para ese issue en concreto, los archivos que vas a tocar y cómo lo vas a probar. Un “lo tomo” o una plantilla genérica no cuentan. Se asigna al primer plan válido, un issue activo por persona. Si no hay PR en borrador 48 horas después de la asignación, el issue se libera. Un PR aceptado te da Contributor.")}</p>
                    </Faq>

                    <Faq q={lang("Rules", "Reglas")}>
                        <ul className="space-y-2">
                            {[
                                lang("We never give you funds or refund anything for mainnet transactions. Mainnet use is with your own funds; the only thing we pay for is the badges.", "Nunca te damos fondos ni te reembolsamos nada para transacciones en mainnet. El uso en mainnet es con tus propios fondos; lo único que pagamos nosotros son los badges."),
                                lang("Team keys don't count: keys held by the Nirium team, our self-test accounts, or any account Nirium has funded.", "Las llaves del equipo no cuentan: llaves del equipo de Nirium, nuestras cuentas de autoprueba, ni cualquier cuenta que Nirium haya fondeado."),
                                lang("Nirium is non-custodial software and never touches your funds. Mainnet is optional and at your own risk.", "Nirium es software no custodial y nunca toca tus fondos. Mainnet es opcional y bajo tu propio riesgo."),
                            ].map((r) => (
                                <li key={r} className="flex gap-2"><Ban className="w-4 h-4 mt-0.5 shrink-0 text-red-300" /><span>{r}</span></li>
                            ))}
                        </ul>
                    </Faq>

                    <Faq q={lang("Can I use AI?", "¿Puedo usar IA?")}>
                        <p className="font-bold text-white">{rules.lead}</p>
                        <ul className="space-y-2">
                            {rules.items.map((r) => (
                                <li key={r} className="flex gap-2"><GitPullRequest className="w-4 h-4 mt-0.5 shrink-0 text-orange-300" /><span>{r}</span></li>
                            ))}
                        </ul>
                        <p className="text-xs text-gray-500">
                            {lang("For the fun issues, testing means showing the result: the file renders, the story reads well, the translation matches. No hash or CID needed.", "En los issues fun, probar es mostrar el resultado: el archivo se ve bien, el cuento se lee bien, la traducción coincide. Sin hash ni CID.")}
                        </p>
                    </Faq>

                    <Faq q={lang("How do I verify a badge?", "¿Cómo verifico un badge?")}>
                        <p>{lang("Each badge is a receipt Nirium signs and anchors in Audit Trail on mainnet, at our cost. It cites your evidence. Badge anchors are ours: we never count them as user activity.", "Cada badge es un recibo que Nirium firma y ancla en Audit Trail en mainnet, a nuestro costo. Cita tu evidencia. Los anclajes de badges son nuestros: nunca los contamos como uso de usuarios.")}</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs font-mono">
                                <tbody>
                                    {receiptFields.map(([k, v]) => (
                                        <tr key={k} className="border-t border-white/5">
                                            <td className="py-1.5 pr-3 text-orange-200 align-top">{k}</td>
                                            <td className="py-1.5 text-gray-300 align-top break-words">{v}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>{lang("Fetch the badge CID from any IPFS gateway.", "Baja el CID del badge desde cualquier gateway de IPFS.")}</li>
                            <li><Code>{lang("Recompute sha-256 over `record` and compare it with `content_sha256`.", "Recalcula el sha-256 de `record` y compáralo con `content_sha256`.")}</Code></li>
                            <li><Code>{lang("Rebuild `nirium-audit-v1:<sha256>` and check the ed25519 signature against `agent.key`, which must be the issuer key below.", "Reconstruye `nirium-audit-v1:<sha256>` y verifica la firma ed25519 contra `agent.key`, que tiene que ser la llave emisora de abajo.")}</Code></li>
                            <li><Code>{lang("Open the participant's evidence the receipt cites: their CID's `agent.key`, or their tx on Horizon.", "Abre la evidencia del participante que cita el recibo: el `agent.key` de su CID, o su tx en Horizon.")}</Code></li>
                            <li><Code>{lang("Champion is checked the same way: same issuer key, tag `niriumtober-2026`, and `badge: \"champion\"` in the record.", "Champion se verifica igual: misma llave emisora, tag `niriumtober-2026` y `badge: \"champion\"` en el registro.")}</Code></li>
                        </ol>
                        <p className="text-xs text-gray-400 break-all">
                            <Code>{lang("Niriumtober issuer key: `GBPDN4LQFQ4YJMP3Y43ZQ5PABLAMRID6IF52PGYILLHECC2ZDKH2NNY5`. Steps 1-3 are what the `verify-audit-cid` GitHub Action already does.", "Llave emisora de Niriumtober: `GBPDN4LQFQ4YJMP3Y43ZQ5PABLAMRID6IF52PGYILLHECC2ZDKH2NNY5`. Los pasos 1-3 son lo que ya hace la GitHub Action `verify-audit-cid`.")}</Code>
                        </p>
                        <a href={`${REPO}/tree/main/actions/verify-audit-cid`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-emerald-200">
                            <FileCheck2 className="w-3.5 h-3.5" /> verify-audit-cid
                        </a>
                    </Faq>
                </div>
            </section>

            {/* ── FECHAS Y CONTACTO ─────────────────────────────────────────── */}
            <section className="pb-20 sm:pb-28">
                <div className="container mx-auto px-4 max-w-5xl grid sm:grid-cols-3 gap-4">
                    <div className="rounded-xl bg-[#0A0A0A] border border-white/10 p-4">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">{lang("Dates", "Fechas")}</div>
                        <div className="text-sm text-white">{lang("Oct 22 to Nov 2, 2026", "22 de octubre al 2 de noviembre de 2026")}</div>
                        <div className="text-sm text-gray-400">{lang("Halloween week + 2 bonus days", "Semana de Halloween + 2 días extra")}</div>
                    </div>
                    <div className="rounded-xl bg-[#0A0A0A] border border-white/10 p-4 space-y-1">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">{lang("Contact", "Contacto")}</div>
                        <a href={`mailto:${CONTACT}`} className="flex items-center gap-1.5 text-sm text-white hover:text-orange-200 break-all"><Mail className="w-4 h-4 shrink-0" /> {CONTACT}</a>
                        <a href={AGENDA_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-white hover:text-orange-200"><CalendarClock className="w-4 h-4 shrink-0" /> {lang("Office hours", "Office hours")}</a>
                    </div>
                    <div className="rounded-xl bg-[#0A0A0A] border border-white/10 p-4 space-y-1">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">{lang("Links", "Links")}</div>
                        <a href="https://nirium.xyz/build" className="flex items-center gap-1.5 text-sm text-white hover:text-orange-200"><ArrowRight className="w-4 h-4" /> nirium.xyz/build</a>
                        <a href={REPO} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-white hover:text-orange-200"><Github className="w-4 h-4" /> nirium-protocol/nirium</a>
                        <Link href="/ecosystem" className="flex items-center gap-1.5 text-sm text-white hover:text-orange-200"><ShieldCheck className="w-4 h-4" /> Built with Nirium</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
