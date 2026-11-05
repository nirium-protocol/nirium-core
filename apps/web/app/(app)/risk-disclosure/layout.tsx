import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/risk-disclosure",
    title: "Risk Disclosure",
    description: "The technical and operational risks of using Nirium's automation, smart contracts and the Stellar network.",
});

export default function RiskDisclosureLayout({ children }: { children: React.ReactNode }) {
    return children;
}
