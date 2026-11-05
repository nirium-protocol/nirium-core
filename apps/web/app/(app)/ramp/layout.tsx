import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
    path: "/ramp",
    title: "MXN to CETES",
    description: "Fund tokenized CETES from MXN through Etherfuse, an independent operator, on Stellar testnet. KYC/KYB required.",
});

export default function RampLayout({ children }: { children: React.ReactNode }) {
    return children;
}
