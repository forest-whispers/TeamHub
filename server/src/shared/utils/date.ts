import { constants } from "../../config/constants.js";

export const getRefreshTokenExpiry = () =>
    new Date(Date.now() + constants.REFRESH_COOKIE_MAX_AGE);