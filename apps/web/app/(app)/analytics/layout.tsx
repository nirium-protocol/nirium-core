import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/analytics",
    title: "Network Telemetry",
    description: "Receipts, settlements and node activity on Stellar, with links to the transactions behind them. Panels with sample data are labeled.",
});

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
