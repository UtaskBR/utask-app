import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import { Prisma } from "@prisma/client";

// GET - Buscar informações essenciais do usuário para edição
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não informado' }, { status: 400 });
    }
    
    console.log(`🔍 Buscando usuário com ID: ${userId}`);
    
    // Buscar o usuário usando SQL bruto
    const users = await prisma.$queryRaw`
      SELECT 
        u.id, 
        u.name, 
        u.about, 
        u.city, 
        u.state, 
        u.image
      FROM "User" u
      WHERE u.id = ${userId}
    `;
    
    if (!users || (users as any[]).length === 0) {
      console.log(`⚠️ Usuário não encontrado: ${userId}`);
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    
    const user = (users as any[])[0];
    
    // Buscar profissões do usuário
    const professions = await prisma.$queryRaw`
      SELECT p.id, p.name
      FROM "Profession" p
      JOIN "UserProfession" up ON p.id = up."professionId"
      WHERE up."userId" = ${userId}
    `;
    
    // Buscar fotos do usuário
    const photos = await prisma.$queryRaw`
      SELECT id, url, "publicId"
      FROM "Photo"
      WHERE "userId" = ${userId}
    `;
    
    // Formatar a resposta
    const formattedUser = {
      id: user.id,
      name: user.name,
      about: user.about,
      city: user.city,
      state: user.state,
      image: user.image,
      professions: professions,
      photos: photos
    };
    
    console.log(`✅ Usuário encontrado:`, formattedUser);
    
    const response = NextResponse.json(formattedUser);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (error) {
    console.error('[USER_GET_ERROR]', error);
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 });
  }
}

// PATCH - Atualizar perfil do usuário
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não informado' }, { status: 400 });
    }
    
    if (!session?.user?.id || session.user.id !== userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const { name, about, city, state } = await req.json();
    console.log(`🛠️ Atualizando usuário com ID: ${userId}`, { name, about, city, state });
    
    // Atualizar o usuário usando SQL bruto
    const now = new Date();
    
    await prisma.$executeRaw`
      UPDATE "User"
      SET 
        name = COALESCE(${name}, name),
        about = COALESCE(${about}, about),
        city = COALESCE(${city}, city),
        state = COALESCE(${state}, state),
        "updatedAt" = ${now}
      WHERE id = ${userId}
    `;
    
    // Buscar o usuário atualizado
    const updatedUsers = await prisma.$queryRaw`
      SELECT id, name, about, city, state, image, "createdAt", "updatedAt"
      FROM "User"
      WHERE id = ${userId}
    `;
    
    const updated = (updatedUsers as any[])[0];
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
