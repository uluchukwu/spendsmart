const nodemailer = require('nodemailer');

/**
 * Send a transactional email via SMTP.
 *
 * Required env vars:
 *   SMTP_HOST  — e.g. smtp.gmail.com
 *   SMTP_PORT  — e.g. 587  (TLS) or 465 (SSL)
 *   SMTP_USER  — sending email address
 *   SMTP_PASS  — SMTP password / app password
 *
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  const port   = parseInt(process.env.SMTP_PORT, 10) || 587;
  const secure = port === 465; // true only for SSL on port 465

  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from:    `"SpendSmart" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
