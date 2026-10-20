// src/lib/mailer.ts
// Transactional email via SMTP (Gmail app password by default).
// Requires env: SMTP_USER + SMTP_PASS. Optionally SMTP_HOST / SMTP_PORT.
// Returns { sent: false } when not configured so callers can degrade honestly.
import nodemailer from 'nodemailer';

export function mailerConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendPasswordResetEmail(
  toEmail: string,
  resetUrl: string
): Promise<{ sent: boolean; reason?: string }> {
  if (!mailerConfigured()) {
    console.warn('[mailer] SMTP not configured — reset email not sent to', toEmail);
    return { sent: false, reason: 'not_configured' };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: (process.env.SMTP_PORT || '465') === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"Pawsitive Stays" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Reset your Pawsitive Stays password 🐾',
      text: [
        'Hi pet parent!',
        '',
        'We received a request to reset your Pawsitive Stays password.',
        'Tap the link below within 60 minutes to choose a new one:',
        '',
        resetUrl,
        '',
        "If you didn't request this, you can safely ignore this email — your password won't change.",
        '',
        '— The Pawsitive Stays pack',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
          <h2 style="margin:0 0 8px">Reset your password 🐾</h2>
          <p style="color:#334155;line-height:1.5">We received a request to reset your Pawsitive Stays password. Tap the button within <strong>60 minutes</strong> to choose a new one:</p>
          <p style="margin:24px 0">
            <a href="${resetUrl}" style="background:#f59e0b;color:#0f172a;font-weight:bold;padding:12px 22px;border-radius:12px;text-decoration:none">Choose a New Password</a>
          </p>
          <p style="color:#64748b;font-size:13px;line-height:1.5">If you didn't request this, you can safely ignore this email — your password won't change.</p>
          <p style="color:#64748b;font-size:13px">— The Pawsitive Stays pack</p>
        </div>`,
    });
    return { sent: true };
  } catch (error) {
    console.error('[mailer] Failed to send reset email:', error);
    return { sent: false, reason: 'send_failed' };
  }
}
