import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Audit Trail en Stellar: 2 talleres en vivo con Nirium";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mismo lenguaje visual que el OG de /blog/audit-trail-verify-it-yourself
// (mismo tema, Audit Trail) - fondo negro, acento cian, wordmark NIRIUM
// arriba a la izquierda, pill de tema arriba a la derecha. Las fechas/horas
// vienen de la misma fuente verificada que page.tsx (WORKSHOPS), no se
// reescriben aparte.
export default function OGImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#000000",
                    backgroundImage:
                        "radial-gradient(circle at 85% 12%, rgba(45,235,232,0.20), transparent 45%), radial-gradient(circle at 8% 92%, rgba(45,235,232,0.10), transparent 40%)",
                    padding: "64px 72px",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 16, height: 16, borderRadius: 999, backgroundColor: "#2DEBE8" }} />
                        <div style={{ fontSize: 30, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}>
                            NIRIUM
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            padding: "9px 20px",
                            borderRadius: 999,
                            border: "1px solid rgba(45,235,232,0.4)",
                            color: "#2DEBE8",
                            fontSize: 18,
                            fontWeight: 600,
                            letterSpacing: "3px",
                            textTransform: "uppercase",
                        }}
                    >
                        Workshop · Audit Trail
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1050 }}>
                    <div style={{ fontSize: 58, fontWeight: 900, color: "#ffffff", lineHeight: 1.08, letterSpacing: "-2px" }}>
                        Audit Trail en Stellar: prueba verificable con Nirium
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 500, color: "#2DEBE8" }}>
                        Firma, ancla y verifica tu primera prueba — en vivo, en mainnet
                    </div>
                </div>

                <div style={{ display: "flex", gap: 20 }}>
                    {[
                        { label: "Workshop 1", date: "Vie 30 oct · 11:00 AM CDMX" },
                        { label: "Workshop 2", date: "Lun 2 nov · 4:00 PM CDMX" },
                    ].map((w) => (
                        <div
                            key={w.label}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                                padding: "16px 24px",
                                borderRadius: 16,
                                border: "1px solid rgba(45,235,232,0.3)",
                                backgroundColor: "rgba(45,235,232,0.06)",
                            }}
                        >
                            <div style={{ display: "flex", fontSize: 16, fontWeight: 700, color: "#2DEBE8", textTransform: "uppercase", letterSpacing: "1px" }}>
                                {w.label}
                            </div>
                            <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: "#ffffff" }}>
                                {w.date}
                            </div>
                        </div>
                    ))}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: 20,
                            color: "rgba(255,255,255,0.55)",
                            paddingLeft: 8,
                        }}
                    >
                        Gratis · Sin instalar nada
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
