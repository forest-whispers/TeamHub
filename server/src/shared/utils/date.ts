import { REFRESH_COOKIE_MAX_AGE } from "../../config/constants.js";

export const getRefreshTokenExpiry = () =>
    new Date(Date.now() + REFRESH_COOKIE_MAX_AGE);