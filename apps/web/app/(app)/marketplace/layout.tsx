import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/marketplace",
    title: "Strategy Marketplace (planned)",
    description: "A planned marketplace of auditable treasury policy templates as Soroban contracts. It is not live yet.",
});

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
    return children;
}
