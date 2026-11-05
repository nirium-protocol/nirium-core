import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/treasury/vault",
    title: "Treasury Vault Console",
    description: "Deploy a DeFindex vault you own. Nirium only takes the RebalanceManager role: it moves funds between strategies inside your vault and nothing else.",
});

export default function TreasuryVaultLayout({ children }: { children: React.ReactNode }) {
    return children;
}
