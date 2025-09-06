import { validateEmail } from "@utils/helpers";
import { UserData } from "authentication/models/userData.interface";
import User from "authentication/models/userModel";
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
      throw new Error("All fields are required");
    }

    if (!validateEmail(email)) {
      throw new Error("Email format is invalid");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    const existingUser = await this.userModel.findByEmail(email);

    if (existingUser) {
      throw new Error("Email is already in use");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser: User = new User(firstName, lastName, email, hashedPassword);

    return this.userModel.create(newUser);
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
