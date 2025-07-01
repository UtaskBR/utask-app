import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role, AdminAuditLog } from "@prisma/client";
import { ParsedUrlQuery } from "querystring";

interface AuditLogQuery extends ParsedUrlQuery {
  page?: string;
  limit?: string;
  adminId?: string;
  action?: string; // Pode ser um AuditActions
  targetEntityType?: string;
  targetEntityId?: string;
  startDate?: string; // ISO Date string
  endDate?: string;   // ISO Date string
  sortBy?: keyof AdminAuditLog;
  sortOrder?: "asc" | "desc";
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const query: AuditLogQuery = Object.fromEntries(searchParams.entries());

  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "20", 10);
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "timestamp";
  const sortOrder = query.sortOrder || "desc";

  let whereClause: Prisma.AdminAuditLogWhereInput = {};

  if (query.adminId) {
    whereClause.adminId = query.adminId;
  }
  if (query.action) {
    whereClause.action = { contains: query.action, mode: "insensitive" };
  }
  if (query.targetEntityType) {
    whereClause.targetEntityType = { contains: query.targetEntityType, mode: "insensitive" };
  }
  if (query.targetEntityId) {
    whereClause.targetEntityId = query.targetEntityId;
  }
  if (query.startDate) {
    whereClause.timestamp = { ...whereClause.timestamp, gte: new Date(query.startDate) };
  }
  if (query.endDate) {
    // Adicionar 1 dia ao endDate para incluir todo o dia, ou ajustar a lógica para fim do dia.
    const endDate = new Date(query.endDate);
    endDate.setDate(endDate.getDate() + 1); // Inclui até o final do dia selecionado
    whereClause.timestamp = { ...whereClause.timestamp, lt: endDate };
  }

  try {
    const logs = await prisma.adminAuditLog.findMany({
      where: whereClause,
      include: {
        admin: { // Incluir alguns dados do admin para exibição, se necessário
          select: { id: true, name: true, email: true }
        }
      },
      skip: skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalLogs = await prisma.adminAuditLog.count({ where: whereClause });

    return NextResponse.json({
      logs,
      totalPages: Math.ceil(totalLogs / limit),
      currentPage: page,
      totalLogs,
    });
  } catch (error) {
    console.error("Erro ao listar logs de auditoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao listar logs de auditoria" },
      { status: 500 }
    );
  }
}
