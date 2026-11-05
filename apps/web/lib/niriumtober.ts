// Fechas de Niriumtober, en un solo lugar. Las usan la página, el banner de la
// home y el redirect de /sandbox en el middleware (corre en el edge: nada de
// imports de Node aquí).
export const NIRIUMTOBER_START = Date.UTC(2026, 9, 22);
// Fin del 2 de noviembre completo, en UTC.
export const NIRIUMTOBER_END = Date.UTC(2026, 10, 3);

export function isNiriumtoberLive(now: number = Date.now()): boolean {
    return now < NIRIUMTOBER_END;
}

export function niriumtoberHref(ref: string): string {
    return `/build/niriumtober?ref=${encodeURIComponent(ref)}`;
}

/** Días que faltan para el cierre, redondeando hacia arriba. 0 si ya terminó. */
export function niriumtoberDaysLeft(now: number = Date.now()): number {
    return Math.max(0, Math.ceil((NIRIUMTOBER_END - now) / 86_400_000));
}
