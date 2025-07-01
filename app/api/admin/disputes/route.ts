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
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  // Filtros adicionais podem ser adicionados aqui, como por data, profissional, cliente, etc.
  // Por enquanto, apenas serviços com status DISPUTED.
  const statusFilter = searchParams.get("status") || "DISPUTED"; // Default to DISPUTED

  let whereClause: any = {
    status: statusFilter,
  };

  // Se quisermos listar também as resolvidas, podemos ajustar o filtro
  // Ex: /api/admin/disputes?status=RESOLVED
  // Ex: /api/admin/disputes?status=ALL_DISPUTES (para DISPUTED ou RESOLVED)
  if (statusFilter === "ALL_DISPUTES") {
    whereClause = {
        OR: [
            { status: "DISPUTED" },
            { status: "RESOLVED" }
        ]
    };
  }


  try {
    const disputedServices = await prisma.service.findMany({
      where: whereClause,
      include: {
        creator: {
          select: { id: true, name: true, email: true, image: true },
        },
        profession: {
          select: { id: true, name: true },
        },
        bids: { // Para identificar o provedor, se um foi aceito
          where: { status: 'ACCEPTED' }, // Idealmente, teríamos um campo `acceptedBidId` ou `providerId` no Service
          select: {
            provider: { select: { id: true, name: true, email: true, image: true } }
          },
          take: 1,
        },
        disputeResolutions: { // Inclui a resolução se já existir (para status RESOLVED)
          orderBy: { resolvedAt: 'desc' },
          take: 1,
          include: {
            admin: {select: {id: true, name: true}}
          }
        }
        // Poderia incluir mais detalhes do serviço ou da disputa se necessário
      },
      skip: skip,
      take: limit,
      orderBy: {
        updatedAt: "desc", // Mostrar as disputas atualizadas mais recentemente primeiro
      },
    });

    const totalDisputes = await prisma.service.count({ where: whereClause });

    return NextResponse.json({
      disputes: disputedServices.map(service => ({
        ...service,
        // Simplificando o provedor para o frontend
        provider: service.bids.length > 0 ? service.bids[0].provider : null,
      })),
      totalPages: Math.ceil(totalDisputes / limit),
      currentPage: page,
      totalDisputes,
    });
  } catch (error) {
    console.error("Erro ao listar disputas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao listar disputas" },
      { status: 500 }
    );
  }
}
