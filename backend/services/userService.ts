import User, { UserData, UserRow } from "../models/user";

export const getUserById = async (
  userId: number,
): Promise<UserRow | undefined> => {
  // Puedes agregar validaciones aquí si lo deseas
  const res = await User.findById?.(userId);
  return res;
};

export const getUserByEmail = async (
  email: string,
): Promise<UserRow | undefined> => {
  return await User.findByEmail(email);
};

export const createUser = async (
  userData: UserData,
): Promise<UserRow | undefined> => {
  return await User.create(userData);
};

export const updatePassword = async (
  userId: number,
  newPassword: string,
): Promise<boolean> => {
  return await User.updatePassword(userId, newPassword);
};

// Puedes agregar más métodos según lo necesites
