import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/notifications - Obter notificações do usuário
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
    
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: session.user.id,
        ...(unreadOnly ? { read: false } : {})
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Retornar as notificações sem tentar acessar relações inexistentes
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Marcar notificações como lidas
export async function PATCH(
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
    
    const body = await request.json();
    const { ids, all } = body;
    
    if (all) {
      // Marcar todas as notificações do usuário como lidas
      await prisma.notification.updateMany({
        where: {
          receiverId: session.user.id,
          read: false
        },
        data: {
          read: true
        }
      });
      
      return NextResponse.json({ success: true });
    }
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "IDs de notificações não fornecidos" },
        { status: 400 }
      );
    }
    
    // Verificar se todas as notificações pertencem ao usuário
    const notifications = await prisma.notification.findMany({
      where: {
        id: { in: ids }
      },
      select: {
        id: true,
        receiverId: true
      }
    });
    
    const unauthorizedIds = notifications
      .filter(notification => notification.receiverId !== session.user.id)
      .map(notification => notification.id);
    
    if (unauthorizedIds.length > 0) {
      return NextResponse.json(
        { error: "Não autorizado a modificar algumas notificações" },
        { status: 403 }
      );
    }
    
    // Marcar notificações como lidas
    await prisma.notification.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        read: true
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar notificações:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
