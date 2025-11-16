import {z} from "zod";
import type {NextFunction, Request, Response} from "express";

export const validateBody =
    (schema: z.ZodSchema<any>) =>
        (req: Request, res: Response, next: NextFunction) => {
            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    error: 'Invalid request body',
                    details: z.flattenError(result.error),
                });
            }

            req.body = result.data;
            next();
        };
