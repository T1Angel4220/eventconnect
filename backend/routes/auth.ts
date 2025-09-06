import { Router } from "express";
import {
  login,
  register,
  sendResetCode,
  verifyResetCode,
  resetPassword,
} from "../controllers/authController";

const authRouter: Router = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/forgot-password", sendResetCode);
authRouter.post("/verify-reset-code", verifyResetCode);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
