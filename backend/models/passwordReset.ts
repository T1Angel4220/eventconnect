import pool from "./db";

export interface PasswordResetCodeData {
  reset_id: number;
  code: string;
  expires_at: Date;
  created_at: Date;
  user_id?: number;
  used?: boolean;
}

const PasswordResetCode = {
  // Crear un nuevo código de recuperación
  create: async (
    userId: number,
    code: string,
    expiresAt: Date,
  ): Promise<PasswordResetCodeData> => {
    const res = await pool.query(
      "INSERT INTO password_reset_codes (user_id, code, expires_at) VALUES ($1, $2, $3) RETURNING reset_id, code, expires_at, created_at",
      [userId, code, expiresAt.toISOString()],
    );
    return res.rows[0];
  },

  // Buscar código válido por usuario y código
  findValidCode: async (
    userId: number,
    code: string,
  ): Promise<PasswordResetCodeData | undefined> => {
    const res = await pool.query(
      "SELECT * FROM password_reset_codes WHERE user_id = $1 AND code = $2 AND expires_at > NOW() AND used = FALSE ORDER BY created_at DESC LIMIT 1",
      [userId, code],
    );
    return res.rows[0];
  },

  // Marcar código como usado
  markAsUsed: async (resetId: number): Promise<PasswordResetCodeData> => {
    const res = await pool.query(
      "UPDATE password_reset_codes SET used = TRUE WHERE reset_id = $1 RETURNING *",
      [resetId],
    );
    return res.rows[0];
  },

  // Limpiar códigos expirados
  cleanExpiredCodes: async (): Promise<number> => {
    const res = await pool.query(
      "DELETE FROM password_reset_codes WHERE expires_at < NOW() OR used = TRUE",
    );
    return res.rowCount ?? 0;
  },

  // Invalidar todos los códigos pendientes de un usuario
  invalidateUserCodes: async (userId: number): Promise<number> => {
    const res = await pool.query(
      "UPDATE password_reset_codes SET used = TRUE WHERE user_id = $1 AND used = FALSE",
      [userId],
    );
    return res.rowCount ?? 0;
  },
};

export default PasswordResetCode;
