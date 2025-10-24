import type {NextFunction, Request, Response} from "express";
import db from "../config/db";
import {Role} from "@prisma/client";

export const required = (role: Role) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user;
            const user = await db.user.findFirst({
                where: {id: userId},
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