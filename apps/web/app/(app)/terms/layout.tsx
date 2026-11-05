import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/terms",
    title: "Terms of Service",
    description: "Terms of service and software license for Nirium, non-custodial infrastructure software on Stellar.",
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
