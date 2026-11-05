import { pageMetadata } from "@/lib/pageMetadata";

// page.tsx es "use client": sin este layout el post salía con el título de la home.
export const metadata = pageMetadata({
    path: "/blog/bbva-open-deal-room",
    title: "Nirium at The Open Deal Room by Stellar",
    description: "We were one of six Stellar startups featured at La Arena inside BBVA Tower CDMX. Here is what we showed, who was in the room, and why an autonomous treasury agent belongs in front of institutional investors.",
});

export default function BbvaOpenDealRoomLayout({ children }: { children: React.ReactNode }) {
    return children;
}
