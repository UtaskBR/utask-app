import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const professionId = searchParams.get('professionId');
    const nameQuery = searchParams.get('name'); // Use 'name' as query param for consistency

    let whereClause: Prisma.UserWhereInput = {};

    if (nameQuery) {
      whereClause.name = {
        contains: nameQuery,
        mode: 'insensitive', // Case-insensitive search
      };
    }

    if (professionId) {
      // Ensure users have at least one profession, and one of them matches the ID.
      whereClause.professions = {
        some: {
          id: professionId,
        },
      };
    } else {
      // If no specific profession, no specific profession filter is applied by default.
      // Depending on requirements, one might add:
      // whereClause.professions = { some: {} };
      // to ensure only users with at least one profession are returned.
      // For this iteration, if professionId is null/empty, all users matching other criteria (like name) are returned.
    }

    // If both professionId and nameQuery are empty, this will return all users.
    // If the intent is to always return "professionals", consider adding a default
    // filter like `whereClause.professions = { some: {} };` when other filters are absent.
    // For now, adhering to the provided logic.

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        professions: true, // To display their list of professions
        receivedReviews: { // To calculate average rating
          select: {
            rating: true,
          },
        },
        // image is a direct field on User model, so it's included by default
        // No need to select other fields like 'id', 'name', 'email', 'city', 'state', 'about' as they are returned by default
        // unless specific `select` is used on the User model directly.
      },
      orderBy: {
        name: 'asc', // Default sort order
      }
    });

    // Process users to calculate averageRating and simplify professions list
    const processedUsers = users.map(user => {
      let averageRating = null;
      if (user.receivedReviews && user.receivedReviews.length > 0) {
        const totalRating = user.receivedReviews.reduce((acc, review) => acc + review.rating, 0);
        averageRating = parseFloat((totalRating / user.receivedReviews.length).toFixed(1));
      }
      const professionNames = user.professions.map(p => p.name);

      // Explicitly select or omit fields for the final response
      // Omitting sensitive data like password, emailVerified, accounts, sessions
      const { receivedReviews, password, emailVerified, accounts, sessions, ...userWithoutSensitiveData } = user;

      return {
        ...userWithoutSensitiveData, // id, name, email, image, about, city, state, createdAt, updatedAt
        professions: professionNames, // Return array of names
        averageRating,
      };
    });

    return NextResponse.json(processedUsers);

  } catch (error) {
    console.error('Error searching professionals:', error);
    // It's good to check for Prisma-specific errors or other known error types
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      return NextResponse.json({ error: `Database error: ${error.code}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to search for professionals.' }, { status: 500 });
  }
}
