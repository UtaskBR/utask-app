import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";

// POST /api/services/[id]/bids/[bidId]/counter - Fazer uma contraproposta
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; bidId: string } }
) {
  try {
    console.log('API counter: Iniciando processamento de contraproposta');
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('API counter: Usuário não autenticado');
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { id: serviceId, bidId } = params;
    console.log(`API counter: Processando contraproposta para proposta ${bidId} do serviço ${serviceId}`);
    
    const body = await request.json();
    const { value, proposedDate, message } = body;
    
    console.log('API counter: Dados recebidos:', { value, proposedDate, message });
    
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
      console.log('API counter: Proposta não encontrada');
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário é o criador do serviço
    const isServiceCreator = bid.service.creatorId === session.user.id;
    
    if (!isServiceCreator) {
      console.log('API counter: Usuário não é o criador do serviço');
      return NextResponse.json(
        { error: "Apenas o criador do serviço pode fazer contrapropostas" },
        { status: 403 }
      );
    }
    
    console.log('API counter: Atualizando proposta com contraproposta');
    
    // Atualizar a proposta com a contraproposta
    const updatedBid = await prisma.serviceBid.update({
      where: { id: bidId },
      data: { 
        status: "COUNTER_OFFERED",
        value: value !== undefined ? parseFloat(value) : undefined,
        proposedDate: proposedDate ? new Date(proposedDate) : undefined,
        message: message || undefined
      }
    });
    
    console.log('API counter: Criando notificação');
    
    // Criar notificação
    await prisma.notification.create({
      data: {
        type: "COUNTER_OFFER",
        message: "Você recebeu uma contraproposta.",
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
    
    console.log('API counter: Contraproposta enviada com sucesso');
    return NextResponse.json(updatedBid);
  } catch (error) {
    console.error("API counter: Erro ao processar contraproposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
