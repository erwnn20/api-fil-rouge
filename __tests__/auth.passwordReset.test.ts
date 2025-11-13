import request from 'supertest';
import * as jwt from '../src/utils/jwt.utils';
import app from "../src/app";

import * as middleware from '../src/middleware/middleware.tests'


const method = 'POST';
const route = '/auth/password-reset'

describe(`${method} ${route}`, () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user successfully', async () => {
        const response = await request(app)
            .post(route)
            .expect(501);

        expect(response.body.error).toBe( 'Not implemented');
    });
});
