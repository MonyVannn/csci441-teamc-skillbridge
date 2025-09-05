import { PrismaClient } from "@prisma/client";

const primsa = new PrismaClient();

const globalForPrisma = global as unknown as { prisma: typeof primsa };

if (process.env.NODE_ENV != "production") globalForPrisma.prisma = primsa;

export default primsa;
