import nodemailer from "nodemailer";

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

function getTransporter() {
  if (!smtpConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendOtpEmail({ to, code, purpose = "register" }) {
  console.log(`[OTP] ${purpose} ${to} code=${code}`);

  const transporter = getTransporter();
  if (!transporter) {
    console.log("[OTP] SMTP is not configured. Use the console code to complete verification.");
    return { delivered: false };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: "Your Shopecomira verification code",
      text: `Your Shopecomira verification code is ${code}. It expires in 10 minutes. Do not share this code with anyone.`,
      html: `
        <p>Your Shopecomira verification code is:</p>
        <p style="font-size:24px;letter-spacing:4px;font-weight:700">${code}</p>
        <p>This code expires in 10 minutes. Do not share it with anyone.</p>
      `,
    });
    return { delivered: true };
  } catch (err) {
    console.error("[OTP] Failed to send email:", err.message);
    return { delivered: false, error: err.message };
  }
}
