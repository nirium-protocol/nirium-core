import type { Metadata } from "next";
import { Inter, Inconsolata } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";
import RefCapture from "@/components/analytics/RefCapture";
import { Analytics } from "@vercel/analytics/next";
import { OG_SECTIONS, ogImageUrl } from "@/lib/og/sections";

// Tarjeta general (lib/og/sections.ts "/home"), la misma que usan las rutas sin tarjeta propia.
const HOME_OG_IMAGE = ogImageUrl("/home") ?? "/og-image.png";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const inconsolata = Inconsolata({ subsets: ["latin"], variable: "--font-inconsolata" });

export const metadata: Metadata = {
    metadataBase: new URL('https://nirium.xyz'),
    title: {
        default: "Nirium | Payment, audit and execution rails on Stellar",
        template: "%s | Nirium"
    },
    description: "Non-custodial payment, audit and execution rails for apps, backends and AI agents on Stellar. x402 per-request billing, verifiable receipts on IPFS and reporting. Your keys, your funds. Not financial advice.",
    keywords: ["Stellar", "x402", "MPP", "AI agents", "agent economy", "machine payments", "Soroban", "Nirium", "audit trail", "non-custodial", "Stellar mainnet", "micropayments"],
    authors: [{ name: "Nirium Core" }],
    creator: "Nirium",
    publisher: "Nirium Protocol",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: [
            { url: "/brand/icon.svg", type: "image/svg+xml" },
            { url: "/brand/icon-solid-512.png", type: "image/png", sizes: "512x512" },
        ],
        shortcut: "/favicon.ico",
        apple: "/brand/apple-icon.png",
    },
    openGraph: {
        title: "Nirium | Payment, audit and execution rails on Stellar",
        description: "Non-custodial payment, audit and execution rails for apps, backends and AI agents on Stellar. x402 per-request billing, verifiable receipts on IPFS and reporting. Your keys, your funds. Not financial advice.",
        url: "https://nirium.xyz",
        siteName: "Nirium",
        images: [
            {
                url: HOME_OG_IMAGE,
                width: 1200,
                height: 630,
                alt: OG_SECTIONS["/home"].alt,
            }
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Nirium | Payment, audit and execution rails on Stellar",
        description: "Non-custodial payment, audit and execution rails for apps, backends and AI agents on Stellar. x402 per-request billing, verifiable receipts on IPFS and reporting. Your keys, your funds. Not financial advice.",
        creator: "@Niriumstellar",
        images: [HOME_OG_IMAGE],
    },
};

import MarketTicker from "@/components/dashboard/MarketTicker";
import TestnetBanner from "@/components/layout/TestnetBanner";
import ChatBot from "@/components/ui/ChatBot";
import TopChromeAutoHide from "@/components/layout/TopChromeAutoHide";
import ChromeGate from "@/components/layout/ChromeGate";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Nirium Protocol",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web",
        "url": "https://nirium.xyz",
        "description": "Non-custodial payment, audit and execution rails for apps, backends and AI agents on Stellar. x402 per-request billing, verifiable receipts on IPFS and reporting. Your keys, your funds. Not financial advice.",
        "creator": {
            "@type": "Organization",
            "name": "Nirium Core"
        },
        "potentialAction": {
            "@type": "InteractAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://nirium.xyz/dashboard",
                "actionPlatform": [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/MobileWebPlatform"
                ]
            },
            "name": "Explore Nirium on Stellar"
        }
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('nirium_theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
                    }}
                />
            </head>
            <body className={`${inter.variable} ${inconsolata.variable} font-sans bg-background text-zinc-900 dark:text-white min-h-screen selection:bg-stellar-teal/30 scroll-smooth overflow-x-hidden`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <Providers>
                    <RefCapture />
                    <ChromeGate>
                        <TestnetBanner />
                        <MarketTicker />
                    </ChromeGate>
                    {/* Background Layers */}
                    <div className="fixed inset-0 z-[-1] bg-[url('/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                    <div className="fixed inset-0 z-[-2] bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#050505] dark:via-[#0A0A0A] dark:to-[#050505] pointer-events-none transition-colors duration-500"></div>
                    <div className="fixed inset-0 z-[-3] bg-[radial-gradient(circle_at_50%_50%,rgba(138,43,226,0.05),transparent_50%)] pointer-events-none"></div>

                    {children}
                    <ChromeGate>
                        <ChatBot />
                        <TopChromeAutoHide />
                    </ChromeGate>
                    <Toaster position="bottom-right" theme="system" />
                </Providers>
                <Analytics />
            </body>
        </html>
    );
}
