import { track } from "@vercel/analytics";
import { MAINNET_API_URL } from "./constants";

// De dónde llegó la persona (?ref=), guardado en sessionStorage la primera vez
// que aparece en la sesión, para atribuir el embudo completo: CTA, copias de
// código, llaves creadas y compartidos. Solo vive en el navegador; nunca se
// manda al agente ni se guarda junto a la llave.
const KEY = "nirium_ref";
export const REF_RX = /^[a-z0-9_-]{1,32}$/i;

export function captureRef(search: string = typeof window === "undefined" ? "" : window.location.search): string | null {
    try {
        const r = new URLSearchParams(search).get("ref");
        if (r && REF_RX.test(r) && !sessionStorage.getItem(KEY)) sessionStorage.setItem(KEY, r.toLowerCase());
        return sessionStorage.getItem(KEY);
    } catch {
        return null;
    }
}

export function getRef(): string | null {
    try {
        return sessionStorage.getItem(KEY);
    } catch {
        return null;
    }
}

export type FunnelEvent = "cta_start" | "key_created" | "docs_copy" | "share_click";

export function trackFunnel(event: FunnelEvent, props: Record<string, string> = {}): void {
    track(event, { ...props, ref: getRef() ?? "none" });
}

// Vercel Hobby no registra Custom Events (son de Pro y Enterprise), así que
// track() no cuenta nada hoy. Junto a cada track() va este beacon al agente
// (Box B), que solo suma 1 a (día, ref, evento). text/plain para que no haya
// preflight de CORS; si el navegador no tiene sendBeacon o falla, no pasa nada.
// key_created no va por aquí: lo suma el agente al guardar la llave (ver /keys).
export type NiriumtoberHitEvent = "view" | "start" | "copy" | "proof" | "share" | "video_play" | "cta_home";
const HIT_URL = `${MAINNET_API_URL}/api/public/niriumtober/hit`;

export function niriumtoberHit(event: NiriumtoberHitEvent): void {
    try {
        navigator.sendBeacon(HIT_URL, JSON.stringify({ ref: getRef() ?? "none", event }));
    } catch {
        /* best-effort */
    }
}

// "view" cuenta una vez por sesión del navegador, no por recarga.
export function niriumtoberViewOnce(): void {
    try {
        if (sessionStorage.getItem("nirium_nt_view")) return;
        sessionStorage.setItem("nirium_nt_view", "1");
    } catch {
        return;
    }
    niriumtoberHit("view");
}
