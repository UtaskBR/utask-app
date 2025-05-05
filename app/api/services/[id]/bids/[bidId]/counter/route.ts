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
    const { price, proposedDate, message } = await request.json();

    // Buscar a proposta e verificar se pertence ao serviço
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        service: { select: { id: true, creatorId: true, status: true } },
      },
    });

    if (!bid || bid.service.id !== serviceId) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    if (bid.service.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Apenas o criador do serviço pode fazer contrapropostas" },
        { status: 403 }
      );
    }

    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: {
        status: "COUNTER_OFFER",
        price: price !== undefined ? parseFloat(price) : bid.price,
        proposedDate: proposedDate ? new Date(proposedDate) : bid.proposedDate,
        message: message ?? bid.message,
        updatedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        type: "COUNTER_OFFER",
        title: "Nova contraproposta",
        message: "Você recebeu uma contraproposta.",
        receiverId: bid.providerId,
        senderId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json(updatedBid);
  } catch (error: any) {
    console.error("Erro ao processar contraproposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + error.message },
      { status: 500 }
    );
  }
}
