import pool from "../models/db";
import env from "../config/env";

console.log("EMAIL_USER:", env.email.user ? "OK" : "NO DEFINIDO");
console.log("EMAIL_PASS:", env.email.pass ? "OK" : "NO DEFINIDO");

(async () => {
  try {
    const res = await pool.query("SELECT NOW()"); // Consulta simple
    console.log("Conexión exitosa a PostgreSQL:", res.rows[0]);
    process.exit(0);
  } catch (err: any) {
    console.error("Error al conectar a PostgreSQL:", err);
    process.exit(1);
  }
})();
