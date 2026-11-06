import pool from "../config/db";
import env from "../config/env";

console.log("🔍 Verificando conexión a base de datos y configuración...");
console.log("DB_HOST:", env.database.host);
console.log("DB_PORT:", env.database.port);
console.log("DB_NAME:", env.database.name);
console.log("DB_USER:", env.database.user);

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Conexión exitosa a PostgreSQL:", res.rows[0]);
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Error al conectar a PostgreSQL:", err.message || err);
    process.exit(1);
  }
})();
