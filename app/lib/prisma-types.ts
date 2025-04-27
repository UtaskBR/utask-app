import { Prisma } from '@prisma/client';

/**
 * Extensões de tipos para o Prisma Client
 * Estas extensões permitem que o código continue funcionando sem alterar a estrutura do banco de dados
 */

// Extensão para o modelo User para incluir o campo rating calculado
declare global {
  namespace PrismaJson {
    interface UserGetPayload {
      rating?: number;
    }
  }
}

// Extensão para permitir a seleção do campo rating no modelo User
declare module '@prisma/client' {
  namespace Prisma {
    interface UserSelect {
      rating?: boolean;
    }
  }
}

// Função auxiliar para calcular a média de avaliações de um usuário
export async function calculateUserRating(userId: string, prisma: any): Promise<number | null> {
  const reviews = await prisma.review.findMany({
    where: {
      receiverId: userId
    },
    select: {
      rating: true
    }
  });
  
  if (reviews.length === 0) {
    return null;
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
}

// Função para enriquecer os resultados do usuário com o rating calculado
export async function enrichUserWithRating(user: any, prisma: any): Promise<any> {
  if (!user) return user;
  
  const rating = await calculateUserRating(user.id, prisma);
  return {
    ...user,
    rating
  };
}

// Função para enriquecer os resultados de serviços com dados adicionais
export async function enrichServiceResults(services: any[], prisma: any): Promise<any[]> {
  if (!services || services.length === 0) return services;
  
  const enrichedServices = await Promise.all(
    services.map(async (service) => {
      if (service.creator) {
        service.creator = await enrichUserWithRating(service.creator, prisma);
      }
      return service;
    })
  );
  
  return enrichedServices;
}

// Função para enriquecer os resultados de favoritos com dados adicionais
export async function enrichFavoriteResults(favorites: any[], prisma: any): Promise<any[]> {
  if (!favorites || favorites.length === 0) return favorites;
  
  const enrichedFavorites = await Promise.all(
    favorites.map(async (favorite) => {
      if (favorite.service && favorite.service.creator) {
        favorite.service.creator = await enrichUserWithRating(favorite.service.creator, prisma);
      }
      return favorite;
    })
  );
  
  return enrichedFavorites;
}
