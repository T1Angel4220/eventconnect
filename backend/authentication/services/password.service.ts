import { JWT_OPTIONS, JWT_SECRET } from "@config/jwtConfig";
import {
  encryptPassword,
  generateResetCode,
  validateEmail,
} from "@utils/helpers";
import {
  recoveryCodeRepository,
  RecoveryCodeRepository,
} from "authentication/repositories/recoveryCode.repository";
import jwt from "jsonwebtoken";
import { userService, UserService } from "./user.service";
import {
  sendPasswordResetCode,
  sendPasswordChangeConfirmation,
} from "authentication/services/email.service";

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
      throw new Error("Email is required");
    }

    if (!validateEmail(email)) {
      throw new Error("Invalid email format");
    }

    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
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

    return { resetCode, expiresAt };
  }

  async verifyRecoveryCode(userId: number, code: string) {
    if (!userId || !code) {
      throw new Error("User ID and code are required");
    }

    const record = await this.recoveryCodeRepository.findValid(userId, code);

    if (!record) {
      throw new Error("Invalid or expired code");
    }

    await this.recoveryCodeRepository.markAsUsed(record.reset_id);

    const tempJWTData = {
      payload: { userId },
      secret: JWT_SECRET,
      options: JWT_OPTIONS,
    };

    const token = jwt.sign(
      tempJWTData.payload,
      tempJWTData.secret,
      tempJWTData.options,
    );

    return token;
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new Error("Token and new password are required");
    }

    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };

    if (!payload || !payload.userId) {
      throw new Error("Invalid token");
    }

    const hashedPassword = await encryptPassword(newPassword);

    await this.userService.updateUserPassword(payload.userId, hashedPassword);

    // Obtener usuario para enviar email de confirmación
    const user = await this.userService.getUserById(payload.userId);
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
