import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceId = params.id;
    const body = await request.json();
    const { rating, testimonial } = body;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
    }

    if (typeof testimonial !== 'string' || testimonial.length < 19) {
      return NextResponse.json({ error: 'Testimonial must be a string with at least 19 characters' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { creatorId: true, status: true, title: true },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (service.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (service.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Service must be completed to be evaluated.' }, { status: 400 });
    }

    const acceptedBid = await prisma.bid.findFirst({
      where: {
        serviceId: serviceId,
        status: 'ACCEPTED',
      },
      select: { providerId: true },
    });

    if (!acceptedBid || !acceptedBid.providerId) {
      return NextResponse.json({ error: 'Accepted provider not found for this service.' }, { status: 404 });
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        serviceId: serviceId,
        giverId: session.user.id,
        receiverId: acceptedBid.providerId,
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'This service has already been evaluated by you for this provider.' }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        rating: rating,
        comment: testimonial,
        giverId: session.user.id,
        receiverId: acceptedBid.providerId,
        serviceId: serviceId,
      },
    });

    await prisma.notification.create({
      data: {
        type: 'REVIEW',
        title: 'Nova Avaliação Recebida',
        message: `Você recebeu uma nova avaliação para o serviço "${service.title}".`,
        receiverId: acceptedBid.providerId,
        senderId: session.user.id,
        serviceId: serviceId,
        read: false,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating evaluation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
