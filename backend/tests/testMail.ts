import nodemailer from "nodemailer";
import env from "../config/env";

async function main(): Promise<void> {
  console.log("🔍 Verificando configuración del servicio de correo...");
  console.log("EMAIL_USER:", env.email.user ? `${env.email.user.split("@")[0].slice(0, 3)}***@...` : "NO DEFINIDO");
  console.log("EMAIL_PASS:", env.email.pass ? "CONFIGURADO (OK)" : "NO DEFINIDO");

  if (!env.email.user || !env.email.pass) {
    console.warn("⚠️ Las credenciales de correo no están configuradas en las variables de entorno. Omitiendo prueba.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.email.user,
      pass: env.email.pass,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Conexión con el servidor de correo establecida exitosamente.");
  } catch (error: any) {
    console.error("❌ Falló la autenticación con el servidor SMTP:", error.message || error);
  }
}

main().catch(console.error);
