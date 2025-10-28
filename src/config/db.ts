import {PrismaClient} from '@prisma/client';


/**
 * Prisma database access
 */
const db = new PrismaClient();

export default db;