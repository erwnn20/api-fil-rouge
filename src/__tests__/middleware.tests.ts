import request from "supertest";
import {dbMock} from "./setup/jest.setup";
import app from "../app";
import * as jwt from "../utils/jwt.utils";
import {Role} from "@prisma/client";

// auth middlewares
export const auth = (route: string) => {
    it('[auth.middleware] should return 404 if no access token provided', async () => {
        const response = await request(app)
            .post(route)
            .expect(404);

        expect(response.body.error).toBe('Missing access token');
    });
    it('[auth.middleware] should return 401 if access token is invalid or expired', async () => {
        const res = await request(app)
            .post(route)
            .set('Authorization', 'Bearer invalidToken')
            .expect(401);

        expect(res.body.error).toBe('Invalid access token');
    });
    it('[auth.middleware] should return 403 if logged user is banned', async () => {
        const fakeUser = {id: 100};

        const accessToken = jwt.generateTokens(fakeUser.id).access;

        dbMock.user.findFirstOrThrow.mockResolvedValue({
            BansReceived: [{endAt: null, reason: 'Test ban'}],
        } as any);

        const response = await request(app)
            .post(route)
            .set('Authorization', accessToken)
            .expect(403);

        expect(response.body.error).toBe('User logged in currently banned');
    });
}
export const guest = (route: string) => {
    it('[guest.middleware] should return 409 if valid access token provided', async () => {
        const fakeUser = {id: 100};

        const accessToken = jwt.generateTokens(fakeUser.id).access;

        const response = await request(app)
            .post(route)
            .set('Authorization', accessToken)
            .expect(409);

        expect(response.body.error).toBe('Already logged in');
    });
}
export const logged = (route: string) => {
    it('[logged.middleware] should return 404 if refreshToken cookie is missing', async () => {
        const response = await request(app)
            .post(route)
            .expect(404);

        expect(response.body.error).toBe('Missing refresh token');
    });
}


// role middlewares
export const role = (route: string, role: Role) => {
    it(`[role.middleware] should return 403 if user is not ${role}`, async () => {
        const fakeUser = {
            id: 100,
            role: role === Role.USER ? Role.ADMIN : Role.USER,
        };

        const accessToken = jwt.generateTokens(fakeUser.id).access;

        dbMock.user.findFirstOrThrow.mockResolvedValue({BansReceived: []} as any);
        dbMock.user.findFirst.mockResolvedValue({role: fakeUser.role} as any);

        const response = await request(app)
            .post(route)
            .set('Authorization', accessToken)
            .expect(403);

        expect(response.body.error).toContain(`${role} role required`);
    });
}