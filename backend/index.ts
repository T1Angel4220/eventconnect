import cors from "cors";
import express, { Application } from "express";
import env from "./config/env";
import authRouter from "authentication/routes/auth.routes";
import userRouter from "authentication/routes/user.routes";

const app: Application = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

const PORT: number = env.port || 3001;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
