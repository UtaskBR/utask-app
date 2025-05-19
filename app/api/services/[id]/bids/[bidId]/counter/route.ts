import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// POST /api/services/[id]/bids/[bidId]/counter - Fazer uma contraproposta
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; bidId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: serviceId, bidId } = params;
    const body = await request.json();
    const price = body.price !== undefined ? parseFloat(String(body.price)) : undefined;
    const proposedDate = body.proposedDate || undefined;
    const message = body.message || undefined;

    if (price !== undefined && (isNaN(price) || price <= 0)) {
      return NextResponse.json(
        { error: "O valor da contraproposta deve ser um número positivo" },
        { status: 400 }
      );
    }

    // Buscar a proposta e verificar se pertence ao serviço
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        service: { 
          select: { 
            id: true, 
            creatorId: true, 
            status: true,
            title: true 
          } 
        },
        provider: {
          select: {
            id: true,
            name: true
          }
        }
      },
    });

    if (!bid) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    if (bid.service.id !== serviceId) {
      return NextResponse.json({ error: "Proposta não pertence a este serviço" }, { status: 400 });
    }

    if (bid.service.status !== "OPEN") {
      return NextResponse.json(
        { error: "Não é possível fazer contrapropostas para serviços que não estão abertos" },
        { status: 400 }
      );
    }

    if (bid.service.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Apenas o criador do serviço pode fazer contrapropostas" },
        { status: 403 }
      );
    }

    if (bid.status !== "PENDING") {
      return NextResponse.json(
        { error: "Apenas propostas pendentes podem receber contrapropostas" },
        { status: 400 }
      );
    }

    // Formatar a data para exibição
    const formattedDate = proposedDate 
      ? new Date(proposedDate).toLocaleString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : bid.proposedDate 
        ? new Date(bid.proposedDate).toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        : "data original";

    // Formatar o valor para exibição
    const formattedPrice = price !== undefined 
      ? `R$ ${price.toFixed(2)}` 
      : bid.price 
        ? `R$ ${bid.price.toFixed(2)}` 
        : "valor original";

    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: {
        status: "COUNTER_OFFER",
        price: price !== undefined ? price : bid.price,
        proposedDate: proposedDate ? new Date(proposedDate) : bid.proposedDate,
        message: message ?? bid.message,
        updatedAt: new Date(),
      },
    });

    // Criar notificação com detalhes mais completos
    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        type: "COUNTER_OFFER",
        title: "Nova contraproposta para você",
        message: `Você recebeu uma contraproposta para o serviço "${bid.service.title}" com valor ${formattedPrice} e data ${formattedDate}.`,
        receiverId: bid.providerId,
        senderId: session.user.id,
        serviceId: serviceId,
        bidId: bidId,
        read: false,
      },
    });

    return NextResponse.json({
      ...updatedBid,
      message: "Contraproposta enviada com sucesso"
    });
  } catch (error: any) {
    console.error("Erro ao processar contraproposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + error.message },
      { status: 500 }
    );
  }
}
