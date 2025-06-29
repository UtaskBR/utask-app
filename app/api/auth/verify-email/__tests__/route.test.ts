/** @jest-environment node */

import { GET } from '../route'; // The handler for GET requests
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

describe('GET /api/auth/verify-email', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (token: string | null): NextRequest => {
    const url = token ? `http://localhost/api/auth/verify-email?token=${token}` : 'http://localhost/api/auth/verify-email';
    return {
      url: url,
      // searchParams: new URL(url).searchParams, // This is how NextRequest gets it
    } as unknown as NextRequest;
  };

  // Helper to simulate NextRequest's searchParams behavior for testing
  const createMockRequestWithSearchParams = (token: string | null): NextRequest => {
    const url = token
      ? `http://localhost/api/auth/verify-email?token=${encodeURIComponent(token)}`
      : 'http://localhost/api/auth/verify-email';
    return new NextRequest(url);
  };


  it('should verify email successfully with a valid token', async () => {
    const validToken = 'valid-token-123';
    const mockUser = { id: 'user-id-1', emailVerificationToken: validToken, emailIsVerified: false };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, emailIsVerified: true, emailVerificationToken: null });

    mockRequest = createMockRequestWithSearchParams(validToken);
    const response = await GET(mockRequest);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.message).toBe('Email verified successfully. You can now log in.');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { emailVerificationToken: validToken } });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: {
        emailIsVerified: true,
        emailVerificationToken: null,
      },
    });
  });

  it('should return 400 if token is missing', async () => {
    mockRequest = createMockRequestWithSearchParams(null);
    const response = await GET(mockRequest);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('Verification token is missing');
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return 404 if token is invalid or not found', async () => {
    const invalidToken = 'invalid-token-xyz';
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // User not found

    mockRequest = createMockRequestWithSearchParams(invalidToken);
    const response = await GET(mockRequest);
    const responseBody = await response.json();

    expect(response.status).toBe(404);
    expect(responseBody.error).toBe('Invalid or expired verification token');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { emailVerificationToken: invalidToken } });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('should return 500 if a database error occurs during findUnique', async () => {
    const token = 'any-token';
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database connection error'));

    mockRequest = createMockRequestWithSearchParams(token);
    const response = await GET(mockRequest);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('An error occurred during email verification');
  });

  it('should return 500 if a database error occurs during update', async () => {
    const token = 'valid-token-for-find';
    const mockUser = { id: 'user-id-2', emailVerificationToken: token, emailIsVerified: false };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.user.update as jest.Mock).mockRejectedValue(new Error('Database update error'));

    mockRequest = createMockRequestWithSearchParams(token);
    const response = await GET(mockRequest);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe('An error occurred during email verification');
  });
});
