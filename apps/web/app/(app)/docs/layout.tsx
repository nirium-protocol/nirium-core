import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/docs",
    title: "Documentation",
    description: "Technical reference for Nirium on Stellar: the API, execution nodes, Soroban contracts, x402 payments and the Audit Trail.",
});

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
