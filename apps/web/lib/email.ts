import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Root domain MX moved to ImprovMX 24-oct-2026 (no catch-all - only
// legal@/hola@/hello@ are aliased). If this function ever gets wired up for
// real, change `from` to a send.nirium.xyz address (Resend's own SPF/DKIM
// live there, untouched by the MX change) or add noreply@ as an alias first.
export async function sendEmail({
    to,
    subject,
    html,
    from = 'Nirium <noreply@nirium.xyz>',
}: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
}) {
    return resend.emails.send({ from, to, subject, html });
}
