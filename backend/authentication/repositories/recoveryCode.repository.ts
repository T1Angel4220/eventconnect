import { RecoveryCodeData } from "authentication/models/recoveryCode.interface";
import pool from "@config/db";

class RecoveryCodeRepository {
  async create(
    userId: number,
    code: string,
    expiresAt: Date,
  ): Promise<RecoveryCodeData> {
    try {
      const res = await pool.query(
        "INSERT INTO password_reset_codes (user_id, code, expires_at) VALUES ($1, $2, $3) RETURNING reset_id, code, expires_at, created_at",
        [userId, code, expiresAt.toISOString()],
      );
      return res.rows[0];
    } catch (error) {
      console.error("Error creating recovery code:", error);
      throw new Error("Database error creating recovery code");
    }
  }

  async findValid(
    userId: number,
    code: string,
  ): Promise<RecoveryCodeData | undefined> {
    try {
      const res = await pool.query(
        "SELECT * FROM password_reset_codes WHERE user_id = $1 AND code = $2 AND expires_at > NOW() AND used = FALSE ORDER BY created_at DESC LIMIT 1",
        [userId, code],
      );
      return res.rows[0];
    } catch (error) {
      console.error("Error finding valid recovery code:", error);
      throw new Error("Database error finding valid recovery code");
    }
  }

  async markAsUsed(resetId: number): Promise<RecoveryCodeData | undefined> {
    try {
      const res = await pool.query(
        "UPDATE password_reset_codes SET used = TRUE WHERE reset_id = $1 RETURNING *",
        [resetId],
      );
      return res.rows[0];
    } catch (error) {
      console.error("Error marking recovery code as used:", error);
      throw new Error("Database error marking recovery code as used");
    }
  }

  async cleanExpired(): Promise<number | undefined> {
    try {
      const res = await pool.query(
        "DELETE FROM password_reset_codes WHERE expires_at < NOW() OR used = TRUE",
      );
      return res.rowCount ?? 0;
    } catch (error) {
      console.error("Error cleaning expired recovery codes:", error);
      throw new Error("Database error cleaning expired recovery codes");
    }
  }

  async invalidateCodes(userId: number): Promise<number> {
    try {
      const res = await pool.query(
        "UPDATE password_reset_codes SET used = TRUE WHERE user_id = $1 AND used = FALSE",
        [userId],
      );
      return res.rowCount ?? 0;
    } catch (error) {
      console.error("Error invalidating user recovery codes:", error);
      throw new Error("Database error invalidating user recovery codes");
    }
  }
}

export const recoveryCodeRepository = new RecoveryCodeRepository();
export { RecoveryCodeRepository };
