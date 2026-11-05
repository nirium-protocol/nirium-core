import { OG_SECTIONS } from "@/lib/og/sections";
import { renderOg } from "@/lib/og/render";

// Una sola ruta sirve la tarjeta de preview de cada sección (/og/verify,
// /og/treasury/vault...). Se genera en el build: solo existen los paths del mapa.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
    return Object.keys(OG_SECTIONS).map((path) => ({ slug: path.slice(1).split("/") }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const path = `/${slug.join("/")}`;
    const section = OG_SECTIONS[path];
    if (!section) return new Response("Not found", { status: 404 });
    return renderOg(path, section);
}
