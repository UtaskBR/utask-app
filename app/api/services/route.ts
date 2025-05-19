import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// POST /api/services - Criar um novo serviço
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se o request é multipart/form-data
    const contentType = request.headers.get("content-type") || "";
    
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "O formato da requisição deve ser multipart/form-data" },
        { status: 400 }
      );
    }

    // Processar o formulário multipart
    const formData = await request.formData();
    
    // Extrair dados do serviço
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const dateStr = formData.get("date") as string;
    const latitude = formData.get("latitude") as string;
    const longitude = formData.get("longitude") as string;
    const address = formData.get("address") as string;
    const professionId = formData.get("professionId") as string;
    
    // Validar campos obrigatórios
    if (!title || !description) {
      return NextResponse.json(
        { error: "Título e descrição são obrigatórios" },
        { status: 400 }
      );
    }

    // Converter e validar campos numéricos
    let price: number | null = null;
    if (priceStr) {
      price = parseFloat(priceStr);
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: "Preço inválido" },
          { status: 400 }
        );
      }
    }

    // Converter e validar data
    let date: Date | null = null;
    if (dateStr) {
      date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: "Data inválida" },
          { status: 400 }
        );
      }
    }

    // Converter coordenadas
    let lat: number | null = null;
    let lng: number | null = null;
    
    if (latitude && longitude) {
      lat = parseFloat(latitude);
      lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json(
          { error: "Coordenadas inválidas" },
          { status: 400 }
        );
      }
    }

    // Gerar ID único para o serviço
    const serviceId = crypto.randomUUID();

    // Criar o serviço no banco de dados
    const service = await prisma.service.create({
      data: {
        id: serviceId,
        title,
        description,
        price,
        date,
        latitude: lat,
        longitude: lng,
        address,
        status: "OPEN",
        creatorId: session.user.id,
        professionId: professionId || undefined
      }
    });

    // Processar fotos (se houver)
    const photos = formData.getAll("photos") as File[];
    const photoUrls: string[] = [];

    if (photos && photos.length > 0) {
      for (const photo of photos) {
        if (!photo.name || !photo.type.startsWith("image/")) {
          continue; // Pular arquivos que não são imagens
        }

        try {
          // Ler o arquivo como array de bytes
          const bytes = await photo.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Gerar nome único para o arquivo
          const fileName = `${crypto.randomUUID()}-${photo.name.replace(/\s+/g, '_')}`;
          
          // Aqui você implementaria o upload para seu serviço de armazenamento
          // Por exemplo, para o S3, Azure Blob Storage, etc.
          // Para este exemplo, vamos simular um URL de imagem
          const photoUrl = `/uploads/services/${fileName}`;
          
          // Em um ambiente real, você faria algo como:
          // await uploadToStorage(buffer, fileName, photo.type);
          
          // Registrar a foto no banco de dados
          await prisma.photo.create({
            data: {
              id: crypto.randomUUID(),
              url: photoUrl,
              serviceId: service.id
            }
          });
          
          photoUrls.push(photoUrl);
        } catch (photoError) {
          console.error("Erro ao processar foto:", photoError);
          // Continuar com as outras fotos mesmo se uma falhar
        }
      }
    }

    // Buscar o serviço criado com suas fotos
    const createdService = await prisma.service.findUnique({
      where: { id: service.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        profession: true,
        photos: true
      }
    });

    return NextResponse.json(createdService, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// GET /api/services - Listar serviços
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Parâmetros de consulta
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const creatorId = url.searchParams.get("creatorId");
    const providerId = url.searchParams.get("providerId");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    
    // Construir filtros
    const filters: any = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (creatorId) {
      filters.creatorId = creatorId;
    }
    
    if (providerId) {
      filters.bids = {
        some: {
          providerId,
          status: "ACCEPTED"
        }
      };
    }
    
    // Buscar serviços com paginação
    const services = await prisma.service.findMany({
      where: filters,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        profession: true,
        photos: true,
        bids: {
          where: {
            status: "ACCEPTED"
          },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip: offset,
      take: limit
    });
    
    // Contar total de serviços para paginação
    const total = await prisma.service.count({
      where: filters
    });
    
    return NextResponse.json({
      services,
      pagination: {
        total,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error("Erro ao listar serviços:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
