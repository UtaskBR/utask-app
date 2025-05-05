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
          },
        },
        provider: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!bid || bid.service.id !== serviceId) {
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }

    if (bid.service.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Apenas o criador do serviço pode rejeitar propostas" },
        { status: 403 }
      );
    }

    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: { status: "REJECTED" },
    });

    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        type: "REJECTION",
        title: "Proposta rejeitada",
        message: "Sua proposta foi rejeitada.",
        receiverId: bid.provider.id,
        senderId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json(updatedBid);
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
