import {NextFunction, Request, Response} from "express";
import db from "../config/db";
import ms from "ms";


/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Gestion admin - ban / unban d'utilisateurs
 */

interface Ban {
    username: string;
    adminName: string;
    startAt?: Date;
    duration?: ms.StringValue | number;
    reason: string;
}


/**
 * @swagger
 * paths:
 *   /admin/ban:
 *     post:
 *       summary: Bannir un utilisateur
 *       description: Creer un nouveau bannisement d'utilisateur. Rôle ADMIN requis.
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
 * @swagger
 * paths:
 *   /admin/unban:
 *     post:
 *       summary: Débanni un utilisateur
 *       description:  Mets fin a tout les bannisement en cours de l'utilisateur. Rôle ADMIN requis.
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
                    endAt: new Date()
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
