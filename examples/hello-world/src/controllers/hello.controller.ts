import { controller, defineBody, definePath, inject } from '@kraftr/http-framework';
import { PrismaClient } from '@prisma/client';

type User = { name: string };

const users: User[] = [];

export const getUsers = controller(() => {
  definePath('/users');

  return async () => {
    const prisma = inject<PrismaClient>('prisma');

    return await prisma.user.findMany();
  };
});

export const createUser = controller(() => {
  definePath('POST', '/users');

  const body = defineBody<User>();

  return async () => {
    const prisma = inject<PrismaClient>('prisma');
    return await prisma.user.create({
      data: await body.value
    });
  };
});
