// Contenido de la tarjeta de preview (og:image / twitter:image) de cada ruta
// pública. Cada texto sale de lo que la propia página dice hoy: si la página no
// lo respalda, no va aquí. El diseño vive en lib/og/render.tsx y la imagen la
// sirve app/og/[...slug]/route.tsx; pageMetadata() la enlaza sola por path.

export type OgAccent = "teal" | "yellow" | "emerald" | "sky" | "violet" | "amber";

export type OgSection =
    | {
          kind: "section";
          kicker: string;
          headline: string;
          support?: string;
          chips?: string[];
          accent: OgAccent;
          alt: string;
      }
    | { kind: "legal"; document: string; alt: string };

const legal = (document: string): OgSection => ({ kind: "legal", document, alt: `Nirium - ${document}` });

export const OG_SECTIONS: Record<string, OgSection> = {
    // Tarjeta general del sitio: la usa la home y cualquier ruta sin tarjeta
    // propia (ver DEFAULT_OG_IMAGE en lib/pageMetadata.ts). "/home" no es una
    // página; solo existe para servir /og/home. Texto tomado del hero de la home.
    "/home": {
        kind: "section",
        kicker: "x402 on Stellar",
        headline: "Payment, audit and execution rails on Stellar.",
        support: "For apps, backends and AI agents. Charge per request, prove what the chain doesn't show.",
        chips: ["Non-custodial: your keys, your funds", "Testnet + mainnet"],
        accent: "yellow",
        alt: "Nirium - payment, audit and execution rails on Stellar for apps, backends and AI agents",
    },
    "/verify": {
        kind: "section",
        kicker: "Audit Trail",
        headline: "Verify any receipt yourself.",
        support: "Paste a CID. No account.",
        chips: ["Proves the receipt hasn't changed", "Not that its contents are true"],
        accent: "emerald",
        alt: "Verify any Nirium Audit Trail receipt yourself",
    },
    "/ecosystem": {
        kind: "section",
        kicker: "Ecosystem",
        headline: "Built with Nirium",
        support: "Who integrates with Nirium, and on which network.",
        chips: ["Pollar · testnet", "AgentLedger · testnet", "TIA · mainnet"],
        accent: "violet",
        alt: "Built with Nirium: Pollar and AgentLedger on testnet, TIA on mainnet",
    },
    "/pricing": {
        kind: "section",
        kicker: "Pricing",
        headline: "No surprises. No fine print.",
        support: "Start free. On mainnet, pay per request in USDC on Stellar.",
        chips: ["No card", "Free tier: 10 requests/min"],
        accent: "yellow",
        alt: "Nirium pricing: start free, pay per request in USDC on mainnet",
    },
    "/developers": {
        kind: "section",
        kicker: "Developers",
        headline: "Build on Nirium",
        support: "TypeScript and Python packages, a REST API and an MCP server.",
        chips: ["x402 per-request payments", "npm · PyPI"],
        accent: "teal",
        alt: "Build on Nirium: TypeScript and Python packages, REST API, MCP server",
    },
    "/docs": {
        kind: "section",
        kicker: "Documentation",
        headline: "Verifiable receipts for Stellar payments",
        support: "Audit Trail receipts, Reporting, x402 sellers and the pre-sign policy hook.",
        chips: ["Non-custodial", "Verify it yourself"],
        accent: "sky",
        alt: "Nirium documentation: verifiable receipts for Stellar payments",
    },
    "/how-to-use": {
        kind: "section",
        kicker: "How to use",
        headline: "Getting started with Nirium.",
        support: "An API key, x402 payments, the invite-only Treasury rebalancer and Audit Trail receipts.",
        accent: "sky",
        alt: "How to use Nirium, step by step",
    },
    "/build": {
        kind: "section",
        kicker: "What you can build",
        headline: "Twelve product ideas to prototype on Nirium.",
        support: "Most primitives run on Stellar testnet today.",
        chips: ["Invite-only items are marked"],
        accent: "yellow",
        alt: "Twelve product ideas you can prototype on Nirium",
    },
    "/keys": {
        kind: "section",
        kicker: "API Keys",
        headline: "One API key for testnet and mainnet.",
        support: "Free, tied to your Stellar wallet, proven by signature.",
        accent: "teal",
        alt: "Issue a free Nirium API key tied to your Stellar wallet",
    },
    "/marketplace": {
        kind: "section",
        kicker: "Strategy Marketplace",
        headline: "Planned: auditable treasury policy templates.",
        support: "As Soroban contracts. Not live yet.",
        chips: ["Planned"],
        accent: "violet",
        alt: "Planned Nirium strategy marketplace, not live yet",
    },
    "/agents": {
        kind: "section",
        kicker: "Execution Nodes",
        headline: "What each node does, and what it may sign.",
        support: "And on which network it runs.",
        accent: "teal",
        alt: "Nirium execution nodes: role, signing scope and network",
    },
    "/analytics": {
        kind: "section",
        kicker: "Network Telemetry",
        headline: "Agent activity, linked to its transactions.",
        support: "Panels with sample data are labeled.",
        accent: "sky",
        alt: "Nirium network telemetry: receipts, settlements and agent activity linked to transactions",
    },
    "/dashboard": {
        kind: "section",
        kicker: "Dashboard",
        headline: "Execution feed, vault state and receipts.",
        support: "The operator dashboard, on Stellar testnet.",
        accent: "teal",
        alt: "Nirium operator dashboard on Stellar testnet",
    },
    "/stats": {
        kind: "section",
        kicker: "Usage stats",
        headline: "Usage. Not claims.",
        support: "Read from Horizon, npm, PyPI and GitHub when you load the page.",
        chips: ["Each number links to its query"],
        accent: "emerald",
        alt: "Nirium usage stats, read live from third-party sources",
    },
    "/treasury": {
        kind: "section",
        kicker: "Treasury",
        headline: "Treasury Node",
        support: "USDC and CETES inside a DeFindex vault structured for you to own.",
        chips: ["Autonomous rebalancing on mainnet: invite-only"],
        accent: "amber",
        alt: "Nirium Treasury Node",
    },
    "/treasury/vault": {
        kind: "section",
        kicker: "Treasury",
        headline: "Treasury Vault Console",
        support: "Deploy a DeFindex vault you own. Nirium takes only the RebalanceManager role.",
        chips: ["Autonomous rebalancing on mainnet: invite-only"],
        accent: "amber",
        alt: "Nirium Treasury Vault Console",
    },
    "/treasury/builder": {
        kind: "section",
        kicker: "Treasury",
        headline: "Treasury Strategy Builder",
        support: "A preview canvas to compose a treasury strategy.",
        chips: ["Preview"],
        accent: "amber",
        alt: "Nirium Treasury Strategy Builder (preview)",
    },
    "/payouts": {
        kind: "section",
        kicker: "Disbursements",
        headline: "Payouts",
        support: "Up to 100 recipients in one Stellar transaction. Nirium builds it, you sign it.",
        chips: ["Invite-only on mainnet"],
        accent: "sky",
        alt: "Nirium Payouts",
    },
    "/ramp": {
        kind: "section",
        kicker: "SPEI onramp",
        headline: "MXN to CETES",
        support: "Through Etherfuse, an independent operator. Test environment: no real funds move.",
        chips: ["KYC/KYB required"],
        accent: "amber",
        alt: "MXN to CETES through Etherfuse, test environment",
    },
    "/security": {
        kind: "section",
        kicker: "Security",
        headline: "Who holds the keys.",
        support: "What the agent can and cannot sign, and how vaults are controlled.",
        accent: "emerald",
        alt: "Nirium security: who holds the keys",
    },
    "/compliance": {
        kind: "section",
        kicker: "Audit Trail",
        headline: "Hashed, anchored on IPFS, exported as JSON.",
        support: "Records you choose to anchor, so anyone can check them.",
        chips: ["SHA-256", "IPFS", "Opt-in per call"],
        accent: "emerald",
        alt: "Nirium Audit Trail: hashed, anchored on IPFS, exported as JSON",
    },
    "/pollar-adapter-documentation": {
        kind: "section",
        kicker: "Integration notes",
        headline: "Nirium × Pollar",
        support: "How nirium-pollar-adapter lets a Pollar social-login wallet pay over x402.",
        chips: ["nirium-pollar-adapter"],
        accent: "violet",
        alt: "Nirium and Pollar integration notes",
    },
    "/branding-nirium": {
        kind: "section",
        kicker: "Brand assets",
        headline: "Nirium brand assets pack",
        support: "SVG and PNG at every resolution, plus the full ZIP.",
        accent: "yellow",
        alt: "Nirium brand assets pack",
    },
    "/branding-nirium-play": {
        kind: "section",
        kicker: "Brand assets",
        headline: "Nirium Play logo pack",
        support: "The Nirium mark for the Play sub-brand, in SVG and PNG.",
        accent: "violet",
        alt: "Nirium Play logo pack",
    },
    "/blog": {
        kind: "section",
        kicker: "Blog",
        headline: "Field notes",
        support: "Building Nirium on Stellar: engineering, events and results you can verify.",
        accent: "teal",
        alt: "Nirium blog: field notes",
    },
    "/blog/bbva-open-deal-room": {
        kind: "section",
        kicker: "Blog · May 21, 2026",
        headline: "Nirium at The Open Deal Room by Stellar",
        support: "One of six Stellar startups at La Arena, BBVA Tower CDMX.",
        accent: "sky",
        alt: "Nirium at The Open Deal Room by Stellar",
    },
    "/blog/treasury-node-verify-it-yourself": {
        kind: "section",
        kicker: "Blog · Aug 6, 2026",
        headline: "The Treasury Node on mainnet: verify the contract.",
        support: "The agent's vault role can't withdraw funds, by the contract's own code.",
        accent: "amber",
        alt: "The Treasury Node on mainnet: verify the contract",
    },
    "/blog/codigo-402-agentes-que-pagan": {
        kind: "section",
        kicker: "Blog · Nov 6, 2026",
        headline: "Build an API that charges. An agent that pays.",
        support: "Free, 5-session Stellar bootcamp with BAF. Nov 10-27, 100% online.",
        accent: "teal",
        alt: "Codigo 402: free Stellar x402 bootcamp with BAF and Nirium",
    },
    "/terms": legal("Terms of Service"),
    "/privacy": legal("Privacy Policy"),
    "/disclaimers": legal("Legal Disclaimers"),
    "/risk-disclosure": legal("Risk Disclosure"),
    "/coc": legal("Code of Conduct"),
};

// URL de la imagen de una ruta, o undefined si la ruta no tiene tarjeta propia.
// El ?v= cambia la URL cuando cambia el diseño, para que Discord/X no sirvan la
// tarjeta vieja desde su caché.
export const OG_VERSION = "2";
export function ogImageUrl(path: string): string | undefined {
    return OG_SECTIONS[path] ? `/og${path}?v=${OG_VERSION}` : undefined;
}
