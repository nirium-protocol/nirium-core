import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/payouts",
    title: "Payouts",
    description: "Pay up to 100 recipients from one treasury in a single signed Stellar transaction. Nirium builds it, you sign it. Invite-only on mainnet.",
});

export default function PayoutsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
