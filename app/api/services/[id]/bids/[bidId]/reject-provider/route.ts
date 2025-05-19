import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// POST /api/services/[id]/bids/[bidId]/reject-provider
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
            title: true,
            status: true
          },
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
        { error: "Não é possível rejeitar contrapropostas para serviços que não estão abertos" },
        { status: 400 }
      );
    }

    if (bid.providerId !== session.user.id) {
      return NextResponse.json(
        { error: "Apenas o prestador pode rejeitar a contraproposta" },
        { status: 403 }
      );
    }

    if (bid.status !== "COUNTER_OFFER") {
      return NextResponse.json(
        { error: "Apenas contrapropostas podem ser rejeitadas pelo prestador" },
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
        updatedAt: new Date(),
      },
    });

    const providerName = bid.provider.name || "O prestador";

    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        type: "REJECTION",
        title: "Contraproposta rejeitada",
        message: `${providerName} rejeitou sua contraproposta para o serviço "${bid.service.title}" com valor ${formattedPrice} e data ${formattedDate}.`,
        receiverId: bid.service.creatorId,
        senderId: session.user.id,
        serviceId: serviceId,
        bidId: bidId,
        read: false,
      },
    });

    return NextResponse.json({
      ...updatedBid,
      message: "Contraproposta rejeitada com sucesso"
    });
  } catch (error: any) {
    console.error("Erro ao rejeitar contraproposta:", error);
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
