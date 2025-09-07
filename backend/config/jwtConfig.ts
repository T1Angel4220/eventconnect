import env from "@config/env";
import jwt, { Secret } from "jsonwebtoken";

const JWT_SECRET = env.jwt.secret as Secret;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const JWT_EXPIRES_IN = env.jwt.expiresIn as jwt.SignOptions["expiresIn"];

if (!JWT_EXPIRES_IN) {
  throw new Error("JWT_EXPIRES_IN is not defined in environment variables");
}

const JWT_OPTIONS: jwt.SignOptions = {
  expiresIn: JWT_EXPIRES_IN,
};

export { JWT_SECRET, JWT_OPTIONS };
