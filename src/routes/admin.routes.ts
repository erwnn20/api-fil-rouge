import {Router} from "express";
import * as mwAuth from "../middleware/auth.middleware";
import * as mwRole from "../middleware/role.middleware";
import * as mwZ from "../middleware/zod.middleware";
import * as adm from "../services/admin.service"
import {ban, unban} from "../controllers/admin.controller";

/**
 * Regroups ADMIN features routes
 */
const adminRoutes = Router();

adminRoutes.post('/ban',
    mwAuth.auth,
    mwRole.required("ADMIN"),
    mwZ.validateBody(adm.BanRequestSchema),
    ban
);
adminRoutes.post('/unban',
    mwAuth.auth,
    mwRole.required("ADMIN"),
    mwZ.validateBody(adm.UnBanRequestSchema),
    unban
);

export default adminRoutes;