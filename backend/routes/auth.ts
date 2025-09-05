import { Router } from "express";
import {
  login,
  register,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from "../controllers/authController";

const authRouter: Router = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-reset-code", verifyResetCode);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
