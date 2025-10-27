import type {Request, Response, NextFunction} from 'express';
import * as jwt from '../utils/jwt.utils';
import * as pwd from '../utils/password.utils';
import ms from "ms";
import db from "../config/db";


export const register =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;

            if ((await db.user.count({where: {email: data.email}})) > 0)
                return res.status(401).json({error: 'Email already used'});
            if ((await db.user.count({where: {username: data.username}})) > 0)
                return res.status(401).json({error: 'Username already used'});

            const user = await db.user.create({
                data: {
                    username: data.username,
                    email: data.email,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    password: pwd.hash(data.password),
                },
                select: {
                    id: true,
                    username: true,
                }
            });

            const tokens = await jwt.generate(user.id);

            res.status(201)
                .cookie(
                    'refreshToken',
                    tokens.refresh,
                    {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                        maxAge: ms(jwt.JWT_REFRESH_EXPIRE),
                    }
                ).json({
                message: `User \`${user.username}\` registered successfully`,
                accessToken: tokens.access,
            });
        } catch (error) {
            next(error);
        }
    };

export const login =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const now = new Date();
            const {login, password} = req.body;
            const users = await db.user.findMany({
                where: {
                    OR: [{username: login}, {email: login}],
                },
                select: {
                    id: true,
                    username: true,
                    password: true,
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

            if (users.length !== 1)
                return users.length > 1
                    ? res.status(409).json({
                        error: 'Invalid credentials',
                        details: 'Multiple users have this login information'
                    })
                    : res.status(404).json({
                        error: 'Invalid credentials',
                        details: 'No user with this login information',
                    });
            const user = users[0];

            const match = pwd.compare(password, user.password);
            if (!match) return res.status(401).json({error: 'Invalid password'});

            if (user.BansReceived.length > 0)
                return res.status(403).json({
                    error: 'User currently banned',
                    bans: user.BansReceived,
                });

            const tokens = await jwt.generate(user.id);

            res.status(200)
                .cookie(
                'refreshToken',
                tokens.refresh,
                {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: ms(jwt.JWT_REFRESH_EXPIRE),
                }
            ).json({
                message: `User \`${user.username}\` logged in successfully`,
                accessToken: tokens.access,
            });
        } catch (error) {
            next(error);
        }
    };

export const logout =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {refreshToken} = req.cookies;

            if (refreshToken) {
                await db.jwtRefreshToken.delete({
                    where: {token: refreshToken},
                });

                res.status(200)
                    .clearCookie('refreshToken')
                    .json({
                        message: 'User logged out successfully',
                    });
            }
        } catch (error) {
            next(error);
        }
    };

export const refresh =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken: jwt.Token = req.cookies.refreshToken;
            const newTokens = await jwt.refresh(refreshToken);

            res.status(200)
                .cookie(
                'refreshToken',
                newTokens.refresh,
                {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: ms(jwt.JWT_REFRESH_EXPIRE),
                }
            ).json({
                message: 'Token refreshed successfully',
                accessToken: newTokens.access,
            });
        } catch (error) {
            next(error);
        }
    };

export const passwordReset =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            return res.status(501).json({
                error: 'Not implemented',
            })
        } catch (error) {
            next(error);
        }
    };
