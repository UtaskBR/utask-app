/** @jest-environment node */

import { POST } from '../route'; // The handler for POST requests
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { cpfValidationService } from '@/services/cpfValidationService';
import { normalizeEmail } from '@/utils/formatters'; // For verifying stored email

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));
jest.mock('@/services/cpfValidationService', () => ({
  cpfValidationService: {
    validateCpf: jest.fn(),
  },
}));
// NextResponse mock is usually not needed if you just check the returned value's status and json()
// jest.mock('next/server', () => ({
//   NextResponse: {
//     json: jest.fn((body, { status }) => ({ body, status })),
//   },
// }));


describe('POST /api/register', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test

    // Default mock implementations
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockImplementation(async (args) => ({
      id: 'mock-user-id',
      ...args.data, // Return the data that was passed in for creation
    }));
    (hash as jest.Mock).mockResolvedValue('hashedPassword123');
    (uuidv4 as jest.Mock).mockReturnValue('mock-email-verification-token');
    (cpfValidationService.validateCpf as jest.Mock).mockResolvedValue({ isValid: true, message: 'CPF válido (mock)' });
  });

  const createMockRequest = (body: any): NextRequest => {
    return {
      json: jest.fn().mockResolvedValue(body),
      // Add other properties/methods if your handler uses them (e.g., headers, url)
    } as unknown as NextRequest;
  };

  it('should register a new user successfully', async () => {
    const body = {
      name: 'Test User',
      email: ' Test@Example.com ',
      password: 'password123',
      cpf: '11122233344', // mock valid CPF
      city: 'Test City',
      state: 'TS',
    };
    mockRequest = createMockRequest(body);

    const response = await POST(mockRequest);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody.message).toBe('Registration successful. Please verify your email.');
    expect(responseBody.user.email).toBe('test@example.com'); // Normalized
    expect(responseBody.emailVerificationToken).toBe('mock-email-verification-token');

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: body.name,
          email: normalizeEmail(body.email),
          password: 'hashedPassword123',
          cpf: body.cpf, // Cleaned CPF
          emailIsVerified: false,
          emailVerificationToken: 'mock-email-verification-token',
          city: body.city,
          state: body.state,
          wallet: { create: { balance: 0 } },
        }),
      })
    );
    expect(hash).toHaveBeenCalledWith(body.password, 10);
    expect(cpfValidationService.validateCpf).toHaveBeenCalledWith(body.cpf);
  });

  it('should return 400 if required fields are missing', async () => {
    const body = { name: 'Test User', email: 'test@example.com' }; // Missing password and CPF
    mockRequest = createMockRequest(body);
    const response = await POST(mockRequest);
    const responseBody = await response.json();
    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('Nome, email, senha e CPF são obrigatórios');
  });

  it('should return 400 for invalid email format (empty after normalization)', async () => {
    const body = { name: 'Test', email: '  ', password: 'p', cpf: '12345678901' };
    mockRequest = createMockRequest(body);
    const response = await POST(mockRequest);
    const responseBody = await response.json();
    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('Email inválido');
  });

  it('should return 400 for invalid CPF format (local check)', async () => {
    const body = { name: 'Test', email: 't@e.com', password: 'p', cpf: '123' };
    mockRequest = createMockRequest(body);
    const response = await POST(mockRequest);
    const responseBody = await response.json();
    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('Formato de CPF inválido');
  });

  it('should return 400 if external CPF validation fails', async () => {
    (cpfValidationService.validateCpf as jest.Mock).mockResolvedValue({
      isValid: false,
      message: 'CPF inválido pela Receita (mock)'
    });
    // Use a CPF that passes local format validation but will be rejected by the mock service
    const cpfThatPassesLocalButFailsMock = '12345678900'; // Example of a MOCK_FLAGGED_CPF
    const body = { name: 'Test', email: 't@e.com', password: 'p', cpf: cpfThatPassesLocalButFailsMock };
    mockRequest = createMockRequest(body);
    const response = await POST(mockRequest);
    const responseBody = await response.json();
    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('CPF inválido pela Receita (mock)');
  });

  it('should return 400 if email already exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }) => {
      if (where.email === 'existing@example.com') {
        return Promise.resolve({ id: 'user1', email: 'existing@example.com' });
      }
      return Promise.resolve(null);
    });
    const body = { name: 'Test', email: 'existing@example.com', password: 'p', cpf: '12345678901' };
    mockRequest = createMockRequest(body);
    const response = await POST(mockRequest);
    const responseBody = await response.json();
    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('Email já cadastrado');
  });

  it('should return 400 if CPF already exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }) => {
      if (where.cpf === '99988877766') {
        return Promise.resolve({ id: 'user2', cpf: '99988877766' });
      }
      return Promise.resolve(null);
    });
     const body = { name: 'Test', email: 'new@example.com', password: 'p', cpf: '99988877766' };
    mockRequest = createMockRequest(body);
    const response = await POST(mockRequest);
    const responseBody = await response.json();
    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('CPF já cadastrado em nosso sistema');
  });

});
