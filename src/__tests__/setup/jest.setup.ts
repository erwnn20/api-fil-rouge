import {PrismaClient} from '@prisma/client'
import {DeepMockProxy, mockDeep, mockReset} from 'jest-mock-extended'

import db from "../../config/db";


jest.mock('../../config/db', () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
    mockReset(dbMock)
});

export const dbMock = db as unknown as DeepMockProxy<PrismaClient>;

jest.spyOn(console, "log").mockImplementation(() => {});
