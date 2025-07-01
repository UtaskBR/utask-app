import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  try {
    const totalUsers = await prisma.user.count();
    const totalServices = await prisma.service.count();

    const servicesByStatus = await prisma.service.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const totalDisputes = await prisma.service.count({
      where: { status: 'DISPUTED' },
    });

    // Assumindo que a carteira da plataforma é identificada por um nome/ID específico
    // Conforme definido no seed: UTASK_PLATFORM
    const platformWallet = await prisma.wallet.findFirst({
      where: { platform: { name: "UTASK_PLATFORM" } },
      select: { balance: true, reservedBalance: true },
    });

    // Contagem de disputas resolvidas (exemplo, necessita de um campo/modelo para 'resolvida')
    // Por enquanto, vamos focar nas disputas abertas (status DISPUTED)
    // Se houver um modelo `DisputeResolution` ou um status 'RESOLVED' em `Service`, isso pode ser melhorado.
    // Para simplificar, vamos apenas contar as disputas com status 'DISPUTED' como 'abertas'.
    // E, por enquanto, não teremos 'disputas resolvidas' diretamente desta query.

    return NextResponse.json({
      totalUsers,
      totalServices,
      servicesByStatus: servicesByStatus.reduce((acc, current) => {
        acc[current.status] = current._count.status;
        return acc;
      }, {} as Record<string, number>),
      disputes: {
        open: totalDisputes,
        // resolved: 0, // Placeholder
      },
      adminWalletBalance: platformWallet?.balance ?? 0,
      adminWalletReservedBalance: platformWallet?.reservedBalance ?? 0,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao buscar dados do dashboard" },
      { status: 500 }
    );
  }
}
