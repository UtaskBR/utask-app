import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


// Tipo correto para os parâmetros no Next.js 15
type RouteParams = {
  params: {
    id: string;
    bidId: string;
  };
};

// POST /api/services/[id]/bids/[bidId]/accept - Aceitar uma proposta
export async function POST(
  request: NextRequest,
  context: { params: { id: string, bidId: string } }
) {
  try {
    console.log('API accept: Iniciando processamento de aceitação de proposta');
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('API accept: Usuário não autenticado');
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { id: serviceId, bidId } = params;
    console.log(`API accept: Aceitando proposta ${bidId} para serviço ${serviceId}`);
    
    // Verificar se a proposta existe
    const bid = await prisma.serviceBid.findUnique({
      where: { id: bidId },
      include: {
        service: {
          select: {
            id: true,
            creatorId: true,
            status: true
          }
        },
        provider: {
          select: {
            id: true
          }
        }
      }
    });
    
    if (!bid || bid.serviceId !== serviceId) {
      console.log('API accept: Proposta não encontrada');
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário é o criador do serviço
    const isServiceCreator = bid.service.creatorId === session.user.id;
    
    if (!isServiceCreator) {
      console.log('API accept: Usuário não é o criador do serviço');
      return NextResponse.json(
        { error: "Apenas o criador do serviço pode aceitar propostas" },
        { status: 403 }
      );
    }
    
    console.log('API accept: Atualizando status da proposta para ACCEPTED');
    
    // Atualizar o status da proposta
    const updatedBid = await prisma.serviceBid.update({
      where: { id: bidId },
      data: { status: "ACCEPTED" }
    });
    
    console.log('API accept: Atualizando status do serviço para IN_PROGRESS');
    
    // Atualizar o status do serviço
    await prisma.service.update({
      where: { id: serviceId },
      data: { status: "IN_PROGRESS" }
    });
    
    console.log('API accept: Rejeitando outras propostas');
    
    // Rejeitar todas as outras propostas
    await prisma.serviceBid.updateMany({
      where: {
        serviceId,
        id: { not: bidId }
      },
      data: { status: "REJECTED" }
    });
    
    console.log('API accept: Criando notificação');
    
    // Criar notificação
    await prisma.notification.create({
      data: {
        type: "ACCEPTANCE",
        message: "Sua proposta foi aceita!",
        receiver: {
          connect: {
            id: bid.providerId
          }
        },
        sender: {
          connect: {
            id: session.user.id
          }
        }
      }
    });
    
    console.log('API accept: Proposta aceita com sucesso');
    return NextResponse.json(updatedBid);
  } catch (error) {
    console.error("API accept: Erro ao aceitar proposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
