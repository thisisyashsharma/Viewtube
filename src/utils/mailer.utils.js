//EU10u2.p1.a1.20ln - Email verification level 2 - nodemailer api handler
import nodemailer from "nodemailer";

console.log("ENV.SMTPhost=", JSON.stringify(process.env.SMTP_HOST));
console.log("ENV.SMTPuser=", JSON.stringify(process.env.SMTP_USER));

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., "smtp.gmail.com"
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false, // true if 465
  requireTLS: true, // upgrade to TLS
  tls: { minVersion: "TLSv1.2", servername: "smtp.gmail.com" },
  auth: {
    user: process.env.SMTP_USER, // full email address
    pass: process.env.SMTP_PASS, // app password
  },
});

mailer
  .verify()
  .then(() => {
    console.log("✅ SMTP ready:", process.env.SMTP_HOST, process.env.SMTP_USER);
  })
  .catch((err) => {
    console.error("❌ SMTP verify failed:", err?.message);
  });

export async function sendMail({ to, subject, html, text }) {
  return mailer.sendMail({
    from: process.env.MAIL_FROM || "no-reply <no-reply@mailer.example>",
    to,
    subject,
    html,
    text,
  });
}

// Guard: fail fast if HOST is accidentally set to an email
if (!process.env.SMTP_HOST || process.env.SMTP_HOST.includes("@")) {
  throw new Error(
    'Bad SMTP_HOST. It must be "smtp.gmail.com", not an email address.'
  );
}

export { mailer };
