import { authService } from "authentication/services/auth.service.ts";
import { Request, Response } from "express";

export const login = async (req: Request, res: Response) => {
  try {
    const { user, token } = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};
