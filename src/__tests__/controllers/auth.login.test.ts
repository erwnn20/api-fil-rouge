import request from 'supertest';
import * as jwt from '../../utils/jwt.utils';
import * as pwd from '../../utils/password.utils';
import {dbMock} from "../setup/jest.setup";
import app from "../../app";

import * as middleware from '../../middleware/middleware.tests'


const method = 'POST';
const route = '/auth/login'

describe(`${method} ${route}`, () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    middleware.guest(route);

    const fakeUser = {
        id: 100,
        username: 'fakeUser',
        email: 'fake.user@mail.com',
        firstname: 'User',
        lastname: 'Fake',
        password: 'password',
    };

    it('should return 409 if many users have same credentials', async () => {
        dbMock.user.findMany.mockResolvedValue([
            {
                id: fakeUser.id,
                username: fakeUser.username,
                password: 'hashed_password',
                BansReceived: [],
            },
            {
                id: 0,
                username: 'fakeUser',
                password: 'hashed_password',
                BansReceived: [],
            }
        ] as any);

        const response = await request(app)
            .post(route)
            .send({
                login: fakeUser.username,
                password: fakeUser.password,
            })
            .expect(409);

        expect(response.body).toEqual({
            error: 'Invalid credentials',
            details: 'Multiple users have this login information'
        });
    });
    it('should return 404 if no user have the credentials', async () => {
        dbMock.user.findMany.mockResolvedValue([] as any);

        const response = await request(app)
            .post(route)
            .send({
                login: fakeUser.username,
                password: fakeUser.password,
            })
            .expect(404);

        expect(response.body).toEqual({
            error: 'Invalid credentials',
            details: 'No user with this login information'
        });
    });
    it('should return 401 if the password is incorrect', async () => {
        dbMock.user.findMany.mockResolvedValue([{
            id: fakeUser.id,
            username: fakeUser.username,
            password: 'hashed_password',
            BansReceived: [],
        }] as any);

        jest.spyOn(pwd, 'compare').mockReturnValue(false);

        const response = await request(app)
            .post(route)
            .send({
                login: fakeUser.username,
                password: fakeUser.password,
            })
            .expect(401);

        expect(response.body.error).toBe('Invalid password');
    });
    it('should return 403 if the user is banned', async () => {
        dbMock.user.findMany.mockResolvedValue([{
            id: fakeUser.id,
            username: fakeUser.username,
            password: 'hashed_password',
            BansReceived: [{endAt: null, reason: 'Test ban'}],
        }] as any);

        jest.spyOn(pwd, 'compare').mockReturnValue(true);

        const response = await request(app)
            .post(route)
            .send({
                login: fakeUser.username,
                password: fakeUser.password,
            })
            .expect(403);

        expect(response.body.error).toBe('User currently banned');
    });

    it('should login the user successfully', async () => {
        dbMock.user.findMany.mockResolvedValue([{
            id: fakeUser.id,
            username: fakeUser.username,
            password: 'hashed_password',
            BansReceived: [],
        }] as any);

        jest.spyOn(pwd, 'compare').mockReturnValue(true);
        jest.spyOn(jwt, 'generate').mockResolvedValue({
            access: 'fake_access_token',
            refresh: 'fake_refresh_token',
        });

        const response = await request(app)
            .post(route)
            .send({
                login: fakeUser.username,
                password: fakeUser.password,
            })
            .expect(200);

        expect(response.body).toEqual({
            message: `User \`${fakeUser.username}\` logged in successfully`,
            accessToken: 'fake_access_token',
        });
        expect(response.headers['set-cookie'][0]).toContain('refreshToken=fake_refresh_token');
    });
});
