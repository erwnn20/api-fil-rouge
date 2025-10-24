import type {Request, Response, NextFunction} from 'express';
import db from "../config/db";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const user = await db.user.create({
            data: {
                firstname: data.firstname,
                lastname: data.lastname,
                username: data.username,
                email: data.email,
                password: data.password,
            },
        });

        res.json({
            message: `User created successfully.`,
            user: user,
        });
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.query;
        const users = await db.user.findMany({
            where: {
                id: req.params.id ? Number(req.params.id) : undefined,
                firstname: data.firstname as string | undefined,
                lastname: data.lastname as string | undefined,
                username: data.username as string | undefined,
                email: data.email as string | undefined,
                // created_at: Date,
            },
        })

        res.json({
            message: users.length === 0 ? 'no User found.' : `${users.length} Users found.`,
            users: users,
            count: users.length,
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const user = await db.user.update({
            where: {
                id: req.params.id ? Number(req.params.id) : undefined,
            },
            data: {
                firstname: data.firstname,
                lastname: data.lastname,
                username: data.username,
                email: data.email,
            },
        })

        res.json({
            message: `User updated successfully.`,
            user: user,
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

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await db.user.delete({
            where: {
                id: req.params.id ? Number(req.params.id) : undefined
            },
        });
        res.json({
            message: `User deleted successfully.`,
        });
    } catch (error) {
        next(error);
    }
};