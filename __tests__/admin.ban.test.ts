import request from 'supertest';
import * as jwt from '../src/utils/jwt.utils';
import {dbMock} from "../src/config/singleton";
import app from "../src/app";
import db from "../src/config/db";
import {Role} from "@prisma/client";

import * as middleware from '../src/middleware/middleware.tests'
import {Ban} from "../src/controllers/admin.controller";
import ms from "ms";


describe('POST /admin/ban', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    middleware.auth('/admin/ban');
    middleware.role('/admin/ban', Role.ADMIN);

    it('should create a ban successfully', async () => {
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
        }

        const banBody: Ban = {
            username: bannedUser.username,
            adminName: fakeUser.username,
            startAt: new Date(),
            duration: '1d',
            reason: 'Test ban',
        };


        const accessToken = jwt.generateTokens(fakeUser.id).access;

        dbMock.user.findFirstOrThrow.mockResolvedValue({BansReceived: []} as any);
        dbMock.user.findFirst.mockResolvedValue({role: fakeUser.role} as any);

        dbMock.ban.create.mockResolvedValue({
            user: bannedUser,
            startAt: banBody.startAt,
            endAt: banBody.duration
                ? new Date(
                    (banBody.startAt?.getTime() || 0)
                    + (typeof banBody.duration === "number"
                        ? banBody.duration
                        : ms(banBody.duration)))
                : undefined,
            reason: banBody.reason,
        } as any);

        const response = await request(app)
            .post('/admin/ban')
            .set('Authorization', accessToken)
            .send(banBody);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe(`User \`${bannedUser.username}\` was successfully banned`);
        expect(db.ban.create).toHaveBeenCalledTimes(1);
    });


});
