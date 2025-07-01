import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role, ServiceStatus, Prisma } from "@prisma/client"; // Import ServiceStatus e Prisma

interface RouteParams {
  params: { serviceId: string };
}

interface ResolveDisputeBody {
  decision: "RELEASE_TO_PROVIDER" | "REFUND_TO_CLIENT" | "PARTIAL_PAYMENT" | "NO_ACTION";
  justification?: string;
  amountReleasedToProvider?: number; // Obrigatório se decision for RELEASE_TO_PROVIDER ou PARTIAL_PAYMENT
  amountRefundedToClient?: number;   // Obrigatório se decision for REFUND_TO_CLIENT ou PARTIAL_PAYMENT
}

import { createAuditLog, AuditActions, AuditEntityTypes } from "@/app/lib/auditLog";

// Função auxiliar para garantir que os valores financeiros sejam números válidos
function isValidAmount(amount: any): amount is number {
  return typeof amount === 'number' && amount >= 0;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.id || !token.email || token.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Acesso não autorizado ou token inválido" }, { status: 403 });
  }
  const adminId = token.id as string;
  const adminEmail = token.email as string;

  const { serviceId } = params;
  if (!serviceId) {
    return NextResponse.json({ error: "ID do serviço não fornecido" }, { status: 400 });
  }

  const body = (await req.json()) as ResolveDisputeBody;
  const { decision, justification, amountReleasedToProvider, amountRefundedToClient } = body;

  if (!decision) {
    return NextResponse.json({ error: "Decisão não fornecida" }, { status: 400 });
  }

  // Validações dos valores com base na decisão
  if (decision === "RELEASE_TO_PROVIDER" && !isValidAmount(amountReleasedToProvider)) {
    return NextResponse.json({ error: "Valor a ser liberado para o prestador é inválido ou não fornecido." }, { status: 400 });
  }
  if (decision === "REFUND_TO_CLIENT" && !isValidAmount(amountRefundedToClient)) {
    return NextResponse.json({ error: "Valor a ser estornado para o cliente é inválido ou não fornecido." }, { status: 400 });
  }
  if (decision === "PARTIAL_PAYMENT") {
    if (!isValidAmount(amountReleasedToProvider) || !isValidAmount(amountRefundedToClient)) {
      return NextResponse.json({ error: "Valores para pagamento parcial são inválidos ou não fornecidos." }, { status: 400 });
    }
  }
  if (decision === "NO_ACTION" && (!justification || justification.trim() === "")) {
      return NextResponse.json({ error: "Justificativa é obrigatória para a decisão 'NO_ACTION'." }, { status: 400 });
  }


  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        creator: { select: { id: true, wallet: true } }, // Cliente
        bids: { // Para encontrar o prestador aceito
          where: { status: "ACCEPTED" },
          select: { provider: { select: { id: true, wallet: true } } },
          take: 1,
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }
    if (service.status !== ServiceStatus.DISPUTED) {
      return NextResponse.json({ error: "Este serviço não está atualmente em disputa ou já foi resolvido." }, { status: 400 });
    }

    const providerData = service.bids.length > 0 ? service.bids[0].provider : null;
    const clientWallet = service.creator.wallet;

    // Simplificação da lógica de transação financeira.
    // Idealmente, isso seria uma transação Prisma ($transaction) para garantir atomicidade.
    // E os fundos estariam "bloqueados" em algum lugar (ex: reservedBalance da plataforma ou do prestador).

    // Plataforma (Admin) Wallet - para taxas
    const platform = await prisma.platform.findUnique({
        where: { name: "UTASK_PLATFORM" },
        include: { wallet: true }
    });
    if (!platform || !platform.wallet) {
        console.error("Carteira da plataforma não encontrada para processar taxas da disputa.");
        // Decide se isso é um erro fatal ou se a disputa pode ser resolvida sem taxas.
        // Por ora, vamos permitir continuar, mas logar.
    }
    const adminPlatformWalletId = platform?.wallet?.id;
    const PLATFORM_FEE_RATE = 0.15; // 15%

    // Iniciar transação Prisma
    const resolution = await prisma.$transaction(async (tx) => {
      const newResolution = await tx.disputeResolution.create({
        data: {
          serviceId: serviceId,
          adminId: adminId,
          decision: decision,
          justification: justification,
          amountReleasedToProvider: amountReleasedToProvider,
          amountRefundedToClient: amountRefundedToClient,
        },
      });

      await tx.service.update({
        where: { id: serviceId },
        data: { status: ServiceStatus.RESOLVED }, // Novo status para indicar disputa resolvida
      });

      // Lógica de movimentação de fundos (SIMPLIFICADA)
      // Assume que o 'service.price' é o valor total em disputa que estava bloqueado.
      // Esta lógica precisaria ser robusta e considerar onde os fundos estão (carteira do cliente, plataforma, etc.)

      const servicePrice = service.price ?? 0; // Valor base do serviço.

      if (decision === "RELEASE_TO_PROVIDER" && providerData?.wallet && isValidAmount(amountReleasedToProvider)) {
        // Libera para o prestador, deduz taxa da plataforma
        const amountForProvider = amountReleasedToProvider * (1 - PLATFORM_FEE_RATE);
        const platformFee = amountReleasedToProvider * PLATFORM_FEE_RATE;

        await tx.wallet.update({
          where: { id: providerData.wallet.id },
          data: { balance: { increment: amountForProvider } },
        });
        await tx.transaction.create({
          data: { walletId: providerData.wallet.id, amount: amountForProvider, type: "DISPUTE_SETTLEMENT_PROVIDER", description: `Resolução de disputa serviço ${serviceId} - liberado`, serviceId: serviceId}
        });

        if (adminPlatformWalletId && platformFee > 0) {
          await tx.wallet.update({
            where: { id: adminPlatformWalletId },
            data: { balance: { increment: platformFee } },
          });
          await tx.transaction.create({
            data: { walletId: adminPlatformWalletId, amount: platformFee, type: "PLATFORM_FEE_DISPUTE", description: `Taxa de resolução de disputa serviço ${serviceId}`, serviceId: serviceId}
          });
        }
      } else if (decision === "REFUND_TO_CLIENT" && clientWallet && isValidAmount(amountRefundedToClient)) {
        // Estorna para o cliente
        await tx.wallet.update({
          where: { id: clientWallet.id },
          data: { balance: { increment: amountRefundedToClient } },
        });
         await tx.transaction.create({
          data: { walletId: clientWallet.id, amount: amountRefundedToClient, type: "DISPUTE_SETTLEMENT_CLIENT_REFUND", description: `Resolução de disputa serviço ${serviceId} - estorno`, serviceId: serviceId}
        });
      } else if (decision === "PARTIAL_PAYMENT" && isValidAmount(amountReleasedToProvider) && isValidAmount(amountRefundedToClient)) {
        // Lógica para pagamento parcial (libera uma parte para o prestador, estorna outra para o cliente)
        if (providerData?.wallet && amountReleasedToProvider > 0) {
            const amountForProvider = amountReleasedToProvider * (1 - PLATFORM_FEE_RATE);
            const platformFee = amountReleasedToProvider * PLATFORM_FEE_RATE;

            await tx.wallet.update({
                where: { id: providerData.wallet.id },
                data: { balance: { increment: amountForProvider } },
            });
            await tx.transaction.create({
              data: { walletId: providerData.wallet.id, amount: amountForProvider, type: "DISPUTE_SETTLEMENT_PROVIDER_PARTIAL", description: `Resolução de disputa (parcial) serviço ${serviceId} - liberado`, serviceId: serviceId}
            });

            if (adminPlatformWalletId && platformFee > 0) {
                await tx.wallet.update({
                    where: { id: adminPlatformWalletId },
                    data: { balance: { increment: platformFee } },
                });
                await tx.transaction.create({
                  data: { walletId: adminPlatformWalletId, amount: platformFee, type: "PLATFORM_FEE_DISPUTE_PARTIAL", description: `Taxa de resolução de disputa (parcial) serviço ${serviceId}`, serviceId: serviceId}
                });
            }
        }
        if (clientWallet && amountRefundedToClient > 0) {
            await tx.wallet.update({
                where: { id: clientWallet.id },
                data: { balance: { increment: amountRefundedToClient } },
            });
            await tx.transaction.create({
              data: { walletId: clientWallet.id, amount: amountRefundedToClient, type: "DISPUTE_SETTLEMENT_CLIENT_REFUND_PARTIAL", description: `Resolução de disputa (parcial) serviço ${serviceId} - estorno`, serviceId: serviceId}
            });
        }
      }
      // Se NO_ACTION, apenas registra a resolução, sem movimentação financeira.

      return newResolution;
    });

    await createAuditLog({
      adminId,
      adminEmail,
      action: AuditActions.DISPUTE_RESOLVE,
      targetEntityType: AuditEntityTypes.SERVICE, // Ou AuditEntityTypes.DISPUTE_RESOLUTION
      targetEntityId: serviceId, // ID do serviço em disputa
      details: {
        serviceId: serviceId,
        decision: resolution.decision,
        justification: resolution.justification,
        resolutionId: resolution.id,
        amountToProvider: resolution.amountReleasedToProvider,
        amountToClient: resolution.amountRefundedToClient
      },
    });

    return NextResponse.json(resolution, { status: 201 });

  } catch (error) {
    console.error(`Erro ao resolver disputa para o serviço ${serviceId}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { // Unique constraint violation (ex: já existe uma resolução)
             return NextResponse.json({ error: "Já existe uma resolução para esta disputa de serviço." }, { status: 409 });
        }
    }
    return NextResponse.json(
      { error: "Erro interno do servidor ao resolver disputa." },
      { status: 500 }
    );
  }
}
