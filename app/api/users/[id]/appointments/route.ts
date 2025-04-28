import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET /api/users/[id]/appointments - Obter serviços para a agenda do usuário
export async function GET(
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
    
    const { id: userId } = await params;
    
    // Verificar se o usuário está tentando acessar sua própria agenda
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Não autorizado a acessar agenda de outro usuário" },
        { status: 403 }
      );
    }
    
    // Buscar serviços criados pelo usuário que estão em andamento (aceitos) usando SQL bruto
    const createdServices = await prisma.$queryRaw`
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.price, 
        s.date, 
        s.time, 
        s.location, 
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
      WHERE s."creatorId" = ${userId} AND s.status = 'IN_PROGRESS'
      ORDER BY s.date ASC
    `;
    
    // Buscar serviços onde o usuário é o prestador aceito usando SQL bruto
    const providedServices = await prisma.$queryRaw`
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.price, 
        s.date, 
        s.time, 
        s.location, 
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
      JOIN "ServiceBid" sb ON s.id = sb."serviceId"
      WHERE s.status = 'IN_PROGRESS' AND sb."providerId" = ${userId} AND sb.status = 'ACCEPTED'
      ORDER BY s.date ASC
    `;
    
    // Buscar as propostas aceitas para todos os serviços
    const serviceIds = [
      ...(createdServices as any[]).map(service => service.id),
      ...(providedServices as any[]).map(service => service.id)
    ];
    
    const acceptedBids = await prisma.$queryRaw`
      SELECT 
        sb.id, 
        sb."serviceId", 
        sb."providerId", 
        sb.status,
        sb.value,
        sb."proposedDate",
        sb.message,
        sb."createdAt",
        sb."updatedAt",
        p.id as provider_id,
        p.name as provider_name,
        p.image as provider_image
      FROM "ServiceBid" sb
      JOIN "User" p ON sb."providerId" = p.id
      WHERE sb."serviceId" IN (${Prisma.join(serviceIds)}) AND sb.status = 'ACCEPTED'
    `;
    
    // Formatar os serviços criados pelo usuário
    const formattedCreatedServices = (createdServices as any[]).map(service => {
      const serviceBids = (acceptedBids as any[])
        .filter(bid => bid.serviceId === service.id)
        .map(bid => ({
          id: bid.id,
          serviceId: bid.serviceId,
          providerId: bid.providerId,
          status: bid.status,
          value: bid.value,
          proposedDate: bid.proposedDate,
          message: bid.message,
          createdAt: bid.createdAt,
          updatedAt: bid.updatedAt,
          provider: {
            id: bid.provider_id,
            name: bid.provider_name,
            image: bid.provider_image
          }
        }));
      
      return {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        date: service.date,
        time: service.time,
        location: service.location,
        status: service.status,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        creator: {
          id: service.creator_id,
          name: service.creator_name,
          image: service.creator_image
        },
        profession: service.profession_id ? {
          id: service.profession_id,
          name: service.profession_name
        } : null,
        bids: serviceBids
      };
    });
    
    // Formatar os serviços onde o usuário é o prestador
    const formattedProvidedServices = (providedServices as any[]).map(service => {
      const serviceBids = (acceptedBids as any[])
        .filter(bid => bid.serviceId === service.id && bid.providerId === userId)
        .map(bid => ({
          id: bid.id,
          serviceId: bid.serviceId,
          providerId: bid.providerId,
          status: bid.status,
          value: bid.value,
          proposedDate: bid.proposedDate,
          message: bid.message,
          createdAt: bid.createdAt,
          updatedAt: bid.updatedAt,
          provider: {
            id: bid.provider_id,
            name: bid.provider_name,
            image: bid.provider_image
          }
        }));
      
      return {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        date: service.date,
        time: service.time,
        location: service.location,
        status: service.status,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        creator: {
          id: service.creator_id,
          name: service.creator_name,
          image: service.creator_image
        },
        profession: service.profession_id ? {
          id: service.profession_id,
          name: service.profession_name
        } : null,
        bids: serviceBids
      };
    });
    
    // Combinar os dois conjuntos de serviços
    const allAppointments = [
      ...formattedCreatedServices,
      ...formattedProvidedServices
    ];
    
    // Remover duplicatas (embora isso não deva acontecer neste caso)
    const uniqueAppointments = Array.from(
      new Map(allAppointments.map(appointment => [appointment.id, appointment])).values()
    );
    
    return NextResponse.json(uniqueAppointments);
  } catch (error) {
    console.error("Erro ao buscar agenda do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
