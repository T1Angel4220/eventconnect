import cors from "cors";
import express, { Application } from "express";
import env from "./config/env";
import authRoutes from "./routes/auth";

const app: Application = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT: number = env.port || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
