import { PasswordResetCodeData } from "../models/passwordReset";
import PasswordResetCode from "../models/passwordReset";

export const createResetCode = async (
  userId: number,
  codeData: string,
  expiresAt: Date,
): Promise<PasswordResetCodeData | undefined> => {
  return await PasswordResetCode.create(userId, codeData, expiresAt);
};

export const getResetCode = async (
  userId: number,
  code: string,
): Promise<PasswordResetCodeData | undefined> => {
  return await PasswordResetCode.findValidCode(userId, code);
};

export const markCodeAsUsed = async (
  resetId: number,
): Promise<PasswordResetCodeData | undefined> => {
  return await PasswordResetCode.markAsUsed(resetId);
};

export const cleanExpiredCodes = async (): Promise<number> => {
  return await PasswordResetCode.cleanExpiredCodes();
};

export const invalidateUserCodes = async (userId: number): Promise<number> => {
  return await PasswordResetCode.invalidateUserCodes(userId);
};
