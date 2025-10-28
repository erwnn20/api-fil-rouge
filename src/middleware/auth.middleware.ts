import type {NextFunction, Request, Response} from "express";
import * as jwt from '../utils/jwt.utils';
import db from "../config/db";


/**
 * Middleware: check that  the user is logged with a valid token
 */
export const auth =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get the full token form the header
            const authHeader = req.header('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer '))
                return res.status(404).json({error: 'Missing access token'});

            // split to get the token
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

            // check if the user is not banned
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

/**
 * Middleware: check that the user is not logged
 */
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

/**
 * Middleware: check that  the user is logged. does not require a valid token.
 */
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
