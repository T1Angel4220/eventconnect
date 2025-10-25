import { Router } from "express";
import authMiddleware from "authentication/middlewares/auth.middleware";
import {
  createToken,
  deleteToken,
  getAllTokens,
  getToken,
  updateToken,
} from "tokens/controllers/token.controller";

const tokenRouter: Router = Router();

tokenRouter.get("/", authMiddleware, getAllTokens);
tokenRouter.get("/:id", authMiddleware, getToken);
tokenRouter.post("/", authMiddleware, createToken);
tokenRouter.put("/:id", authMiddleware, updateToken);
tokenRouter.delete("/:id", authMiddleware, deleteToken);

export default tokenRouter;
