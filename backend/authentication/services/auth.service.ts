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
    const { firstName, lastName, email, password, role } = userData;

    if (!firstName || !lastName || !email || !password) {
      throw new Error("Todos los campos son requeridos");
    }

    if (!validateEmail(email)) {
      throw new Error("El formato del correo es incorrecto");
    }

    if (password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }

    const existingUser = await this.userService.getUserByEmail(email);

    if (existingUser) {
      throw new Error("El correo ya esta en uso");
    }

    const hashedPassword = await encryptPassword(password);

    const userDataToCreate: UserData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "participant", // Por defecto es participant
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
      throw new Error("Correo y contraseña requerido");
    }

    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new Error("El correo no existe");
    }

    if (!user.password) {
      throw new Error("El usuario no tiene contraseña establecida");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new Error("Contraseña Incorrecta");
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
