// emailSender.js (par exemple)

import nodemailer from "nodemailer";

export default async function sendEmail({ to, subject, text, html }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
      html,
    };
    console.info("Mail Options:", mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.info("Email envoyé avec succès : %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    throw new Error("Une erreur est survenue lors de l'envoi de l'email.");
  }
}
