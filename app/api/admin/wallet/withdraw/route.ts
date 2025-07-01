import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role, TransactionType, TransactionStatus } from "@prisma/client"; // Assuming TransactionType and Status enums/types exist or will be added

// Se TransactionType e TransactionStatus não estiverem no schema, defina-os aqui ou adicione ao Prisma.
// Exemplo de como poderiam estar no schema (adicionar se necessário):
// enum TransactionType {
//   PAYMENT
//   REFUND
//   WITHDRAWAL
//   DEPOSIT
//   PLATFORM_FEE
//   ADJUSTMENT
// }
// enum TransactionStatus {
//   PENDING
//   COMPLETED
//   FAILED
//   CANCELLED
// }
// No schema atual, Transaction.type e Transaction.status são Strings.
import { createAuditLog, AuditActions, AuditEntityTypes } from "@/app/lib/auditLog";

// Vamos usar valores string diretamente por enquanto, mas o ideal seria ter enums.

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN || !token.id || !token.email) {
    return NextResponse.json({ error: "Acesso não autorizado ou token inválido" }, { status: 403 });
  }
  const adminId = token.id as string;
  const adminEmail = token.email as string;

  try {
    const body = await req.json();
    const { amount, description } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: "Valor do saque inválido ou não fornecido." }, { status: 400 });
    }

    const platform = await prisma.platform.findUnique({
      where: { name: "UTASK_PLATFORM" },
      include: { wallet: true },
    });

    if (!platform || !platform.wallet) {
      return NextResponse.json({ error: "Carteira da plataforma não encontrada." }, { status: 404 });
    }

    const adminWallet = platform.wallet;

    // Simplificação: verificar apenas o saldo total. Idealmente, seria saldo disponível (balance - reservedBalance).
    if (adminWallet.balance < amount) {
      return NextResponse.json({ error: "Saldo insuficiente para o saque." }, { status: 400 });
    }

    // Lógica de Saque Simplificada:
    // Envolver em uma transação Prisma para garantir atomicidade
    const { updatedWallet, withdrawalTransaction } = await prisma.$transaction(async (tx) => {
      const walletAfterUpdate = await tx.wallet.update({
        where: { id: adminWallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      const transactionRecord = await tx.transaction.create({
        data: {
          walletId: adminWallet.id,
          amount: -amount, // Saques são registrados como valor negativo na carteira
          type: "WITHDRAWAL_REQUEST", // Usar um tipo específico
          status: "PENDING", // Saques devem iniciar como pendentes
          description: description || `Solicitação de saque de ${amount.toFixed(2)} BRL`,
        },
      });
      return { updatedWallet: walletAfterUpdate, withdrawalTransaction: transactionRecord };
    });

    await createAuditLog({
      adminId,
      adminEmail,
      action: AuditActions.WALLET_WITHDRAWAL_REQUEST,
      targetEntityType: AuditEntityTypes.WALLET,
      targetEntityId: adminWallet.id,
      details: {
        amount: amount,
        description: description,
        transactionId: withdrawalTransaction.id,
        newBalance: updatedWallet.balance
      },
    });

    return NextResponse.json({
      message: "Solicitação de saque registrada com sucesso. O processamento é manual/externo.",
      transaction: withdrawalTransaction,
      updatedWalletBalance: updatedWallet.balance,
    }, { status: 201 });

  } catch (error) {
    console.error("Erro ao processar solicitação de saque:", error);
    // Rollback manual seria necessário aqui se a transação do Prisma falhasse no meio.
    // Por isso, transações Prisma (o método $transaction) são importantes para operações multi-etapas.
    // Para esta simplificação, não implementaremos o rollback complexo.
    return NextResponse.json(
      { error: "Erro interno do servidor ao processar solicitação de saque." },
      { status: 500 }
    );
  }
}
