import { pageMetadata } from "@/lib/pageMetadata";

// page.tsx es "use client": la metadata va en este layout. pageMetadata pone
// canonical, og:url y la tarjeta propia de lib/og/sections.ts.
export const metadata = pageMetadata({
    path: "/blog/treasury-node-verify-it-yourself",
    title: "The Treasury Node on Mainnet: Don't Trust Us, Verify the Contract",
    description:
        "Nirium's agent holds the RebalanceManager role on a real DeFindex vault on Stellar mainnet, and the vault's own contract code makes withdrawal structurally impossible for that role, not just against our policy. Here is the transaction, the exact line of source code that proves it, and what it means for everyone involved.",
    absoluteTitle: true,
});

export default function TreasuryNodeVerifyItYourselfLayout({ children }: { children: React.ReactNode }) {
    return children;
}
