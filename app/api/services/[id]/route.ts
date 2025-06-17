import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET, PUT, DELETE /api/services/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params;
    
    // Buscar o serviço usando SQL bruto
    const services = await prisma.$queryRaw`
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.price, 
        s.date, 
        s.latitude,
        s.longitude,
        s.address, 
        s.status, 
        s."createdAt", 
        s."updatedAt",
        s."creatorId",
        s."professionId",
        u.id as creator_id,
        u.name as creator_name,
        u.image as creator_image,
        p.id as profession_id,
        p.name as profession_name
      FROM "Service" s
      JOIN "User" u ON s."creatorId" = u.id
      LEFT JOIN "Profession" p ON s."professionId" = p.id
      WHERE s.id = ${serviceId}
    `;
    
    if (!services || (services as any[]).length === 0) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    const service = (services as any[])[0];
    
    // Buscar fotos do serviço
    const photos = await prisma.$queryRaw`
      SELECT id, url
      FROM "Photo"
      WHERE "serviceId" = ${serviceId}
    `;
    
    // Buscar avaliações do criador
    const reviews = await prisma.$queryRaw`
      SELECT rating FROM "Review" WHERE "receiverId" = ${service.creator_id}
    `;

// Buscar propostas com dados do prestador
const bids = await prisma.$queryRaw`
  SELECT 
  b.id, b."providerId", b.status, b."proposedDate", b.message, b.price,
  u.name as provider_name,
  u."image" as provider_image
  FROM "Bid" b
  JOIN "User" u ON b."providerId" = u.id
  WHERE b."serviceId" = ${serviceId}
`;

// Buscar notas dos prestadores
const providerRatings = await prisma.$queryRaw`
SELECT "receiverId", AVG(rating) as avg_rating
FROM "Review"
WHERE "receiverId" IN (SELECT "providerId" FROM "Bid" WHERE "serviceId" = ${serviceId})
GROUP BY "receiverId"
`;


let creatorRating = null;
if (reviews && (reviews as any[]).length > 0) {
  const totalRating = (reviews as any[]).reduce((sum, review) => sum + review.rating, 0);
  creatorRating = totalRating / (reviews as any[]).length;
}

    
    // Formatar a resposta
    const formattedService = {
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      date: service.date,
      latitude: service.latitude,
      longitude: service.longitude,
      address: service.address,
      status: service.status,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      creatorId: service.creatorId, // Added this line
      creator: {
        id: service.creator_id,
        name: service.creator_name,
        image: service.creator_image,
        rating: creatorRating
      },
      profession: service.profession_id ? {
        id: service.profession_id,
        name: service.profession_name
      } : null,
      photos: (photos as any[]).map(photo => ({ url: photo.url })),
      bids: (bids as any[]).map(bid => ({
        id: bid.id,
        providerId: bid.providerId,
        status: bid.status,
        price: bid.price,
        message: bid.message,
        proposedDate: bid.proposedDate,
        provider: {
          name: bid.provider_name,
          image: bid.provider_image,
          rating: (() => {
            const found = (providerRatings as any[]).find(r => r.receiverId === bid.providerId);
            return found ? Number(found.avg_rating) : null;
          })()
        }
      }))
    };    
    
    return NextResponse.json(formattedService);
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { id: serviceId } = await params;
    const body = await request.json();
    const { title, description, price, date, latitude, longitude, address, status, professionId } = body;
    
    // Verificar se o serviço existe e se o usuário é o criador
    const services = await prisma.$queryRaw`
      SELECT id, "creatorId", status FROM "Service" WHERE id = ${serviceId}
    `;
    
    if (!services || (services as any[]).length === 0) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    const service = (services as any[])[0];
    
    if (service.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Apenas o criador do serviço pode editá-lo" },
        { status: 403 }
      );
    }
    
    // Verificar se o serviço pode ser editado
    if (service.status !== 'OPEN' && service.status !== 'PENDING') {
      return NextResponse.json(
        { error: "Apenas serviços com status OPEN ou PENDING podem ser editados" },
        { status: 400 }
      );
    }
    
    // Atualizar o serviço usando SQL bruto
    const now = new Date();
    const dateValue = date ? new Date(date) : null;
    
    await prisma.$executeRaw`
      UPDATE "Service"
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        price = COALESCE(${price}, price),
        date = COALESCE(${dateValue}, date),
        latitude = COALESCE(${latitude}, latitude),
        longitude = COALESCE(${longitude}, longitude),
        address = COALESCE(${address}, address),
        status = COALESCE(${status}, status),
        "professionId" = COALESCE(${professionId}, "professionId"),
        "updatedAt" = ${now}
      WHERE id = ${serviceId}
    `;
    
    // Buscar o serviço atualizado
    const updatedServices = await prisma.$queryRaw`
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.price, 
        s.date, 
        s.latitude,
        s.longitude,
        s.address, 
        s.status, 
        s."createdAt", 
        s."updatedAt",
        s."creatorId",
        s."professionId",
        u.id as creator_id,
        u.name as creator_name,
        u.image as creator_image,
        p.id as profession_id,
        p.name as profession_name
      FROM "Service" s
      JOIN "User" u ON s."creatorId" = u.id
      LEFT JOIN "Profession" p ON s."professionId" = p.id
      WHERE s.id = ${serviceId}
    `;
    
    const updatedService = (updatedServices as any[])[0];
    
    // Buscar fotos do serviço
    const photos = await prisma.$queryRaw`
      SELECT id, url
      FROM "Photo"
      WHERE "serviceId" = ${serviceId}
    `;
    
    // Buscar propostas com dados do prestador
    const bids = await prisma.$queryRaw`
      SELECT 
      b.id, b."providerId", b.status, b."proposedDate", b.message, b.price,
      u.name as provider_name,
      u."image" as provider_image
      FROM "Bid" b
      JOIN "User" u ON b."providerId" = u.id
      WHERE b."serviceId" = ${serviceId}
    `;

    // Buscar notas dos prestadores
    const providerRatings = await prisma.$queryRaw`
      SELECT "receiverId", AVG(rating) as avg_rating
      FROM "Review"
      WHERE "receiverId" IN (SELECT "providerId" FROM "Bid" WHERE "serviceId" = ${serviceId})
      GROUP BY "receiverId"
    `;

    // Buscar avaliações do criador
    const reviews = await prisma.$queryRaw`
      SELECT rating FROM "Review" WHERE "receiverId" = ${service.creator_id}
    `;

    let creatorRating = null;
    if (reviews && (reviews as any[]).length > 0) {
      const totalRating = (reviews as any[]).reduce((sum, review) => sum + review.rating, 0);
      creatorRating = totalRating / (reviews as any[]).length;
    }

    // Formatar a resposta
    const formattedService = {
      id: updatedService.id,
      title: updatedService.title,
      description: updatedService.description,
      price: updatedService.price,
      date: updatedService.date,
      latitude: updatedService.latitude,
      longitude: updatedService.longitude,
      address: updatedService.address,
      status: updatedService.status,
      createdAt: updatedService.createdAt,
      updatedAt: updatedService.updatedAt,
      creatorId: service.creator_id, 
      creator: {
        id: service.creator_id,
        name: service.creator_name,
        image: service.creator_image,
        rating: creatorRating
      },
      profession: updatedService.profession_id ? {
        id: updatedService.profession_id,
        name: updatedService.profession_name
      } : null,
      photos: (photos as any[]).map(photo => ({ url: photo.url })),
      bids: (bids as any[]).map(bid => ({
        id: bid.id,
        providerId: bid.providerId,
        status: bid.status,
        price: bid.price,
        message: bid.message,
        proposedDate: bid.proposedDate,
        provider: {
          name: bid.provider_name,
          image: bid.provider_image,
          rating: (() => {
            const found = (providerRatings as any[]).find(r => r.receiverId === bid.providerId);
            return found ? Number(found.avg_rating) : null;
          })()
        }
      }))
      
    };
    
    return NextResponse.json(formattedService);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { id: serviceId } = await params;
    
    // Verificar se o serviço existe e se o usuário é o criador
    const services = await prisma.$queryRaw`
      SELECT id, "creatorId", status FROM "Service" WHERE id = ${serviceId}
    `;
    
    if (!services || (services as any[]).length === 0) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    const service = (services as any[])[0];
    
    if (service.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Apenas o criador do serviço pode excluí-lo" },
        { status: 403 }
      );
    }
    
    // Verificar se o serviço pode ser excluído
    if (service.status !== 'OPEN' && service.status !== 'PENDING') {
      return NextResponse.json(
        { error: "Apenas serviços com status OPEN ou PENDING podem ser excluídos" },
        { status: 400 }
      );
    }
    
    // Excluir fotos do serviço
    await prisma.$executeRaw`
      DELETE FROM "Photo" WHERE "serviceId" = ${serviceId}
    `;
    
    // Excluir propostas do serviço
    await prisma.$executeRaw`
      DELETE FROM "Bid" WHERE "serviceId" = ${serviceId}
    `;
    
    // Excluir favoritos do serviço
    await prisma.$executeRaw`
      DELETE FROM "Favorite" WHERE "serviceId" = ${serviceId}
    `;
    
    // Excluir o serviço
    await prisma.$executeRaw`
      DELETE FROM "Service" WHERE id = ${serviceId}
    `;
    
    return NextResponse.json({ message: "Serviço excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

