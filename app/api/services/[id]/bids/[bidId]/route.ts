import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/services/[id]/bids/[bidId] - Obter detalhes de uma proposta específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, bidId: string }> }
) {
  try {
    const resolvedParams = await params;
    const serviceId = resolvedParams.id;
    const bidId = resolvedParams.bidId;
    
    const bid = await prisma.serviceBid.findUnique({
      where: { id: bidId },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            professions: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            creatorId: true
          }
        }
      }
    });
    
    if (!bid) {
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }
    
    if (bid.serviceId !== serviceId) {
      return NextResponse.json(
        { error: "Proposta não pertence a este serviço" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(bid);
  } catch (error) {
    console.error("Erro ao buscar proposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// PATCH /api/services/[id]/bids/[bidId] - Atualizar uma proposta
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, bidId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const resolvedParams = await params;
    const serviceId = resolvedParams.id;
    const bidId = resolvedParams.bidId;
    
    const { status, value, proposedDate, message } = await request.json();
    
    // Buscar a proposta com informações do serviço e provedor
    const bid = await prisma.serviceBid.findUnique({
      where: { id: bidId },
      include: {
        provider: true,
        service: true
      }
    });
    
    if (!bid) {
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }
    
    if (bid.serviceId !== serviceId) {
      return NextResponse.json(
        { error: "Proposta não pertence a este serviço" },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário é o criador do serviço ou o provedor da proposta
    const isServiceCreator = bid.service.creatorId === session.user.id;
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
    
    // Se o criador do serviço está aceitando a proposta
    if (isServiceCreator && status === "ACCEPTED") {
      // Atualizar o status da proposta
      updatedBid = await prisma.serviceBid.update({
        where: { id: bidId },
        data: { status: "ACCEPTED" }
      });
      
      // Atualizar o status do serviço
      await prisma.service.update({
        where: { id: serviceId },
        data: { status: "IN_PROGRESS" }
      });
      
      // Rejeitar todas as outras propostas
      await prisma.serviceBid.updateMany({
        where: {
          serviceId,
          id: { not: bidId }
        },
        data: { status: "REJECTED" }
      });
      
      notificationType = "ACCEPTANCE";
      notificationMessage = `Sua proposta para o serviço "${bid.service.title}" foi aceita!`;
    } 
    // Se o criador do serviço está rejeitando a proposta
    else if (isServiceCreator && status === "REJECTED") {
      updatedBid = await prisma.serviceBid.update({
        where: { id: bidId },
        data: { status: "REJECTED" }
      });
      
      notificationType = "REJECTION";
      notificationMessage = `Sua proposta para o serviço "${bid.service.title}" foi rejeitada.`;
    } 
    // Se o criador do serviço está fazendo uma contra-proposta
    else if (isServiceCreator && status === "COUNTER_OFFERED") {
      updatedBid = await prisma.serviceBid.update({
        where: { id: bidId },
        data: { 
          status: "COUNTER_OFFERED",
          value: value !== undefined ? value : undefined,
          proposedDate: proposedDate ? new Date(proposedDate) : undefined,
          message: message || undefined
        }
      });
      
      notificationType = "COUNTER_OFFER";
      notificationMessage = `Você recebeu uma contra-proposta para o serviço "${bid.service.title}".`;
    }
    // Se o provedor está aceitando uma contra-proposta
    else if (isProvider && status === "ACCEPTED" && bid.status === "COUNTER_OFFERED") {
      // Atualizar o status da proposta
      updatedBid = await prisma.serviceBid.update({
        where: { id: bidId },
        data: { status: "ACCEPTED" }
      });
      
      // Atualizar o status do serviço
      await prisma.service.update({
        where: { id: serviceId },
        data: { status: "IN_PROGRESS" }
      });
      
      // Rejeitar todas as outras propostas
      await prisma.serviceBid.updateMany({
        where: {
          serviceId,
          id: { not: bidId }
        },
        data: { status: "REJECTED" }
      });
      
      notificationType = "ACCEPTANCE";
      notificationMessage = `A contraproposta para o serviço "${bid.service.title}" foi aceita!`;
    }
    // Se o provedor está rejeitando uma contra-proposta
    else if (isProvider && status === "REJECTED" && bid.status === "COUNTER_OFFERED") {
      updatedBid = await prisma.serviceBid.update({
        where: { id: bidId },
        data: { status: "REJECTED" }
      });
      
      notificationType = "REJECTION";
      notificationMessage = `A contraproposta para o serviço "${bid.service.title}" foi rejeitada.`;
    }
    // Se o provedor está atualizando sua proposta
    else if (isProvider && !status) {
      updatedBid = await prisma.serviceBid.update({
        where: { id: bidId },
        data: { 
          value: value !== undefined ? value : undefined,
          proposedDate: proposedDate ? new Date(proposedDate) : undefined,
          message: message || undefined
        }
      });
      
      notificationType = "BID";
      notificationMessage = `A proposta para seu serviço "${bid.service.title}" foi atualizada por ${bid.provider.name}.`;
    } else {
      return NextResponse.json(
        { error: "Operação não permitida" },
        { status: 400 }
      );
    }
    
    // Criar notificação
    if (notificationType && notificationMessage) {
      await prisma.notification.create({
        data: {
          type: notificationType as any,
          message: notificationMessage,
          receiver: {
            connect: {
              id: isServiceCreator ? bid.providerId : bid.service.creatorId
            }
          },
          sender: {
            connect: {
              id: session.user.id
            }
          }
        }
      });
    }
    
    return NextResponse.json(updatedBid);
  } catch (error) {
    console.error("Erro ao atualizar proposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
