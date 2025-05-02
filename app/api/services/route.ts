import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET, POST /api/services
export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros de consulta
    const url = new URL(request.url);
    const professionId = url.searchParams.get('professionId');
    const status = url.searchParams.get('status');
    const creatorId = url.searchParams.get('creatorId');
    const search = url.searchParams.get('search');
    
    // Construir a consulta SQL base
    let query = `
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.price, 
        s.date, 
        s.time, 
        s.location, 
        s.status, 
        s."createdAt", 
        s."updatedAt",
        s."creatorId",
        s."professionId",
        u.id as creator_id,
        u.name as creator_name,
        u.image as creator_image,
        p.id as profession_id,
        p.name as profession_name
      FROM "Service" s
      JOIN "User" u ON s."creatorId" = u.id
      LEFT JOIN "Profession" p ON s."professionId" = p.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Adicionar condições à consulta
    if (professionId) {
      query += ` AND s."professionId" = $${queryParams.length + 1}`;
      queryParams.push(professionId);
    }
    
    if (status) {
      query += ` AND s.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }
    
    if (creatorId) {
      query += ` AND s."creatorId" = $${queryParams.length + 1}`;
      queryParams.push(creatorId);
    }
    
    if (search) {
      query += ` AND (s.title ILIKE $${queryParams.length + 1} OR s.description ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY s."createdAt" DESC`;
    
    // Executar a consulta
    const services = await prisma.$queryRawUnsafe(query, ...queryParams);
    
    // Buscar fotos dos serviços
    const servicesIds = (services as any[]).map(service => service.id);
    
    const photos = await prisma.$queryRaw`
      SELECT id, url, "serviceId"
      FROM "Photo"
      WHERE "serviceId" IN (${Prisma.join(servicesIds)})
    `;
    
    // Buscar avaliações dos criadores
    const creatorIds = Array.from(new Set((services as any[]).map(service => service.creator_id)));
    
    const creatorRatings: { [key: string]: number | null } = {};
    
    for (const creatorId of creatorIds) {
      const reviews = await prisma.$queryRaw`
        SELECT rating FROM "Review" WHERE "receiverId" = ${creatorId}
      `;
      
      if (reviews && (reviews as any[]).length > 0) {
        const totalRating = (reviews as any[]).reduce((sum, review) => sum + review.rating, 0);
        creatorRatings[creatorId] = totalRating / (reviews as any[]).length;
      } else {
        creatorRatings[creatorId] = null;
      }
    }
    
    // Formatar a resposta
    const formattedServices = (services as any[]).map(service => {
      const servicePhotos = (photos as any[])
        .filter(photo => photo.serviceId === service.id)
        .map(photo => ({ url: photo.url }));
      
      return {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        date: service.date,
        time: service.time,
        location: service.location,
        status: service.status,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        creator: {
          id: service.creator_id,
          name: service.creator_name,
          image: service.creator_image,
          rating: creatorRatings[service.creator_id]
        },
        profession: service.profession_id ? {
          id: service.profession_id,
          name: service.profession_name
        } : null,
        photos: servicePhotos
      };
    });
    
    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { title, description, price, date, time, location, professionId } = body;
    
    // Verificar se todos os campos obrigatórios estão presentes
    if (!title || !description) {
      return NextResponse.json(
        { error: "Título, descrição e preço são obrigatórios" },
        { status: 400 }
      );
    }
    
    // Gerar um ID único para o serviço
    const serviceId = crypto.randomUUID();
    const now = new Date();
    
    // Criar o serviço usando SQL bruto
    await prisma.$executeRaw`
      INSERT INTO "Service" (
        id, 
        title, 
        description, 
        price, 
        date, 
        time, 
        location, 
        status, 
        "creatorId", 
        "professionId", 
        "createdAt", 
        "updatedAt"
      )
      VALUES (
        ${serviceId}, 
        ${title}, 
        ${description}, 
        ${price}, 
        ${date ? new Date(date) : null}, 
        ${time || null}, 
        ${location || null}, 
        'OPEN', 
        ${session.user.id}, 
        ${professionId || null}, 
        ${now}, 
        ${now}
      )
    `;
    
    // Buscar o serviço criado
    const createdServices = await prisma.$queryRaw`
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.price, 
        s.date, 
        s.time, 
        s.location, 
        s.status, 
        s."createdAt", 
        s."updatedAt",
        s."creatorId",
        s."professionId",
        u.id as creator_id,
        u.name as creator_name,
        u.image as creator_image,
        p.id as profession_id,
        p.name as profession_name
      FROM "Service" s
      JOIN "User" u ON s."creatorId" = u.id
      LEFT JOIN "Profession" p ON s."professionId" = p.id
      WHERE s.id = ${serviceId}
    `;
    
    if (!createdServices || (createdServices as any[]).length === 0) {
      return NextResponse.json(
        { error: "Erro ao criar serviço" },
        { status: 500 }
      );
    }
    
    const service = (createdServices as any[])[0];
    
    // Formatar a resposta
    const formattedService = {
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      date: service.date,
      time: service.time,
      location: service.location,
      status: service.status,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      creator: {
        id: service.creator_id,
        name: service.creator_name,
        image: service.creator_image
      },
      profession: service.profession_id ? {
        id: service.profession_id,
        name: service.profession_name
      } : null,
      photos: []
    };
    
    return NextResponse.json(formattedService, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
