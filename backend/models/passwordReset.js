const pool = require('./db');

const PasswordReset = {
    // Crear un nuevo código de recuperación
    create: async (userId, code, expiresAt) => {
        const res = await pool.query(
            'INSERT INTO password_reset_codes (user_id, code, expires_at) VALUES ($1, $2, $3) RETURNING reset_id, code, expires_at, created_at',
            [userId, code, expiresAt]
        );
        return res.rows[0];
    },

    // Buscar código válido por usuario y código
    findValidCode: async (userId, code) => {
        const res = await pool.query(
            'SELECT * FROM password_reset_codes WHERE user_id = $1 AND code = $2 AND expires_at > NOW() AND used = FALSE ORDER BY created_at DESC LIMIT 1',
            [userId, code]
        );
        return res.rows[0];
    },

    // Marcar código como usado
    markAsUsed: async (resetId) => {
        const res = await pool.query(
            'UPDATE password_reset_codes SET used = TRUE WHERE reset_id = $1 RETURNING *',
            [resetId]
        );
        return res.rows[0];
    },

    // Limpiar códigos expirados
    cleanExpiredCodes: async () => {
        const res = await pool.query(
            'DELETE FROM password_reset_codes WHERE expires_at < NOW() OR used = TRUE'
        );
        return res.rowCount;
    },

    // Invalidar todos los códigos pendientes de un usuario
    invalidateUserCodes: async (userId) => {
        const res = await pool.query(
            'UPDATE password_reset_codes SET used = TRUE WHERE user_id = $1 AND used = FALSE',
            [userId]
        );
        return res.rowCount;
    }
};

module.exports = PasswordReset;
