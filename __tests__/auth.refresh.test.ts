import request from 'supertest';
import * as jwt from '../src/utils/jwt.utils';
import app from "../src/app";

import * as middleware from '../src/middleware/middleware.tests'


const method = 'POST';
const route = '/auth/refresh'

describe(`${method} ${route}`, () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    middleware.logged(route);

    it('should register a new user successfully', async () => {
        const refreshToken = 'expired_refresh_token';

        jest.spyOn(jwt, 'refresh').mockResolvedValue({
            access: 'new_access_token',
            refresh: 'new_refresh_token',
        });

        const response = await request(app)
            .post(route)
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(200);

        expect(response.body).toEqual({
            message: 'Token refreshed successfully',
            accessToken: 'new_access_token',
        });
        expect(response.headers['set-cookie'][0]).toContain(`refreshToken=new_refresh_token`);
    });
});
