import { Router } from "express";
import {
  sendRecoveryCode,
  verifyRecoveryCode,
  resetPassword,
} from "authentication/controllers/password.controller";
import authMiddleware from "authentication/middlewares/auth.middleware";

const passwordRouter: Router = Router();

passwordRouter.post("/forgot-password", sendRecoveryCode);
passwordRouter.post("/verify-code", verifyRecoveryCode);
passwordRouter.post("/reset-password", authMiddleware, resetPassword);

export default passwordRouter;
