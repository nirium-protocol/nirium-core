import type { Metadata } from 'next';

const TITLE = 'Audit Trail en Stellar: prueba verificable con Nirium';
const DESCRIPTION =
    'Dos talleres en vivo (vie 30 oct, 11:00 AM CDMX · lun 2 nov, 4:00 PM CDMX), mismo contenido. Firma una prueba con tu propia llave de Stellar, ánclala en el Audit Trail de Nirium y verifícala tú mismo. Con Giovanny Amador y Monserrat Mendoza, cofundadores de Nirium.';

// Página de evento fechado, no la fuente viva del producto - sí se indexa
// (a diferencia de /pitch) porque la idea es que se comparta y se encuentre
// mientras el taller esté vigente. page.tsx es 'use client', así que el
// metadata tiene que venir de este layout.
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

export default function WorkshopAuditTrailOctoberLayout({ children }: { children: React.ReactNode }) {
    return children;
}
