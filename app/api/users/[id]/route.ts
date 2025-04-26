import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

// GET - Buscar informações essenciais do usuário para edição
export async function GET(req: NextRequest, context: { params?: { id?: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = context.params?.id;
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não informado' }, { status: 400 });
    }

    console.log(`🔍 Buscando usuário com ID: ${userId}`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        about: true,
        city: true,
        state: true,
        image: true,
        professions: true,
        photos: { select: { id: true, url: true, publicId: true } },
      }
    });

    if (!user) {
      console.log(`⚠️ Usuário não encontrado: ${userId}`);
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log(`✅ Usuário encontrado:`, user);

    const response = NextResponse.json(user);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error) {
    console.error('[USER_GET_ERROR]', error);
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 });
  }
}

// PATCH - Atualizar perfil do usuário
export async function PATCH(req: NextRequest, context: { params?: { id?: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = context.params?.id;

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não informado' }, { status: 400 });
    }

    if (!session?.user?.id || session.user.id !== userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { name, about, city, state } = await req.json();

    console.log(`🛠️ Atualizando usuário com ID: ${userId}`, { name, about, city, state });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name, about, city, state },
    });

    console.log(`✅ Usuário atualizado:`, updated);

    const response = NextResponse.json(updated);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error) {
    console.error('[USER_PATCH_ERROR]', error);
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}
