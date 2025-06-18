import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import crypto from "crypto";

// GET /api/transactions - Obter todas as transações do usuário logado
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Buscar a carteira do usuário usando SQL bruto
    const wallets = await prisma.$queryRaw`
      SELECT id
      FROM "Wallet"
      WHERE "userId" = ${userId}
    `;
    
    if (!wallets || (wallets as any[]).length === 0) {
      return NextResponse.json(
        { error: "Carteira não encontrada" },
        { status: 404 }
      );
    }
    
    const walletId = (wallets as any[])[0].id;
    
    // Buscar as transações da carteira
    const transactions = await prisma.$queryRaw`
      SELECT 
        t.id, 
        t.amount, 
        t.type, 
        t.description, 
        t."walletId", 
        t."serviceId", 
        t."createdAt", 
        t."updatedAt",
        s.title as service_title
      FROM "Transaction" t
      LEFT JOIN "Service" s ON t."serviceId" = s.id
      WHERE t."walletId" = ${walletId}
      ORDER BY t."createdAt" DESC
    `;
    
    // Formatar as transações para incluir detalhes do serviço
    const formattedTransactions = (transactions as any[]).map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      walletId: transaction.walletId,
      serviceId: transaction.serviceId,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      service: transaction.serviceId ? {
        title: transaction.service_title
      } : null
    }));
    
    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Criar uma nova transação
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { amount, type, description, serviceId } = await request.json();
    
    // Validar os dados da transação
    // if (!amount || !type) { // Old basic validation
    //   return NextResponse.json(
    //     { error: "Dados incompletos" },
    //     { status: 400 }
    //   );
    // }

    if (!type || (type !== 'DEPOSIT' && type !== 'WITHDRAWAL')) {
      return NextResponse.json({ error: "Tipo de transação inválido. Use 'DEPOSIT' ou 'WITHDRAWAL'." }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "O valor da transação deve ser um número positivo." }, { status: 400 });
    }
    
    // Buscar a carteira do usuário
    const wallets = await prisma.$queryRaw`
      SELECT id, balance
      FROM "Wallet"
      WHERE "userId" = ${userId}
    `;
    
    if (!wallets || (wallets as any[]).length === 0) {
      return NextResponse.json(
        { error: "Carteira não encontrada" },
        { status: 404 }
      );
    }
    
    const wallet = (wallets as any[])[0];
    
    // Calcular o novo saldo e verificar fundos para saque
    let newBalance;
    if (type === 'DEPOSIT') {
      newBalance = wallet.balance + numericAmount;
    } else if (type === 'WITHDRAWAL') {
      if (wallet.balance < numericAmount) {
        return NextResponse.json(
          { error: "Saldo insuficiente para saque." },
          { status: 400 }
        );
      }
      newBalance = wallet.balance - numericAmount;
    }
    // else { // This case is already handled by the type check above
    //   console.error(`Invalid transaction type from client form: ${type}`);
    //   return NextResponse.json({ error: "Tipo de transação inválido." }, { status: 400 });
    // }
    
    // Atualizar o saldo da carteira
    await prisma.$executeRaw`
      UPDATE "Wallet"
      SET balance = ${newBalance}, "updatedAt" = ${new Date()}
      WHERE id = ${wallet.id}
    `;
    
    // Criar a transação
    const transactionId = crypto.randomUUID();
    const now = new Date();
    
    await prisma.$executeRaw`
      INSERT INTO "Transaction" (
        id, amount, type, description, "walletId", "serviceId", "createdAt", "updatedAt"
      )
      VALUES (
        ${transactionId}, ${numericAmount}, ${type}, ${description || null}, 
        ${wallet.id}, ${serviceId || null}, ${now}, ${now}
      )
    `;
    
    // Buscar a transação criada
    const transactions = await prisma.$queryRaw`
      SELECT *
      FROM "Transaction"
      WHERE id = ${transactionId}
    `;
    
    const transaction = (transactions as any[])[0];
    
    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
