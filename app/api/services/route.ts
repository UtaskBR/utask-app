import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import cloudinary from '@/lib/cloudinary'; // Cloudinary import

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

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "O formato da requisição deve ser multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const dateStr = formData.get("date") as string;
    const latitude = formData.get("latitude") as string;
    const longitude = formData.get("longitude") as string;
    const address = formData.get("address") as string;
    const professionId = formData.get("professionId") as string;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Título e descrição são obrigatórios" },
        { status: 400 }
      );
    }

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

    const serviceId = crypto.randomUUID();

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

    const photos = formData.getAll("photos") as File[];

    if (photos && photos.length > 0) {
      for (const photo of photos) {
        if (!photo.name || !photo.type.startsWith("image/")) {
          console.warn(`[Service ID: ${service.id}] Skipping non-image file: ${photo.name}`);
          continue;
        }

        try {
          const arrayBuffer = await photo.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          console.log(`[Service ID: ${service.id}] Attempting Cloudinary upload for file: ${photo.name}`);

          const result = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "utask/services", upload_preset: "utask-gallery" },
              (error, cloudinaryResult) => {
                if (error) {
                  console.error(`[Service ID: ${service.id}] Cloudinary upload stream error for ${photo.name}:`, error);
                  return reject(error);
                }
                console.log(`[Service ID: ${service.id}] Cloudinary upload stream success for ${photo.name}.`);
                return resolve(cloudinaryResult);
              }
            );
            stream.end(buffer);
          });

          console.log(`[Service ID: ${service.id}] Cloudinary Result for ${photo.name} (Full):`, JSON.stringify(result, null, 2));
          console.log(`[Service ID: ${service.id}] Cloudinary result.secure_url for ${photo.name}:`, result?.secure_url);

          if (result?.secure_url) {
            await prisma.photo.create({
              data: {
                url: result.secure_url,
                publicId: result.public_id,
                serviceId: service.id,
              },
            });
          } else {
            console.error(`[Service ID: ${service.id}] Cloudinary upload for ${photo.name} succeeded but no secure_url was returned. Full result:`, JSON.stringify(result, null, 2));
          }
        } catch (photoError) {
          console.error(`[Service ID: ${service.id}] Error processing photo ${photo.name}:`, photoError);
        }
      }
    }

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
