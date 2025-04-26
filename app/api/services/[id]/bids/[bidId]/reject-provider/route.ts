import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/services/[id]/bids/[bidId]/reject-provider - Prestador rejeita contraproposta do contratante
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; bidId: string } }
) {
  try {
    console.log('API reject-provider: Iniciando processamento de rejeição de contraproposta pelo prestador');
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('API reject-provider: Usuário não autenticado');
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { id: serviceId, bidId } = params;
    console.log(`API reject-provider: Prestador rejeitando contraproposta ${bidId} para serviço ${serviceId}`);
    
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
      console.log('API reject-provider: Proposta não encontrada');
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário é o prestador de serviço que fez a proposta
    const isProvider = bid.providerId === session.user.id;
    
    if (!isProvider) {
      console.log('API reject-provider: Usuário não é o prestador que fez a proposta');
      return NextResponse.json(
        { error: "Apenas o prestador que fez a proposta pode rejeitá-la" },
        { status: 403 }
      );
    }
    
    // Verificar se a proposta está no status de contraproposta
    if (bid.status !== "COUNTER_OFFERED") {
      console.log('API reject-provider: Proposta não está no status de contraproposta');
      return NextResponse.json(
        { error: "Apenas contrapropostas podem ser rejeitadas pelo prestador" },
        { status: 400 }
      );
    }
    
    console.log('API reject-provider: Atualizando status da proposta para REJECTED');
    
    // Atualizar o status da proposta
    const updatedBid = await prisma.serviceBid.update({
      where: { id: bidId },
      data: { status: "REJECTED" }
    });
    
    console.log('API reject-provider: Criando notificação');
    
    // Criar notificação para o contratante
    await prisma.notification.create({
      data: {
        type: "REJECTION",
        message: "O prestador rejeitou sua contraproposta.",
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
    
    console.log('API reject-provider: Contraproposta rejeitada com sucesso');
    return NextResponse.json(updatedBid);
  } catch (error) {
    console.error("API reject-provider: Erro ao rejeitar contraproposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
