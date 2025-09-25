import cors from "cors";
import express, { Application } from "express";
import env from "./config/env";
import authRouter from "authentication/routes/auth.routes";
import passwordRouter from "authentication/routes/password.routes";
import dashboardRouter from "authentication/routes/dashboard.routes";
import eventRouter from "authentication/routes/event.routes";

const app: Application = express();
app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use("/api/auth", authRouter);
app.use("/api/auth", passwordRouter);

// Rutas del dashboard
app.use("/api/dashboard", dashboardRouter);

// Rutas de eventos
app.use("/api/events", eventRouter);

// Endpoint de prueba sin autenticación (temporal)
app.get("/api/test/stats", async (req, res) => {
  try {
    const { dashboardService } = await import("authentication/services/dashboard.service");
    const stats = await dashboardService.getDashboardStats();
    res.json({
      success: true,
      data: stats,
      message: "Endpoint de prueba - sin autenticación"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en endpoint de prueba",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

const PORT: number = env.port || 3001;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
