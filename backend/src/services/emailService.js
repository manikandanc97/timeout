import nodemailer from 'nodemailer';
import { logger } from './loggerService.js';
import prisma from '../prismaClient.js';

/**
 * Send an email using Nodemailer.
 * Prefers Organization-specific SMTP settings from the database.
 * Falls back to environment variables setup in .env.
 */
async function sendEmail({ to, subject, html, organizationId = null }) {
  let host = process.env.SMTP_HOST;
  let port = process.env.SMTP_PORT || 587;
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;
  let fromName = process.env.SMTP_FROM_NAME || 'Timeout HRM';
  let fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@timeout-hrm.com';
  let secure = Number(port) === 465;

  // ─── DB Override Phase ──────────────────────────────────────────────────
  if (organizationId) {
    try {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { adminSettings: true, name: true },
      });

      if (org?.adminSettings && typeof org.adminSettings === 'object') {
        const smtp = org.adminSettings.smtpSettings;
        if (smtp && smtp.host && smtp.user) {
          host = smtp.host;
          port = smtp.port || port;
          user = smtp.user;
          pass = smtp.pass || pass;
          secure = smtp.secure !== undefined ? smtp.secure : secure;
          fromEmail = smtp.fromEmail || fromEmail;
          fromName = org.name || fromName;
          
          logger.info(`[emailService] Using DB-backed SMTP for org ${organizationId}: ${host}`);
        }
      }
    } catch (err) {
      console.error(`[emailService] Failed to fetch org ${organizationId} SMTP settings:`, err.message);
    }
  }

  if (!host || !user || !pass) {
    console.log('\n[EMULATED EMAIL] (No SMTP credentials available)');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('\nHTML Content (truncated):');
    console.log(html.substring(0, 200) + '...');
    console.log('-----------------------------------------------------\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Boolean(secure),
    auth: {
      user,
      pass: pass.replace(/\s/g, ''), // App Passwords often have spaces
    },
  });

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`[emailService] Email sent successfully to ${to}`, { messageId: info.messageId });
    return info;
  } catch (error) {
    console.error('[emailService] SMTP Error:', {
      code: error.code,
      message: error.message,
      host,
      user,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export { sendEmail };
