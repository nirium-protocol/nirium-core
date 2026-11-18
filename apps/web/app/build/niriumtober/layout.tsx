import type { Metadata } from 'next';

// page.tsx es 'use client', así que la metadata vive aquí (mismo patrón que
// los posts del blog). Sin esto la ruta hereda el título del layout raíz.
const TITLE = 'Niriumtober: agent receipts on Stellar, Halloween 2026';
const DESCRIPTION =
    'A testnet build sprint that ran from Oct 22 to Nov 2, 2026: participants anchored agent receipts on Stellar and earned 3D badges. See the issues and what was built.';

// El openGraph/twitter de una ruta REEMPLAZA al del layout raíz (no se mezcla
// campo por campo): sin `images` y `card` aquí, el link salía sin imagen y con
// tarjeta chica. Compuesta con los renders de public/niriumtober/.
const IMAGE = {
    url: '/niriumtober/og-niriumtober.png',
    width: 1200,
    height: 630,
    alt: 'Niriumtober: a carved pumpkin with the Nirium N and the four 3D badges',
};

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: '/build/niriumtober' },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: '/build/niriumtober',
        type: 'website',
        siteName: 'Nirium',
        images: [IMAGE],
    },
    twitter: {
        card: 'summary_large_image',
        creator: '@Niriumstellar',
        title: TITLE,
        description: DESCRIPTION,
        images: [IMAGE.url],
    },
};

export default function NiriumtoberLayout({ children }: { children: React.ReactNode }) {
    return children;
}
