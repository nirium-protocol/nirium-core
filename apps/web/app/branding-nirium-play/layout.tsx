import { pageMetadata } from "@/lib/pageMetadata";

// page.tsx es "use client": la metadata va en este layout.
export const metadata = pageMetadata({
    path: "/branding-nirium-play",
    title: "Nirium Play logo pack",
    description: "The Nirium mark for the Play sub-brand, in SVG and PNG at every resolution.",
});

export default function BrandingNiriumPlayLayout({ children }: { children: React.ReactNode }) {
    return children;
}
