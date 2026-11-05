import type { Metadata } from "next";
import { OG_SECTIONS, ogImageUrl } from "./og/sections";

// Metadata de una página del sitemap. Casi todas las páginas son "use client" y
// no pueden exportar metadata, así que la pone un layout.tsx de servidor en su
// carpeta. openGraph y twitter de una ruta reemplazan enteros a los del layout
// raíz (no se mezclan campo por campo), por eso la imagen va aquí otra vez: sin
// ella el link compartido sale sin tarjeta. Si la ruta tiene tarjeta propia en
// lib/og/sections.ts se usa esa; si no, la general del sitio.
const DEFAULT_OG_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: "Nirium - payment, audit and execution rails on Stellar" };

export function pageMetadata({
    path,
    title,
    description,
    absoluteTitle = false,
    noindex = false,
}: {
    path: string;
    title: string;
    description: string;
    // true cuando el título ya es el de la página completa (posts del blog):
    // no se le agrega " | Nirium".
    absoluteTitle?: boolean;
    // true para una página pública pero no pensada para buscadores (p.ej.
    // notas internas para un partner, aunque sean legibles por cualquiera).
    noindex?: boolean;
}): Metadata {
    const full = absoluteTitle ? title : `${title} | Nirium`;
    const own = ogImageUrl(path);
    const image = own ? { url: own, width: 1200, height: 630, alt: OG_SECTIONS[path].alt } : DEFAULT_OG_IMAGE;
    // absolute: un layout intermedio con título propio (treasury, blog) corta la
    // plantilla "%s | Nirium" del raíz para sus hijos.
    return {
        title: { absolute: full, template: "%s | Nirium" },
        description,
        alternates: { canonical: path },
        ...(noindex ? { robots: { index: false, follow: false } } : {}),
        openGraph: { title: full, description, url: path, siteName: "Nirium", type: "website", images: [image] },
        twitter: { card: "summary_large_image", title: full, description, creator: "@Niriumstellar", images: [image.url] },
    };
}
