const pool = require('./db');

const User = {
    findByEmail: async (email) => {
        const res = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        return res.rows[0];
    },
    
    create: async (userData) => {
        const { firstName, lastName, email, password, role = 'organizer' } = userData;
        const res = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, first_name, last_name, email, role, created_at',
            [firstName, lastName, email, password, role]
        );
        return res.rows[0];
    }
};

module.exports = User;
