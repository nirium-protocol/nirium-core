import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/docs",
    title: "Documentation",
    description: "Technical reference for Nirium on Stellar: Audit Trail receipts, Reporting, x402 sellers and the pre-sign policy hook, with commands you can run yourself.",
});

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
