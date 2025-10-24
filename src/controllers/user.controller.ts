import type {Request, Response, NextFunction} from 'express';
import * as pwd from "../utils/password.utils";
import db from "../config/db";
import {User as PrismaUser} from "@prisma/client";


export type User = Omit<PrismaUser, "password">;

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

            res.json({
                message: `User \`${user.username}\` created successfully`, user,
            });
        } catch (error) {
            next(error);
        }
    };

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
                    // created_at: Date,
                },
                omit: {
                    password: true
                }
            });

            res.json({
                message: users.length === 0 ? 'No user found' : `${users.length} users found`,
                users, count: users.length,
            });
        } catch (error) {
            next(error);
        }
    };

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

            res.json({
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

            res.json({
                message: `User \`${user.username}\` deleted successfully`,
            });
        } catch (error) {
            next(error);
        }
    };