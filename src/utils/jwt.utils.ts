import jwt from 'jsonwebtoken';
import ms from "ms";
import db from "../config/db";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '';
export const JWT_ACCESS_EXPIRE = (process.env.JWT_ACCESS_EXPIRE || '') as ms.StringValue;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
export const JWT_REFRESH_EXPIRE = (process.env.JWT_REFRESH_EXPIRE || '') as ms.StringValue;

export type Token = string;

export interface Tokens {
    access: string;
    refresh: string;
}

const generateTokens = (userId: number): Tokens => {
    return {
        access: jwt.sign(
            {id: userId},
            JWT_ACCESS_SECRET,
            {expiresIn: JWT_ACCESS_EXPIRE}
        ),
        refresh: jwt.sign(
            {id: userId},
            JWT_REFRESH_SECRET,
            {expiresIn: JWT_REFRESH_EXPIRE}
        ),
    }
}

export const generate = async (userId: number): Promise<Tokens> => {
    const tokens = generateTokens(userId);

    await db.jwtRefreshToken.create({
        data: {
            token: tokens.refresh,
            userId: userId,
            expiresAt: new Date(Date.now() + ms(JWT_REFRESH_EXPIRE)),
        },
    });

    return tokens;
};

export const refresh = async (refreshToken: Token): Promise<Tokens> => {
    const token = await db.jwtRefreshToken.findUniqueOrThrow({
        where: {token: refreshToken},
        select: {userId: true},
    });

    const newTokens = generateTokens(token.userId);

    await db.jwtRefreshToken.update({
        where: {token: refreshToken},
        data: {
            token: newTokens.refresh,
            expiresAt: new Date(Date.now() + ms(JWT_REFRESH_EXPIRE))
        }
    });

    return newTokens;
}

export const verify =
    (accessTokens: Token) => jwt.verify(accessTokens, JWT_ACCESS_SECRET);
