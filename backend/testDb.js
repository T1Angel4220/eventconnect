require('dotenv').config();
const pool = require('./models/db');

(async () => {
    try {
        const res = await pool.query('SELECT NOW()'); // Consulta simple
        console.log('Conexión exitosa a PostgreSQL:', res.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error('Error al conectar a PostgreSQL:', err);
        process.exit(1);
    }
})();
