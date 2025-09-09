import { passwordService } from "authentication/services/password.service";
import { Request, Response } from "express";

export const sendRecoveryCode = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const result = await passwordService.sendRecoveryCode(email);

    res.status(200).json({
      message: "Code sent successfully",
      userId: result.userId,
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
    const result = await passwordService.verifyRecoveryCode(userId, code);

    res.status(200).json({
      message: "Code verified successfully",
      resetId: result.resetId,
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
    const { resetId, newPassword } = req.body;

    if (!resetId || !newPassword) {
      return res.status(400).json({ error: "Reset ID and new password are required" });
    }

    await passwordService.resetPassword(resetId, newPassword);

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
