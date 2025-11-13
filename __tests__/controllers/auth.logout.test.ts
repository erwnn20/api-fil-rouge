import request from 'supertest';
import * as jwt from '../../src/utils/jwt.utils';
import {dbMock} from "../../src/config/singleton";
import app from "../../src/app";

import * as middleware from '../../src/middleware/middleware.tests'
import db from "../../src/config/db";


const method = 'POST';
const route = '/auth/logout'

describe(`${method} ${route}`, () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    middleware.logged(route);

    const fakeUser = {
        id: 100,
        username: 'fakeUser',
        email: 'fake.user@mail.com',
        firstname: 'User',
        lastname: 'Fake',
        password: 'password',
    };

    it('should logout the user by deleting the refresh token and clear the cookie', async () => {
        const refreshToken = jwt.generateTokens(fakeUser.id).refresh

        dbMock.jwtRefreshToken.delete.mockResolvedValue({token: refreshToken} as any);

        const response = await request(app)
            .post(route)
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(200);

        // expect(response).toBe(200);
        expect(db.jwtRefreshToken.delete).toHaveBeenCalledWith({
            where: {token: refreshToken},
        });
        expect(response.body.message).toBe('User logged out successfully');
        expect(response.headers['set-cookie'][0]).toMatch(/refreshToken=;/); // cookie vidé
    });
});
