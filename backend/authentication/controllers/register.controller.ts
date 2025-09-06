import { UserData } from "authentication/models/userData.interface";
import { userService } from "authentication/services/user.service";
import { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
  try {
    await userService.registerUser(req.body as UserData);
    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    console.error(err);

    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
