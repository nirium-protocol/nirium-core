# Nirium Payouts / Disbursement - Governing Terms (v1)

> **Dispute resolution (§7) matches the site Terms (§5) across the product,
> updated 9 November 2026:** the competent courts of Mexico City, with
> arbitration only where both parties agree to it in writing (Código de
> Comercio art. 1423 requires a written arbitration agreement). This replaces
> the binding Cámara de Comercio de la Ciudad de México clause of the
> previous text. Governing law (§6, Mexico) is unchanged.
>
> This document is the reference artifact for the Legal Context Protocol
> (LCP · https://legalcontextprotocol.org). Its SHA-256 is the LCP `atrHash`
> published at `/.well-known/legal-context.json`. **If this text changes, the
> hash changes - recompute it and update the discovery file and `LCP_ATR_HASH`.**

## 1. Parties and scope

These terms govern a **disbursement run** executed through the Nirium Payouts /
Disbursement node: a fan-out payment from a paying party's treasury ("the
**Company**") to one or more recipient accounts ("**Recipients**") on the Stellar
network. "**Nirium**" refers to the software provider.

On **mainnet**, the Company must identify itself before a run can be built:
legal name, tax identification number, and the name of an authorized
representative (`clientInfo: { legalName, taxId, repName }`). This is not
KYC in the regulated-institution sense - Nirium performs no verification of
the information provided, holds no license to do so, and the requirement
is adopted in view of LFPIORPI Art. 17 fracc. XVI, in force since September
2019 - not a future date. This paragraph documents what the
software already enforces (`requireClientIdentification()`,
`services/payoutsLegal.ts`); it does not itself constitute a representation
that such identification satisfies any specific regulatory requirement.

## 2. Nature of the service (software-only, non-custodial)

Nirium provides **software only**. The node builds an **unsigned** Stellar
transaction; the Company signs it with its own wallet and submits it. Nirium is
**non-custodial** and at no time holds, controls, directs, or takes title to any
funds. Settlement of value is effected solely by the Company's own signature.
Where fiat conversion or other regulated activity occurs, it is performed by
independent third-party operators, not by Nirium. Nirium is not a bank, money
transmitter, payment institution, custodian, or fiduciary.

## 3. What a disbursement represents

Each run instructs a payment from the Company's treasury to the specified
Recipients in the asset and amounts the Company provides. The Company is solely
responsible for the accuracy of Recipient addresses, amounts, and its authority
to make each payment.

## 4. Recipient eligibility

A Recipient is included only if, at build time, its account exists and (for token
assets) holds the required trustline. Ineligible Recipients are reported as
skipped and are not paid. Skipping is a safety control, not an error.

## 5. Records and integrity (IPFS + LCP)

For every settled run, Nirium anchors an **immutable IPFS receipt** containing the
per-recipient breakdown, totals, network, and transaction hash, together with a
**SHA-256 content hash** of that record. These terms are bound to that receipt via
the LCP `atrHash`, which identifies the exact version of this document in force at
the time of the transaction. The IPFS receipt proves *what* was paid; this
document and its `atrHash` prove *under which terms*.

## 6. Governing law

These terms shall be governed by and construed in accordance with the laws of
**Mexico**, without regard to its conflict-of-laws rules.

## 7. Dispute resolution

Any controversy related to this agreement goes to the competent courts of
**Mexico City**. The parties may instead agree in writing to arbitration;
that written agreement names the institution and the rules. This is the same
rule as the site Terms §5.

## 8. No warranty of value

Nirium makes no representation as to the market value, convertibility, or yield of
any asset disbursed. On Stellar **testnet**, assets carry **no monetary value**;
on **mainnet**, disbursed assets carry real monetary value and the Company bears
full responsibility for the accuracy and authorization of every run. The software
is provided "as is," without warranties of any kind to the maximum extent
permitted by law.

## 9. Changes

Nirium may publish revised terms as a new versioned document with a new `atrHash`.
The version in force for a given disbursement is the one referenced by that run's
receipt.

---

*LCP conformance: Level 2 (Provable) - `terms` + `atrHash`. The dispute
resolution clause (§7 - courts of Mexico City, matching Terms §5) is
referenced as additional context (a Level 4 field). Per-payout
digital acceptance (Level 3) is not captured.*
