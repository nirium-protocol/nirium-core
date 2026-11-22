import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/payouts",
    title: "Payouts",
    description: "Pay up to 100 recipients per batch (99 if the batch carries a fee) from one company wallet in a single signed Stellar transaction. Nirium builds it, you sign it. Invite-only on mainnet.",
});

export default function PayoutsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
