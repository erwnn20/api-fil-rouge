import request from 'supertest';
import * as jwt from '../../src/utils/jwt.utils';
import {dbMock} from "../../src/config/singleton";
import app from "../../src/app";
import db from "../../src/config/db";
import {Role} from "@prisma/client";

import * as middleware from '../../src/middleware/middleware.tests'


const method = 'POST';
const route = '/admin/unban'

describe(`${method} ${route}`, () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    middleware.auth(route);
    middleware.role(route, Role.ADMIN);

    it('should update all bans successfully', async () => {
        const fakeUser = {
            id: 100,
            username: 'fakeUser',
            role: Role.ADMIN,
        };

        const bannedUser = {
            firstname: 'John',
            lastname: 'Doe',
            email: 'john.doe@mail.com',
            username: 'johndoe',
            role: Role.USER,
        };

        const accessToken = jwt.generateTokens(fakeUser.id).access;

        dbMock.user.findFirstOrThrow.mockResolvedValue({BansReceived: []} as any);
        dbMock.user.findFirst.mockResolvedValue({role: fakeUser.role} as any);

        dbMock.ban.updateMany.mockResolvedValue({
            count: 2
        });

        const response = await request(app)
            .post(route)
            .set('Authorization', accessToken)
            .send({
                username: bannedUser.username,
            })
            .expect(200);

        expect(response.body.message).toBe(`User \`${bannedUser.username}\` was successfully unbanned`);
        expect(db.ban.updateMany).toHaveBeenCalledTimes(1);
    });


});
