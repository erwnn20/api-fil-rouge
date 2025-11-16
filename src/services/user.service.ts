import {Prisma} from "@prisma/client";
import {DefaultArgs} from "@prisma/client/runtime/library";
import {z} from "zod";
import * as pwd from "../utils/password.utils";
import db from "../config/db";

export const CreationRequestSchema = z.object({
    username: z.string('Username is required')
        .min(1, 'Username is required')
        .trim(),
    email: z.email('Invalid email'),
    firstname: z.string().trim().optional(),
    lastname: z.string('Lastname is required')
        .min(1, 'Lastname is required')
        .trim(),
    password: z.string('Password is required')
        .min(1, 'Password is required')
        .trim(),
});
export type CreationRequest = z.infer<typeof CreationRequestSchema>;

export enum CreationErrors {
    Email = 'EmailError',
    Username = 'UsernameError',
}

export class CreationError extends Error {
    private static baseMassage = 'User creation failed'
    private static messages: Record<CreationErrors, string> = {
        [CreationErrors.Email]: ', email already used',
        [CreationErrors.Username]: ', username already used',
    };

    constructor(type: CreationErrors) {
        super(CreationError.baseMassage
            + (CreationError.messages[type] || ''));
        this.name = type;

        Object.setPrototypeOf(this, CreationError.prototype);
    }
}

export const create = async (
    data: CreationRequest,
    options?: {
        select?: Prisma.UserSelect<DefaultArgs> | null | undefined;
        omit?: Prisma.UserOmit<DefaultArgs> | null | undefined;
        include?: Prisma.UserInclude<DefaultArgs> | null | undefined;
    }
) => {
    if ((await db.user.count({where: {email: data.email}})) > 0)
        throw new CreationError(CreationErrors.Email);
    if ((await db.user.count({where: {username: data.username}})) > 0)
        throw new CreationError(CreationErrors.Username);

    return (await db.user.create({
        data: {
            username: data.username,
            email: data.email,
            firstname: data.firstname,
            lastname: data.lastname,
            password: pwd.hash(data.password),
        },
        ...options
    }));
}