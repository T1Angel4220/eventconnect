import env from "@config/env";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import { UserService, userService } from "./user.service";

const JWT_SECRET = env.jwt.secret as Secret;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

const JWT_EXPIRES_IN = env.jwt.expiresIn as jwt.SignOptions["expiresIn"];

if (!JWT_EXPIRES_IN) {
  throw new Error(
    "JWT_EXPIRES_IN no está definido en las variables de entorno",
  );
}

class AuthService {
  constructor(private userService: UserService) {}

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
      options: { expiresIn: JWT_EXPIRES_IN },
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
