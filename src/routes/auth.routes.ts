import {Router} from "express";
import {login, logout, passwordReset, refresh, register} from "../controllers/auth.controller";
import * as middleware from "../middleware/auth.middleware";
import * as mwZ from "../middleware/zod.middleware";
import * as auth from "../services/auth.service";


/**
 * Regroups Authentication features routes
 */
const authRoutes = Router();

authRoutes.post('/register',
    middleware.guest,
    mwZ.validateBody(auth.RegisterRequestSchema),
    register
);
authRoutes.post('/login',
    middleware.guest,
    mwZ.validateBody(auth.LoginRequestSchema),
    login
);
authRoutes.post('/logout',
    middleware.logged,
    logout
);
authRoutes.post('/refresh',
    middleware.logged,
    refresh
);
authRoutes.post('/password-reset', passwordReset);

export default authRoutes;