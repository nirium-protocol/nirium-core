import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/compliance",
    title: "Audit Trail",
    description: "Every node execution is hashed with SHA-256, anchored on IPFS and exported as JSON, so anyone can check it.",
});

export default function ComplianceLayout({ children }: { children: React.ReactNode }) {
    return children;
}
