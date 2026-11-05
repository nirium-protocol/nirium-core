import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/pricing",
    title: "Pricing",
    description: "Start free. On mainnet you pay per request in USDC, settled on Stellar, with no card and no subscription.",
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return children;
}
