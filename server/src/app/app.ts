import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { env } from "../config/env.js";
import { router } from "./routes.js";
import { NotFoundError } from "../shared/errors/index.js";

const app = express();

const allowedOrigins = env.CLIENT_ORIGINS?.split(',') || ['http://localhost:3000'];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    }
));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/v1", router);

app.use((req, res, next) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

export default app;