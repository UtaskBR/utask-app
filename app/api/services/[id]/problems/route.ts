import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


// Tipo correto para os parâmetros no Next.js 15
type RouteParams = {
  params: {
    id: string;
  };
};

// POST /api/services/[id]/problem - Reportar um problema com o serviço
export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const id = await context.params.id;
    const body = await request.json();
    
    // Verificar se o serviço existe
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: {
        bids: {
          where: {
            status: "ACCEPTED"
          },
          include: {
            provider: true
          }
        },
        creator: {
          include: {
            wallet: true
          }
        }
      }
    });
    
    if (!existingService) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário é o criador do serviço ou o prestador aceito
    const isCreator = existingService.creatorId === session.user.id;
    const isAcceptedProvider = existingService.bids.some(
      bid => bid.status === "ACCEPTED" && bid.providerId === session.user.id
    );
    
    if (!isCreator && !isAcceptedProvider) {
      return NextResponse.json(
        { error: "Não autorizado a reportar problemas neste serviço" },
        { status: 403 }
      );
    }
    
    // Verificar se o serviço está em andamento
    if (existingService.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Apenas serviços em andamento podem ter problemas reportados" },
        { status: 400 }
      );
    }

    // Registrar o problema
    await prisma.serviceProblem.create({
      data: {
        service: { connect: { id } },
        reporter: { connect: { id: session.user.id } },
        reason: body.reason || "Problema não especificado"
      }
    });

    // Estornar o valor para o contratante
    // Primeiro, verificar se o serviço tem um valor definido
    const acceptedBid = existingService.bids[0];
    const serviceValue = acceptedBid.value || existingService.value;

    // Estornar o valor para a carteira do contratante
    await prisma.wallet.update({
      where: { userId: existingService.creatorId },
      data: { balance: { increment: serviceValue } }
    });

    // Registrar a transação de estorno
    await prisma.transaction.create({
      data: {
        amount: serviceValue,
        type: "REFUND",
        description: `Estorno pelo serviço: ${existingService.title}. Motivo: ${body.reason || "Problema reportado"}`,
        serviceId: id,
        receiverId: existingService.creatorId
      }
    });

    // Atualizar o status do serviço para cancelado
    await prisma.service.update({
      where: { id },
      data: { status: "CANCELLED" }
    });

    // Criar notificações para ambas as partes
    const providerId = acceptedBid.providerId;

    await prisma.notification.create({
      data: {
        type: "SERVICE_PROBLEM",
        message: `Um problema foi reportado no serviço "${existingService.title}" e ele foi cancelado. O valor foi estornado.`,
        receiver: { connect: { id: existingService.creatorId } }
      }
    });

    await prisma.notification.create({
      data: {
        type: "SERVICE_PROBLEM",
        message: `Um problema foi reportado no serviço "${existingService.title}" e ele foi cancelado. Motivo: ${body.reason || "Não especificado"}`,
        receiver: { connect: { id: providerId } }
      }
    });

    return NextResponse.json({
      message: "Problema reportado com sucesso. O serviço foi cancelado e o valor estornado.",
      status: "CANCELLED"
    });
  } catch (error) {
    console.error("Erro ao reportar problema:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
