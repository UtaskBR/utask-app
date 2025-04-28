import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET /api/users/[id]/services - Obter todos os serviços relacionados ao usuário
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
    
    // Verificar se o usuário está tentando acessar seus próprios serviços
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Não autorizado a acessar serviços de outro usuário" },
        { status: 403 }
      );
    }
    
    // Buscar serviços criados pelo usuário usando SQL bruto
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
      WHERE s."creatorId" = ${userId}
      ORDER BY s."createdAt" DESC
    `;
    
    // Buscar serviços onde o usuário fez propostas (candidaturas) usando SQL bruto
    const servicesWithUserBids = await prisma.$queryRaw`
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
      WHERE sb."providerId" = ${userId}
      ORDER BY s."createdAt" DESC
    `;
    
    // Buscar todas as propostas para os serviços
    const serviceIds = [
      ...(createdServices as any[]).map(service => service.id),
      ...(servicesWithUserBids as any[]).map(service => service.id)
    ];
    
    const bids = await prisma.$queryRaw`
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
      WHERE sb."serviceId" IN (${Prisma.join(serviceIds)})
    `;
    
    // Buscar as propostas do usuário específico
    const userBids = await prisma.$queryRaw`
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
      WHERE sb."providerId" = ${userId} AND sb."serviceId" IN (${Prisma.join(serviceIds)})
    `;
    
    // Formatar os serviços criados pelo usuário
    const formattedCreatedServices = (createdServices as any[]).map(service => {
      const serviceBids = (bids as any[])
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
    
    // Formatar os serviços onde o usuário fez propostas
    const servicesWithUserBidsFormatted = (servicesWithUserBids as any[]).map(service => {
      const serviceBids = (userBids as any[])
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
        bids: serviceBids,
        userBid: serviceBids.length > 0 ? serviceBids[0] : null // A proposta do usuário como propriedade separada
      };
    });
    
    // Combinar os dois conjuntos de serviços
    const allServices = [
      ...formattedCreatedServices,
      ...servicesWithUserBidsFormatted
    ];
    
    // Remover duplicatas (serviços que o usuário criou e também fez proposta)
    const uniqueServices = Array.from(
      new Map(allServices.map(service => [service.id, service])).values()
    );
    
    return NextResponse.json(uniqueServices);
  } catch (error) {
    console.error("Erro ao buscar serviços do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
