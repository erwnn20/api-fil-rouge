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

export const generate = async (userId: number): Promise<Tokens> => {
    const accessToken = jwt.sign(
        {id: userId},
        JWT_ACCESS_SECRET,
        {expiresIn: JWT_ACCESS_EXPIRE}
    );

    const refreshToken = jwt.sign(
        {id: userId},
        JWT_REFRESH_SECRET,
        {expiresIn: JWT_REFRESH_EXPIRE}
    );

    await db.jwtRefreshToken.create({
        data: {
            token: refreshToken,
            userId: userId,
            expiresAt: new Date(Date.now() + ms(JWT_REFRESH_EXPIRE)),
        },
    });

    return {
        access: accessToken,
        refresh: refreshToken,
    };
};

export const refresh = async (tokens: Tokens) => {
    await db.jwtRefreshToken.update({
        where: {token: tokens.refresh},
        data: {expiresAt: new Date(Date.now() + ms(JWT_REFRESH_EXPIRE))}
    });
}

export const verify =
    (accessTokens: Token) => jwt.verify(accessTokens, JWT_ACCESS_SECRET);
