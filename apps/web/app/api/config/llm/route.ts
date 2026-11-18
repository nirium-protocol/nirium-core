import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CONFIG_COOKIE = 'nirium_llm_config';

// Hallazgo real (2026-11-03, barrido de seguridad): este POST escribía sin
// NINGÚN auth a la fila compartida `nirium_llm_config` en Supabase, que el
// loop autónomo del agente lee cada 30s para decidir qué LLM usa en cada
// ejecución — incluido lo que propone para Treasury Rebalance. La ruta
// equivalente del agente (`POST /api/config/llm` en server.ts) sí exige
// `authMiddleware + adminMiddleware`; esta ruta pisaba la misma superficie
// sin pasar por ningún gate.
//
// En vez de duplicar `ADMIN_API_KEY` como variable de Vercel (un segundo
// lugar donde ese secreto puede desalinearse del real en Fly), se verifica
// el admin llamando al propio endpoint ya gateado del agente
// (`GET /api/system/health`, authMiddleware + adminMiddleware) con las
// credenciales que mandó quien llama — una sola fuente de verdad para "es
// admin", nunca una copia del secreto en esta app.
const AGENT_URL = (process.env.AGENT_INTERNAL_URL ?? 'https://nirium-agent.fly.dev').replace(/\/$/, '');

async function requireAdmin(request: NextRequest): Promise<boolean> {
    const apiKey = request.headers.get('x-api-key');
    const authHeader = request.headers.get('authorization');
    if (!apiKey && !authHeader) return false;
    try {
        const headers: Record<string, string> = {};
        if (apiKey) headers['x-api-key'] = apiKey;
        if (authHeader) headers['Authorization'] = authHeader;
        const res = await fetch(`${AGENT_URL}/api/system/health`, {
            headers,
            signal: AbortSignal.timeout(5000),
        });
        return res.ok;
    } catch {
        // Un agente inalcanzable nunca debe leerse como "admin confirmado".
        return false;
    }
}

const VALID_PROVIDERS = new Set([
    'nirium', 'openai', 'anthropic', 'ollama',
    'minimax', 'gemini', 'grok', 'bedrock', 'openrouter',
]);

// Providers the agent can't use (no server-side keys); stored in Supabase as-is
// but agent falls back to its env default for these.
const AGENT_INCOMPATIBLE = new Set(['nirium', 'ollama']);

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

async function syncToSupabase(provider: string, model: string): Promise<void> {
    if (!SB_URL || !SB_KEY) return;
    // Use the agent-compatible provider name; incompatible ones keep their value
    // so the agent knows to fall back to its env default.
    await fetch(`${SB_URL}/rest/v1/nirium_llm_config`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: SB_KEY,
            Authorization: `Bearer ${SB_KEY}`,
            Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({ id: 'global', provider, model, updated_at: new Date().toISOString() }),
    });
}

export async function GET(request: NextRequest) {
    const saved = request.cookies.get(CONFIG_COOKIE);
    if (!saved) {
        return NextResponse.json({ provider: 'nirium', model: 'agent-default' });
    }
    try {
        const config = JSON.parse(saved.value);
        if (config.apiKey) config.apiKey = '••••••••';
        return NextResponse.json(config);
    } catch {
        return NextResponse.json({ provider: 'nirium', model: 'agent-default' });
    }
}

export async function POST(request: NextRequest) {
    if (!(await requireAdmin(request))) {
        return NextResponse.json(
            { success: false, message: 'Admin permissions required' },
            { status: 403 },
        );
    }
    try {
        const body = await request.json();
        const { provider, model, apiKey, ollamaUrl } = body;

        if (!provider || !model) {
            return NextResponse.json(
                { success: false, message: 'provider and model are required' },
                { status: 400 },
            );
        }

        if (!VALID_PROVIDERS.has(provider)) {
            return NextResponse.json(
                { success: false, message: `Unknown provider: ${provider}` },
                { status: 400 },
            );
        }

        if (provider !== 'nirium' && provider !== 'ollama' && !apiKey) {
            return NextResponse.json(
                { success: false, message: 'API key required for this provider' },
                { status: 400 },
            );
        }

        const config: Record<string, string> = { provider, model };
        if (apiKey) config.apiKey = apiKey;
        if (ollamaUrl) config.ollamaUrl = ollamaUrl;

        // Sync provider+model to Supabase so the agent picks it up dynamically.
        // API key is intentionally excluded - the agent uses its own Fly.io env vars.
        await syncToSupabase(provider, model);

        const response = NextResponse.json({
            success: true,
            message: `Protocol synced → ${provider} / ${model}`,
        });

        response.cookies.set(CONFIG_COOKIE, JSON.stringify(config), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
        });

        return response;
    } catch {
        return NextResponse.json(
            { success: false, message: 'Invalid payload' },
            { status: 400 },
        );
    }
}

export async function DELETE(request: NextRequest) {
    if (!(await requireAdmin(request))) {
        return NextResponse.json(
            { success: false, message: 'Admin permissions required' },
            { status: 403 },
        );
    }
    // Revert Supabase to the default agent provider
    await syncToSupabase('openrouter', 'meta-llama/llama-4-maverick');

    const response = NextResponse.json({ success: true, message: 'Config cleared' });
    response.cookies.delete(CONFIG_COOKIE);
    return response;
}
