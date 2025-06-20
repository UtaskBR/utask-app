import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // For types if needed

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = parseFloat(searchParams.get('radius') || ''); // in kilometers
    const professionId = searchParams.get('professionId');
    const minPriceStr = searchParams.get('minPrice');
    const maxPriceStr = searchParams.get('maxPrice');

    if (isNaN(lat) || isNaN(lng) || isNaN(radius) || radius <= 0) {
      return NextResponse.json({ error: 'Latitude, longitude, and a positive radius are required.' }, { status: 400 });
    }

    // Earth radius in kilometers
    const R = 6371;

    // Corrected parameter setup for the query
    const queryParams: any[] = [lat, lng]; // $1=lat, $2=lng
    let sqlConditions = [
      "s.status = 'OPEN'",
      "s.latitude IS NOT NULL",
      "s.longitude IS NOT NULL"
    ];

    if (professionId) {
      sqlConditions.push(`s."professionId" = $${queryParams.length + 1}`);
      queryParams.push(professionId);
    }
    if (minPriceStr) {
      const minPrice = parseFloat(minPriceStr);
      if (!isNaN(minPrice)) {
        sqlConditions.push(`s.price >= $${queryParams.length + 1}`);
        queryParams.push(minPrice);
      }
    }
    if (maxPriceStr) {
      const maxPrice = parseFloat(maxPriceStr);
      if (!isNaN(maxPrice)) {
        sqlConditions.push(`s.price <= $${queryParams.length + 1}`);
        queryParams.push(maxPrice);
      }
    }

    // Add radius to queryParams for the HAVING clause comparison
    // This will be the last parameter.
    queryParams.push(radius);
    const radiusParamIndex = queryParams.length;

    const finalWhereClause = sqlConditions.length > 0 ? `WHERE ${sqlConditions.join(' AND ')}` : '';

    // Using s.latitude and s.longitude which are expected to be in degrees.
    // radians() function converts degrees to radians.
    // $1 is user's latitude, $2 is user's longitude.
    // $${radiusParamIndex} is the search radius.
    const finalQuery = `
      SELECT
        s.id, s.title, s.description, s.price, s.date, s.status,
        s.latitude, s.longitude, s.address, s."professionId",
        p.name as "professionName",
        (SELECT ph.url FROM "Photo" ph WHERE ph."serviceId" = s.id ORDER BY ph."createdAt" ASC LIMIT 1) as "photoUrl",
        (
          ${R} * acos(
            GREATEST(-1.0, LEAST(1.0,
              cos(radians($1)) * cos(radians(s.latitude)) *
              cos(radians(s.longitude) - radians($2)) +
              sin(radians($1)) * sin(radians(s.latitude))
            ))
          )
        ) AS distance
      FROM "Service" s
      LEFT JOIN "Profession" p ON s."professionId" = p.id
      ${finalWhereClause}
      HAVING (
        ${R} * acos(
          GREATEST(-1.0, LEAST(1.0,
            cos(radians($1)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(s.latitude))
          ))
        )
      ) <= $${radiusParamIndex}
      ORDER BY distance ASC;
    `;

    // console.log("Executing nearby query:", finalQuery);
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
