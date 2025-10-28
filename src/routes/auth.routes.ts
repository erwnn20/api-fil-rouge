import {Router} from "express";
import {register, login, logout, passwordReset, refresh} from "../controllers/auth.controller";
import * as middleware from "../middleware/auth.middleware";


const authRoutes = Router();

authRoutes.post('/register', middleware.guest, register);
authRoutes.post('/login', middleware.guest, login);
authRoutes.post('/logout', middleware.logged, logout);
authRoutes.post('/refresh', middleware.logged, refresh);
authRoutes.post('/password-reset', passwordReset);

export default authRoutes;