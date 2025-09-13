import { JWT_OPTIONS, JWT_SECRET } from "@config/jwtConfig";
import { encryptPassword, validateEmail } from "@utils/helpers";
import { UserData } from "authentication/models/userData.interface";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserService, userService } from "./user.service";
import { sendWelcomeEmail } from "./email.service";

class AuthService {
  constructor(private userService: UserService) {}

  async register(userData: UserData) {
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

    const existingUser = await this.userService.getUserByEmail(email);

    if (existingUser) {
      throw new Error("Email is already in use");
    }

    const hashedPassword = await encryptPassword(password);

    const userDataToCreate: UserData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    };

    const newUser = await this.userService.createUser(userDataToCreate);

    if (newUser) {
      try {
        await sendWelcomeEmail(newUser.email, newUser.first_name);
      } catch (err: any) {
        console.error("Error enviando email de bienvenida:", err.message);
      }
    }

    return newUser;
  }

  async login(data: { email: string; password: string }) {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.password) {
      throw new Error("User has no password set");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new Error("Invalid credentials");
    }

    const tokenData = {
      payload: { userId: user.user_id, role: user.role },
      secret: JWT_SECRET,
      options: JWT_OPTIONS,
    };

    const token = jwt.sign(
      tokenData.payload,
      tokenData.secret,
      tokenData.options,
    );

    return { token, user };
  }
}

export const authService = new AuthService(userService);
