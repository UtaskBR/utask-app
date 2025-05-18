import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// POST /api/services/[id]/confirm-completion
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
    const userId = session.user.id;

    // 1. Fetch the service and the accepted bid to identify creator and provider
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        creator: { select: { id: true, name: true, wallet: true } }, // Include wallet for payment
        bids: {
          where: { status: "ACCEPTED" },
          include: { provider: { select: { id: true, name: true, wallet: true } } }, // Include wallet for payment
        },
        completionConfirmations: true, // To check existing confirmations
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    if (service.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "O serviço deve estar em andamento para confirmar a conclusão" },
        { status: 400 }
      );
    }

    const acceptedBid = service.bids[0]; // Should be only one accepted bid
    if (!acceptedBid) {
      return NextResponse.json(
        { error: "Nenhuma proposta aceita encontrada para este serviço" },
        { status: 400 }
      );
    }

    const creatorId = service.creatorId;
    const providerId = acceptedBid.providerId;

    // 2. Check if the current user is either the creator or the accepted provider
    if (userId !== creatorId && userId !== providerId) {
      return NextResponse.json(
        { error: "Apenas o criador do serviço ou o prestador aceito podem confirmar a conclusão" },
        { status: 403 }
      );
    }

    // 3. Check if this user has already confirmed
    const existingConfirmation = service.completionConfirmations.find(
      (conf) => conf.userId === userId
    );

    if (existingConfirmation) {
      return NextResponse.json(
        { message: "Você já confirmou a conclusão deste serviço" },
        { status: 200 } // Or 400 if considered an error to re-confirm
      );
    }

    // 4. Record the confirmation
    await prisma.completionConfirmation.create({
      data: {
        serviceId: serviceId,
        userId: userId,
      },
    });

    // 5. Check if both parties have confirmed
    const allConfirmations = await prisma.completionConfirmation.findMany({
      where: { serviceId: serviceId },
    });

    const creatorConfirmed = allConfirmations.some((c) => c.userId === creatorId);
    const providerConfirmed = allConfirmations.some((c) => c.userId === providerId);

    if (creatorConfirmed && providerConfirmed) {
      // Both parties confirmed - Proceed to complete service and process payment

      if (!service.price || service.price <= 0) {
        // If service price is not set or zero, just mark as completed without payment
        await prisma.service.update({
          where: { id: serviceId },
          data: { status: "COMPLETED", updatedAt: new Date() },
        });
        // Notify both parties about completion without payment
        await prisma.notification.createMany({
          data: [
            {
              id: crypto.randomUUID(),
              type: "SERVICE_COMPLETED_NO_PAYMENT",
              title: "Serviço Concluído",
              message: `O serviço "${service.title}" foi concluído por ambas as partes (sem valor transacionado).`,
              receiverId: creatorId,
              senderId: providerId, // Or system
              serviceId: serviceId,
            },
            {
              id: crypto.randomUUID(),
              type: "SERVICE_COMPLETED_NO_PAYMENT",
              title: "Serviço Concluído",
              message: `O serviço "${service.title}" foi concluído por ambas as partes (sem valor transacionado).`,
              receiverId: providerId,
              senderId: creatorId, // Or system
              serviceId: serviceId,
            },
          ],
        });
        return NextResponse.json({
          message: "Serviço concluído por ambas as partes! (Sem valor transacionado)",
          serviceStatus: "COMPLETED",
        });
      }
      
      // Proceed with payment logic
      const amountToPay = service.price;
      const creatorWallet = service.creator.wallet;
      const providerWallet = acceptedBid.provider.wallet;

      if (!creatorWallet) {
        // This should ideally not happen if wallets are created on user registration
        // Mark service as disputed or requires admin intervention
        await prisma.service.update({
            where: { id: serviceId },
            data: { status: "DISPUTED", updatedAt: new Date() },
        });
        return NextResponse.json({ error: "Carteira do contratante não encontrada. Serviço marcado como DISPUTADO." }, { status: 500 });
      }
      if (!providerWallet) {
        // This should ideally not happen
        await prisma.service.update({
            where: { id: serviceId },
            data: { status: "DISPUTED", updatedAt: new Date() },
        });
        return NextResponse.json({ error: "Carteira do prestador não encontrada. Serviço marcado como DISPUTADO." }, { status: 500 });
      }

      if (creatorWallet.balance < amountToPay) {
        // Mark service as disputed or requires admin intervention due to insufficient funds
         await prisma.service.update({
            where: { id: serviceId },
            data: { status: "DISPUTED", updatedAt: new Date() },
        });
        // Notify admin and users
        return NextResponse.json({ error: "Saldo insuficiente na carteira do contratante. Serviço marcado como DISPUTADO." }, { status: 400 });
      }

      // Perform the transaction within a Prisma transaction
      try {
        await prisma.$transaction(async (tx) => {
          // Debit from creator's wallet
          await tx.wallet.update({
            where: { id: creatorWallet.id },
            data: { balance: { decrement: amountToPay } },
          });

          // Credit to provider's wallet
          await tx.wallet.update({
            where: { id: providerWallet.id },
            data: { balance: { increment: amountToPay } },
          });

          // Record transaction for creator (debit)
          await tx.transaction.create({
            data: {
              id: crypto.randomUUID(),
              walletId: creatorWallet.id,
              amount: -amountToPay, // Negative for debit
              type: "PAYMENT_SENT",
              description: `Pagamento pelo serviço: ${service.title} para ${acceptedBid.provider.name}`,
              serviceId: serviceId,
              status: "COMPLETED",
            },
          });

          // Record transaction for provider (credit)
          await tx.transaction.create({
            data: {
              id: crypto.randomUUID(),
              walletId: providerWallet.id,
              amount: amountToPay,
              type: "PAYMENT_RECEIVED",
              description: `Recebimento pelo serviço: ${service.title} de ${service.creator.name}`,
              serviceId: serviceId,
              status: "COMPLETED",
            },
          });

          // Update service status to COMPLETED
          await tx.service.update({
            where: { id: serviceId },
            data: { status: "COMPLETED", updatedAt: new Date() },
          });
        });

        // Send notifications
        await prisma.notification.createMany({
          data: [
            {
              id: crypto.randomUUID(),
              type: "SERVICE_COMPLETED_PAID",
              title: "Serviço Concluído e Pago",
              message: `O serviço "${service.title}" foi concluído e o pagamento de R$${amountToPay.toFixed(2)} foi efetuado para ${acceptedBid.provider.name}.`,
              receiverId: creatorId,
              senderId: providerId, // or system
              serviceId: serviceId,
            },
            {
              id: crypto.randomUUID(),
              type: "SERVICE_COMPLETED_PAYMENT_RECEIVED",
              title: "Serviço Concluído e Pagamento Recebido",
              message: `O serviço "${service.title}" foi concluído e você recebeu R$${amountToPay.toFixed(2)} de ${service.creator.name}.`,
              receiverId: providerId,
              senderId: creatorId, // or system
              serviceId: serviceId,
            },
          ],
        });

        return NextResponse.json({
          message: "Serviço concluído e pagamento processado com sucesso!",
          serviceStatus: "COMPLETED",
        });

      } catch (transactionError) {
        console.error("Erro na transação de pagamento:", transactionError);
        // If transaction fails, the service status might remain IN_PROGRESS or be set to DISPUTED
        // Potentially create a notification for admin/support
        return NextResponse.json({ error: "Erro ao processar o pagamento. A transação foi revertida." }, { status: 500 });
      }

    } else {
      // Only one party has confirmed so far
      const waitingFor = userId === creatorId ? acceptedBid.provider.name : service.creator.name;
      const confirmerName = userId === creatorId ? service.creator.name : acceptedBid.provider.name;
      
      // Notify the other party that one has confirmed
      const otherPartyId = userId === creatorId ? providerId : creatorId;
      await prisma.notification.create({
        data: {
          id: crypto.randomUUID(),
          type: "SERVICE_COMPLETION_CONFIRMED_BY_ONE_PARTY",
          title: "Confirmação de Conclusão Pendente",
          message: `${confirmerName || 'Uma parte'} confirmou a conclusão do serviço "${service.title}". Aguardando sua confirmação.`,
          receiverId: otherPartyId,
          senderId: userId,
          serviceId: serviceId,
        }
      });

      return NextResponse.json({
        message: `Conclusão registrada. Aguardando confirmação de ${waitingFor || 'outra parte'}.`,
      });
    }
  } catch (error: any) {
    console.error("Erro ao confirmar conclusão do serviço:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar a confirmação: " + error.message },
      { status: 500 }
    );
  }
}
