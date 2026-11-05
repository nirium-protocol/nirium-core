import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/keys",
    title: "API Keys",
    description: "Issue a free Nirium API key tied to your Stellar wallet, proven by signature. One key works on testnet and mainnet.",
});

export default function KeysLayout({ children }: { children: React.ReactNode }) {
    return children;
}
