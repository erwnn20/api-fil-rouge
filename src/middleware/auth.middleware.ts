import type {NextFunction, Request, Response} from "express";
import * as jwt from '../utils/jwt.utils';
import db from "../config/db";


export const auth =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.header('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer '))
                return res.status(404).json({error: 'Missing access token'});

            const accessToken = authHeader.split(' ')[1];

            try {
                (req as any).user = jwt.verify(accessToken);
            } catch (err: any) {
                    return res.status(401).json({
                        error: err.name === 'TokenExpiredError'
                            ? 'Token expired'
                            : 'Invalid token',
                    });
            }

            const now = new Date();
            const user = await db.user.findFirstOrThrow({
                where: {id: (req as any).user.id},
                select: {
                    BansReceived: {
                        where: {
                            startAt: {lte: now},
                            OR: [
                                { endAt: { gt: now } },
                                { endAt: null },
                            ],
                        },
                        select: {
                            endAt: true,
                            reason: true,
                        }
                    },
                }
            })

            if (user.BansReceived.length > 0)
                return res.status(403).json({
                    error: 'User logged in currently banned',
                    bans: user.BansReceived,
                });

            return next();

            // regen access via refresh token ?
        } catch (error) {
            next(error);
        }
    }

export const guest =
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.header('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

            const accessToken = authHeader.split(' ')[1];

            try {
                jwt.verify(accessToken);
                return res.status(409).json({error: 'Already logged in'});
            } catch {
                return next();
            }

        } catch (error) {
            next(error);
        }
    }

export const logged =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken: jwt.Token = req.cookies.refreshToken;

            if (!refreshToken)
                return res.status(404).json({error: 'Missing refresh token'});

            return next();
        } catch (error) {
            next(error);
        }
    }
