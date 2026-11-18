/** Nirium - Public Usage Stats. Server-rendered so the numbers are already in
 *  the initial HTML (not behind a client-only fetch) - a non-JS crawler, or
 *  Wayback Machine's save-page request, sees the same figures a visitor does.
 *  See app/api/stats/statsData.ts for the exact queries. */
export const revalidate = 300; // 5 min - matches /api/stats's own cache
export const maxDuration = 60;

import { pageMetadata } from '@/lib/pageMetadata';
import { getStatsData } from '../../api/stats/statsData';
import StatsClient from './StatsClient';

export const metadata = pageMetadata({
    path: '/stats',
    title: 'Usage stats',
    description: 'Usage, not claims: x402 settlements, payers and package downloads, read live from Horizon, npm, PyPI and GitHub when you load the page.',
});

export default async function StatsPage() {
    const data = await getStatsData();
    return <StatsClient initialData={data} />;
}
