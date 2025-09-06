import { Router } from "express";
import {
  sendRecoveryCode,
  verifyRecoveryCode,
} from "authentication/controllers/password.controller";

const passwordRouter: Router = Router();

passwordRouter.post("/forgot-password", sendRecoveryCode);
passwordRouter.post("/verify-code", verifyRecoveryCode);

export default passwordRouter;
