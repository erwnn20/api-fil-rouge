import type {NextFunction, Request, Response} from "express";
import db from "../config/db";
import {Role} from "@prisma/client";


/**
 * Middleware: Check that the logged user has the correct Role
 *
 * @param {Role} role - The required user role (from Prisma enum)
 */
export const required = (role: Role) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await db.user.findFirst({
                where: {id: (req as any).user.id},
                select: {role: true}
            })
            if (user?.role === role) return next();

            return res.status(403).json({
                error: `${role} role required`,
            });

        } catch (error) {
            next(error);
        }
    }