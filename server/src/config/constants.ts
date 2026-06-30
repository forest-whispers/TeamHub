export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY = "30d";

export const ACCESS_COOKIE_NAME = "accessToken";
export const REFRESH_COOKIE_NAME = "refreshToken";

export const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
export const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

export const EMPTY_DOCUMENT = {
    type: "doc",
    content: [
        {
            type: "paragraph",
        },
    ],
};