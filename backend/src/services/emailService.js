import nodemailer from 'nodemailer';

/**
 * Send an email using Nodemailer.
 * Relies on SMTP environment variables setup in .env.
 * If variables are missing, it silently logs to the console to prevent crashes.
 */
async function sendEmail({ to, subject, html }) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromName = process.env.SMTP_FROM_NAME || 'Timeout HRM';
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@acmehrm.com';

  if (!host || !user || !pass) {
    console.log('\n[EMULATED EMAIL] (Missing SMTP credentials in .env)');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('\nHTML Content:');
    console.log(html);
    console.log('-----------------------------------------------------\n');
    return;
  }

  // Debug: log which SMTP config values are loaded (mask password)
  console.log('[emailService] SMTP config:', {
    host,
    port,
    user,
    passLength: pass ? pass.length : 0,
    fromEmail,
  });

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user,
      pass: pass.replace(/\s/g, ''), // Remove any spaces from App Password
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
    console.log(`[emailService] Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[emailService] SMTP Error details:', {
      code: error.code,
      command: error.command,
      message: error.message,
      responseCode: error.responseCode,
      response: error.response,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export { sendEmail };
