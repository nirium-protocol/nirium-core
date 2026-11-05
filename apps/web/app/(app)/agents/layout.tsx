import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/agents",
    title: "Execution Nodes",
    description: "Nirium's execution nodes on Stellar: what each one does, what it is allowed to sign, and on which network it runs.",
});

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
