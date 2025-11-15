import type {Request, Response, NextFunction} from 'express';
import * as jwt from '../utils/jwt.utils';
import * as pwd from '../utils/password.utils';
import ms from "ms";
import db from "../config/db";


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gestion de l'enregistrement et de la connection des utilisateurs
 */


/**
 * Log in a new user. Non-logged in user only.
 *
 * @swagger
 * paths:
 *   /auth/register:
 *     post:
 *       summary: Enregistre un nouvel utilisateur
 *       description: Connecte un nouvel utilisateur. Utilisateur non connectés seulement.
 *       tags: [Auth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [username, email, password, lastname]
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "johndoe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "johndoe@mail.com"
 *                 firstname:
 *                   type: string
 *                   nullable: true
 *                   example: "John"
 *                 lastname:
 *                   type: string
 *                   example: "Doe"
 *                 password:
 *                   type: string
 *                   format: password
 *                   example: "mysecurepassword123"
 *
 *       responses:
 *         201:
 *           description: Utilisateur enregistré avec succes
 *           headers:
 *             Set-Cookie:
 *               schema:
 *                 type: string
 *                 example: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "User `johndoe` registered successfully"
 *                   accessToken:
 *                     type: string
 *                     example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         401:
 *           description: Email ou username deja utilisé
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: "Email already used"
 */
export const register =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;

            if ((await db.user.count({where: {email: data.email}})) > 0)
                return res.status(401).json({error: 'Email already used'});
            if ((await db.user.count({where: {username: data.username}})) > 0)
                return res.status(401).json({error: 'Username already used'});

            // create the user in the database
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
                )
                // .set('Authorization', tokens.access)
                .json({
                    message: `User \`${user.username}\` registered successfully`,
                    accessToken: tokens.access,
                });
        } catch (error) {
            if (error instanceof pwd.PasswordError)
                return res.status(400).json({
                    error: {
                        name: error.name,
                        details: error.errors
                    }
                });

            next(error);
        }
    };


/**
 * Authenticates a user with their username or email and password.
 * Non-logged in users only.
 *
 * @swagger
 * paths:
 *   /auth/login:
 *     post:
 *       summary: Authentification d'un utilisateur
 *       description: >
 *         Authentifie un utilisateur avec son nom d'utilisateur **ou** son e-mail et son mot de passe.
 *         Utilisateur non connectés seulement.
 *       tags: [Auth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [login, password]
 *               properties:
 *                 login:
 *                   type: string
 *                   example: "johndoe"
 *                   description: username ou email de l'utilisateur
 *                 password:
 *                   type: string
 *                   example: "mysecurepassword123"
 *
 *       responses:
 *         200:
 *           description: Successful login
 *           headers:
 *             Set-Cookie:
 *               schema:
 *                 type: string
 *                 example: "refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6...; HttpOnly; Secure; SameSite=Strict"
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "User `johndoe` logged in successfully"
 *                   accessToken:
 *                     type: string
 *                     example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *         401:
 *           description: Mot de passe incorrect
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: "Invalid password"
 *         403:
 *           description: Utilisateur actuellement banni
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: "User currently banned"
 *                   bans:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         ban:
 *                           $ref: '#/components/schemas/Ban'
 *         404:
 *           description: Utilisateur introuvable
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: "Invalid credentials"
 *                   details:
 *                     type: string
 *                     example: "No user with this login information"
 *         409:
 *           description: Plusieurs utilisateurs avec les mêmes informations d'identification
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: "Invalid credentials"
 *                   details:
 *                     type: string
 *                     example: "Multiple users have this login information"
 */
export const login =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const now = new Date();
            const {login, password} = req.body;

            // finds all users with matching credentials
            const users = await db.user.findMany({
                where: {
                    OR: [{username: login}, {email: login}],
                },
                // select the data retrieved from the db
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

            // check if the user is banned
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
                )
                // .set('Authorization', tokens.access)
                .json({
                    message: `User \`${user.username}\` logged in successfully`,
                    accessToken: tokens.access,
                });
        } catch (error) {
            next(error);
        }
    };


/**
 * Logs out the currently authenticated user by removing their refresh token and clearing the cookie.
 *
 * @swagger
 * paths:
 *   /auth/logout:
 *     post:
 *       summary: Déconnexion de l'utilisateur
 *       description: Déconnecte l'utilisateur actuellement authentifié en supprimant son jeton d'actualisation et en effaçant le cookie.
 *       tags: [Auth]
 *       security:
 *         - bearerAuth: []
 *
 *       responses:
 *         200:
 *           description: L'utilisateur s'est déconnecté avec succès
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "User logged out successfully"
 */
export const logout =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get the refreshToken from cookies
            const refreshToken: jwt.Token = req.cookies.refreshToken;

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


/**
 * Refreshes the access token from a refresh token.
 *
 * @swagger
 * paths:
 *   /auth/refresh:
 *     post:
 *       summary: Actualise l'access token
 *       description: Rafraîchit l'access token à partir d'un refresh token.
 *       tags: [Auth]
 *       security:
 *         - bearerAuth: []
 *
 *       responses:
 *         200:
 *           description: Tokens actualisés avec succès
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Token refreshed successfully"
 *                   accessToken:
 *                     type: string
 *                     example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
export const refresh =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get the refreshToken from cookies
            const refreshToken: jwt.Token = req.cookies.refreshToken;

            // get the new generated tokens
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
                )
                .json({
                    message: 'Token refreshed successfully',
                    accessToken: newTokens.access,
                });
        } catch (error) {
            next(error);
        }
    };

/**
 * not implemented yet
 */
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
