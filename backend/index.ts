import cors from "cors";
import express, { Application } from "express";
import path from "path";
import env from "./config/env";
import pool from "./config/db";
import authRouter from "authentication/routes/auth.routes";
import passwordRouter from "authentication/routes/password.routes";
import dashboardRouter from "authentication/routes/dashboard.routes";
import eventRouter from "authentication/routes/event.routes";
import registrationRouter from "authentication/routes/registration.routes";
import organizerRouter from "authentication/routes/organizer.routes";
import adminRouter from "authentication/routes/admin.routes";
import tokenRouter from "tokens/routes/token.routes";

const app: Application = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (imágenes de perfil)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas de autenticación
app.use("/api/auth", authRouter);
app.use("/api/auth", passwordRouter);

// Rutas del dashboard
app.use("/api/dashboard", dashboardRouter);

// Rutas de eventos
app.use("/api/events", eventRouter);

// Rutas de inscripciones
app.use("/api/registrations", registrationRouter);

// Rutas de organizador (configuración)
app.use("/api/organizer", organizerRouter);

// Rutas de administrador
app.use("/api/admin", adminRouter);

app.use("/api/token", tokenRouter);

// Endpoint de prueba sin autenticación (temporal)
app.get("/api/test/stats", async (req, res) => {
  try {
    const { dashboardService } = await import(
      "authentication/services/dashboard.service"
    );
    const stats = await dashboardService.getDashboardStats();
    res.json({
      success: true,
      data: stats,
      message: "Endpoint de prueba - sin autenticación",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en endpoint de prueba",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const PORT: number = env.port || 3001;

// Probar conexión a la base de datos antes de iniciar el servidor
async function startServer() {
  try {
    console.log("Probando conexión a la base de datos...");
    await pool.query("SELECT 1");
    console.log("Conexión a la base de datos exitosa");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(
        `Base de datos: ${env.database.host}:${env.database.port}/${env.database.name}`,
      );
    });
  } catch (error) {
    console.error("Error conectando a la base de datos:", error);
    console.error(
      "Verifica que PostgreSQL esté corriendo y las credenciales sean correctas",
    );
    process.exit(1);
  }
}

// Manejar errores no capturados
process.on("uncaughtException", (error) => {
  console.error("Error no capturado:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Promesa rechazada no manejada:", reason);
  process.exit(1);
});

startServer();
