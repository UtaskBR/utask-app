import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        about: true,
        createdAt: true,
        professions: { // Assuming 'professions' is the correct relation name in schema
          select: {
            id: true,
            name: true,
          },
        },
        receivedReviews: { // Assuming 'receivedReviews' is the correct relation name
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            // Optionally, include limited giver info if needed by modal and privacy allows
            // giver: { select: { id: true, name: true, image: true } }
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Limit number of reviews for brevity in modal
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate average rating
    let averageRating = null;
    if (user.receivedReviews && user.receivedReviews.length > 0) {
      const totalRating = user.receivedReviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / user.receivedReviews.length;
    }

    const profileData = {
      ...user,
      rating: averageRating, // Add average rating to the response
    };

    return NextResponse.json(profileData);

  } catch (error) {
    console.error(`Error fetching user profile for ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal server error while fetching profile' }, { status: 500 });
  }
}
