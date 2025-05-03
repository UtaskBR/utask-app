import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET, POST /api/services/[id]/bids
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params;
    
    // Buscar as propostas usando SQL bruto
    const bids = await prisma.$queryRaw`
      SELECT 
        sb.id, 
        sb."serviceId", 
        sb."providerId", 
        sb.status,
        sb.price,
        sb."proposedDate",
        sb.message,
        sb."createdAt",
        sb."updatedAt",
        p.id as provider_id,
        p.name as provider_name,
        p.image as provider_image
      FROM "ServiceBid" sb
      JOIN "User" p ON sb."providerId" = p.id
      WHERE sb."serviceId" = ${serviceId}
      ORDER BY sb."createdAt" DESC
    `;
    
    // Buscar os ratings dos provedores
    const providerIds = Array.from(new Set((bids as any[]).map(bid => bid.provider_id)));
    
    const providerRatings: { [key: string]: number | null } = {};
    
    for (const providerId of providerIds) {
      const reviews = await prisma.$queryRaw`
        SELECT rating FROM "Review" WHERE "receiverId" = ${providerId}
      `;
      
      if (reviews && (reviews as any[]).length > 0) {
        const totalRating = (reviews as any[]).reduce((sum, review) => sum + review.rating, 0);
        providerRatings[providerId] = totalRating / (reviews as any[]).length;
      } else {
        providerRatings[providerId] = null;
      }
    }
    
    // Formatar a resposta
    const formattedBids = (bids as any[]).map(bid => ({
      id: bid.id,
      serviceId: bid.serviceId,
      providerId: bid.providerId,
      status: bid.status,
      price: bid.price,
      proposedDate: bid.proposedDate,
      message: bid.message,
      createdAt: bid.createdAt,
      updatedAt: bid.updatedAt,
      provider: {
        id: bid.provider_id,
        name: bid.provider_name,
        image: bid.provider_image,
        rating: providerRatings[bid.provider_id]
      }
    }));
    
    return NextResponse.json(formattedBids);
  } catch (error) {
    console.error("Erro ao buscar propostas:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const { price, proposedDate, message } = body;
    
    // Verificar se o serviço existe
    const services = await prisma.$queryRaw`
      SELECT 
        s.id, 
        s."creatorId",
        s.title,
        s.status
      FROM "Service" s
      WHERE s.id = ${serviceId}
    `;
    
    if (!services || (services as any[]).length === 0) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    const service = (services as any[])[0];
    
    // Verificar se o usuário não é o criador do serviço
    if (service.creatorId === session.user.id) {
      return NextResponse.json(
        { error: "O criador do serviço não pode fazer propostas para seu próprio serviço" },
        { status: 403 }
      );
    }
    
    // Verificar se o serviço está disponível
    if (service.status !== "OPEN") {
      return NextResponse.json(
        { error: "Este serviço não está disponível para propostas" },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário já fez uma proposta para este serviço
    const existingBids = await prisma.$queryRaw`
      SELECT id FROM "ServiceBid"
      WHERE "serviceId" = ${serviceId} AND "providerId" = ${session.user.id}
    `;
    
    if (existingBids && (existingBids as any[]).length > 0) {
      return NextResponse.json(
        { error: "Você já fez uma proposta para este serviço" },
        { status: 400 }
      );
    }
    
    // Criar a proposta
    const bidId = crypto.randomUUID();
    const now = new Date();
    const proposedDateValue = proposedDate ? new Date(proposedDate) : null;
    
    await prisma.$executeRaw`
      INSERT INTO "ServiceBid" (
        id, 
        "serviceId", 
        "providerId", 
        status, 
        price, 
        "proposedDate", 
        message, 
        "createdAt", 
        "updatedAt"
      )
      VALUES (
        ${bidId}, 
        ${serviceId}, 
        ${session.user.id}, 
        'PENDING', 
        ${price}, 
        ${proposedDateValue}, 
        ${message || null}, 
        ${now}, 
        ${now}
      )
    `;
    
    // Criar notificação para o criador do serviço
    const notificationId = crypto.randomUUID();
    
    await prisma.$executeRaw`
      INSERT INTO "Notification" (
        id, 
        type, 
        message, 
        "receiverId", 
        "senderId", 
        "createdAt", 
        "updatedAt",
        read
      )
      VALUES (
        ${notificationId}, 
        'BID', 
        ${`Você recebeu uma nova proposta para o serviço "${service.title}"`}, 
        ${service.creatorId}, 
        ${session.user.id}, 
        ${now}, 
        ${now},
        false
      )
    `;
    
    // Buscar a proposta criada
    const createdBids = await prisma.$queryRaw`
      SELECT * FROM "ServiceBid" WHERE id = ${bidId}
    `;
    
    return NextResponse.json((createdBids as any[])[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar proposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
