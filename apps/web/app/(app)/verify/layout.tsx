import { pageMetadata } from "@/lib/pageMetadata";

// page.tsx es "use client": la metadata va en este layout.
export const metadata = pageMetadata({
    path: "/verify",
    title: "Verify an Audit Trail receipt",
    description: "Paste a CID and check, without an account, what an Audit Trail receipt declares and when it was anchored. It proves the receipt has not changed, not that its contents are true.",
});

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
