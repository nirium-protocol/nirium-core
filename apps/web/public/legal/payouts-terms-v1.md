# Nirium Payouts - Terms of Use (v1.3)

**Effective:** July 10, 2026 · **Last updated:** November 16, 2026 · **Jurisdiction:** Mexico · **Stage:** Mainnet early access (invite-only)

By building or submitting a payout run through the Nirium Payouts / Disbursement node (`POST /api/payroll/run` with `acknowledgeTerms: true`), you (the "Client") accept these terms and the [Restricted Jurisdictions & Sanctions Policy](/legal/restricted-jurisdictions-v1.md), which forms part of this agreement.

## 1. Software-only, non-custodial

Nirium provides **software infrastructure only**. The node builds an **unsigned** Stellar transaction; the Client signs it with the Client's own wallet and broadcasts it. **Nirium never holds, custodies, transmits or has access to any funds.** No private key of the Client ever reaches Nirium.

## 2. Nirium is not a regulated financial entity

Nirium is **not** a Financial Technology Institution (Institución de Tecnología Financiera - ITF), **not** an Electronic Payment Funds Institution (IFPE), and **not** a money transmitter. Whether building the unsigned disbursement instruction on the Client's behalf counts as "facilitación o intermediación de activos virtuales" under LFPIORPI Article 17, Section XVI, and Article 24 Bis 4 of the General Rules issued under the LFPIORPI (Reglas de Carácter General, as amended by Acuerdo 115/2026, DOF 7 August 2026) - and so whether Nirium is an Obligated Subject (Sujeto Obligado) for that specific activity - is an open legal question, with no written legal opinion yet; it is precisely why §6 below requires client identification on mainnet, not because the question is already settled either way. Nirium provides **no financial, tax, investment, or labor advice**. Financial services (FX, custody, on/off-ramp) are provided by independent third parties under their own terms and licences.

## 3. Permitted use - independent service payments only

Payouts is licensed **exclusively** for payments for the **independent provision of services** governed by the Civil Code: **contractors, freelancers, and business-to-business (B2B) suppliers.**

## 4. Prohibited uses

You may **not** use Payouts for:

- **Salary of subordinate employees** - Mexican Federal Labor Law (LFT) Art. 101 requires salary to be paid in legal-tender currency.
- **Platform workers deemed subordinate** under LFT Chapter IX Bis (in force June 22, 2025).
- **Specialized-personnel subcontracting** unless the Client complies with its REPSE registration (STPS).
- **Any purpose prohibited by the Restricted Jurisdictions & Sanctions Policy**, including use by or for the benefit of a sanctioned person or a person in a prohibited jurisdiction.

## 5. Client responsibilities

The Client is the **sole responsible party** for:

- Correctly classifying each recipient (independent contractor vs. employee).
- Issuing CFDI and withholding/paying all applicable taxes to the SAT.
- Any labor or social-security obligations that may arise.
- REPSE compliance where applicable.
- Screening its own recipients against applicable sanctions lists.

## 6. Client identification (mainnet)

Under LFPIORPI Article 17, Section XVI (Mexico's anti-money-laundering law provision on virtual assets, in force since September 2019 and amended by decree published in the DOF on 16 July 2025 - not a future date), Nirium requires the Client to provide basic identification before building a run on **mainnet**: legal company name, tax ID (RFC or equivalent), and the name of the Client's legal representative. This information is stored with the run and is not made public. **Testnet runs do not require it.**

## 7. Eligibility and jurisdiction

Payouts is **not offered** in the jurisdictions listed as Tier A or Tier B in the [Restricted Jurisdictions & Sanctions Policy](/legal/restricted-jurisdictions-v1.md) - which today excludes, among others, the European Economic Area, the United Kingdom and the United States. By accepting these terms the Client makes each of the representations in §6 of that policy, on every occasion of use.

Mainnet access is additionally **invite-only**: the Client's API key must be authorized by Nirium at institutional tier. Nirium may decline or withdraw that authorization at its discretion, without liability. Withdrawal never affects the Client's funds, which are never in Nirium's control.

## 8. Limitation of liability

Nirium is **not liable** for the Client's decisions, recipient classification, or any tax, labor, regulatory, or financial consequence arising from use of the software. The Client uses the software at its own risk. To the maximum extent permitted by law, Nirium's aggregate liability under these terms is limited to the software fees actually paid by the Client to Nirium in the three months preceding the event giving rise to the claim.

## 9. Fees - software licence, not a payment fee

Nirium licenses software. It does **not** charge for moving money, and it is not remunerated by reference to the money moved.

- The licence is charged as a **fixed monthly fee, banded by the volume of records the Client's licence permits it to process** (a capacity tier, in the ordinary manner of software licensing).
- The fee is **never a percentage of, and never varies with, the amount disbursed.**
- The fee is **not charged per payment, per transaction, or per settlement.**
- The Stellar **network fee** (~$0.02 per 100 recipients) is paid by the Client directly to the network. Nirium does not receive it, mark it up, or route it.
- Any **financial** commission - foreign exchange, on/off-ramp, custody - is set and charged by those third parties under their own terms, never bundled into Nirium's fee.

During early access no licence fee is charged and the Client pays only the network fee.

## 10. Governing law and dispute resolution

These terms are governed by the federal laws of the United Mexican States. Any controversy related to these terms goes to the competent courts of Mexico City, and each party waives any other jurisdiction to which it might be entitled by reason of its present or future domicile. The parties may instead agree in writing to arbitration; that written agreement names the institution and the rules. This is the same rule as the site Terms (§5) and the Payouts / Disbursement Governing Terms (§7).

---

*Version 1.3 - 16 November 2026. Changes from v1.2: §2 no longer says the open question is "under external review" (no lawyer has been engaged yet; it awaits a written legal opinion), and §2 and §9 no longer call third parties "regulated", since Nirium has not verified their regulatory status. Version 1.2 - 9 November 2026. Changes from v1.1: Article 24 Bis 4 cited to the General Rules (Acuerdo 115/2026) where it actually sits, not to the LFPIORPI itself (§2); in-force date of Article 17, Section XVI stated without "approximately" and its July 2025 amendment added (§6); dispute resolution set to the competent courts of Mexico City, with arbitration only where both parties agree in writing, the same rule as the site Terms and the Payouts / Disbursement Governing Terms (§10). Version 1.1 - 6 August 2026. Changes from v1.0: fee basis restated as a capacity-banded software licence (§9), eligibility and jurisdiction added (§7), liability cap added (§8), governing law added (§10), sanctions incorporated into prohibited uses (§4) and client responsibilities (§5). This document is versioned. Its SHA-256 hash may be referenced in audit receipts via the Legal Context Protocol once finalized. Not legal advice - the Client should consult its own counsel.*
