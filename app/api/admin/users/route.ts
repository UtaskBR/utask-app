import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role, User } from "@prisma/client"; // Import User type
import { ParsedUrlQuery } from "querystring"; // For query parameters

// Helper to safely parse query parameters
interface UserQuery extends ParsedUrlQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: "all" | "active" | "blocked";
  sortBy?: keyof User; // Allow sorting by User fields
  sortOrder?: "asc" | "desc";
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const query: UserQuery = Object.fromEntries(searchParams.entries());

  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "10", 10);
  const skip = (page - 1) * limit;
  const searchTerm = query.search || "";
  const statusFilter = query.status || "all";
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  let whereClause: any = {
    OR: [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
      { cpf: { contains: searchTerm, mode: "insensitive" } },
    ],
  };

  if (statusFilter === "active") {
    whereClause.isBlocked = false;
  } else if (statusFilter === "blocked") {
    whereClause.isBlocked = true;
  }
  // Se 'all', não adiciona filtro de isBlocked

  try {
    const users = await prisma.user.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      // Excluir o campo password da resposta
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        image: true,
        city: true,
        state: true,
        emailIsVerified: true,
        isBlocked: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Explicitamente listar os campos que queremos, excluindo 'password'
        // e outros campos sensíveis ou desnecessários para a listagem de admin.
      },
    });

    const totalUsers = await prisma.user.count({ where: whereClause });

    return NextResponse.json({
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalUsers,
    });
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao listar usuários" },
      { status: 500 }
    );
  }
}
