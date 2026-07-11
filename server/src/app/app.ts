import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { env } from "../config/env.js";
import { router } from "./routes.js";
import { NotFoundError } from "../shared/errors/index.js";

const app = express();

const allowedOrigins = ['http://localhost:5173'];
// const allowedOrigins = env.CLIENT_ORIGINS?.split(',') || ['http://localhost:5173'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }

        const isAllowedExact = allowedOrigins.includes(origin);

        const isAllowedVercel = origin.endsWith('.vercel.app') &&
            !origin.endsWith('vercel.app'); // Prevents fake-vercel.app


        if (isAllowedExact || isAllowedVercel) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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