import type {Request, Response, NextFunction} from 'express';
import * as pwd from "../utils/password.utils";
import db from "../config/db";
import {User as PrismaUser} from "@prisma/client";


/**
 * @swagger
 * tags:
 *   name: API-User
 *   description: Gestion CRUD des utilisateurs
 */

export type User = Omit<PrismaUser, "password">;


/**
 * @swagger
 * paths:
 *   /api/v1/users:
 *     post:
 *       summary: Créer un nouvel utilisateur
 *       description: Créer un nouvel utilisateur dans la base de données. Rôle ADMIN requis.
 *       tags: [API-User]
 *       security:
 *         - bearerAuth: []        # avec verification de rôle (ADMIN)
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [lastname, username, email, password]
 *               properties:
 *                 firstname:
 *                   type: string
 *                   example: "John"
 *                 lastname:
 *                   type: string
 *                   example: "Doe"
 *                 username:
 *                   type: string
 *                   example: "johndoe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john.doe@mail.com"
 *                 password:
 *                   type: string
 *                   format: password
 *                   example: "mysecurepassword123"
 *
 *       responses:
 *         201:
 *           description: Utilisateur créé avec succès
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "User `johndoe` created successfully"
 *                   user:
 *                     $ref: '#/components/schemas/User'
 */
export const createUser =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const user: User = await db.user.create({
                data: {
                    firstname: data.firstname,
                    lastname: data.lastname,
                    username: data.username,
                    email: data.email,
                    password: pwd.hash(data.password),
                },
                omit: {
                    password: true
                }
            });

            res.status(201)
                .json({
                    message: `User \`${user.username}\` created successfully`, user,
                });
        } catch (error) {
            next(error);
        }
    };


/**
 * @swagger
 * paths:
 *   /api/v1/users:
 *     get:
 *       summary: Récupérer une liste d'utilisateurs
 *       description: Renvoie tous les utilisateurs correspondant aux filtres de requête facultatifs.
 *       tags: [API-User]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: firstname
 *           in: query
 *           description: Filter users by firstname
 *           required: false
 *           schema:
 *             type: string
 *             example: "John"
 *         - name: lastname
 *           in: query
 *           description: Filter users by lastname
 *           required: false
 *           schema:
 *             type: string
 *             example: "Doe"
 *         - name: username
 *           in: query
 *           description: Filter users by username
 *           required: false
 *           schema:
 *             type: string
 *             example: "johndoe"
 *         - name: email
 *           in: query
 *           description: Filter users by email
 *           required: false
 *           schema:
 *             type: string
 *             format: email
 *             example: "john.doe@mail.com"
 *
 *       responses:
 *         200:
 *           description: Utilisateurs trouvés
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "10 users found"
 *                   count:
 *                     type: integer
 *                     description: Nombre d'utilisateurs trouvés
 *                   users:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/User'
 *         204:
 *           description: Aucun utilisateur trouvé
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "No user found"
 *                   count:
 *                     type: integer
 *                     example: 0
 *                   users:
 *                     type: array
 *                     example: []
 *
 *   /api/v1/users/{id}:
 *     get:
 *       summary: "Retrieve a specific user by ID"
 *       description: "Returns a single user matching the given ID. Requires authentication."
 *       tags: [API-User]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: id
 *           in: path
 *           description: ID of the user
 *           required: true
 *           schema:
 *             type: integer
 *         - name: firstname
 *           in: query
 *           description: Filter users by firstname
 *           required: false
 *           schema:
 *             type: string
 *             example: "John"
 *         - name: lastname
 *           in: query
 *           description: Filter users by lastname
 *           required: false
 *           schema:
 *             type: string
 *             example: "Doe"
 *         - name: username
 *           in: query
 *           description: Filter users by username
 *           required: false
 *           schema:
 *             type: string
 *             example: "johndoe"
 *         - name: email
 *           in: query
 *           description: Filter users by email
 *           required: false
 *           schema:
 *             type: string
 *             format: email
 *             example: "john.doe@mail.com"
 *
 *       responses:
 *         200:
 *           description: Utilisateurs trouvés
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "10 users found"
 *                   count:
 *                     type: integer
 *                     description: Nombre d'utilisateurs trouvés
 *                   users:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/User'
 *         204:
 *           description: Aucun utilisateur trouvé
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "No user found"
 *                   count:
 *                     type: integer
 *                     example: 0
 *                   users:
 *                     type: array
 *                     example: []
 */
export const getUsers =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.query;
            const users: User[] = await db.user.findMany({
                where: {
                    id: req.params.id ? Number(req.params.id) : undefined,
                    firstname: data.firstname as string | undefined,
                    lastname: data.lastname as string | undefined,
                    username: data.username as string | undefined,
                    email: data.email as string | undefined,
                },
                omit: {
                    password: true
                }
            });

            return users.length > 0
                ? res.status(200)
                    .json({
                        message: `${users.length} users found`,
                        users, count: users.length,
                    })
                : res.status(204)
                    .json({
                        message: 'No user found',
                        users, count: users.length,
                    });
        } catch (error) {
            next(error);
        }
    };


/**
 * @swagger
 * paths:
 *   /api/v1/users/{id}:
 *     put:
 *       summary: Mettre à jour un utilisateur
 *       description: Met à jour les informations d'un utilisateur. Rôle ADMIN requis.
 *       tags: [API-User]
 *       security:
 *         - bearerAuth: []        # avec verification de rôle (ADMIN)
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           schema:
 *             type: integer
 *           description: ID de l'utilisateur mis à jour
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstname:
 *                   type: string
 *                   example: "John"
 *                 lastname:
 *                   type: string
 *                   example: "Doe"
 *                 username:
 *                   type: string
 *                   example: "johndoe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john.doe@mail.com"
 *
 *       responses:
 *         200:
 *           description: User successfully updated
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "User `johndoe` updated successfully"
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *                   updated:
 *                     type: object
 *                     properties:
 *                       firstname:
 *                         type: string
 *                         example: "John"
 *                       lastname:
 *                         type: string
 *                         example: "Doe"
 *                       username:
 *                         type: string
 *                         example: "johndoe"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "john.doe@mail.com"
 */
export const updateUser =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const user: User = await db.user.update({
                where: {
                    id: req.params.id ? Number(req.params.id) : undefined,
                },
                data: {
                    firstname: data.firstname,
                    lastname: data.lastname,
                    username: data.username,
                    email: data.email,
                },
                omit: {
                    password: true
                }
            })

            res.status(200)
                .json({
                    message: `User \`${user.username}\` updated successfully`, user,
                    updated: {
                        firstname: data.firstname,
                        lastname: data.lastname,
                        username: data.username,
                        email: data.email,
                    },
                });
        } catch (error) {
            next(error);
        }
    };


/**
 * @swagger
 * paths:
 *   /api/v1/users/{id}:
 *     delete:
 *       summary: Supprimer un utilisateur
 *       description: Supprimer un utilisateur par son ID. Rôle ADMIN requis.
 *       tags: [API-User]
 *       security:
 *         - bearerAuth: []        # avec verification de rôle (ADMIN)
 *       parameters:
 *         - name: id
 *           in: path
 *           description: ID de l'utilisateur à supprimer
 *           required: true
 *           schema:
 *             type: integer
 *
 *       responses:
 *         200:
 *           description: Utilisateur supprimé avec succès
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "User `johndoe` deleted successfully"
 */
export const deleteUser =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await db.user.delete({
                where: {
                    id: req.params.id ? Number(req.params.id) : undefined
                },
                select: {
                    username: true
                }
            });

            res.status(200)
                .json({
                    message: `User \`${user.username}\` deleted successfully`,
                });
        } catch (error) {
            next(error);
        }
    };