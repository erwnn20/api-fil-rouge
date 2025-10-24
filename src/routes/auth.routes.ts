import {Router} from "express";
import {register, login, logout, passwordReset, refresh} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
authRoutes.post('/refresh', refresh);
authRoutes.post('/password-reset', passwordReset);

export default authRoutes;