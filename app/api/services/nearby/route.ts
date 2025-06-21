import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // For types if needed

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Bounding box parameters
    const minLngStr = searchParams.get('minLng');
    const minLatStr = searchParams.get('minLat');
    const maxLngStr = searchParams.get('maxLng');
    const maxLatStr = searchParams.get('maxLat');

    // Other filters
    const professionId = searchParams.get('professionId');
    const minPriceStr = searchParams.get('minPrice');
    const maxPriceStr = searchParams.get('maxPrice');

    const minLng = parseFloat(minLngStr || '');
    const minLat = parseFloat(minLatStr || '');
    const maxLng = parseFloat(maxLngStr || '');
    const maxLat = parseFloat(maxLatStr || '');

    if (isNaN(minLng) || isNaN(minLat) || isNaN(maxLng) || isNaN(maxLat)) {
      return NextResponse.json({ error: 'Valid bounding box (minLng, minLat, maxLng, maxLat) is required.' }, { status: 400 });
    }

    const queryParams: any[] = [];
    let paramIndex = 1; // To keep track of $n placeholders

    let sqlConditions = [
      "s.status = 'OPEN'", // Keep existing status filter
      "s.latitude IS NOT NULL",
      "s.longitude IS NOT NULL"
    ];

    // Bounding Box conditions
    sqlConditions.push(`s.longitude >= $${paramIndex++}`);
    queryParams.push(minLng);
    sqlConditions.push(`s.longitude <= $${paramIndex++}`);
    queryParams.push(maxLng);
    sqlConditions.push(`s.latitude >= $${paramIndex++}`);
    queryParams.push(minLat);
    sqlConditions.push(`s.latitude <= $${paramIndex++}`);
    queryParams.push(maxLat);

    // Other existing filters
    if (professionId) {
      sqlConditions.push(`s."professionId" = $${paramIndex++}`);
      queryParams.push(professionId);
    }
    if (minPriceStr) {
      const minPrice = parseFloat(minPriceStr);
      if (!isNaN(minPrice)) {
        sqlConditions.push(`s.price >= $${paramIndex++}`);
        queryParams.push(minPrice);
      }
    }
    if (maxPriceStr) {
      const maxPrice = parseFloat(maxPriceStr);
      if (!isNaN(maxPrice)) {
        sqlConditions.push(`s.price <= $${paramIndex++}`);
        queryParams.push(maxPrice);
      }
    }

    const finalWhereClause = sqlConditions.length > 0 ? `WHERE ${sqlConditions.join(' AND ')}` : '';

    const finalQuery = `
      SELECT
        s.id, s.title, s.description, s.price, s.date, s.status,
        s.latitude, s.longitude, s.address, s."professionId",
        s.cep, s.logradouro, s.numero, s.complemento, s.bairro, s.cidade, s.uf,
        p.name as "professionName",
        (SELECT ph.url FROM "Photo" ph WHERE ph."serviceId" = s.id ORDER BY ph."createdAt" ASC LIMIT 1) as "photoUrl"
        -- Removed distance calculation
      FROM "Service" s
      LEFT JOIN "Profession" p ON s."professionId" = p.id
      ${finalWhereClause}
      ORDER BY s."createdAt" DESC; -- Example: order by creation date
    `;

    // console.log("Executing bounds query:", finalQuery);
    // console.log("With parameters:", queryParams);

    const services = await prisma.$queryRawUnsafe(finalQuery, ...queryParams);

    return NextResponse.json(services);

  } catch (error) {
    console.error('Error fetching nearby services:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2010' && error.message.includes('$queryRawUnsafe')) {
        console.error("Prisma $queryRawUnsafe error. Ensure it's correctly configured if this is a new feature use for the project, or check SQL syntax / parameters.");
    }
    return NextResponse.json({ error: 'Failed to fetch nearby services.' }, { status: 500 });
  }
}
