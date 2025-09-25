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

const PORT: number = env.port || 3001;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
