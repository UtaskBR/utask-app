// Este é um arquivo de definição de tipos para estender o esquema Prisma
// Salve como /prisma/types.ts

import { Prisma } from '@prisma/client';

// Estendendo o tipo User para incluir o campo rating
declare global {
  namespace PrismaJson {
    interface UserGetPayload extends Prisma.UserGetPayload<{}> {
      rating?: number | null;
    }
  }
}

// Estendendo o tipo para incluir o modelo Review que está sendo usado no código
declare global {
  namespace PrismaJson {
    interface ReviewGetPayload {
      id: string;
      rating: number;
      comment?: string | null;
      createdAt: Date;
      receiverId: string;
      giverId: string;
      receiver?: Prisma.UserGetPayload<{}>;
      giver?: Prisma.UserGetPayload<{}>;
    }
  }
}

// Estendendo o cliente Prisma para incluir o modelo Review
declare module '@prisma/client' {
  interface PrismaClient {
    review: {
      create: (args: {
        data: {
          rating: number;
          comment?: string;
          receiver: { connect: { id: string } };
          giver: { connect: { id: string } };
        };
      }) => Promise<any>;
      findMany: (args: {
        where?: { receiverId?: string };
        include?: { giver?: { select: { id: boolean; name: boolean; image: boolean } } };
        orderBy?: { createdAt: 'asc' | 'desc' };
      }) => Promise<any[]>;
    };
  }
}

export {};
