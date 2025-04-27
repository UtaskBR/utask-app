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

// POST /api/services/[id]/bids/[bidId]/accept-provider - Prestador aceita contraproposta do contratante
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string, bidId: string } }
) {
  try {
    console.log('API accept-provider: Iniciando processamento de aceitação de contraproposta pelo prestador');
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('API accept-provider: Usuário não autenticado');
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { id: serviceId, bidId } = params;
    console.log(`API accept-provider: Prestador aceitando contraproposta ${bidId} para serviço ${serviceId}`);
    
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
      console.log('API accept-provider: Proposta não encontrada');
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário é o prestador de serviço que fez a proposta
    const isProvider = bid.providerId === session.user.id;
    
    if (!isProvider) {
      console.log('API accept-provider: Usuário não é o prestador que fez a proposta');
      return NextResponse.json(
        { error: "Apenas o prestador que fez a proposta pode aceitá-la" },
        { status: 403 }
      );
    }
    
    // Verificar se a proposta está no status de contraproposta
    if (bid.status !== "COUNTER_OFFERED") {
      console.log('API accept-provider: Proposta não está no status de contraproposta');
      return NextResponse.json(
        { error: "Apenas contrapropostas podem ser aceitas pelo prestador" },
        { status: 400 }
      );
    }
    
    console.log('API accept-provider: Atualizando status da proposta para ACCEPTED');
    
    // Atualizar o status da proposta
    const updatedBid = await prisma.serviceBid.update({
      where: { id: bidId },
      data: { status: "ACCEPTED" }
    });
    
    console.log('API accept-provider: Atualizando status do serviço para IN_PROGRESS');
    
    // Atualizar o status do serviço
    await prisma.service.update({
      where: { id: serviceId },
      data: { status: "IN_PROGRESS" }
    });
    
    console.log('API accept-provider: Rejeitando outras propostas');
    
    // Rejeitar todas as outras propostas
    await prisma.serviceBid.updateMany({
      where: {
        serviceId,
        id: { not: bidId }
      },
      data: { status: "REJECTED" }
    });
    
    console.log('API accept-provider: Criando notificação');
    
    // Criar notificação para o contratante
    await prisma.notification.create({
      data: {
        type: "ACCEPTANCE",
        message: "O prestador aceitou sua contraproposta!",
        receiver: {
          connect: {
            id: bid.service.creatorId
          }
        },
        sender: {
          connect: {
            id: session.user.id
          }
        }
      }
    });
    
    console.log('API accept-provider: Contraproposta aceita com sucesso');
    return NextResponse.json(updatedBid);
  } catch (error) {
    console.error("API accept-provider: Erro ao aceitar contraproposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
