import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// POST /api/services/[id]/bids/[bidId]/accept
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; bidId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: serviceId, bidId } = params;
    const userId = session.user.id;

    // Fetch the service creator's wallet first
    const creatorWallet = await prisma.wallet.findUnique({
      where: { userId: userId },
    });

    if (!creatorWallet) {
      // This case should ideally not happen if wallets are created on user registration
      return NextResponse.json({ error: "Carteira do criador não encontrada." }, { status: 500 });
    }

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
      }
    });

    if (!bid || bid.serviceId !== serviceId) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    if (bid.service.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Apenas o criador do serviço pode aceitar propostas" }, { status: 403 });
    }

    if (bid.service.status !== "OPEN") {
      return NextResponse.json({ error: "Este serviço não está mais aberto a propostas." }, { status: 400 });
    }

    if (!bid.price || bid.price <= 0) {
      // If bid price is zero or not set, skip funds check and reservation.
      // This case might need specific business logic: can services be free?
      // For now, we proceed without reservation for zero-price bids.
      console.log(`Bid ${bidId} for service ${serviceId} has no price or zero price. Skipping funds check.`);
    } else {
      const availableBalance = creatorWallet.balance - creatorWallet.reservedBalance;
      if (availableBalance < bid.price) {
        return NextResponse.json(
          { error: "INSUFFICIENT_FUNDS", message: "Saldo insuficiente para aceitar esta proposta." },
          { status: 402 } // 402 Payment Required is fitting
        );
      }
    }

    // Formatar valores para exibição
    const formattedPrice = bid.price ? `R$ ${bid.price.toFixed(2)}` : "valor não especificado";
    
    // Formatar datas para exibição
    let formattedDate = "data não especificada";
    if (bid.proposedDate) {
      const date = new Date(bid.proposedDate);
      formattedDate = date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Use Prisma transaction to ensure atomicity
    const updatedBid = await prisma.$transaction(async (tx) => {
      // Reserve funds if bid.price is valid
      if (bid.price && bid.price > 0) {
        await tx.wallet.update({
          where: { id: creatorWallet.id },
          data: { reservedBalance: { increment: bid.price } },
        });
      }

      // Atualizar status da proposta aceita
      const acceptedBid = await tx.bid.update({
        where: { id: bidId },
        data: { status: "ACCEPTED" },
      });

      // Atualizar o status do serviço
      await tx.service.update({
        where: { id: serviceId },
        data: {
          status: "IN_PROGRESS",
          price: bid.price, // <-- valor aceito
          date: bid.proposedDate, // <-- data combinada
        },
      });

      // Rejeitar todas as outras propostas
      await tx.bid.updateMany({
        where: {
          serviceId,
          id: { not: bidId },
        },
        data: { status: "REJECTED" },
      });

      // Notificação para o prestador com detalhes completos
      await tx.notification.create({
        data: {
          id: crypto.randomUUID(),
          type: "ACCEPTANCE",
          title: "Proposta Aceita",
          message: `Sua proposta para o serviço "${bid.service.title}" foi aceita! Valor: ${formattedPrice}. Data/hora: ${formattedDate}. O serviço está agora em andamento.`,
          receiverId: bid.provider.id,
          senderId: userId,
          bidId: acceptedBid.id,
          serviceId: bid.service.id,
          read: false,
        },
      });
      return acceptedBid;
    });

    return NextResponse.json(updatedBid);
  } catch (error) {
    console.error("Erro ao aceitar proposta:", error);
    // Handle potential transaction rollback error if needed, though Prisma usually handles it
    return NextResponse.json(
      { error: "Erro interno: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
