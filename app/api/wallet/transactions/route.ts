import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/wallet/transactions - Criar uma nova transação
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
    const body = await request.json();
    const { amount, type, description } = body;
    
    // Validação básica
    if (!amount || !type) {
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }
    
    // Buscar a carteira do usuário
    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });
    
    // Se o usuário não tiver uma carteira, criar uma
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          balance: 0,
          user: {
            connect: {
              id: userId
            }
          }
        }
      });
    }
    
    // Verificar se há saldo suficiente para saques e pagamentos
    if ((type === "WITHDRAWAL" || type === "PAYMENT") && wallet.balance < amount) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      );
    }
    
    // Atualizar o saldo da carteira
    let newBalance = wallet.balance;
    if (type === "DEPOSIT" || type === "RECEIPT") {
      newBalance += amount;
    } else if (type === "WITHDRAWAL" || type === "PAYMENT") {
      newBalance -= amount;
    }
    
    // Criar a transação e atualizar o saldo da carteira em uma transação
    const result = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount,
          type,
          description,
          status: "COMPLETED",
          user: {
            connect: {
              id: userId
            }
          },
          wallet: {
            connect: {
              id: wallet.id
            }
          }
        }
      }),
      prisma.wallet.update({
        where: {
          id: wallet.id
        },
        data: {
          balance: newBalance
        }
      })
    ]);
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
