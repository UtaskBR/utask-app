import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Funções utilitárias para formatação
const formatCurrency = (value: number | null): string => {
  if (value === null || value === undefined) return "valor não especificado";
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const formatDate = (dateString: Date | string | null): string => {
  if (!dateString) return "data não especificada";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "data inválida";
    return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "data inválida";
  }
};

// POST /api/services/[id]/confirm-completion
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const EPSILON = 0.00001; // Epsilon for floating point comparison

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const serviceId = params.id;
    const userId = session.user.id;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        creator: { select: { id: true, name: true, wallet: true } },
        bids: {
          where: { status: "ACCEPTED" },
          include: { provider: { select: { id: true, name: true, wallet: true } } },
        },
        completionConfirmations: { select: { userId: true } },
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

    const acceptedBid = service.bids[0];
    if (!acceptedBid) {
      return NextResponse.json(
        { error: "Nenhuma proposta aceita encontrada para este serviço" },
        { status: 400 }
      );
    }

    const creatorId = service.creatorId;
    const providerId = acceptedBid.providerId;

    if (userId !== creatorId && userId !== providerId) {
      return NextResponse.json(
        { error: "Apenas o criador do serviço ou o prestador aceito podem confirmar a conclusão" },
        { status: 403 }
      );
    }

    const existingConfirmation = service.completionConfirmations.find(
      (conf) => conf.userId === userId
    );

    if (existingConfirmation) {
      return NextResponse.json(
        { message: "Você já confirmou a conclusão deste serviço" },
        { status: 200 }
      );
    }

    const formattedPrice = formatCurrency(service.price);
    const formattedDate = formatDate(service.date);

    await prisma.completionConfirmation.create({
      data: {
        serviceId: serviceId,
        userId: userId,
      },
    });

    const allConfirmations = await prisma.completionConfirmation.findMany({
      where: { serviceId: serviceId },
    });

    const creatorConfirmed = allConfirmations.some((c) => c.userId === creatorId);
    const providerConfirmed = allConfirmations.some((c) => c.userId === providerId);

    if (creatorConfirmed && providerConfirmed) {
      if (!service.price || service.price <= 0) {
        await prisma.service.update({
          where: { id: serviceId },
          data: { status: "COMPLETED", updatedAt: new Date() },
        });
        await prisma.notification.createMany({
          data: [
            {
              id: crypto.randomUUID(),
              type: "SERVICE_COMPLETED_NO_PAYMENT",
              title: "Serviço Concluído",
              message: `O serviço "${service.title}" foi concluído por ambas as partes em ${formattedDate} (sem valor transacionado).`,
              receiverId: creatorId,
              senderId: providerId,
              serviceId: serviceId,
              read: false
            },
            {
              id: crypto.randomUUID(),
              type: "SERVICE_COMPLETED_NO_PAYMENT",
              title: "Serviço Concluído",
              message: `O serviço "${service.title}" foi concluído por ambas as partes em ${formattedDate} (sem valor transacionado).`,
              receiverId: providerId,
              senderId: creatorId,
              serviceId: serviceId,
              read: false
            },
          ],
        });
        return NextResponse.json({
          message: "Serviço concluído por ambas as partes! (Sem valor transacionado)",
          serviceStatus: "COMPLETED",
        });
      }

      const amountToPay = service.price;
      const creatorWallet = service.creator.wallet;
      const providerWallet = acceptedBid.provider.wallet;

      if (!creatorWallet || !providerWallet) {
        await prisma.service.update({
          where: { id: serviceId },
          data: { status: "DISPUTED", updatedAt: new Date() },
        });
        return NextResponse.json({ error: "Carteira não encontrada. Serviço marcado como DISPUTADO." }, { status: 500 });
      }

      console.log("--- Confirm Completion: Balance Check Diagnostic ---");
      console.log("Service ID:", serviceId);
      console.log("Confirmer User ID:", userId);
      console.log("Service Price:", service.price);
      console.log("Creator Wallet Balance:", creatorWallet.balance);
      console.log("Amount to Pay:", amountToPay);

      if (typeof creatorWallet.balance === 'number' && typeof amountToPay === 'number') {
        console.log("Balance Check:", amountToPay - creatorWallet.balance);
        if (amountToPay - creatorWallet.balance > EPSILON) {
          await prisma.service.update({
            where: { id: serviceId },
            data: { status: "DISPUTED", updatedAt: new Date() },
          });
          return NextResponse.json({
            error: `Saldo insuficiente. Saldo: ${creatorWallet.balance}, Valor: ${amountToPay}.` 
          }, { status: 400 });
        }
      } else {
        console.log("Dados inválidos para verificação de saldo.");
      }

      const platformFee = amountToPay * 0.15;
      const providerAmount = amountToPay - platformFee;

      let platformWallet = await prisma.wallet.findFirst({
        where: { platform: { name: "UTASK" } }
      });

      if (!platformWallet) {
        let platform = await prisma.platform.findFirst({ where: { name: "UTASK" } });
        if (!platform) {
          platform = await prisma.platform.create({
            data: { name: "UTASK", description: "Plataforma de serviços autônomos" }
          });
        }
        platformWallet = await prisma.wallet.create({
          data: {
            id: crypto.randomUUID(),
            balance: 0,
            platformId: platform.id
          }
        });
      }

      try {
        await prisma.$transaction(async (tx) => {
          await tx.wallet.update({
            where: { id: creatorWallet.id },
            data: { balance: { decrement: amountToPay } },
          });
          await tx.wallet.update({
            where: { id: providerWallet.id },
            data: { balance: { increment: providerAmount } },
          });
          await tx.wallet.update({
            where: { id: platformWallet.id },
            data: { balance: { increment: platformFee } },
          });

          await tx.transaction.create({
            data: {
              id: crypto.randomUUID(),
              walletId: creatorWallet.id,
              amount: -amountToPay,
              type: "PAYMENT_SENT",
              description: `Pagamento pelo serviço: ${service.title} para ${acceptedBid.provider.name}`,
              serviceId: serviceId,
              status: "COMPLETED",
            },
          });

          await tx.transaction.create({
            data: {
              id: crypto.randomUUID(),
              walletId: providerWallet.id,
              amount: providerAmount,
              type: "PAYMENT_RECEIVED",
              description: `Recebimento pelo serviço: ${service.title} de ${service.creator.name}`,
              serviceId: serviceId,
              status: "COMPLETED",
            },
          });

          await tx.transaction.create({
            data: {
              id: crypto.randomUUID(),
              walletId: platformWallet.id,
              amount: platformFee,
              type: "PLATFORM_FEE",
              description: `Taxa do serviço: ${service.title}`,
              serviceId: serviceId,
              status: "COMPLETED",
            },
          });

          await tx.service.update({
            where: { id: serviceId },
            data: { status: "COMPLETED", updatedAt: new Date() },
          });
        });

        await prisma.notification.createMany({
          data: [
            {
              id: crypto.randomUUID(),
              type: "SERVICE_COMPLETED_PAID",
              title: "Serviço Concluído e Pago",
              message: `O serviço "${service.title}" foi concluído e pago em ${formattedDate}.`,
              receiverId: creatorId,
              senderId: providerId,
              serviceId: serviceId,
              read: false
            },
            {
              id: crypto.randomUUID(),
              type: "SERVICE_COMPLETED_PAYMENT_RECEIVED",
              title: "Serviço Concluído e Pagamento Recebido",
              message: `Você recebeu ${formatCurrency(providerAmount)} pelo serviço "${service.title}".`,
              receiverId: providerId,
              senderId: creatorId,
              serviceId: serviceId,
              read: false
            }
          ],
        });

        return NextResponse.json({
          message: "Serviço concluído e pagamento processado com sucesso!",
          serviceStatus: "COMPLETED",
        });
      } catch (transactionError) {
        console.error("Erro na transação:", transactionError);
        return NextResponse.json({ error: "Erro ao processar o pagamento." }, { status: 500 });
      }
    } else {
      const waitingFor = userId === creatorId ? acceptedBid.provider.name : service.creator.name;
      const confirmerName = userId === creatorId ? service.creator.name : acceptedBid.provider.name;

      await prisma.notification.create({
        data: {
          id: crypto.randomUUID(),
          type: "SERVICE_COMPLETION_CONFIRMED_BY_ONE_PARTY",
          title: "Confirmação Pendente",
          message: `${confirmerName} confirmou a conclusão. Aguarda confirmação de ${waitingFor}.`,
          receiverId: userId === creatorId ? providerId : creatorId,
          senderId: userId,
          serviceId: serviceId,
          read: false
        }
      });

      return NextResponse.json({
        message: `Confirmação registrada. Aguardando ${waitingFor}.`,
      });
    }
  } catch (error: any) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro interno: " + error.message }, { status: 500 });
  }
}
