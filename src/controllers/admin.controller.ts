import type {NextFunction, Request, Response} from "express";
import db from "../config/db";
import ms from "ms";

interface Ban {
    username: string;
    adminName: string;
    startAt?: Date;
    duration?: ms.StringValue | number;
    reason: string;
}

export const ban =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data: Ban = req.body;
            data.startAt = data.startAt || new Date();

            const ban = await db.ban.create({
                data: {
                    user: {
                        connect: {username: data.username}
                    },
                    admin: {
                        connect: {username: data.adminName}
                    },
                    startAt: data.startAt,
                    endAt: data.duration
                        ? new Date(data.startAt.getTime() + (typeof data.duration === "number" ? data.duration : ms(data.duration)))
                        : undefined,
                    reason: data.reason,
                },
                select: {
                    user: {
                        select: {
                            firstname: true,
                            lastname: true,
                            email: true,
                            username: true,
                            role: true,
                        }
                    },
                    startAt: true,
                    endAt: true,
                    reason: true,
                },
            });

            res.json({
                message: `User \`${ban.user.username}\` was successfully banned`,
                ban
            });
        } catch (error) {
            next(error);
        }
    };

export const unban =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data: Ban = req.body;
            const now = new Date();

            const result = await db.ban.updateMany({
                where: {
                    user: {username: data.username},
                    startAt: {lte: now},
                    OR: [
                        { endAt: { gt: now } },
                        { endAt: null },
                    ],
                },
                data: {
                    endAt: new Date()
                },
            });

            res.json({
                message: result.count > 0
                    ? `User \`${data.username}\` was successfully unbanned`
                    : `User \`${data.username}\` isn't currently banned`,
            });
        } catch (error) {
            next(error);
        }
    };
