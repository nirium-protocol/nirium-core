import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/treasury",
    title: "Treasury Node",
    description: "Moves your own DeFindex vault's idle funds (USDC or CETES) into its Blend strategy and back when the yield crosses the thresholds you set. On mainnet, invite-only.",
});

export default function TreasuryLayout({ children }: { children: React.ReactNode }) {
    return children;
}
