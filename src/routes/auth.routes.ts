import {Router} from "express";
import {register, login, logout, passwordReset, refresh} from "../controllers/auth.controller";
import * as middleware from "../middleware/auth.middleware";
import * as mwZ from "../middleware/zod.middleware";
import * as usr from "../services/user.service";


/**
 * Regroups Authentication features routes
 */
const authRoutes = Router();

authRoutes.post('/register', [
    middleware.guest,
    mwZ.validateBody(usr.CreationRequestSchema)
], register);
authRoutes.post('/login', middleware.guest, login);
authRoutes.post('/logout', middleware.logged, logout);
authRoutes.post('/refresh', middleware.logged, refresh);
authRoutes.post('/password-reset', passwordReset);

export default authRoutes;