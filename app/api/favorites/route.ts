import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET /api/favorites - Obter favoritos do usuário logado
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Usar Prisma.$queryRaw para evitar problemas de tipagem
    // Esta abordagem usa SQL bruto em vez do Prisma Client
    const favorites = await prisma.$queryRaw`
      SELECT 
        f.id as favorite_id,
        f."createdAt" as favorite_created_at,
        s.id as service_id,
        s.title as service_title,
        s.description as service_description,
        s.date as service_date,
        s."timeWindow" as service_time_window,
        s.value as service_value,
        s.status as service_status,
        s.latitude as service_latitude,
        s.longitude as service_longitude,
        s.address as service_address,
        s."createdAt" as service_created_at,
        s."updatedAt" as service_updated_at,
        u.id as creator_id,
        u.name as creator_name,
        u.image as creator_image,
        p.id as profession_id,
        p.name as profession_name,
        p.icon as profession_icon
      FROM "Favorite" f
      JOIN "Service" s ON f."serviceId" = s.id
      JOIN "User" u ON s."creatorId" = u.id
      LEFT JOIN "Profession" p ON s."professionId" = p.id
      WHERE f."userId" = ${userId}
      ORDER BY f."createdAt" DESC
    `;
    
    // Buscar as fotos para cada serviço usando SQL bruto também
    const servicesIds = (favorites as any[]).map((fav: any) => fav.service_id);
    
    // Usar SQL bruto para buscar fotos também
    const photos = await prisma.$queryRaw`
      SELECT id, url, "serviceId"
      FROM "Photo"
      WHERE "serviceId" IN (${Prisma.join(servicesIds)})
    `;
    
    // Buscar as avaliações para calcular o rating de cada criador
    const creatorsIds = (favorites as any[]).map((fav: any) => fav.creator_id);
    
    // Usar SQL bruto para buscar reviews também
    const reviews = await prisma.$queryRaw`
      SELECT "receiverId", rating
      FROM "Review"
      WHERE "receiverId" IN (${Prisma.join(creatorsIds)})
    `;
    
    // Calcular o rating médio para cada criador
    const creatorRatings: Record<string, number> = {};
    
    creatorsIds.forEach(creatorId => {
      const creatorReviews = (reviews as any[]).filter(review => review.receiverId === creatorId);
      
      if (creatorReviews.length > 0) {
        const totalRating = creatorReviews.reduce((sum, review) => sum + review.rating, 0);
        creatorRatings[creatorId] = totalRating / creatorReviews.length;
      } else {
        creatorRatings[creatorId] = 0;
      }
    });
    
    // Transformar os resultados em um formato mais amigável
    const formattedFavorites = (favorites as any[]).map((fav: any) => {
      // Encontrar as fotos para este serviço
      const servicePhotos = (photos as any[]).filter(photo => photo.serviceId === fav.service_id);
      
      return {
        id: fav.favorite_id,
        createdAt: fav.favorite_created_at,
        userId: userId,
        serviceId: fav.service_id,
        service: {
          id: fav.service_id,
          title: fav.service_title,
          description: fav.service_description,
          date: fav.service_date,
          timeWindow: fav.service_time_window,
          value: fav.service_value,
          status: fav.service_status,
          latitude: fav.service_latitude,
          longitude: fav.service_longitude,
          address: fav.service_address,
          createdAt: fav.service_created_at,
          updatedAt: fav.service_updated_at,
          creatorId: fav.creator_id,
          creator: {
            id: fav.creator_id,
            name: fav.creator_name,
            image: fav.creator_image,
            rating: creatorRatings[fav.creator_id] || null
          },
          professionId: fav.profession_id,
          profession: fav.profession_id ? {
            id: fav.profession_id,
            name: fav.profession_name,
            icon: fav.profession_icon
          } : null,
          photos: servicePhotos.map(photo => ({
            id: photo.id,
            url: photo.url
          }))
        }
      };
    });
    
    return NextResponse.json(formattedFavorites);
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Adicionar um serviço aos favoritos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    const { serviceId } = body;
    
    // Validação básica
    if (!serviceId) {
      return NextResponse.json(
        { error: "ID do serviço não fornecido" },
        { status: 400 }
      );
    }
    
    // Verificar se o serviço existe usando SQL bruto
    const services = await prisma.$queryRaw`
      SELECT id FROM "Service" WHERE id = ${serviceId}
    `;
    
    if (!services || (services as any[]).length === 0) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar se o serviço já está nos favoritos
    const existingFavorites = await prisma.$queryRaw`
      SELECT id FROM "Favorite" WHERE "userId" = ${userId} AND "serviceId" = ${serviceId}
    `;
    
    if (existingFavorites && (existingFavorites as any[]).length > 0) {
      return NextResponse.json(
        { error: "Serviço já está nos favoritos" },
        { status: 400 }
      );
    }
    
    // Adicionar aos favoritos usando SQL bruto
    const result = await prisma.$executeRaw`
      INSERT INTO "Favorite" ("id", "userId", "serviceId", "createdAt")
      VALUES (${Prisma.raw('gen_random_uuid()')}, ${userId}, ${serviceId}, ${new Date()})
    `;
    
    // Buscar o favorito recém-criado
    const newFavorites = await prisma.$queryRaw`
      SELECT * FROM "Favorite" 
      WHERE "userId" = ${userId} AND "serviceId" = ${serviceId}
    `;
    
    return NextResponse.json((newFavorites as any[])[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar favorito:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
