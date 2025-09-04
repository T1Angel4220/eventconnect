import nodemailer from "nodemailer";
import env from "../config/env";

// Configuración del transporter de email
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.email.user || "email",
      pass: env.email.pass || "oshzkgssiwxfdiqr",
    },
  });
};

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Función para enviar código de recuperación
export const sendPasswordResetCode = async (
  email: string,
  firstName: string,
  code: string,
): Promise<EmailResult> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: env.email.user || "noreply@eventconnect.com",
      to: email,
      subject: "Código de Recuperación de Contraseña - Event Connect",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Event Connect</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sistema de Gestión Universitaria</p>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #667eea;">
                <h2 style="color: #333; margin-top: 0;">Hola ${firstName},</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Event Connect.
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #667eea;">
                    <p style="margin: 0; color: #666; font-size: 14px;">Tu código de verificación es:</p>
                    <h1 style="color: #667eea; font-size: 36px; margin: 10px 0; letter-spacing: 8px; font-weight: bold;">${code}</h1>
                </div>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    <strong>Importante:</strong>
                </p>
                <ul style="color: #666; font-size: 14px; line-height: 1.6;">
                    <li>Este código expira en 15 minutos</li>
                    <li>No compartas este código con nadie</li>
                    <li>Si no solicitaste este cambio, ignora este email</li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                    © 2024 Event Connect - Sistema de Gestión Universitaria<br>
                    Este es un email automático, por favor no respondas.
                </p>
            </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email enviado exitosamente:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error("Error enviando email:", error);
    return { success: false, error: error.message };
  }
};

// Función para enviar confirmación de cambio de contraseña
export const sendPasswordChangeConfirmation = async (
  email: string,
  firstName: string,
): Promise<EmailResult> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: env.email.user || "noreply@eventconnect.com",
      to: email,
      subject: "Contraseña Actualizada - Event Connect",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Event Connect</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sistema de Gestión Universitaria</p>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #28a745;">
                <h2 style="color: #333; margin-top: 0;">¡Hola ${firstName}!</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                    Tu contraseña ha sido actualizada exitosamente.
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #28a745;">
                    <p style="margin: 0; color: #28a745; font-size: 18px; font-weight: bold;">
                        ✅ Contraseña actualizada correctamente
                    </p>
                </div>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    Si no realizaste este cambio, por favor contacta al administrador del sistema inmediatamente.
                </p>
            </div>
            <div style="text-align: center; margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                    © 2024 Event Connect - Sistema de Gestión Universitaria<br>
                    Este es un email automático, por favor no respondas.
                </p>
            </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email de confirmación enviado:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error("Error enviando email de confirmación:", error);
    return { success: false, error: error.message };
  }
};
