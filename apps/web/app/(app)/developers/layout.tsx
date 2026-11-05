import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/developers",
    title: "Build on Nirium",
    description: "The nirium package for TypeScript and Python, a REST API, an MCP server and x402 per-request payments on Stellar.",
});

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
    return children;
}
