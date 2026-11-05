import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/blog",
    title: "Blog",
    description: "Field notes from building Nirium on Stellar: engineering, events and results you can verify yourself.",
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return children;
}
