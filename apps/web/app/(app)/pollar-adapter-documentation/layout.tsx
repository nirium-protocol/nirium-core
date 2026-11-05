import { pageMetadata } from "@/lib/pageMetadata";

// page.tsx es "use client": la metadata va en este layout. noindex: es un
// documento interno para el equipo de Pollar - público y sin login, pero no
// pensado para salir en buscadores.
export const metadata = pageMetadata({
    path: "/pollar-adapter-documentation",
    title: "Nirium × Pollar adapter notes",
    description: "How nirium-pollar-adapter lets a Pollar social-login wallet pay over x402, and where the integration stands today.",
    noindex: true,
});

export default function PollarAdapterDocumentationLayout({ children }: { children: React.ReactNode }) {
    return children;
}
