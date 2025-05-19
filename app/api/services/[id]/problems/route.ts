import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// POST /api/services/[id]/problem - Reportar um problema com o serviço
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
    
    const { id } = await params;
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

    // Formatar valores para exibição
    const formattedPrice = existingService.price 
      ? `R$ ${existingService.price.toFixed(2)}` 
      : "valor não especificado";
    
    // Formatar datas para exibição
    let formattedDate = "data não especificada";
    if (existingService.date) {
      const date = new Date(existingService.date);
      formattedDate = date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Registrar o cancelamento usando ServiceCancelRequest em vez de ServiceProblem
    await prisma.serviceCancelRequest.create({
      data: {
        service: { connect: { id } },
        requester: { connect: { id: session.user.id } },
        reason: body.reason || "Problema não especificado"
      }
    });

    // Estornar o valor para o contratante
    // Primeiro, verificar se o serviço tem um valor definido
    const acceptedBid = existingService.bids[0];
    const serviceValue = acceptedBid?.price ?? existingService.price;

    if (serviceValue == null) {
      return NextResponse.json(
        { error: "Valor do serviço não definido para estorno" },
        { status: 400 }
      );
    }

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
    const requesterName = session.user.id === existingService.creatorId 
      ? existingService.creator.name || "O contratante" 
      : acceptedBid.provider.name || "O prestador";

    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        type: "SERVICE_PROBLEM",
        title: "Serviço Cancelado por Problema",
        message: `Um problema foi reportado por ${requesterName} no serviço "${existingService.title}" (${formattedPrice}, ${formattedDate}) e ele foi cancelado. O valor foi estornado para sua carteira. Motivo: ${body.reason || "Não especificado"}`,
        receiverId: existingService.creatorId,
        senderId: session.user.id,
        serviceId: id,
        read: false
      }
    });

    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        type: "SERVICE_PROBLEM",
        title: "Serviço Cancelado por Problema",
        message: `Um problema foi reportado por ${requesterName} no serviço "${existingService.title}" (${formattedPrice}, ${formattedDate}) e ele foi cancelado. Motivo: ${body.reason || "Não especificado"}`,
        receiverId: providerId,
        senderId: session.user.id,
        serviceId: id,
        read: false
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
