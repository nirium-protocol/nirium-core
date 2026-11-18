import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://nirium.xyz';

    // 21-ago-2026: barrido de páginas huérfanas. /strategies, /leaderboard y
    // /plugins ya no existen (404 real, verificado en vivo) -- quedaron de una
    // versión anterior del sitio. /pollar-adapter-documentation (link directo
    // para el equipo de Pollar, no para indexar) y /labs/experimental
    // (experimental, vive detrás del CTA de /agents) se dejan fuera a propósito.
    // 8-nov-2026: /manifesto sale (redirige a /docs); /build/niriumtober queda
    // fuera porque la campaña cerró el 2-nov.
    // 16-nov-2026: /marketplace sale (redirige a /treasury), igual que /labs/experimental
    // (a /agents) y /workshop-audit-trail-october (al recap).
    const staticRoutes = [
        '',
        '/dashboard',
        '/docs',
        '/verify',
        '/ecosystem',
        '/stats',
        '/nirium-play',
        '/agents',
        '/analytics',
        '/blog/audit-trail-verify-it-yourself',
        '/blog/bbva-open-deal-room',
        '/blog/codigo-402-agentes-que-pagan',
        '/blog/treasury-node-verify-it-yourself',
        '/blog/x402-outage-verify-it-yourself',
        '/workshop-audit-trail-recap',
        '/privacy',
        '/terms',
        '/risk-disclosure',
        '/how-to-use',
        '/build',
        '/blog',
        '/compliance',
        '/coc',
        '/developers',
        '/disclaimers',
        '/keys',
        '/payouts',
        '/pricing',
        '/ramp',
        '/security',
        '/treasury',
        '/treasury/builder',
        '/treasury/vault',
    ].map((route) => {
        const changeFrequency: "daily" | "weekly" = route === '' || route === '/dashboard' || route === '/docs' ? 'daily' : 'weekly';
        return {
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency,
            priority: route === '' ? 1 : 0.8,
        };
    });

    return [...staticRoutes];
}
