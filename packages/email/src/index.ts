import { Resend } from "resend";

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function monthlyReportHtml(input: { name: string; month: string; nav: string; mtd: string; ytd: string }) {
  return `<!doctype html><html lang="es"><body style="font-family:Arial,sans-serif;color:#0f1d2e;max-width:560px;margin:auto">
  <h1 style="font-size:20px">Informe mensual EFX · ${escape(input.month)}</h1>
  <p>Hola ${escape(input.name)}, este es el resumen de tu participación.</p>
  <table style="width:100%;border-collapse:collapse">
    <tr><td>NAV por participación</td><td style="text-align:right"><b>${escape(input.nav)}</b></td></tr>
    <tr><td>Rentabilidad del mes</td><td style="text-align:right">${escape(input.mtd)}</td></tr>
    <tr><td>Rentabilidad del año</td><td style="text-align:right">${escape(input.ytd)}</td></tr>
  </table>
  <p style="font-size:12px;color:#5a6b7d">Rentabilidades pasadas no garantizan rentabilidades futuras.</p>
  </body></html>`;
}

export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY no configurada; email omitido:", subject);
    return { skipped: true as const };
  }
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? "EFX <noreply@efx.capital>",
    to,
    subject,
    html,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
  return { skipped: false as const };
}
