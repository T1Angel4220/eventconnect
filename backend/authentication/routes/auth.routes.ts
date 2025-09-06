import { Router } from "express";
import { login } from "authentication/controllers/login.controller";

const authRouter: Router = Router();

authRouter.post("/login", login);

export default authRouter;
