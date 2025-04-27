import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/services - Listar todos os serviços
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const profession = searchParams.get("profession");
    const minValue = searchParams.get("minValue");
    const maxDistance = searchParams.get("maxDistance");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const type = searchParams.get("type");
    
    // Se o tipo for "appointments", retornar os serviços agendados do usuário
    if (type === "appointments" && session?.user?.id) {
      console.log("Buscando serviços agendados para o usuário:", session.user.id);
      
      // Buscar serviços onde o usuário é o criador e tem uma proposta aceita
      const servicesAsClient = await prisma.service.findMany({
        where: {
          creatorId: session.user.id,
          status: {
            in: ["IN_PROGRESS", "COMPLETED"]
          },
          bids: {
            some: {
              status: "ACCEPTED"
            }
          }
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
              image: true,
              rating: true
            }
          },
          bids: {
            where: {
              status: "ACCEPTED"
            },
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
          }
        }
      });
      
      // Buscar serviços onde o usuário é o prestador e sua proposta foi aceita
      const servicesAsProvider = await prisma.service.findMany({
        where: {
          status: {
            in: ["IN_PROGRESS", "COMPLETED"]
          },
          bids: {
            some: {
              providerId: session.user.id,
              status: "ACCEPTED"
            }
          }
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true
            }
          },
          bids: {
            where: {
              providerId: session.user.id,
              status: "ACCEPTED"
            }
          }
        }
      });
      
      // Formatar os serviços como cliente para incluir informações do prestador
      const formattedClientServices = servicesAsClient.map(service => {
        const acceptedBid = service.bids[0];
        return {
          ...service,
          provider: acceptedBid?.provider || null,
          isProvider: false,
          client: service.creator
        };
      });
      
      // Formatar os serviços como prestador para incluir informações do cliente
      const formattedProviderServices = servicesAsProvider.map(service => {
        return {
          ...service,
          isProvider: true,
          client: service.creator,
          provider: {
            id: session.user.id,
            name: session.user.name,
            image: session.user.image
          }
        };
      });
      
      // Combinar os dois conjuntos de serviços
      const allAppointments = [...formattedClientServices, ...formattedProviderServices];
      
      console.log(`Encontrados ${allAppointments.length} serviços agendados`);
      return NextResponse.json(allAppointments);
    }
    
    // Caso contrário, retornar os serviços normais com filtros
    let whereClause: any = {
      status: "OPEN" // Por padrão, mostrar apenas serviços abertos
    };
    
    // Filtro por profissão
    if (profession) {
      whereClause.profession = {
        name: {
          contains: profession,
          mode: "insensitive"
        }
      };
    }
    
    // Filtro por valor mínimo
    if (minValue) {
      whereClause.value = {
        gte: parseFloat(minValue)
      };
    }
    
    // Filtro por distância seria implementado com cálculos de geolocalização
    // Simplificado para este exemplo
    
    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            rating: true
          }
        },
        profession: true,
        photos: true,
        bids: {
          select: {
            id: true,
            value: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return NextResponse.json(services);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// POST /api/services - Criar um novo serviço
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{  }> }
) {
  try {
    console.log("Iniciando criação de serviço");
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("Usuário não autenticado");
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    console.log("Usuário autenticado:", session.user.id);
    
    const body = await request.json();
    console.log("Dados recebidos:", JSON.stringify(body));
    
    const { 
      title, 
      description, 
      date, 
      timeWindow, 
      value, 
      professionId,
      latitude,
      longitude,
      address
    } = body;
    
    // Validação básica
    if (!title || !description) {
      console.log("Dados obrigatórios não fornecidos");
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }
    
    console.log("Criando serviço no banco de dados");
    
    // Criar o serviço
    const service = await prisma.service.create({
      data: {
        title,
        description,
        date: date ? new Date(date) : null,
        timeWindow: timeWindow ? parseInt(timeWindow) : 60,
        value: value ? parseFloat(value) : null,
        latitude: latitude || null,
        longitude: longitude || null,
        address: address || "",
        status: "OPEN",
        creator: {
          connect: {
            id: session.user.id
          }
        },
        profession: professionId ? {
          connect: {
            id: professionId
          }
        } : undefined
      }
    });
    
    console.log("Serviço criado com sucesso:", service.id);
    
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// PATCH /api/services - Editar um serviço existente
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{  }> }
) {
  try {
    console.log("Iniciando edição de serviço");
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("Usuário não autenticado");
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    console.log("Usuário autenticado:", session.user.id);
    
    const body = await request.json();
    console.log("Dados recebidos:", JSON.stringify(body));
    
    const { 
      id,
      title, 
      description, 
      date, 
      timeWindow, 
      value, 
      professionId,
      latitude,
      longitude,
      address
    } = body;
    
    // Validação básica
    if (!id) {
      console.log("ID do serviço não fornecido");
      return NextResponse.json(
        { error: "ID do serviço é obrigatório" },
        { status: 400 }
      );
    }
    
    // Verificar se o serviço existe e pertence ao usuário
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: {
        bids: true
      }
    });
    
    if (!existingService) {
      console.log("Serviço não encontrado");
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    if (existingService.creatorId !== session.user.id) {
      console.log("Usuário não é o criador do serviço");
      return NextResponse.json(
        { error: "Você não tem permissão para editar este serviço" },
        { status: 403 }
      );
    }
    
    // Verificar se o serviço já tem propostas aceitas
    if (existingService.status !== "OPEN") {
      console.log("Serviço não está mais aberto para edição");
      return NextResponse.json(
        { error: "Não é possível editar um serviço que não está mais aberto" },
        { status: 400 }
      );
    }
    
    console.log("Atualizando serviço no banco de dados");
    
    // Atualizar o serviço
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        title: title || undefined,
        description: description || undefined,
        date: date ? new Date(date) : undefined,
        timeWindow: timeWindow ? parseInt(timeWindow) : undefined,
        value: value ? parseFloat(value) : undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        address: address || undefined,
        profession: professionId ? {
          connect: {
            id: professionId
          }
        } : undefined
      }
    });
    
    console.log("Serviço atualizado com sucesso:", updatedService.id);
    
    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// DELETE /api/services - Excluir um serviço
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{  }> }
) {
  try {
    console.log("Iniciando exclusão de serviço");
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("Usuário não autenticado");
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    console.log("Usuário autenticado:", session.user.id);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      console.log("ID do serviço não fornecido");
      return NextResponse.json(
        { error: "ID do serviço é obrigatório" },
        { status: 400 }
      );
    }
    
    // Verificar se o serviço existe e pertence ao usuário
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: {
        bids: true
      }
    });
    
    if (!existingService) {
      console.log("Serviço não encontrado");
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    if (existingService.creatorId !== session.user.id) {
      console.log("Usuário não é o criador do serviço");
      return NextResponse.json(
        { error: "Você não tem permissão para excluir este serviço" },
        { status: 403 }
      );
    }
    
    // Verificar se o serviço já tem propostas aceitas
    if (existingService.status !== "OPEN") {
      console.log("Serviço não está mais aberto para exclusão");
      return NextResponse.json(
        { error: "Não é possível excluir um serviço que não está mais aberto" },
        { status: 400 }
      );
    }
    
    console.log("Excluindo serviço do banco de dados");
    
    // Excluir fotos relacionadas
    await prisma.photo.deleteMany({
      where: { serviceId: id }
    });
    
    // Excluir propostas relacionadas
    await prisma.serviceBid.deleteMany({
      where: { serviceId: id }
    });
    
    // Excluir o serviço
    await prisma.service.delete({
      where: { id }
    });
    
    console.log("Serviço excluído com sucesso");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
