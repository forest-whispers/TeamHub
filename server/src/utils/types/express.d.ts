import { AuthUser } from "../../features/auth/types.js";

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export { };