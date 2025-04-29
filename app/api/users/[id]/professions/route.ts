import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 Buscando usuário com ID: ${params.id}`);
    
    // Usar findUnique e incluir as profissões relacionadas
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        about: true,
        city: true,
        state: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        // Incluir profissões relacionadas
        professions: {
          select: {
            id: true,
            name: true,
          },
        },
        // Incluir outras relações que podem ser necessárias para o perfil
        photos: {
          select: {
            id: true,
            url: true,
          }
        },
        receivedReviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            giver: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          }
        }
        // Adicione outras relações conforme necessário (ex: certificates, etc.)
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("[USER_GET_ERROR]", error);
    return NextResponse.json(
      { error: `Erro ao buscar usuário: ${error.message}` },
      { status: 500 }
    );
  }
}

// Adicionar a função PUT para atualizar o perfil, incluindo profissões
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, about, city, state, image, professionIds } = body;

    console.log(`🔄 Atualizando usuário com ID: ${params.id}`);
    console.log(`Dados recebidos para atualização:`, body);

    // Validar se professionIds é um array (mesmo que vazio)
    if (professionIds && !Array.isArray(professionIds)) {
      return NextResponse.json(
        { error: "'professionIds' deve ser um array." },
        { status: 400 }
      );
    }

    const updateData: any = {
      name: name,
      about: about,
      city: city,
      state: state,
      image: image,
    };

    // Se professionIds for fornecido, atualizar a relação muitos-para-muitos
    if (professionIds) {
      updateData.professions = {
        // Desconectar todas as profissões existentes primeiro
        set: [], 
        // Conectar as novas profissões selecionadas
        connect: professionIds.map((id: string) => ({ id: id }))
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        about: true,
        city: true,
        state: true,
        image: true,
        professions: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`✅ Usuário atualizado com sucesso:`, updatedUser);
    return NextResponse.json(updatedUser);

  } catch (error: any) {
    console.error("[USER_PUT_ERROR]", error);
    // Verificar erros específicos do Prisma (ex: profissão não encontrada)
    if (error.code === 'P2025') { // Prisma error code for record not found during connect
       return NextResponse.json(
        { error: `Erro ao atualizar profissões: Uma ou mais profissões selecionadas não foram encontradas.` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: `Erro ao atualizar usuário: ${error.message}` },
      { status: 500 }
    );
  }
}

