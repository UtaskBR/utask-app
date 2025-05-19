import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// POST /api/services/[id]/bids/[bidId]/reject - Rejeitar uma proposta
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

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        service: {
          select: {
            id: true,
            creatorId: true,
            status: true,
            title: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!bid) {
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }

    if (bid.service.id !== serviceId) {
      return NextResponse.json(
        { error: "Proposta não pertence a este serviço" },
        { status: 400 }
      );
    }

    if (bid.service.status !== "OPEN") {
      return NextResponse.json(
        { error: "Não é possível rejeitar propostas para serviços que não estão abertos" },
        { status: 400 }
      );
    }

    if (bid.service.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Apenas o criador do serviço pode rejeitar propostas" },
        { status: 403 }
      );
    }

    if (bid.status !== "PENDING") {
      return NextResponse.json(
        { error: "Apenas propostas pendentes podem ser rejeitadas" },
        { status: 400 }
      );
    }

    // Formatar o valor para exibição
    const formattedPrice = bid.price 
      ? `R$ ${bid.price.toFixed(2)}` 
      : "valor não especificado";

    // Formatar a data para exibição
    const formattedDate = bid.proposedDate 
      ? new Date(bid.proposedDate).toLocaleString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : "data não especificada";

    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: { 
        status: "REJECTED",
        updatedAt: new Date()
      },
    });

    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        type: "REJECTION",
        title: "Proposta rejeitada",
        message: `Sua proposta para o serviço "${bid.service.title}" com valor ${formattedPrice} e data ${formattedDate} foi rejeitada pelo contratante.`,
        receiverId: bid.provider.id,
        senderId: session.user.id,
        serviceId: serviceId,
        bidId: bidId,
        read: false,
      },
    });

    return NextResponse.json({
      ...updatedBid,
      message: "Proposta rejeitada com sucesso"
    });
  } catch (error: any) {
    console.error("Erro ao rejeitar proposta:", error);
    return NextResponse.json(
      {
        error:
          "Erro ao processar a solicitação: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
