// src/tests/helpers/reset-db.ts
import { PrismaClient } from '@prisma/client';

export const resetDb = async (prisma: PrismaClient) => {
  await prisma.$transaction([prisma.user.deleteMany()]);
};
