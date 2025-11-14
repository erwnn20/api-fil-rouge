import request from 'supertest';
import * as jwt from '../../utils/jwt.utils';
import * as pwd from '../../utils/password.utils';
import {dbMock} from "../setup/jest.setup";
import app from "../../app";
import db from "../../config/db";

import * as middleware from '../../middleware/middleware.tests'


const method = 'POST';
const route = '/auth/register'

describe(`${method} ${route}`, () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    middleware.guest(route);

    const fakeUser = {
        username: 'fakeUser',
        email: 'fake.user@mail.com',
        firstname: 'User',
        lastname: 'Fake',
        password: 'password',
    };

    it('should return 401 if email is already used', async () => {
        dbMock.user.count.mockResolvedValueOnce(1); // email already used

        const response = await request(app)
            .post(route)
            .send(fakeUser)
            .expect(401);

        expect(response.body.error).toBe('Email already used');
    });
    it('should return 401 if email is already used', async () => {
        dbMock.user.count
            .mockResolvedValueOnce(0) // email ok
            .mockResolvedValueOnce(1); // username already used

        const response = await request(app)
            .post(route)
            .send(fakeUser)
            .expect(401);

        expect(response.body.error).toBe('Username already used');
    });

    it('should register a new user successfully', async () => {
        dbMock.user.count.mockResolvedValue(0); // email + username not used
        dbMock.user.create.mockResolvedValue({
            id: 1,
            username: fakeUser.username,
        } as any);

        jest.spyOn(pwd, 'hash').mockReturnValue('hashed_password');
        jest.spyOn(jwt, 'generate').mockResolvedValue({
            access: 'fake_access_token',
            refresh: 'fake_refresh_token',
        });

        const response = await request(app)
            .post(route)
            .send(fakeUser)
            .expect(201);

        expect(db.user.count).toHaveBeenCalledTimes(2);
        expect(db.user.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                username: fakeUser.username,
                email: fakeUser.email,
                firstname: fakeUser.firstname,
                lastname: fakeUser.lastname,
                password: 'hashed_password',
            }),
            select: {id: true, username: true},
        });
        expect(response.body).toEqual({
            message: `User \`${fakeUser.username}\` registered successfully`,
            accessToken: 'fake_access_token',
        });
        expect(response.headers['set-cookie'][0]).toContain('refreshToken=fake_refresh_token');
    });
});
