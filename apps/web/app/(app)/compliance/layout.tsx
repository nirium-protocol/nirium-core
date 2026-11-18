import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/compliance",
    title: "Audit Trail",
    description: "Receipts anyone can verify: each record gets a SHA-256 hash, an optional ed25519 signature and an IPFS CID you can check at nirium.xyz/verify.",
});

export default function ComplianceLayout({ children }: { children: React.ReactNode }) {
    return children;
}
