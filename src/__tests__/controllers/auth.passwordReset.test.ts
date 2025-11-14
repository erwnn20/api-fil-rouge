import request from 'supertest';
import app from "../../app";


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
