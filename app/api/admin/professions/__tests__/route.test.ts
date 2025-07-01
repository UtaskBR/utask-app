/**
 * @jest-environment node
 */
import { POST, GET } from '../route'; // Ajuste o caminho conforme necessário
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/auditLog';
import { Role } from '@prisma/client';

// Mock das dependências
jest.mock('next-auth/jwt');
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    profession: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    // Adicione outros modelos e métodos conforme necessário para outros testes
  },
}));
jest.mock('@/lib/auditLog'); // CORRIGIDO

// Tipagem para o mock do getToken
const mockedGetToken = getToken as jest.MockedFunction<typeof getToken>;

describe('/api/admin/professions API endpoint', () => {
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('POST /api/admin/professions', () => {
    it('should create a new profession successfully as admin', async () => {
      mockedGetToken.mockResolvedValue({
        id: 'admin123',
        email: 'admin@example.com',
        role: Role.ADMIN,
        name: 'Admin User'
      });

      const mockProfessionData = { name: 'Nova Profissão', icon: 'briefcase' };
      const dateNow = new Date();
      // Ajustar o mock para que as datas sejam strings, como seriam após JSON.stringify/parse
      const mockCreatedProfessionForDb = { id: 'prof1', ...mockProfessionData, createdAt: dateNow, updatedAt: dateNow };
      const mockExpectedProfessionResponse = {
        id: 'prof1',
        ...mockProfessionData,
        createdAt: dateNow.toISOString(),
        updatedAt: dateNow.toISOString()
      };

      (prisma.profession.findFirst as jest.Mock).mockResolvedValue(null); // Nenhuma profissão existente com o mesmo nome
      (prisma.profession.create as jest.Mock).mockResolvedValue(mockCreatedProfessionForDb);

      const req = new NextRequest('http://localhost/api/admin/professions', {
        method: 'POST',
        body: JSON.stringify(mockProfessionData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body).toEqual(mockExpectedProfessionResponse); // Comparar com o objeto que tem datas como string
      expect(prisma.profession.create).toHaveBeenCalledWith({
        data: mockProfessionData,
      });
      expect(createAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        adminId: 'admin123',
        adminEmail: 'admin@example.com',
        action: 'PROFESSION_CREATE', // Usar AuditActions.PROFESSION_CREATE se importado
        targetEntityId: 'prof1',
      }));
    });

    it('should return 403 if user is not admin', async () => {
      mockedGetToken.mockResolvedValue({
        id: 'user123',
        email: 'user@example.com',
        role: Role.USER,
        name: 'Regular User'
      });

      const req = new NextRequest('http://localhost/api/admin/professions', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Acesso não autorizado');
      expect(prisma.profession.create).not.toHaveBeenCalled();
      expect(createAuditLog).not.toHaveBeenCalled();
    });

    it('should return 400 if name is missing', async () => {
        mockedGetToken.mockResolvedValue({ id: 'admin123', email: 'admin@example.com', role: Role.ADMIN });
        const req = new NextRequest('http://localhost/api/admin/professions', {
            method: 'POST',
            body: JSON.stringify({ icon: 'some-icon' }), // Sem nome
        });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe('O nome da profissão é obrigatório');
        expect(prisma.profession.create).not.toHaveBeenCalled();
    });

    it('should return 409 if profession name already exists', async () => {
        mockedGetToken.mockResolvedValue({ id: 'admin123', email: 'admin@example.com', role: Role.ADMIN });
        (prisma.profession.findFirst as jest.Mock).mockResolvedValue({ id: 'existingProf', name: 'Nome Existente' }); // Simula profissão existente

        const req = new NextRequest('http://localhost/api/admin/professions', {
            method: 'POST',
            body: JSON.stringify({ name: 'Nome Existente', icon: 'briefcase' }),
        });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.error).toBe('Uma profissão com este nome já existe');
        expect(prisma.profession.create).not.toHaveBeenCalled();
    });
  });

  // TODO: Adicionar testes para GET /api/admin/professions
  // describe('GET /api/admin/professions', () => { ... });
});
