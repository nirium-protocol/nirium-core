import { ImageResponse } from "next/og";
import type { OgAccent, OgSection } from "./sections";

export const OG_SIZE = { width: 1200, height: 630 };

const ACCENTS: Record<OgAccent, { solid: string; glow: string }> = {
    teal: { solid: "#2DEBE8", glow: "rgba(45,235,232,0.22)" },
    yellow: { solid: "#FDDA24", glow: "rgba(253,218,36,0.18)" },
    emerald: { solid: "#34D399", glow: "rgba(52,211,153,0.20)" },
    sky: { solid: "#60A5FA", glow: "rgba(96,165,250,0.20)" },
    violet: { solid: "#A78BFA", glow: "rgba(167,139,250,0.20)" },
    amber: { solid: "#F59E0B", glow: "rgba(245,158,11,0.18)" },
};

// Esquina del brillo según la ruta, para que dos tarjetas con el mismo acento
// tampoco se vean idénticas.
const CORNERS = ["85% 12%", "12% 14%", "88% 90%", "10% 88%"];
function corner(path: string): string {
    let h = 0;
    for (const c of path) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return CORNERS[h % CORNERS.length];
}

function headlineSize(text: string): number {
    if (text.length <= 24) return 84;
    if (text.length <= 36) return 72;
    if (text.length <= 48) return 62;
    return 56;
}

function Wordmark({ color }: { color: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 16, height: 16, borderRadius: 999, backgroundColor: color }} />
            <div style={{ fontSize: 30, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}>NIRIUM</div>
        </div>
    );
}

function Footer({ path, color }: { path: string; color: string }) {
    return (
        <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.55)" }}>
            <div style={{ display: "flex" }}>nirium.xyz</div>
            <div style={{ display: "flex", color }}>{path}</div>
        </div>
    );
}

export function renderOg(path: string, section: OgSection): ImageResponse {
    if (section.kind === "legal") {
        return new ImageResponse(
            (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        backgroundColor: "#0a0a0a",
                        padding: "64px 72px",
                        fontFamily: "sans-serif",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Wordmark color="rgba(255,255,255,0.7)" />
                        <div style={{ display: "flex", fontSize: 20, letterSpacing: "4px", color: "rgba(255,255,255,0.5)" }}>
                            LEGAL
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                        <div style={{ width: 72, height: 3, backgroundColor: "rgba(255,255,255,0.6)" }} />
                        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, color: "#ffffff", letterSpacing: "-1.5px" }}>
                            {section.document}
                        </div>
                    </div>
                    <Footer path={path} color="rgba(255,255,255,0.75)" />
                </div>
            ),
            { ...OG_SIZE }
        );
    }

    const accent = ACCENTS[section.accent];
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
                    backgroundImage: `radial-gradient(circle at ${corner(path)}, ${accent.glow}, transparent 50%)`,
                    padding: "64px 72px",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Wordmark color={accent.solid} />
                    <div
                        style={{
                            display: "flex",
                            padding: "9px 20px",
                            borderRadius: 999,
                            border: `1px solid ${accent.solid}`,
                            color: accent.solid,
                            fontSize: 20,
                            fontWeight: 600,
                            letterSpacing: "3px",
                            textTransform: "uppercase",
                        }}
                    >
                        {section.kicker}
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1040 }}>
                    <div
                        style={{
                            display: "flex",
                            fontSize: headlineSize(section.headline),
                            fontWeight: 900,
                            color: "#ffffff",
                            lineHeight: 1.06,
                            letterSpacing: "-2px",
                        }}
                    >
                        {section.headline}
                    </div>
                    {section.support ? (
                        <div style={{ display: "flex", fontSize: 32, fontWeight: 500, color: accent.solid, lineHeight: 1.25 }}>
                            {section.support}
                        </div>
                    ) : null}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", maxWidth: 820 }}>
                        {(section.chips ?? []).map((chip) => (
                            <div
                                key={chip}
                                style={{
                                    display: "flex",
                                    padding: "8px 16px",
                                    borderRadius: 999,
                                    border: "1px solid rgba(255,255,255,0.22)",
                                    color: "rgba(255,255,255,0.8)",
                                    fontSize: 21,
                                }}
                            >
                                {chip}
                            </div>
                        ))}
                    </div>
                    <Footer path={path} color={accent.solid} />
                </div>
            </div>
        ),
        { ...OG_SIZE }
    );
}
