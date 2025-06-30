import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;
// Use APP_BASE_URL if set, otherwise default to NEXTAUTH_URL, then to a fallback for safety.
const appBaseUrl = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

let resend: Resend | null = null;

if (resendApiKey) {
  resend = new Resend(resendApiKey);
} else {
  console.warn('RESEND_API_KEY is not set. Email sending will be disabled.');
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  if (!resend) {
    console.error('Resend client is not initialized. RESEND_API_KEY might be missing.');
    // Optionally, simulate success in dev if no API key to not block flow,
    // but for now, let's make it clear it's not sending.
    return { success: false, error: 'Resend client not initialized.', data: null };
  }
  if (!emailFrom) {
    console.error('EMAIL_FROM environment variable is not set.');
    return { success: false, error: 'Email sender address (EMAIL_FROM) is not configured.', data: null };
  }

  try {
    const data = await resend.emails.send({
      from: emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log('Email sent successfully via Resend:', data.id);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return { success: false, error, data: null };
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${appBaseUrl}/auth/verify-email?token=${token}`;
  const subject = 'Verifique seu endereço de e-mail - UTask'; // Added app name for clarity
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h1 style="color: #333;">Confirme seu cadastro na UTask</h1>
      <p>Olá,</p>
      <p>Obrigado por se registrar na UTask. Por favor, clique no link abaixo para verificar seu endereço de e-mail e ativar sua conta:</p>
      <p style="margin: 20px 0;">
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verificar E-mail
        </a>
      </p>
      <p>Ou copie e cole o seguinte URL no seu navegador:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p>Se você não solicitou este e-mail, por favor, ignore-o.</p>
      <br>
      <p>Atenciosamente,</p>
      <p>Equipe UTask</p>
    </div>
  `;

  return sendEmail({ to: email, subject: subject, html: htmlBody });
}
