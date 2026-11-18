import type { Metadata } from 'next';

// Without this, /nirium-play inherited the root layout's generic title/
// description/og:url, so sharing or indexing this page showed the
// flagship-mainnet-rails homepage copy instead of this page's own (a
// testnet Unity demo). og-content.tsx/opengraph-image.tsx already render a
// page-specific OG image; this fills in the matching title/description/url.
export const metadata: Metadata = {
    title: 'Nirium Play - pay-per-action inside Unity',
    description: 'x402 on Stellar, running for real inside a Unity 6 game. Every action goes through a pay-per-call gate settled on Stellar testnet.',
    alternates: { canonical: 'https://nirium.xyz/nirium-play' },
    openGraph: {
        title: 'Nirium Play - pay-per-action inside Unity',
        description: 'x402 on Stellar, running for real inside a Unity 6 game. Settled on Stellar testnet.',
        url: 'https://nirium.xyz/nirium-play',
    },
    twitter: {
        title: 'Nirium Play - pay-per-action inside Unity',
        description: 'x402 on Stellar, running for real inside a Unity 6 game. Settled on Stellar testnet.',
    },
};

export default function NiriumPlayLayout({ children }: { children: React.ReactNode }) {
    return children;
}
