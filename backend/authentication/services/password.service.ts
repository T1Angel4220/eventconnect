import { generateResetCode, validateEmail } from "@utils/helpers";
import {
  recoveryCodeRepository,
  RecoveryCodeRepository,
} from "authentication/repositories/recoveryCode.repository";
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

    // const emailResult = await sendPasswordResetCode(
    //   user.email,
    //   user.first_name,
    //   resetCode,
    // );

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
    return true;
  }
}

export const passwordService = new PasswordService(
  userService,
  recoveryCodeRepository,
);
