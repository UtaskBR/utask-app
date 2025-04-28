import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import crypto from "crypto";

// GET /api/wallet - Obter carteira do usuário logado
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
      SELECT id, balance, "userId", "createdAt", "updatedAt"
      FROM "Wallet"
      WHERE "userId" = ${userId}
    `;
    
    let wallet;
    
    // Se o usuário não tiver uma carteira, criar uma
    if (!wallets || (wallets as any[]).length === 0) {
      const walletId = crypto.randomUUID();
      const now = new Date();
      
      // Criar a carteira usando SQL bruto
      await prisma.$executeRaw`
        INSERT INTO "Wallet" (id, balance, "userId", "createdAt", "updatedAt")
        VALUES (${walletId}, 0, ${userId}, ${now}, ${now})
      `;
      
      // Buscar a carteira recém-criada
      const newWallets = await prisma.$queryRaw`
        SELECT id, balance, "userId", "createdAt", "updatedAt"
        FROM "Wallet"
        WHERE id = ${walletId}
      `;
      
      wallet = (newWallets as any[])[0];
      wallet.transactions = []; // Carteira nova não tem transações
    } else {
      wallet = (wallets as any[])[0];
      
      // Buscar as transações da carteira
      const transactions = await prisma.$queryRaw`
        SELECT id, amount, type, description, "walletId", "serviceId", "createdAt", "updatedAt"
        FROM "Transaction"
        WHERE "walletId" = ${wallet.id}
        ORDER BY "createdAt" DESC
      `;
      
      wallet.transactions = transactions;
    }
    
    return NextResponse.json(wallet);
  } catch (error) {
    console.error("Erro ao buscar carteira:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
