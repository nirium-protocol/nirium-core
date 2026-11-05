import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/treasury",
    title: "Treasury Node",
    description: "Move idle USDC into CETES (Etherfuse) inside a DeFindex vault you own. Live on mainnet, invite-only.",
});

export default function TreasuryLayout({ children }: { children: React.ReactNode }) {
    return children;
}
