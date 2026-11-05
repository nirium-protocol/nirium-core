import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/build",
    title: "What You Can Build",
    description: "Product ideas you can prototype on Nirium's payment, audit and execution rails, most of them live on Stellar testnet today.",
});

export default function BuildLayout({ children }: { children: React.ReactNode }) {
    return children;
}
