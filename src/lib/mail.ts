import { Resend } from "resend";
import { email } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: "accounts@laureas.mx",
    to: email,
    subject: "Reset your Laureas password",
    html: baseEmailTemplate({
      title: "Reset your password",
      body: "We received a request to reset your Laureas account password. Click the button below to set a new password. This link will expire in 30 minutes.",
      buttonText: "Reset Password",
      buttonLink: resetLink,
    }),
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: "accounts@laureas.mx",
    to: email,
    subject: "Confirm your Laureas email",
    html: baseEmailTemplate({
      title: "Confirm your email",
      body: "Thanks for signing up to Laureas! Please confirm your email address to activate your account.",
      buttonText: "Confirm Email",
      buttonLink: confirmLink,
    }),
  });
};

function baseEmailTemplate({
  title,
  body,
  buttonText,
  buttonLink,
}: {
  title: string;
  body: string;
  buttonText: string;
  buttonLink: string;
}) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; font-family:'Poppins', Arial, sans-serif; background:#f9fafb; color:#111;">
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table role="presentation" style="max-width:600px; width:100%; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
              <td style="padding:24px; text-align:center; border-bottom:1px solid #eee;">
                <span style="font-size:24px; font-weight:700; color:#111;">Laureas</span>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:32px; text-align:left;">
                <h1 style="font-size:22px; font-weight:600; margin:0 0 16px; color:#111;">${title}</h1>
                <p style="font-size:15px; line-height:1.6; margin:0 0 24px; color:#444;">${body}</p>
                <div style="text-align:center; margin:32px 0;">
                  <a href="${buttonLink}" style="display:inline-block; background:#111; color:#fff; text-decoration:none; padding:14px 28px; border-radius:9999px; font-size:15px; font-weight:600;">
                    ${buttonText}
                  </a>
                </div>
                <p style="font-size:13px; color:#888; margin-top:32px;">If you didn’t request this, you can safely ignore this email.</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:16px; text-align:center; background:#f9fafb; font-size:12px; color:#888;">
                © ${new Date().getFullYear()} Laureas. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
