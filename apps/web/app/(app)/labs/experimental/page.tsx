import { redirect } from "next/navigation";

// Retirada el 16-nov-2026: era la reconstrucción de un diseño (Swarm, 26 agentes) que ya no corre. Redirige a /agents, el catálogo de nodos reales.
export default function Page() {
    redirect("/agents");
}
