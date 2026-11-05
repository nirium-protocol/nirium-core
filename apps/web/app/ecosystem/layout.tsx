import { pageMetadata } from "@/lib/pageMetadata";

// page.tsx es "use client": la metadata va en este layout.
export const metadata = pageMetadata({
    path: "/ecosystem",
    title: "Built with Nirium",
    description: "Who integrates with Nirium and on which network: Pollar and AgentLedger on testnet, TIA on mainnet, plus what Nirium itself depends on.",
});

export default function EcosystemLayout({ children }: { children: React.ReactNode }) {
    return children;
}
