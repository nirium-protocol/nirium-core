// HTTP 451 - Unavailable For Legal Reasons.
//
// Se sirve por rewrite desde middleware.ts cuando la petición viene de una
// jurisdicción Tier A. Vive FUERA de (app) a propósito: el layout de la app
// monta wallet, red y contextos que no deben ejecutarse para alguien a quien
// no le ofrecemos servicio.
//
// Deliberadamente no es un muro: dice cuál es la lista, por qué, y deja
// abiertos los documentos legales y el correo. Una restricción que no se puede
// leer ni cuestionar se parece más a una falla que a una política.

export const metadata = {
    title: 'Not available in your jurisdiction / No disponible en tu jurisdicción - Nirium',
    robots: { index: false, follow: false },
};

export default async function BlockedPage({
    searchParams,
}: {
    searchParams: Promise<{ c?: string }>;
}) {
    const { c } = await searchParams;
    const country = (c || '').toUpperCase().slice(0, 2);

    // 21-nov-2026: la página estaba solo en inglés y decía "established in Mexico", que sugiere
    // una empresa constituida (/disclaimers: sin persona moral constituida). Sin el contexto de
    // idioma de la app, se muestran los dos idiomas.
    const copy = [
        {
            lang: 'en',
            title: 'Nirium is not available in your jurisdiction',
            restricted: <>Access from {country ? <strong>{country}</strong> : 'your location'} is restricted under our Restricted Jurisdictions &amp; Sanctions Policy. Nirium is a software provider operated from Mexico by its founders, and does not offer its services into comprehensively sanctioned jurisdictions, jurisdictions subject to a Financial Action Task Force call for action, or mainland China.</>,
            notYou: 'This is a restriction on who we serve, not a judgement about you, and it is not a statement that you have done anything wrong. If you believe it applies to you in error - geolocation is imperfect - write to us and we will look at it.',
            funds: 'Nirium never holds user funds. If you already hold a Stellar account, a DeFindex vault or any asset, it is entirely outside our control and remains fully usable without us. Nothing here strands anything of yours.',
            policy: 'Read the full policy →',
        },
        {
            lang: 'es',
            title: 'Nirium no está disponible en tu jurisdicción',
            restricted: <>El acceso desde {country ? <strong>{country}</strong> : 'tu ubicación'} está restringido por nuestra Política de Jurisdicciones Restringidas y Sanciones. Nirium es un proveedor de software que sus fundadores operan desde México, y no ofrece sus servicios en jurisdicciones con sanciones integrales, jurisdicciones sujetas a un llamado a la acción del Grupo de Acción Financiera Internacional (GAFI) ni en China continental.</>,
            notYou: 'Es una restricción sobre a quién atendemos, no un juicio sobre ti, y no dice que hayas hecho nada malo. Si crees que te aplica por error (la geolocalización no es perfecta), escríbenos y lo revisamos.',
            funds: 'Nirium nunca guarda fondos de usuarios. Si ya tienes una cuenta de Stellar, una bóveda de DeFindex o cualquier activo, está totalmente fuera de nuestro control y sigue funcionando sin nosotros. Nada de esto deja atrapado nada tuyo.',
            policy: 'Leer la política completa (en inglés) →',
        },
    ];

    return (
        <main
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: '#05060a',
                color: '#e6e8ee',
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
            }}
        >
            <div style={{ maxWidth: '38rem', lineHeight: 1.65 }}>
                <p
                    style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        fontSize: '0.75rem',
                        letterSpacing: '0.18em',
                        color: '#f5a524',
                        marginBottom: '1.25rem',
                    }}
                >
                    HTTP 451 · UNAVAILABLE FOR LEGAL REASONS
                </p>

                {copy.map((c, i) => (
                    <section
                        key={c.lang}
                        lang={c.lang}
                        style={i > 0 ? { borderTop: '1px solid #1f2430', marginTop: '2.5rem', paddingTop: '2.5rem' } : undefined}
                    >
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.25rem' }}>{c.title}</h1>
                        <p style={{ color: '#a6adbb', marginBottom: '1rem' }}>{c.restricted}</p>
                        <p style={{ color: '#a6adbb', marginBottom: '1rem' }}>{c.notYou}</p>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' }}>{c.funds}</p>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                            <a href="/legal/restricted-jurisdictions-v1.md" style={{ color: '#2dd4bf' }}>{c.policy}</a>
                            <a href="mailto:niriumprotocol@gmail.com" style={{ color: '#2dd4bf' }}>niriumprotocol@gmail.com</a>
                        </div>
                    </section>
                ))}
            </div>
        </main>
    );
}
