import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { env } from "../config/env.js";
import { router } from "./routes.js";
import { NotFoundError } from "../shared/errors/index.js";

const app = express();

export const allowedOrigins = ['http://localhost:5173', 'https://team-hub-gold.vercel.app', 'https://team-hub-git-main-forest-whispers-projects.vercel.app', 'https://team-7ao39bvu9-forest-whispers-projects.vercel.app'];
// const allowedOrigins = env.CLIENT_ORIGINS?.split(',') || ['http://localhost:5173'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
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