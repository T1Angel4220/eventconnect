import nodemailer from "nodemailer";
import env from "../config/env";

async function main(): Promise<void> {
  console.log("EMAIL_USER:", env.email.user); // 👈 debug
  console.log("EMAIL_PASS:", env.email.pass ? "OK" : "NO DEFINIDO");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASS as string,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "sebastianalejandroob20@gmail.com",
    subject: "Prueba ✔",
    text: "Haz sido hackeado",
  });

  console.log("✅ Mensaje enviado:", info.messageId);
}

main().catch(console.error);
