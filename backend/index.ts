import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/auth";

const app: Application = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT: number = Number(process.env.PORT) || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
