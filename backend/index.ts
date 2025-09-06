import cors from "cors";
import express, { Application } from "express";
import env from "./config/env";
import authRouter from "authentication/routes/auth.routes";
import passwordRouter from "authentication/routes/password.routes";

const app: Application = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/password", passwordRouter);

const PORT: number = env.port || 3001;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
