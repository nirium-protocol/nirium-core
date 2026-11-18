import { redirect } from "next/navigation";

// Retirada el 16-nov-2026: invitación al taller del 30-oct-2026, que ya pasó; su herramienta de firma en el navegador dependía de un CDN que la CSP bloquea. Redirige al recap.
export default function Page() {
    redirect("/workshop-audit-trail-recap");
}
