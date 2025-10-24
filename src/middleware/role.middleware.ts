import type {NextFunction, Request, Response} from "express";
import db from "../config/db";

export const admin =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user;
            const user = await db.user.findFirst({
                where: {id: userId},
                select: {role: true}
            })
            if (user?.role === 'ADMIN') return next();

            return res.status(403).json({
                error: 'ADMIN role required',
            });

        } catch (error) {
            next(error);
        }
    }