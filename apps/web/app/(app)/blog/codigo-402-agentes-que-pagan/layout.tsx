import { pageMetadata } from "@/lib/pageMetadata";

// page.tsx es "use client": sin este layout el post salía con el título de la home.
export const metadata = pageMetadata({
    path: "/blog/codigo-402-agentes-que-pagan",
    title: "Código 402: Agentes que pagan - free Stellar x402 bootcamp",
    description: "Your code has never charged you a dime. A free, 5-session bootcamp (BAF x Stellar x Nirium) where you build an API that charges per call and an agent that pays on its own, on Stellar testnet.",
});

export default function Codigo402Layout({ children }: { children: React.ReactNode }) {
    return children;
}
