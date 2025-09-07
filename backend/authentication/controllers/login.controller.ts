import { authService } from "authentication/services/auth.service";
import { Request, Response } from "express";

export const login = async (req: Request, res: Response) => {
  try {
    const { user, token } = await authService.login(req.body);

    res
      .status(200)
      .json({ token, role: user.role, firstName: user.first_name });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
