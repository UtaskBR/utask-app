import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


// Tipo correto para os parâmetros no Next.js 15
type RouteParams = {
  params: {
    id: string;
  };
};

// GET /api/services/[id] - Obter detalhes de um serviço específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await params.id;
    
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            rating: true,
            about: true,
            city: true,
            state: true
          }
        },
        profession: true,
        photos: true,
        bids: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                image: true,
                rating: true
              }
            }
          }
        },
        cancelRequests: true
        // Removido temporariamente até que a migração seja aplicada
        // completionConfirmations: true
      }
    });
    
    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(service);
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// PATCH /api/services/[id] - Atualizar um serviço
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const id = await params.id;
    const body = await request.json();
    
    // Verificar se o serviço existe
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: {
        bids: {
          where: {
            status: "ACCEPTED"
          },
          include: {
            provider: true
          }
        },
        // Removido temporariamente até que a migração seja aplicada
        // completionConfirmations: true,
        creator: true
      }
    });
    
    if (!existingService) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário é o criador do serviço
    const isCreator = existingService.creatorId === session.user.id;
    
    // Verificar se o usuário é o prestador aceito
    const isAcceptedProvider = existingService.bids.some(
      bid => bid.status === "ACCEPTED" && bid.providerId === session.user.id
    );
    
    // Se não for nem criador nem prestador aceito, não pode modificar
    if (!isCreator && !isAcceptedProvider) {
      return NextResponse.json(
        { error: "Não autorizado a modificar este serviço" },
        { status: 403 }
      );
    }

    // Caso especial: Confirmação de conclusão do serviço
    if (body.confirmCompletion === true) {
      // Verificar se o serviço está em andamento
      if (existingService.status !== "IN_PROGRESS") {
        return NextResponse.json(
          { error: "Apenas serviços em andamento podem ser confirmados como concluídos" },
          { status: 400 }
        );
      }

      // Verificar se o usuário já confirmou a conclusão
      // Comentado temporariamente até que a migração seja aplicada
      /*
      const alreadyConfirmed = existingService.completionConfirmations.some(
        confirmation => confirmation.userId === session.user.id
      );

      if (alreadyConfirmed) {
        return NextResponse.json(
          { message: "Você já confirmou a conclusão deste serviço" },
          { status: 200 }
        );
      }
      */

      // Simplificando para evitar erros com o modelo não migrado
      // Atualizar o status do serviço para concluído diretamente
      const updatedService = await prisma.service.update({
        where: { id },
        data: { status: "COMPLETED" }
      });

      // Criar notificações para ambas as partes
      if (isCreator) {
        const providerId = existingService.bids[0].providerId;
        
        await prisma.notification.create({
          data: {
            type: "SERVICE_COMPLETION",
            message: `O serviço "${existingService.title}" foi marcado como concluído pelo contratante.`,
            receiver: { connect: { id: providerId } },
            sender: { connect: { id: session.user.id } }
          }
        });
      } else {
        await prisma.notification.create({
          data: {
            type: "SERVICE_COMPLETION",
            message: `O serviço "${existingService.title}" foi marcado como concluído pelo prestador.`,
            receiver: { connect: { id: existingService.creatorId } },
            sender: { connect: { id: session.user.id } }
          }
        });
      }

      return NextResponse.json({
        message: "Serviço concluído com sucesso!",
        status: "COMPLETED"
      });
    }
    
    // Caso especial: Cancelamento de serviço
    if (body.status === "CANCELLED") {
      // Se o serviço já tem um prestador aceito, é necessário concordância mútua
      if (existingService.bids.length > 0 && existingService.bids[0].status === "ACCEPTED") {
        const acceptedBid = existingService.bids[0];
        
        // Se o criador está solicitando cancelamento
        if (isCreator) {
          // Verificar se já existe uma solicitação de cancelamento
          const existingRequest = await prisma.serviceCancelRequest.findFirst({
            where: {
              serviceId: id,
              requesterId: session.user.id
            }
          });
          
          if (existingRequest) {
            return NextResponse.json(
              { message: "Solicitação de cancelamento já enviada" },
              { status: 200 }
            );
          }
          
          // Criar solicitação de cancelamento
          await prisma.serviceCancelRequest.create({
            data: {
              service: { connect: { id } },
              requester: { connect: { id: session.user.id } },
              reason: body.cancelReason || "Solicitação de cancelamento pelo criador"
            }
          });
          
          // Criar notificação para o prestador
          await prisma.notification.create({
            data: {
              type: "CANCEL_REQUEST",
              message: `O criador do serviço solicitou cancelamento. Motivo: ${body.cancelReason || "Não especificado"}`,
              receiver: { connect: { id: acceptedBid.providerId } },
              sender: { connect: { id: session.user.id } }
            }
          });
          
          return NextResponse.json({
            message: "Solicitação de cancelamento enviada ao prestador"
          });
        }
        
        // Se o prestador está solicitando cancelamento
        if (isAcceptedProvider) {
          // Verificar se já existe uma solicitação de cancelamento
          const existingRequest = await prisma.serviceCancelRequest.findFirst({
            where: {
              serviceId: id,
              requesterId: session.user.id
            }
          });
          
          if (existingRequest) {
            return NextResponse.json(
              { message: "Solicitação de cancelamento já enviada" },
              { status: 200 }
            );
          }
          
          // Criar solicitação de cancelamento
          await prisma.serviceCancelRequest.create({
            data: {
              service: { connect: { id } },
              requester: { connect: { id: session.user.id } },
              reason: body.cancelReason || "Solicitação de cancelamento pelo prestador"
            }
          });
          
          // Criar notificação para o criador
          await prisma.notification.create({
            data: {
              type: "CANCEL_REQUEST",
              message: `O prestador solicitou cancelamento do serviço. Motivo: ${body.cancelReason || "Não especificado"}`,
              receiver: { connect: { id: existingService.creatorId } },
              sender: { connect: { id: session.user.id } }
            }
          });
          
          return NextResponse.json({
            message: "Solicitação de cancelamento enviada ao criador"
          });
        }
      } else {
        // Se não tem prestador aceito, o criador pode cancelar diretamente
        if (isCreator) {
          const updatedService = await prisma.service.update({
            where: { id },
            data: { status: "CANCELLED" }
          });
          
          return NextResponse.json(updatedService);
        } else {
          return NextResponse.json(
            { error: "Apenas o criador pode cancelar este serviço" },
            { status: 403 }
          );
        }
      }
    }
    
    // Caso especial: Resposta a solicitação de cancelamento
    if (body.respondToCancelRequest === true) {
      // Verificar se existe uma solicitação de cancelamento pendente
      const cancelRequest = await prisma.serviceCancelRequest.findFirst({
        where: {
          serviceId: id,
          requesterId: {
            not: session.user.id // A solicitação deve ter sido feita pela outra parte
          }
        }
      });
      
      if (!cancelRequest) {
        return NextResponse.json(
          { error: "Não há solicitação de cancelamento pendente" },
          { status: 400 }
        );
      }
      
      // Se aceitou o cancelamento
      if (body.acceptCancelRequest === true) {
        // Atualizar o serviço para cancelado
        const updatedService = await prisma.service.update({
          where: { id },
          data: { status: "CANCELLED" }
        });
        
        // Determinar quem é o outro usuário (criador ou prestador)
        const otherUserId = isCreator 
          ? existingService.bids[0].providerId 
          : existingService.creatorId;
        
        // Criar notificação
        await prisma.notification.create({
          data: {
            type: "SERVICE_CANCELLED",
            message: "O serviço foi cancelado por acordo mútuo",
            receiver: { connect: { id: cancelRequest.requesterId } },
            sender: { connect: { id: session.user.id } }
          }
        });
        
        // Remover todas as solicitações de cancelamento
        await prisma.serviceCancelRequest.deleteMany({
          where: { serviceId: id }
        });
        
        return NextResponse.json(updatedService);
      } else {
        // Se rejeitou o cancelamento
        // Remover a solicitação de cancelamento
        await prisma.serviceCancelRequest.delete({
          where: { id: cancelRequest.id }
        });
        
        // Criar notificação
        await prisma.notification.create({
          data: {
            type: "CANCEL_REJECTED",
            message: "Sua solicitação de cancelamento foi rejeitada",
            receiver: { connect: { id: cancelRequest.requesterId } },
            sender: { connect: { id: session.user.id } }
          }
        });
        
        return NextResponse.json({
          message: "Solicitação de cancelamento rejeitada"
        });
      }
    }
    
    // Atualização normal do serviço (apenas o criador pode fazer)
    if (!isCreator) {
      return NextResponse.json(
        { error: "Apenas o criador pode atualizar os detalhes do serviço" },
        { status: 403 }
      );
    }
    
    // Atualizar o serviço
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        date: body.date ? new Date(body.date) : undefined,
        timeWindow: body.timeWindow,
        value: body.value,
        status: body.status,
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address,
        professionId: body.professionId
      }
    });
    
    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[id] - Excluir um serviço
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const id = await params.id;
    
    // Verificar se o serviço existe
    const existingService = await prisma.service.findUnique({
      where: { id }
    });
    
    if (!existingService) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário é o criador do serviço
    if (existingService.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Apenas o criador pode excluir o serviço" },
        { status: 403 }
      );
    }
    
    // Verificar se o serviço já está em andamento
    if (existingService.status === "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Não é possível excluir um serviço em andamento" },
        { status: 400 }
      );
    }
    
    // Excluir o serviço
    await prisma.service.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Serviço excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
