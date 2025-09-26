import cors from "cors";
import express, { Application } from "express";
import env from "./config/env";
import authRouter from "authentication/routes/auth.routes";
import passwordRouter from "authentication/routes/password.routes";
import eventRouter from "events/routes/event.routes";
import pool from "./config/db";

const app: Application = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/auth", passwordRouter);
app.use("/api", eventRouter);

const PORT: number = env.port || 3001;

// Probar conexión a la base de datos antes de iniciar el servidor
async function startServer() {
  try {
    console.log("🔍 Probando conexión a la base de datos...");
    await pool.query("SELECT 1");
    console.log("✅ Conexión a la base de datos exitosa");
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 Base de datos: ${env.database.host}:${env.database.port}/${env.database.name}`);
    });
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error);
    console.error("🔧 Verifica que PostgreSQL esté corriendo y las credenciales sean correctas");
    process.exit(1);
  }
}

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

startServer();
