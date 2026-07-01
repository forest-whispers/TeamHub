import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { router } from "./routes.js";
import { NotFoundError } from "../shared/errors/index.js";

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/v1", router);

app.use((req, res, next) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

export default app;