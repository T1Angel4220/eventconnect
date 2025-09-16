import cors from "cors";
import express, { Application } from "express";
import env from "./config/env";
import authRouter from "authentication/routes/auth.routes";
import passwordRouter from "authentication/routes/password.routes";
import eventRouter from "events/routes/event.routes";

const app: Application = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/auth", passwordRouter);
app.use("/api", eventRouter);

const PORT: number = env.port || 3001;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
