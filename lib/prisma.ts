import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

declare global {
  var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV != "production") global.prisma = prisma;

export default prisma;
