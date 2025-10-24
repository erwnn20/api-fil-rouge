import type {NextFunction, Request, Response} from "express";
import * as jwt from '../utils/jwt.utils';

export const auth =
    (req: Request, res: Response, next: NextFunction) => {
        try {

            const authHeader = req.header('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer '))
                return res.status(401).json({error: 'Missing access token'});

            const accessToken = authHeader.split(' ')[1];

            try {
                (req as any).user = jwt.verify(accessToken);
                return next();
            } catch (err: any) {
                if (err.name !== "TokenExpiredError")
                    return res.status(403).json({message: "Token invalide"});
            }

            // regen access via refresh token ?
        } catch (error) {
            next(error);
        }
    }

export const guest =
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.header('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

            const accessToken = authHeader.split(' ')[1];

            try {
                jwt.verify(accessToken);
                return res.status(403).json({error: 'Already logged in'});
            } catch {
                return next();
            }

        } catch (error) {
            next(error);
        }
    }
