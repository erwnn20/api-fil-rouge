import {z} from "zod";
import * as usr from "./user.service"

export const RegisterRequestSchema = usr.CreationRequestSchema;
export type RegisterRequest = usr.CreationRequest;

export const LoginRequestSchema = z.object({
    login: z.string('Username is required')
        .min(1, 'Username is required')
        .trim(),
    password: z.string('Password is required')
        .min(1, 'Username is required'),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
