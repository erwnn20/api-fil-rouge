import jwt from 'jsonwebtoken';
import ms from "ms";
import db from "../config/db";
import {getEnv} from "./env.utils";

export const JWT_ACCESS_SECRET = getEnv('JWT_ACCESS_SECRET');
export const JWT_ACCESS_EXPIRE = getEnv('JWT_ACCESS_EXPIRE') as ms.StringValue;
export const JWT_REFRESH_SECRET = getEnv('JWT_REFRESH_SECRET');
export const JWT_REFRESH_EXPIRE = getEnv('JWT_REFRESH_EXPIRE') as ms.StringValue;

export type Token = string;

export interface Tokens {
    access: string;
    refresh: string;
}

/**
 * Generate an access and a refresh token for a user
 *
 * @param userId User ID for whom the tokens are
 */
export const generateTokens = (userId: number): Tokens => {
    return {
        access: 'Bearer ' + jwt.sign(
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

/**
 * Generates new tokens. Saves the refresh token in the db.
 *
 * @param userId User ID for whom the tokens are
 */
export const generate = async (userId: number): Promise<Tokens> => {
    const tokens = generateTokens(userId);

    await db.jwtRefreshToken.upsert({
        where: {userId},
        update: {
            token: tokens.refresh,
            expiresAt: new Date(Date.now() + ms(JWT_REFRESH_EXPIRE)),
        },
        create: {
            userId,
            token: tokens.refresh,
            expiresAt: new Date(Date.now() + ms(JWT_REFRESH_EXPIRE)),
        },
    });

    return tokens;
};

/**
 * Updates tokens based on a user's refresh token passed as a parameter
 */
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

/**
 * Verifies an access token
 */
export const verify =
    (accessTokens: Token) => jwt.verify(accessTokens, JWT_ACCESS_SECRET);
