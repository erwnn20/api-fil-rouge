import jwt from "jsonwebtoken";
import {dbMock} from "../setup/jest.setup";
import * as jwToken from '../../utils/jwt.utils';
import db from "../../config/db";



describe('JWT Utils', () => {
    const fakeUser = {
        id: 100,
    };
    const fakeTokens: jwToken.Tokens = {
        access: 'ACCESS_TOKEN',
        refresh: 'REFRESH_TOKEN'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateTokens', () => {
        it("should generate access and refresh tokens with proper secrets", () => {
            jest.spyOn(jwt, 'sign')
                .mockReturnValueOnce(fakeTokens.access as any)
                .mockReturnValueOnce(fakeTokens.refresh as any);

            const tokens = jwToken.generateTokens(fakeUser.id);

            expect(jwt.sign).toHaveBeenCalledWith(
                {id: fakeUser.id},
                jwToken.tokenDatas.access.secret,
                {expiresIn: jwToken.tokenDatas.access.expiresIn},
            );
            expect(jwt.sign).toHaveBeenCalledWith(
                {id: fakeUser.id},
                jwToken.tokenDatas.refresh.secret,
                {expiresIn: jwToken.tokenDatas.refresh.expiresIn},
            );

            expect(tokens).toEqual({
                access: `Bearer ${fakeTokens.access}`,
                refresh: fakeTokens.refresh,
            });
        });
    });

    describe("generate", () => {
        it("should upsert refresh token in db and return tokens", async () => {
            dbMock.jwtRefreshToken.upsert.mockResolvedValue({} as any);

            jest.spyOn(jwt, 'sign')
                .mockReturnValueOnce(fakeTokens.access as any)
                .mockReturnValueOnce(fakeTokens.refresh as any);

            const tokens = await jwToken.generate(fakeUser.id);

            expect(db.jwtRefreshToken.upsert).toHaveBeenCalledWith({
                where: {userId: fakeUser.id},
                update: {
                    token: fakeTokens.refresh,
                    expiresAt: expect.any(Date),
                },
                create: {
                    userId: fakeUser.id,
                    token: fakeTokens.refresh,
                    expiresAt: expect.any(Date),
                },
            });

            expect(tokens).toEqual({
                access: `Bearer ${fakeTokens.access}`,
                refresh: fakeTokens.refresh,
            });
        });
    });

    describe("refresh", () => {
        it("should update refresh token and return new tokens", async () => {
            dbMock.jwtRefreshToken.findUniqueOrThrow.mockResolvedValue({userId: fakeUser.id} as any);
            dbMock.jwtRefreshToken.update.mockResolvedValue({} as any);

            jest.spyOn(jwt, 'sign')
                .mockReturnValueOnce(fakeTokens.access as any)
                .mockReturnValueOnce(fakeTokens.refresh as any);

            const tokens = await jwToken.refresh('OLD_REFRESH_TOKEN');

            expect(dbMock.jwtRefreshToken.update).toHaveBeenCalledWith({
                where: {token: 'OLD_REFRESH_TOKEN'},
                data: {
                    token: fakeTokens.refresh,
                    expiresAt: expect.any(Date),
                }
            });

            expect(tokens).toEqual({
                access: `Bearer ${fakeTokens.access}`,
                refresh: fakeTokens.refresh,
            });
        });
    });

    describe("verify", () => {
        it("should call jwt.verify with the access secret", () => {
            jest.spyOn(jwt, 'verify')
                .mockReturnValue({ id: fakeUser.id } as any);

            const result = jwToken.verify(fakeTokens.access);

            expect(jwt.verify).toHaveBeenCalledWith(fakeTokens.access, jwToken.tokenDatas.access.secret);
            expect(result).toEqual({ id: fakeUser.id });
        });
    });
});
