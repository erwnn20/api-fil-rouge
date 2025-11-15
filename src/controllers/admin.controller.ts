import {NextFunction, Request, Response} from "express";
import db from "../config/db";
import ms from "ms";


/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Gestion admin - ban / unban d'utilisateurs
 */

export interface Ban {
    username: string;
    adminName: string;
    startAt?: Date;
    duration?: ms.StringValue | number;
    reason: string;
}


/**
 * Create a new user ban. ADMIN role required.
 *
 * @swagger
 * paths:
 *   /admin/ban:
 *     post:
 *       summary: Bannir un utilisateur
 *       description: Creer un nouveau bannissement d'utilisateur. Rôle ADMIN requis.
 *       tags: [Admin]
 *       security:
 *         - bearerAuth: []        # avec verification de rôle (ADMIN)
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [username, adminName, reason, startAt]
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "johndoe"
 *                 adminName:
 *                   type: string
 *                   example: "adminMaster"
 *                 startAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-26T12:00:00Z"
 *                 duration:
 *                   type: string
 *                   example: "1h"
 *                 reason:
 *                   type: string
 *                   example: "Comportement inapproprié"
 *
 *       responses:
 *         201:
 *           description: Utilisateur banni avec succes
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "User `johndoe` was successfully banned"
 *                   ban:
 *                     $ref: '#/components/schemas/Ban'
 */
export const ban =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data: Ban = req.body;
            data.startAt = new Date(data.startAt ?? Date.now()); // sets the date at runtime if no 'startAt' date specified

            // create the ban in the db
            const ban = await db.ban.create({
                data: {
                    user: {
                        connect: {username: data.username}
                    },
                    admin: {
                        connect: data.adminName
                            ? {username: data.adminName}
                            : {id: (req as any).user.id}
                    },
                    startAt: data.startAt,
                    endAt: data.duration
                        ? new Date(
                            data.startAt.getTime()
                            + (typeof data.duration === "number"
                                ? data.duration
                                : ms(data.duration)))
                        : undefined,
                    reason: data.reason,
                },
                // select the data retrieved from the db
                select: {
                    user: {
                        select: {
                            id: true,
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

            await db.jwtRefreshToken.deleteMany({
                where: {userId: ban.user.id}
            })

            res.status(201)
                .json({
                    message: `User \`${ban.user.username}\` was successfully banned`,
                    ban
                });
        } catch (error) {
            next(error);
        }
    };


/**
 * Ends all current bans on the user. Admin role required.
 *
 * @swagger
 * paths:
 *   /admin/unban:
 *     post:
 *       summary: Débanni un utilisateur
 *       description:  Mets fin a tout les bannissement en cours de l'utilisateur. Rôle ADMIN requis.
 *       tags: [Admin]
 *       security:
 *         - bearerAuth: []        # avec verification de rôle (ADMIN)
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [username]
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "johndoe"
 *
 *       responses:
 *         200:
 *           description: Utilisateur débanni avec succes ou non banni actuellement
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "User `johndoe` was successfully unbanned"
 */
export const unban =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data: Ban = req.body;
            const now = new Date();

            // set all the endAt of actives bans of the selected user to now
            const result = await db.ban.updateMany({
                where: {
                    user: {username: data.username},
                    startAt: {lte: now},
                    OR: [
                        {endAt: {gt: now}},
                        {endAt: null},
                    ],
                },
                data: {
                    endAt: now
                },
            });

            res.status(200)
                .json({
                    message: result.count > 0
                        ? `User \`${data.username}\` was successfully unbanned`
                        : `User \`${data.username}\` isn't currently banned`,
                });
        } catch (error) {
            next(error);
        }
    };
