import nodemailer from "nodemailer";

const isTest = process.env.NODE_ENV === "test";

const createTransporter = () => {
  if (isTest) {
    return {
      sendMail: async (options) => ({ messageId: "test-mock-id", ...options }),
      verify: async () => true,
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: false,
    requireTLS: true,
    tls: { minVersion: "TLSv1.2", servername: "smtp.gmail.com" },
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const mailer = createTransporter();

if (!isTest) {
  if (mailer.verify) {
    mailer
      .verify()
      .then(() => {
        console.log("✅ SMTP connection verified successfully.");
      })
      .catch((err) => {
        console.error("❌ SMTP verify failed:", err?.message);
      });
  }

  if (!process.env.SMTP_HOST || process.env.SMTP_HOST.includes("@")) {
    console.warn(
      'Warning: Bad SMTP_HOST. It must be "smtp.gmail.com", not an email address.'
    );
  }
}

export async function sendMail({ to, subject, html, text }) {
  return mailer.sendMail({
    from: process.env.MAIL_FROM || "no-reply <no-reply@mailer.example>",
    to,
    subject,
    html,
    text,
  });
}

export { mailer };
