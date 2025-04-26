import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/wallet - Obter carteira do usuário logado
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Buscar a carteira do usuário
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
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
        },
        include: {
          transactions: true
        }
      });
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
