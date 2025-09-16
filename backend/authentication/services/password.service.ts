import {
  encryptPassword,
  generateResetCode,
  validateEmail,
} from "@utils/helpers";
import {
  recoveryCodeRepository,
  RecoveryCodeRepository,
} from "authentication/repositories/recoveryCode.repository";
import {
  sendPasswordChangeConfirmation,
  sendPasswordResetCode,
} from "authentication/services/email.service";
import { userService, UserService } from "./user.service";

class PasswordService {
  private userService: UserService;
  private recoveryCodeRepository: RecoveryCodeRepository;

  constructor(
    userService: UserService,
    codeRepository: RecoveryCodeRepository,
  ) {
    this.userService = userService;
    this.recoveryCodeRepository = codeRepository;
  }

  async sendRecoveryCode(email: string) {
    if (!email) {
      throw new Error("El correo es requerido");
    }

    if (!validateEmail(email)) {
      throw new Error("Formato de correo invalido");
    }

    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new Error("El usuario con ese correo no existe");
    }

    await this.recoveryCodeRepository.invalidateCodes(user.user_id);

    const resetCode = generateResetCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await this.recoveryCodeRepository.create(
      user.user_id,
      resetCode,
      expiresAt,
    );

    // Enviar email con el código de recuperación
    try {
      const emailResult = await sendPasswordResetCode(
        user.email,
        user.first_name,
        resetCode,
      );
      if (!emailResult.success) {
        console.error("Error enviando email:", emailResult.error);
      }
    } catch (err: any) {
      console.error("Error enviando email de recuperación:", err.message);
    }

    return { resetCode, expiresAt, userId: user.user_id };
  }

  async verifyRecoveryCode(userId: number, code: string) {
    if (!userId || !code) {
      throw new Error("Se requiere identificación de usuario y código");
    }

    const record = await this.recoveryCodeRepository.findValid(userId, code);

    if (!record) {
      throw new Error("Código inválido o caducado");
    }

    // No marcar como usado todavía, solo verificar
    // Se marcará como usado cuando se resetee la contraseña

    return { resetId: record.reset_id };
  }

  async resetPassword(resetId: number, newPassword: string) {
    if (!resetId || !newPassword) {
      throw new Error("Se requiere restablecer ID y nueva contraseña");
    }

    if (newPassword.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }

    // Verificar que el resetId existe y es válido
    const record = await this.recoveryCodeRepository.findById(resetId);

    if (!record) {
      throw new Error("ID de restablecimiento no válido");
    }

    if (record.used) {
      throw new Error("Este código de reinicio ya se ha utilizado");
    }

    if (record.expires_at < new Date()) {
      throw new Error("Este código de reinicio ha expirado");
    }

    // Marcar como usado
    await this.recoveryCodeRepository.markAsUsed(resetId);

    // Actualizar contraseña
    const hashedPassword = await encryptPassword(newPassword);
    await this.userService.updateUserPassword(record.user_id!, hashedPassword);

    // Obtener usuario para enviar email de confirmación
    const user = await this.userService.getUserById(record.user_id!);
    if (user) {
      try {
        await sendPasswordChangeConfirmation(user.email, user.first_name);
      } catch (err: any) {
        console.error("Error enviando email de confirmación:", err.message);
      }
    }

    return true;
  }
}

export const passwordService = new PasswordService(
  userService,
  recoveryCodeRepository,
);
