import type {Request, Response, NextFunction} from 'express';
import bcrypt from 'bcrypt';
import * as jwt from '../utils/jwt.utils';
import ms from "ms";
import db from "../config/db";


const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

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
                    password: await bcrypt.hash(data.password, BCRYPT_ROUNDS),
                },
            });

            const tokens = await jwt.generate(user.id);

            res.cookie('refreshToken', tokens.refresh, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: ms(jwt.JWT_REFRESH_EXPIRE),
            }).json({
                message: 'User registered successfully',
                accessToken: tokens.access,
                user
            });
        } catch (error) {
            next(error);
        }
    };

export const login =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {login, password} = req.body;
            const users = await db.user.findMany({
                where: {
                    OR: [{username: login}, {email: login}],
                }
            });

            if (users.length !== 1)
                return res.status(401).json({
                    error: 'Invalid credentials',
                    details: users.length > 1
                        ? 'Multiple users have this login information'
                        : 'No user with this login information',
                })
            const user = users[0];

            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(401).json({error: 'Invalid password'});

            const tokens = await jwt.generate(user.id);

            res.cookie('refreshToken', tokens.refresh, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: ms(jwt.JWT_REFRESH_EXPIRE),
            }).json({
                message: 'User logged in successfully!',
                accessToken: tokens.access,
                user
            });
        } catch (error) {
            next(error);
        }
    };

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {refreshToken} = req.cookies;

        if (refreshToken) {
            await db.jwtRefreshToken.delete({
                where: {token: refreshToken},
            });

            res.clearCookie('refreshToken')
                .json({
                    message: 'User logged out successfully!',
                });
        }
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const tokens: jwt.Tokens = data.tokens;
        await jwt.refresh(tokens);

        res.json({
            message: 'Token refreshed successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const passwordReset = async (req: Request, res: Response, next: NextFunction) => {
    try {

        return res.status(501).json({
            error: 'Not implemented',
        })
        // res.json({message: '',});
    } catch (error) {
        next(error);
    }
};
