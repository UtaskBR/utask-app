import prisma from "@/lib/prisma"; // CORRIGIDO
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10); // Default limit for transactions
  const skip = (page - 1) * limit;

  try {
    // Encontrar a carteira da plataforma (admin)
    // Conforme definido no seed: UTASK_PLATFORM
    const platformAdmin = await prisma.platform.findUnique({
      where: { name: "UTASK_PLATFORM" },
      include: {
        wallet: {
          select: {
            id: true,
            balance: true,
            reservedBalance: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!platformAdmin || !platformAdmin.wallet) {
      return NextResponse.json({ error: "Carteira da plataforma não encontrada." }, { status: 404 });
    }

    const adminWalletId = platformAdmin.wallet.id;

    // Buscar transações da carteira do admin com paginação
    const transactions = await prisma.transaction.findMany({
      where: { walletId: adminWalletId },
      orderBy: { createdAt: "desc" },
      skip: skip,
      take: limit,
    });

    const totalTransactions = await prisma.transaction.count({
      where: { walletId: adminWalletId },
    });

    return NextResponse.json({
      walletInfo: {
        id: adminWalletId,
        balance: platformAdmin.wallet.balance,
        reservedBalance: platformAdmin.wallet.reservedBalance,
        lastUpdated: platformAdmin.wallet.updatedAt,
      },
      transactions,
      totalPages: Math.ceil(totalTransactions / limit),
      currentPage: page,
      totalTransactions,
    });
  } catch (error) {
    console.error("Erro ao buscar dados da carteira do administrador:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao buscar dados da carteira do administrador" },
      { status: 500 }
    );
  }
}
