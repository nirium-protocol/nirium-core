import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/security",
    title: "Security",
    description: "How Nirium stays non-custodial: who holds the keys, what the agent can and cannot sign, and how vaults are controlled.",
});

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
    return children;
}
