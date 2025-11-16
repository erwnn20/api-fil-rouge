import type {NextFunction, Request, Response} from 'express';
import * as usr from '../services/user.service';
import * as pwd from "../utils/password.utils";
import db from "../config/db";
import {Role, User as PrismaUser} from "@prisma/client";


/**
 * @swagger
 * tags:
 *   name: API-User
 *   description: Gestion CRUD des utilisateurs
 */

/**
 * User type without password
 */
export type User = Omit<PrismaUser, "password">;


/**
 * Create a new user in the database. ADMIN role required.
 *
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
            const data: usr.CreationRequest = req.body;

            const user: User = await usr.create(data, {omit: {password: true}})

            res.status(201)
                .json({
                    message: `User \`${user.username}\` created successfully`, user,
                });
        } catch (error) {
            if (error instanceof usr.CreationError)
                return res.status(400).json({
                    error: error.message
                });

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
 * Returns all users matching the optional query filters.
 *
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
 *         - name: page
 *           in: query
 *           description: Selected page
 *           required: false
 *           schema:
 *             type: integer
 *             default: 1
 *         - name: perPage
 *           in: query
 *           description: Number of users per page
 *           required: false
 *           schema:
 *             type: integer
 *             default: 5
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
 *                   paginate:
 *                     $ref: '#/components/schemas/paginate'
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
 *                   paginate:
 *                     $ref: '#/components/schemas/paginate'
 */
export const getUsers =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await db.user.findFirstOrThrow({
                where: {id: (req as any).user.id},
                select: {role: true}
            });
            const data = req.query;

            const page: number = Number(data.page) || 1;
            const limit: number = Number(data.perPage) || 5;
            const offset = (page - 1) * limit;

            const condition = {
                id: req.params.id ? Number(req.params.id) : undefined,
                firstname: data.firstname as string | undefined,
                lastname: data.lastname as string | undefined,
                username: data.username as string | undefined,
                email: data.email as string | undefined,
                role: user.role !== Role.ADMIN ? Role.USER : undefined,
            }

            const [users, total]: [User[], number] = await db.$transaction([
                db.user.findMany({
                    skip: offset,
                    take: limit,
                    where: condition,
                    omit: {
                        password: true
                    }
                }),
                db.user.count({where: condition}),
            ]);

            return res.status(200)
                .json({
                    message: users.length > 0
                        ? `${users.length} users found`
                        : 'No user found',
                    paginate: {
                        page,
                        perPage: limit,
                        currentStartIndex: offset + 1,
                        count: users.length,
                        total,
                        data: users,
                    },
                });
        } catch (error) {
            next(error);
        }
    };


/**
 * Updates a user's information. ADMIN role required.
 *
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
            const data: usr.EditionRequest = req.body;
            const user: User = await db.user.update({
                where: {
                    id: req.params.id ? Number(req.params.id) : undefined,
                },
                data: data,
                omit: {
                    password: true
                }
            })

            res.status(200)
                .json({
                    message: `User \`${user.username}\` updated successfully`,
                    user,
                    updated: data,
                });
        } catch (error) {
            next(error);
        }
    };


/**
 * Delete a user by ID. ADMIN role required.
 *
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