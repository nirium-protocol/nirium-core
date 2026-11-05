import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/manifesto",
    title: "Manifesto",
    description: "Why autonomous agents need payment, audit and execution rails, and why Nirium builds them on Stellar.",
});

export default function ManifestoLayout({ children }: { children: React.ReactNode }) {
    return children;
}
