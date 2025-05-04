import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// POST /api/services/[id]/bids
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const serviceId = params.id;
    const { price, proposedDate, message } = await request.json();

    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, creatorId: true, title: true, status: true }
    });

    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    if (service.creatorId === session.user.id) {
      return NextResponse.json({ error: "Você não pode propor em seu próprio serviço" }, { status: 403 });
    }

    if (service.status !== "OPEN") {
      return NextResponse.json({ error: "Serviço indisponível para propostas" }, { status: 400 });
    }

    // Impedir propostas duplicadas
    const alreadyBid = await prisma.bid.findFirst({
      where: {
        serviceId,
        providerId: session.user.id
      }
    });

    if (alreadyBid) {
      return NextResponse.json({ error: "Você já fez uma proposta para este serviço" }, { status: 400 });
    }

    // Criar a proposta
    const bid = await prisma.bid.create({
      data: {
        id: crypto.randomUUID(),
        serviceId,
        providerId: session.user.id,
        value: price,
        proposedDate: proposedDate ? new Date(proposedDate) : null,
        message,
        status: "PENDING"
      }
    });

    // Notificar o criador do serviço
    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        type: "BID",
        title: "Nova proposta recebida",
        message: `Você recebeu uma nova proposta para o serviço "${service.title}"`,
        receiverId: service.creatorId,
        senderId: session.user.id,
        read: false
      }
    });

    return NextResponse.json(bid, { status: 201 });

  } catch (error: any) {
    console.error("Erro ao criar proposta:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar a proposta" },
      { status: 500 }
    );
  }
}
