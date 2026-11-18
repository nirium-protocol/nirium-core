import { NextRequest, NextResponse } from 'next/server';

// ═══ Tier B en el sitio: Payouts y Treasury no se ofrecen en EEE, UK y EE.UU. ═══
//
// Política: /legal/restricted-jurisdictions-v1.md §4.
//
// Por qué aquí y no solo en el agente: el agente decide por `req.ip`, pero toda
// llamada que sale de nirium.xyz le llega desde el servidor de Vercel, no desde
// el visitante. Comprobado el 8-nov-2026: desde una IP de México se armó un retiro
// de mainnet sin problema, y la misma ruta habría pasado desde EE.UU. El sitio sí
// conoce el país real (`x-vercel-ip-country`, lo pone Vercel, no el cliente), así
// que el bloqueo de Tier B para el tráfico del sitio vive aquí. El agente lo
// sigue aplicando a quien le llama directo.
//
// Se bloquea ARMAR la operación (desplegar, depositar, entregar el rol,
// rebalancear, armar o enviar una corrida de Payouts, onboarding). NO se bloquea:
// - retirar de tu propia bóveda (/api/treasury/withdraw): devolverle a alguien su
//   dinero no es ofrecerle un servicio (decidido por el usuario, 8-nov-2026);
// - /api/treasury/submit: solo transmite una transacción que el usuario ya firmó,
//   y las que mueven fondos ya no se pueden armar desde aquí en Tier B.
// Tier A (sancionados, China) lo bloquea middleware.ts para todo /api.

export const TIER_B_COUNTRIES = new Set([
    // Unión Europea (27)
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE',
    // EEE no-UE
    'IS', 'LI', 'NO',
    // Reino Unido + Estados Unidos
    'GB', 'US',
]);

// Política v1.1 (8-nov-2026), §1 y §4:
// - Treasury en testnet SÍ se ofrece en Tier B, como demostración: tokens sin valor.
// - Payouts NO se ofrece en ninguna red: los términos de Payouts, que se aceptan en
//   cada corrida, incluyen declarar que no estás en Tier B. Abrir Payouts en testnet
//   pide cambiar primero esos términos.
export type GatedProduct = 'treasury' | 'payouts';

/** 451 si el visitante está en Tier B y la operación aplica; null si puede seguir. */
export function tierBBlock(req: NextRequest, network: 'mainnet' | 'testnet', product: GatedProduct): NextResponse | null {
    const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase();
    if (!country || !TIER_B_COUNTRIES.has(country)) return null;
    if (product === 'treasury' && network === 'testnet') return null;
    return NextResponse.json(
        {
            error: 'unavailable_for_legal_reasons',
            message: product === 'treasury'
                ? 'The Treasury node is not offered on mainnet in your jurisdiction pending a written legal opinion. It is available on testnet as a demonstration, and withdrawing from your own vault is always available. Settlement, Audit and Reporting remain available.'
                : 'Payouts is not offered in your jurisdiction pending a written legal opinion. Settlement, Audit and Reporting remain available.',
            jurisdiction: country,
            policy: 'https://nirium.xyz/legal/restricted-jurisdictions-v1.md',
            contact: 'niriumprotocol@gmail.com',
        },
        { status: 451, headers: { 'X-Restricted-Jurisdiction': country } },
    );
}
