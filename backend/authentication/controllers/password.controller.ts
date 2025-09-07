import { passwordService } from "authentication/services/password.service";
import { Request, Response } from "express";

export const sendRecoveryCode = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    await passwordService.sendRecoveryCode(email);

    res.status(200).json({
      message: "Code sent successfully",
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

export const verifyRecoveryCode = async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;
    const token = await passwordService.verifyRecoveryCode(userId, code);

    res.status(200).json({
      message: "Code verified successfully",
      token,
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

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const token = req.token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { newPassword } = req.body;
    await passwordService.resetPassword(token, newPassword);

    res.status(200).json({
      message: "Password reset successfully",
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
