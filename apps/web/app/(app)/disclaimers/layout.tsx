import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/disclaimers",
    title: "Legal Disclaimers",
    description: "Mandatory legal disclaimers and risk disclosures for the Nirium Protocol software.",
});

export default function DisclaimersLayout({ children }: { children: React.ReactNode }) {
    return children;
}
