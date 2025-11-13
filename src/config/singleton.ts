import {PrismaClient} from '@prisma/client'
import {mockDeep, mockReset, DeepMockProxy} from 'jest-mock-extended'

import db from './db'


jest.mock('./db', () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
    mockReset(dbMock)
})

export const dbMock = db as unknown as DeepMockProxy<PrismaClient>;
