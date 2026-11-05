import type { Metadata } from 'next';

const TITLE = 'Audit Trail on Stellar: verifiable payment receipts | Nirium';
const DESCRIPTION =
    'Recap of the Nirium workshop on Audit Trail: signed, independently verifiable receipts for payments made by apps, backends and AI agents on Stellar. See it work, verify it yourself, free.';

// Página de recap posterior al taller del 30-oct, no el invite (ese es
// app/workshop-audit-trail-october). page.tsx es 'use client', así que el
// metadata viene de aquí, mismo patrón que esa página.
export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
    },
};

export default function WorkshopAuditTrailRecapLayout({ children }: { children: React.ReactNode }) {
    return children;
}
