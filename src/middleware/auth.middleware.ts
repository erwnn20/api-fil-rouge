import type {NextFunction, Request, Response} from "express";
import * as jwt from '../utils/jwt.utils';
import db from "../config/db";
import ms from "ms";


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
                if (err.name !== 'TokenExpiredError')
                    return res.status(401).json({
                        error: 'Invalid access token',
                    });

                const refreshToken: jwt.Token = req.cookies.refreshToken;

                try {
                    const user = jwt.verify(refreshToken, jwt.tokenDatas.refresh);

                    const storedToken = await db.jwtRefreshToken.findUnique({
                        where: {
                            userId: (user as any).id,
                            token: refreshToken,
                        }
                    });
                    if (!storedToken)
                        throw new Error("Invalid refresh token");

                    (req as any).user = user;

                    const tokens = await jwt.generate((req as any).user.id);

                    res.cookie('refreshToken', tokens.refresh, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                        maxAge: ms(jwt.tokenDatas.refresh.expiresIn),
                    })

                    const originalJson = res.json.bind(res);
                    res.json = (data) => {
                        data = {
                            ...data,
                            tokenMessage: 'tokens refreshed via refresh token',
                            accessToken: tokens.access,
                        };

                        return originalJson(data);
                    };
                } catch (e) {
                    return res.status(401).json({
                        error: 'Invalid tokens',
                    });
                }
            }

            const now = new Date();
            const user = await db.user.findFirstOrThrow({
                where: {id: (req as any).user.id},
                select: {
                    BansReceived: {
                        where: {
                            startAt: {lte: now},
                            OR: [
                                {endAt: {gt: now}},
                                {endAt: null},
                            ],
                        },
                        select: {
                            endAt: true,
                            reason: true,
                        }
                    },
                }
            });

            // check if the user is not banned
            if (user.BansReceived.length > 0)
                return res.status(403).json({
                    error: 'User logged in currently banned',
                    bans: user.BansReceived,
                });

            return next();
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
