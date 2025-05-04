import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// POST /api/services/[id]/bids/[bidId]/accept-provider
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
        service: { select: { id: true, creatorId: true } }
      }
    });

    if (!bid || bid.service.id !== serviceId) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    if (bid.providerId !== session.user.id) {
      return NextResponse.json({ error: "Apenas o prestador pode aceitar a contraproposta" }, { status: 403 });
    }

    if (bid.status !== "COUNTER_OFFER") {
      return NextResponse.json({ error: "A proposta não está em estado de contraproposta" }, { status: 400 });
    }

    // Atualizar a proposta aceita
    const acceptedBid = await prisma.bid.update({
      where: { id: bidId },
      data: {
        status: "ACCEPTED",
        updatedAt: new Date()
      }
    });

    // Atualizar o serviço para em andamento
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        status: "IN_PROGRESS",
        updatedAt: new Date()
      }
    });

    // Rejeitar outras propostas
    await prisma.bid.updateMany({
      where: {
        serviceId: serviceId,
        id: { not: bidId }
      },
      data: {
        status: "REJECTED",
        updatedAt: new Date()
      }
    });

    // Criar notificação para o contratante
    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        type: "ACCEPTANCE",
        title: "Contraproposta aceita",
        message: "O prestador aceitou sua contraproposta!",
        receiverId: bid.service.creatorId,
        senderId: session.user.id,
        read: false
      }
    });

    return NextResponse.json(acceptedBid);
  } catch (error: any) {
    console.error("Erro ao aceitar contraproposta:", error);
    return NextResponse.json(
      {
        error:
          "Erro ao processar a solicitação: " +
          (error instanceof Error ? error.message : String(error))
      },
      { status: 500 }
    );
  }
}
