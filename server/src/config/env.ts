import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: Number(process.env.PORT) || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",

    DATABASE_URL: process.env.DATABASE_URL!,

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,

    CLIENT_URL: process.env.CLIENT_URL,
    CLIENT_ORIGINS: process.env.CLIENT_ORIGINS
};