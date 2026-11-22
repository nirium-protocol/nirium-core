import { permanentRedirect } from "next/navigation";

// 21-nov-2026 (NAV3): /how-to-use era una segunda guía de inicio que ya se había desalineado de
// /docs (decía "20 requests/min" y que /verify no depende de nuestro backend). Redirige (308)
// al inicio rápido de /docs, la única guía que se mantiene.
export default function HowToUsePage() {
    permanentRedirect("/docs#quickstart");
}
