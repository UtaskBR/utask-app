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
        },
        service: {
          select: {
            id: true,
            title: true,
            value: true,
            date: true,
            status: true
          }
        },
        bid: {
          select: {
            id: true,
            value: true,
            date: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Enriquecer as notificações com informações adicionais
    const enrichedNotifications = notifications.map(notification => {
      // Extrair informações relevantes do serviço e da proposta
      const serviceInfo = notification.service ? {
        title: notification.service.title,
        value: notification.service.value,
        date: notification.service.date,
        status: notification.service.status
      } : null;
      
      const bidInfo = notification.bid ? {
        value: notification.bid.value,
        date: notification.bid.date,
        status: notification.bid.status
      } : null;
      
      // Adicionar detalhes formatados para exibição
      return {
        ...notification,
        serviceInfo,
        bidInfo,
        details: {
          title: serviceInfo?.title || 'Serviço',
          value: bidInfo?.value || serviceInfo?.value || null,
          date: bidInfo?.date || serviceInfo?.date || null,
          formattedValue: bidInfo?.value || serviceInfo?.value 
            ? `R$ ${(bidInfo?.value || serviceInfo?.value).toFixed(2).replace('.', ',')}`
            : 'Valor a combinar',
          formattedDate: bidInfo?.date || serviceInfo?.date
            ? new Date(bidInfo?.date || serviceInfo?.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'Data a combinar'
        }
      };
    });
    
    return NextResponse.json(enrichedNotifications);
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
