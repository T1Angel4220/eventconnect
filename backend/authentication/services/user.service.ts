import { validateEmail } from "@utils/helpers";
import { UserData } from "authentication/models/userData.interface";
import {
  userRepository,
  UserRepository,
} from "authentication/repositories/user.repository";
import bcrypt from "bcryptjs";

class UserService {
  constructor(private userModel: UserRepository) {}

  async registerUser(userData: UserData) {
    const { firstName, lastName, email, password } = userData;

    if (!firstName || !lastName || !email || !password) {
      throw new Error(
        "Todos los campos son obligatorios, para crear el usuario",
      );
    }

    if (!validateEmail(email)) {
      throw new Error("Formato de email inválido");
    }

    if (password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    userData.password = hashedPassword;

    return this.userModel.create(userData);
  }

  async updateUserPassword(userId: number, newPassword: string) {
    return this.userModel.updatePassword(userId, newPassword);
  }

  async getUserById(userId: number) {
    return this.userModel.findById(userId);
  }

  async getUserByEmail(email: string) {
    return this.userModel.findByEmail(email);
  }
}

export const userService = new UserService(userRepository);
export { UserService };
