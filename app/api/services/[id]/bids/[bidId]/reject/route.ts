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

// POST /api/services/[id]/bids/[bidId]/reject - Rejeitar uma proposta
export async function POST(
  request: NextRequest,
  context: RouteParams
)
) {
  try {
    console.log('API reject: Iniciando processamento de rejeição de proposta');
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('API reject: Usuário não autenticado');
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { id: serviceId, bidId } = params;
    console.log(`API reject: Rejeitando proposta ${bidId} para serviço ${serviceId}`);
    
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
      console.log('API reject: Proposta não encontrada');
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário é o criador do serviço
    const isServiceCreator = bid.service.creatorId === session.user.id;
    
    if (!isServiceCreator) {
      console.log('API reject: Usuário não é o criador do serviço');
      return NextResponse.json(
        { error: "Apenas o criador do serviço pode rejeitar propostas" },
        { status: 403 }
      );
    }
    
    console.log('API reject: Atualizando status da proposta para REJECTED');
    
    // Atualizar o status da proposta
    const updatedBid = await prisma.serviceBid.update({
      where: { id: bidId },
      data: { status: "REJECTED" }
    });
    
    console.log('API reject: Criando notificação');
    
    // Criar notificação
    await prisma.notification.create({
      data: {
        type: "REJECTION",
        message: "Sua proposta foi rejeitada.",
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
    
    console.log('API reject: Proposta rejeitada com sucesso');
    return NextResponse.json(updatedBid);
  } catch (error) {
    console.error("API reject: Erro ao rejeitar proposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
