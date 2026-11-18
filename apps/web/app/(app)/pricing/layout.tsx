import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/pricing",
    title: "Pricing",
    description: "Start free on testnet. On mainnet you pay per request in USDC, settled on Stellar, with no card needed.",
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return children;
}
