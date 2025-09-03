require('dotenv').config({ path: __dirname + '/config/.env' });
const pool = require('../models/db');
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "OK" : "NO DEFINIDO");


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
