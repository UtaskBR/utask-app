import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET, POST /api/services
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const professionId = url.searchParams.get("professionId");
    const status = url.searchParams.get("status");
    const creatorId = url.searchParams.get("creatorId");
    const search = url.searchParams.get("search");

    let query = `
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.price, 
        s.date, 
        s.latitude,
        s.longitude,
        s.address,
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

    const services = await prisma.$queryRawUnsafe(query, ...queryParams);
    const servicesIds = (services as any[]).map((s) => s.id);

    const [photos, ratings] = await Promise.all([
      prisma.$queryRaw`
        SELECT id, url, "serviceId"
        FROM "Photo"
        WHERE "serviceId" IN (${Prisma.join(servicesIds)})
      `,
      prisma.$queryRaw`
        SELECT "receiverId", AVG(rating)::float AS rating
        FROM "Review"
        WHERE "receiverId" IN (${Prisma.join(services.map((s) => s.creator_id))})
        GROUP BY "receiverId"
      `,
    ]);

    const ratingMap = Object.fromEntries((ratings as any[]).map(r => [r.receiverId, r.rating]));

    const formattedServices = (services as any[]).map((service) => {
      const servicePhotos = (photos as any[]).filter(p => p.serviceId === service.id).map(p => ({ url: p.url }));
      return {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        date: service.date,
        latitude: service.latitude,
        longitude: service.longitude,
        address: service.address,
        status: service.status,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        creator: {
          id: service.creator_id,
          name: service.creator_name,
          image: service.creator_image,
          rating: ratingMap[service.creator_id] ?? null
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
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, price, date, latitude, longitude, address, professionId } = body;

    if (!title || !description || price === undefined) {
      return NextResponse.json({ error: "Título, descrição e preço são obrigatórios" }, { status: 400 });
    }

    const serviceId = crypto.randomUUID();
    const now = new Date();

    await prisma.$executeRaw`
      INSERT INTO "Service" (
        id, title, description, price, date, latitude, longitude, address,
        status, "creatorId", "professionId", "createdAt", "updatedAt"
      ) VALUES (
        ${serviceId}, ${title}, ${description}, ${price},
        ${date ? new Date(date) : null},
        ${latitude || null}, ${longitude || null}, ${address || null},
        'OPEN', ${session.user.id}, ${professionId || null}, ${now}, ${now}
      )
    `;

    const [service] = await prisma.$queryRaw`
      SELECT 
        s.id, s.title, s.description, s.price, s.date, s.latitude,
        s.longitude, s.address, s.status, s."createdAt", s."updatedAt",
        u.id as creator_id, u.name as creator_name, u.image as creator_image,
        p.id as profession_id, p.name as profession_name
      FROM "Service" s
      JOIN "User" u ON s."creatorId" = u.id
      LEFT JOIN "Profession" p ON s."professionId" = p.id
      WHERE s.id = ${serviceId}
    `;

    return NextResponse.json({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      date: service.date,
      latitude: service.latitude,
      longitude: service.longitude,
      address: service.address,
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
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 });
  }
}
