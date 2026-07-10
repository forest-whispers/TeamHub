export const constants = {
    ACCESS_TOKEN_EXPIRY: "15m",
    REFRESH_TOKEN_EXPIRY: "30d",

    ACCESS_COOKIE_NAME: "accessToken",
    REFRESH_COOKIE_NAME: "refreshToken",

    ACCESS_COOKIE_MAX_AGE: 15 * 60 * 1000,
    REFRESH_COOKIE_MAX_AGE: 30 * 24 * 60 * 60 * 1000,

    EMPTY_DOCUMENT: {
        type: "doc",
        content: [
            {
                type: "paragraph",
            },
        ],
    }
} as const;