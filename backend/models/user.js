const pool = require('./db');

const User = {
    findByEmail: async (email) => {
        const res = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        return res.rows[0];
    }
};

module.exports = User;
