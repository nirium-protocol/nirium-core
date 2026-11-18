import { redirect } from "next/navigation";

// Retirada el 16-nov-2026: describía un marketplace de plantillas que no existe. Redirige a /treasury, el producto real.
export default function Page() {
    redirect("/treasury");
}
