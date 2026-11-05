import { pageMetadata } from "@/lib/pageMetadata";

// page.tsx es "use client": la metadata va en este layout.
export const metadata = pageMetadata({
    path: "/branding-nirium",
    title: "Brand assets pack",
    description: "The Nirium brand assets pack: SVG and PNG at every resolution, plus the full ZIP.",
});

export default function BrandingNiriumLayout({ children }: { children: React.ReactNode }) {
    return children;
}
