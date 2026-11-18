import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/how-to-use",
    title: "How to Use Nirium",
    description: "Getting started with Nirium: an API key, x402 payments, the invite-only Treasury rebalancer and Audit Trail receipts anyone can verify.",
});

export default function HowToUseLayout({ children }: { children: React.ReactNode }) {
    return children;
}
