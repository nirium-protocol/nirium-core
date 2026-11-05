import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/treasury/builder",
    title: "Treasury Strategy Builder (preview)",
    description: "A preview canvas to compose a treasury strategy. Execution runs in the Treasury node.",
});

export default function TreasuryBuilderLayout({ children }: { children: React.ReactNode }) {
    return children;
}
