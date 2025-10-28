import {Router} from "express";
import * as mwAuth from "../middleware/auth.middleware";
import * as mwRole from "../middleware/role.middleware";
import {ban, unban} from "../controllers/admin.controller";


const adminRoutes = Router();

adminRoutes.post('/ban', mwAuth.auth, mwRole.required("ADMIN"), ban);
adminRoutes.post('/unban', mwAuth.auth, mwRole.required("ADMIN"), unban);

export default adminRoutes;