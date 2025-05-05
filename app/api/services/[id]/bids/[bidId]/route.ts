import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET, PUT, DELETE /api/services/[id]/bids/[bidId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, bidId: string }> }
) {
  try {
    const { id: serviceId, bidId } = await params;
    
    // Buscar a proposta usando SQL bruto
    const bids = await prisma.$queryRaw`
      SELECT 
        b.id, 
        b."serviceId", 
        b."providerId", 
        b.status,
        b.price,
        b."proposedDate",
        b.message,
        b."createdAt",
        b."updatedAt",
        s.id as service_id,
        s.title as service_title,
        s."creatorId" as service_creator_id,
        s.status as service_status,
        p.id as provider_id,
        p.name as provider_name,
        p.image as provider_image
      FROM "Bid" b
      JOIN "Service" s ON b."serviceId" = s.id
      JOIN "User" p ON b."providerId" = p.id
      WHERE b.id = ${bidId} AND b."serviceId" = ${serviceId}
    `;
    
    if (!bids || (bids as any[]).length === 0) {
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }
    
    const bid = (bids as any[])[0];
    
    // Buscar o rating do provedor
    const reviews = await prisma.$queryRaw`
      SELECT rating FROM "Review" WHERE "receiverId" = ${bid.provider_id}
    `;
    
    let providerRating = null;
    if (reviews && (reviews as any[]).length > 0) {
      const totalRating = (reviews as any[]).reduce((sum, review) => sum + review.rating, 0);
      providerRating = totalRating / (reviews as any[]).length;
    }
    
    // Formatar a resposta
    const formattedBid = {
      id: bid.id,
      serviceId: bid.serviceId,
      providerId: bid.providerId,
      status: bid.status,
      price: bid.price,
      proposedDate: bid.proposedDate,
      message: bid.message,
      createdAt: bid.createdAt,
      updatedAt: bid.updatedAt,
      service: {
        id: bid.service_id,
        title: bid.service_title,
        creatorId: bid.service_creator_id,
        status: bid.service_status
      },
      provider: {
        id: bid.provider_id,
        name: bid.provider_name,
        image: bid.provider_image,
        rating: providerRating
      }
    };
    
    return NextResponse.json(formattedBid);
  } catch (error) {
    console.error("Erro ao buscar proposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, bidId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { id: serviceId, bidId } = await params;
    const body = await request.json();
    const { status, price, proposedDate, message } = body;
    
    // Buscar a proposta usando SQL bruto
    const bids = await prisma.$queryRaw`
      SELECT 
        b.id, 
        b."serviceId", 
        b."providerId", 
        b.status,
        s.id as service_id,
        s.title as service_title,
        s."creatorId" as service_creator_id,
        s.status as service_status,
        p.id as provider_id,
        p.name as provider_name
      FROM "Bid" b
      JOIN "Service" s ON b."serviceId" = s.id
      JOIN "User" p ON b."providerId" = p.id
      WHERE b.id = ${bidId} AND b."serviceId" = ${serviceId}
    `;
    
    if (!bids || (bids as any[]).length === 0) {
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }
    
    const bid = (bids as any[])[0];
    
    // Verificar se o usuário é o criador do serviço ou o provedor da proposta
    const isServiceCreator = bid.service_creator_id === session.user.id;
    const isProvider = bid.providerId === session.user.id;
    
    if (!isServiceCreator && !isProvider) {
      return NextResponse.json(
        { error: "Não autorizado a modificar esta proposta" },
        { status: 403 }
      );
    }
    
    // Lógica para atualizar a proposta
    let updatedBid;
    let notificationType;
    let notificationMessage;
    const now = new Date();
    
    // Se o criador do serviço está aceitando a proposta
    if (isServiceCreator && status === "ACCEPTED") {
      // Atualizar o status da proposta
      await prisma.$executeRaw`
        UPDATE "Bid"
        SET status = 'ACCEPTED', "updatedAt" = ${now}
        WHERE id = ${bidId}
      `;
      
      // Atualizar o status do serviço
      await prisma.$executeRaw`
        UPDATE "Service"
        SET status = 'IN_PROGRESS', "updatedAt" = ${now}
        WHERE id = ${serviceId}
      `;
      
      // Rejeitar todas as outras propostas
      await prisma.$executeRaw`
        UPDATE "Bid"
        SET status = 'REJECTED', "updatedAt" = ${now}
        WHERE "serviceId" = ${serviceId} AND id != ${bidId}
      `;
      
      notificationType = "ACCEPTANCE";
      notificationMessage = `Sua proposta para o serviço "${bid.service_title}" foi aceita!`;
    } 
    // Se o criador do serviço está rejeitando a proposta
    else if (isServiceCreator && status === "REJECTED") {
      await prisma.$executeRaw`
        UPDATE "Bid"
        SET status = 'REJECTED', "updatedAt" = ${now}
        WHERE id = ${bidId}
      `;
      
      notificationType = "REJECTION";
      notificationMessage = `Sua proposta para o serviço "${bid.service_title}" foi rejeitada.`;
    } 
    // Se o criador do serviço está fazendo uma contra-proposta
    else if (isServiceCreator && status === "COUNTER_OFFER") {
      const newPrice = price !== undefined ? price : null;
      const newProposedDate = proposedDate ? new Date(proposedDate) : null;
      const newMessage = message || null;
      
      await prisma.$executeRaw`
        UPDATE "Bid"
        SET 
          status = 'COUNTER_OFFER', 
          price = COALESCE(${newPrice}, price),
          "proposedDate" = COALESCE(${newProposedDate}, "proposedDate"),
          message = COALESCE(${newMessage}, message),
          "updatedAt" = ${now}
        WHERE id = ${bidId}
      `;
      
      notificationType = "COUNTER_OFFER";
      notificationMessage = `Você recebeu uma contra-proposta para o serviço "${bid.service_title}".`;
    }
    // Se o provedor está aceitando uma contra-proposta
    else if (isProvider && status === "ACCEPTED" && bid.status === "COUNTER_OFFER") {
      // Atualizar o status da proposta
      await prisma.$executeRaw`
        UPDATE "Bid"
        SET status = 'ACCEPTED', "updatedAt" = ${now}
        WHERE id = ${bidId}
      `;
      
      // Atualizar o status do serviço
      await prisma.$executeRaw`
        UPDATE "Service"
        SET status = 'IN_PROGRESS', "updatedAt" = ${now}
        WHERE id = ${serviceId}
      `;
      
      // Rejeitar todas as outras propostas
      await prisma.$executeRaw`
        UPDATE "Bid"
        SET status = 'REJECTED', "updatedAt" = ${now}
        WHERE "serviceId" = ${serviceId} AND id != ${bidId}
      `;
      
      notificationType = "ACCEPTANCE";
      notificationMessage = `A contraproposta para o serviço "${bid.service_title}" foi aceita!`;
    }
    // Se o provedor está rejeitando uma contra-proposta
    else if (isProvider && status === "REJECTED" && bid.status === "COUNTER_OFFER") {
      await prisma.$executeRaw`
        UPDATE "Bid"
        SET status = 'REJECTED', "updatedAt" = ${now}
        WHERE id = ${bidId}
      `;
      
      notificationType = "REJECTION";
      notificationMessage = `A contraproposta para o serviço "${bid.service_title}" foi rejeitada.`;
    }
    // Se o provedor está atualizando sua proposta
    else if (isProvider && !status) {
      const newPrice = price !== undefined ? price : null;
      const newProposedDate = proposedDate ? new Date(proposedDate) : null;
      const newMessage = message || null;
      
      await prisma.$executeRaw`
        UPDATE "Bid"
        SET 
          price = COALESCE(${newPrice}, price),
          "proposedDate" = COALESCE(${newProposedDate}, "proposedDate"),
          message = COALESCE(${newMessage}, message),
          "updatedAt" = ${now}
        WHERE id = ${bidId}
      `;
      
      notificationType = "BID";
      notificationMessage = `A proposta para seu serviço "${bid.service_title}" foi atualizada por ${bid.provider_name}.`;
    } else {
      return NextResponse.json(
        { error: "Operação não permitida" },
        { status: 400 }
      );
    }
    
    // Criar notificação
    if (notificationType && notificationMessage) {
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
          ${notificationType}, 
          ${notificationMessage}, 
          ${isServiceCreator ? bid.providerId : bid.service_creator_id}, 
          ${session.user.id}, 
          ${now}, 
          ${now},
          false
        )
      `;
    }
    
    // Buscar a proposta atualizada
    const updatedBids = await prisma.$queryRaw`
      SELECT * FROM "Bid" WHERE id = ${bidId}
    `;
    
    return NextResponse.json((updatedBids as any[])[0]);
  } catch (error) {
    console.error("Erro ao atualizar proposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, bidId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { id: serviceId, bidId } = await params;
    
    // Buscar a proposta usando SQL bruto
    const bids = await prisma.$queryRaw`
      SELECT 
        b.id, 
        b."serviceId", 
        b."providerId", 
        s."creatorId" as service_creator_id
      FROM "Bid" b
      JOIN "Service" s ON b."serviceId" = s.id
      WHERE b.id = ${bidId} AND b."serviceId" = ${serviceId}
    `;
    
    if (!bids || (bids as any[]).length === 0) {
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }
    
    const bid = (bids as any[])[0];
    
    // Verificar se o usuário é o provedor da proposta
    const isProvider = bid.providerId === session.user.id;
    
    if (!isProvider) {
      return NextResponse.json(
        { error: "Apenas o prestador que fez a proposta pode excluí-la" },
        { status: 403 }
      );
    }
    
    // Excluir a proposta
    await prisma.$executeRaw`
      DELETE FROM "Bid" WHERE id = ${bidId}
    `;
    
    return NextResponse.json({ message: "Proposta excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir proposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
