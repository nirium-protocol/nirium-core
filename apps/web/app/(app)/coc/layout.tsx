import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/coc",
    title: "Code of Conduct",
    description: "Community guidelines and Code of Conduct aligned with the Stellar Ecosystem.",
});

export default function CocLayout({ children }: { children: React.ReactNode }) {
    return children;
}
