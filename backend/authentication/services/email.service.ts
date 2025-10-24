import env from "@config/env";
import { EmailResult } from "authentication/models/email.interface";
import nodemailer from "nodemailer";

const EMAIL_FROM = env.email.user || "noreply@eventconnect.com";
const FOOTER_HTML = `
  <div style="text-align: center; margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
    <p style="color: #999; font-size: 12px; margin: 0;">
      © 2024 Event Connect - Sistema de Gestión Universitaria<br>
      Este es un email automático, por favor no respondas.
    </p>
  </div>
`;

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.email.user || "email",
      pass: env.email.pass || "nada",
    },
  });

function getPasswordResetHtml(firstName: string, code: string): string {
  return `
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
      ${FOOTER_HTML}
    </div>
  `;
}

function getPasswordChangeHtml(firstName: string): string {
  return `
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
      ${FOOTER_HTML}
    </div>
  `;
}

function getWelcomeHtml(firstName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #007bff 0%, #6a11cb 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Event Connect</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sistema de Gestión Universitaria</p>
      </div>
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #007bff;">
        <h2 style="color: #333; margin-top: 0;">¡Bienvenido/a ${firstName}!</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Tu registro en Event Connect fue exitoso.<br>
          Ahora puedes acceder y disfrutar de todas las funcionalidades de nuestro sistema.
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #007bff;">
          <p style="margin: 0; color: #007bff; font-size: 18px; font-weight: bold;">
            🎉 ¡Gracias por unirte a nuestra comunidad!
          </p>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Si tienes alguna duda, puedes contactarnos desde la plataforma.
        </p>
      </div>
      ${FOOTER_HTML}
    </div>
  `;
}

function getRegistrationConfirmationHtml(
  firstName: string, 
  eventTitle: string, 
  eventDate: string, 
  eventTime: string,
  eventLocation: string,
  eventType: string,
  eventDuration: string,
  organizerName: string
): string {
  const eventTypeColors: { [key: string]: { gradient: string; icon: string; color: string } } = {
    'academico': { 
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      icon: '📚',
      color: '#667eea'
    },
    'cultural': { 
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
      icon: '🎨',
      color: '#f5576c'
    },
    'deportivo': { 
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
      icon: '⚽',
      color: '#4facfe'
    }
  };

  const typeConfig = eventTypeColors[eventType] || eventTypeColors['academico'];
  
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <!-- Header -->
      <div style="background: ${typeConfig.gradient}; padding: 40px 30px; border-radius: 15px 15px 0 0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="font-size: 48px; margin-bottom: 10px;">${typeConfig.icon}</div>
        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 600;">¡Inscripción Confirmada!</h1>
        <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0; font-size: 18px; font-weight: 300;">Event Connect</p>
      </div>
      
      <!-- Main Content -->
      <div style="background: white; padding: 40px 35px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Greeting -->
        <h2 style="color: #333; margin-top: 0; font-size: 24px; font-weight: 600;">¡Hola ${firstName}! 👋</h2>
        <p style="color: #555; font-size: 17px; line-height: 1.7; margin-bottom: 30px;">
          ¡Excelentes noticias! Tu inscripción al siguiente evento ha sido <strong style="color: ${typeConfig.color};">confirmada exitosamente</strong>.
        </p>
        
        <!-- Event Card -->
        <div style="background: linear-gradient(to right, ${typeConfig.color}15, ${typeConfig.color}05); padding: 30px; border-radius: 12px; border-left: 5px solid ${typeConfig.color}; margin: 25px 0;">
          <h3 style="color: ${typeConfig.color}; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">
            ${typeConfig.icon} ${eventTitle}
          </h3>
          
          <!-- Event Details Grid -->
          <div style="display: grid; gap: 15px;">
            <!-- Date -->
            <div style="display: flex; align-items: start; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="margin-right: 15px; font-size: 24px;">📅</div>
              <div style="flex: 1;">
                <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Fecha</div>
                <div style="color: #333; font-size: 16px; font-weight: 600;">${eventDate}</div>
              </div>
            </div>
            
            <!-- Time -->
            <div style="display: flex; align-items: start; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="margin-right: 15px; font-size: 24px;">⏰</div>
              <div style="flex: 1;">
                <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Hora</div>
                <div style="color: #333; font-size: 16px; font-weight: 600;">${eventTime}</div>
              </div>
            </div>
            
            <!-- Duration -->
            <div style="display: flex; align-items: start; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="margin-right: 15px; font-size: 24px;">⏱️</div>
              <div style="flex: 1;">
                <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Duración</div>
                <div style="color: #333; font-size: 16px; font-weight: 600;">${eventDuration}</div>
              </div>
            </div>
            
            <!-- Location -->
            <div style="display: flex; align-items: start; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="margin-right: 15px; font-size: 24px;">📍</div>
              <div style="flex: 1;">
                <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Ubicación</div>
                <div style="color: #333; font-size: 16px; font-weight: 600;">${eventLocation}</div>
              </div>
            </div>
            
            <!-- Organizer -->
            <div style="display: flex; align-items: start; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="margin-right: 15px; font-size: 24px;">👤</div>
              <div style="flex: 1;">
                <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Organizador</div>
                <div style="color: #333; font-size: 16px; font-weight: 600;">${organizerName}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Success Badge -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0; box-shadow: 0 3px 5px rgba(40, 167, 69, 0.2);">
          <div style="font-size: 40px; margin-bottom: 8px;">✅</div>
          <p style="margin: 0; color: white; font-size: 18px; font-weight: 600;">
            Inscripción Exitosa
          </p>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.95); font-size: 14px;">
            ¡Te esperamos en el evento!
          </p>
        </div>
        
        <!-- Important Info -->
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; color: #856404; font-size: 15px; line-height: 1.6;">
            <strong style="font-size: 16px;">⚠️ Información importante:</strong><br><br>
            • Por favor, llega 10 minutos antes del inicio del evento<br>
            • Puedes cancelar tu inscripción desde la app móvil si es necesario<br>
            • Revisa los detalles del evento en tu sección "Mis Eventos"
          </p>
        </div>
        
        <!-- Footer Message -->
        <p style="color: #666; font-size: 15px; line-height: 1.7; margin: 25px 0 0 0; text-align: center;">
          ¡Gracias por participar en nuestras actividades universitarias!<br>
          <span style="color: ${typeConfig.color}; font-weight: 600;">¡Nos vemos pronto!</span>
        </p>
      </div>
      
      ${FOOTER_HTML}
    </div>
  `;
}

export async function sendPasswordResetCode(
  email: string,
  firstName: string,
  code: string,
): Promise<EmailResult> {
  const transporter = createTransporter();
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: "Código de Recuperación de Contraseña - Event Connect",
    html: getPasswordResetHtml(firstName, code),
  };
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email enviado exitosamente:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error("Error enviando email:", error);
    return { success: false, error: error.message };
  }
}

export async function sendPasswordChangeConfirmation(
  email: string,
  firstName: string,
): Promise<EmailResult> {
  const transporter = createTransporter();
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: "Contraseña Actualizada - Event Connect",
    html: getPasswordChangeHtml(firstName),
  };
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email de confirmación enviado:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error("Error enviando email de confirmación:", error);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(
  email: string,
  firstName: string,
): Promise<EmailResult> {
  const transporter = createTransporter();
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: "¡Bienvenido a Event Connect!",
    html: getWelcomeHtml(firstName),
  };
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email de bienvenida enviado:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error("Error enviando email de bienvenida:", error);
    return { success: false, error: error.message };
  }
}

function getRegistrationCancellationHtml(
  firstName: string, 
  eventTitle: string, 
  eventDate: string, 
  eventTime: string,
  eventLocation: string,
  eventType: string,
  organizerName: string
): string {
  const eventTypeColors: { [key: string]: { gradient: string; icon: string; color: string } } = {
    'academico': { 
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      icon: '📚',
      color: '#667eea'
    },
    'cultural': { 
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
      icon: '🎨',
      color: '#f5576c'
    },
    'deportivo': { 
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
      icon: '⚽',
      color: '#4facfe'
    }
  };

  const typeConfig = eventTypeColors[eventType] || eventTypeColors['academico'];
  
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); padding: 40px 30px; border-radius: 15px 15px 0 0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="font-size: 48px; margin-bottom: 10px;">✖️</div>
        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 600;">Inscripción Cancelada</h1>
        <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0; font-size: 18px; font-weight: 300;">Event Connect</p>
      </div>
      
      <!-- Main Content -->
      <div style="background: white; padding: 40px 35px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Greeting -->
        <h2 style="color: #333; margin-top: 0; font-size: 24px; font-weight: 600;">Hola ${firstName},</h2>
        <p style="color: #555; font-size: 17px; line-height: 1.7; margin-bottom: 30px;">
          Hemos recibido tu solicitud de <strong style="color: #6c757d;">cancelación de inscripción</strong> para el siguiente evento:
        </p>
        
        <!-- Event Card -->
        <div style="background: linear-gradient(to right, #f8f9fa, #e9ecef); padding: 30px; border-radius: 12px; border-left: 5px solid #6c757d; margin: 25px 0;">
          <h3 style="color: #495057; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">
            ${typeConfig.icon} ${eventTitle}
          </h3>
          
          <!-- Event Details Grid -->
          <div style="display: grid; gap: 15px;">
            <!-- Date -->
            <div style="display: flex; align-items: start; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="margin-right: 15px; font-size: 24px;">📅</div>
              <div style="flex: 1;">
                <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Fecha</div>
                <div style="color: #333; font-size: 16px; font-weight: 600;">${eventDate}</div>
              </div>
            </div>
            
            <!-- Time -->
            <div style="display: flex; align-items: start; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="margin-right: 15px; font-size: 24px;">⏰</div>
              <div style="flex: 1;">
                <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Hora</div>
                <div style="color: #333; font-size: 16px; font-weight: 600;">${eventTime}</div>
              </div>
            </div>
            
            <!-- Location -->
            <div style="display: flex; align-items: start; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="margin-right: 15px; font-size: 24px;">📍</div>
              <div style="flex: 1;">
                <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Ubicación</div>
                <div style="color: #333; font-size: 16px; font-weight: 600;">${eventLocation}</div>
              </div>
            </div>
            
            <!-- Organizer -->
            <div style="display: flex; align-items: start; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="margin-right: 15px; font-size: 24px;">👤</div>
              <div style="flex: 1;">
                <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Organizador</div>
                <div style="color: #333; font-size: 16px; font-weight: 600;">${organizerName}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Cancellation Badge -->
        <div style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0; box-shadow: 0 3px 5px rgba(108, 117, 125, 0.2);">
          <div style="font-size: 40px; margin-bottom: 8px;">✅</div>
          <p style="margin: 0; color: white; font-size: 18px; font-weight: 600;">
            Cancelación Procesada
          </p>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.95); font-size: 14px;">
            Tu inscripción ha sido cancelada exitosamente
          </p>
        </div>
        
        <!-- Important Info -->
        <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; color: #0c5460; font-size: 15px; line-height: 1.6;">
            <strong style="font-size: 16px;">ℹ️ Información importante:</strong><br><br>
            • Tu plaza en el evento ha sido liberada<br>
            • Puedes volver a inscribirte si cambias de opinión (siempre que haya cupo)<br>
            • Puedes ver más eventos disponibles en la app móvil
          </p>
        </div>
        
        <!-- Footer Message -->
        <p style="color: #666; font-size: 15px; line-height: 1.7; margin: 25px 0 0 0; text-align: center;">
          Esperamos verte en futuros eventos.<br>
          <span style="color: #6c757d; font-weight: 600;">¡Gracias por usar Event Connect!</span>
        </p>
      </div>
      
      ${FOOTER_HTML}
    </div>
  `;
}

export async function sendRegistrationConfirmation(
  email: string,
  firstName: string,
  eventData: {
    title: string;
    date: string;
    time: string;
    location: string;
    type: string;
    duration: string;
    organizerName: string;
  }
): Promise<EmailResult> {
  const transporter = createTransporter();
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: `✅ Confirmación de Inscripción - ${eventData.title}`,
    html: getRegistrationConfirmationHtml(
      firstName,
      eventData.title,
      eventData.date,
      eventData.time,
      eventData.location,
      eventData.type,
      eventData.duration,
      eventData.organizerName
    ),
  };
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("📧 Email de confirmación de inscripción enviado:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error("❌ Error enviando email de confirmación de inscripción:", error);
    return { success: false, error: error.message };
  }
}

export async function sendRegistrationCancellation(
  email: string,
  firstName: string,
  eventData: {
    title: string;
    date: string;
    time: string;
    location: string;
    type: string;
    organizerName: string;
  }
): Promise<EmailResult> {
  const transporter = createTransporter();
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: `✖️ Cancelación de Inscripción - ${eventData.title}`,
    html: getRegistrationCancellationHtml(
      firstName,
      eventData.title,
      eventData.date,
      eventData.time,
      eventData.location,
      eventData.type,
      eventData.organizerName
    ),
  };
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("📧 Email de cancelación de inscripción enviado:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error("❌ Error enviando email de cancelación de inscripción:", error);
    return { success: false, error: error.message };
  }
}
