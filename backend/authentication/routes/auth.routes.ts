import { Router } from "express";
import { login } from "authentication/controllers/login.controller";
import { register } from "authentication/controllers/register.controller";

const authRouter: Router = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

export default authRouter;
