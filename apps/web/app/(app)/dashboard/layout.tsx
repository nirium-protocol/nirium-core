import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/dashboard",
    title: "Dashboard",
    description: "The Nirium operator dashboard: the agent's execution feed, vault state and Audit Trail receipts on Stellar.",
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
