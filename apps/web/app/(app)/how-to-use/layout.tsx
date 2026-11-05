import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/how-to-use",
    title: "How to Use Nirium",
    description: "Step by step: connect a Stellar wallet, set up a strategy and run it with Nirium.",
});

export default function HowToUseLayout({ children }: { children: React.ReactNode }) {
    return children;
}
