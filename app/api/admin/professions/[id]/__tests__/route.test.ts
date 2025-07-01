/**
 * @jest-environment node
 */
import { PUT, DELETE } from '../route'; // Ajuste o caminho conforme necessário
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
      findUnique: jest.fn(),
      findFirst: jest.fn(), // Para checagem de nome duplicado no PUT
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: { // Para a checagem de usuários associados à profissão
      count: jest.fn(),
    }
    // Adicione outros modelos e métodos conforme necessário
  },
}));
jest.mock('@/lib/auditLog'); // CORRIGIDO

const mockedGetToken = getToken as jest.MockedFunction<typeof getToken>;
const mockProfessionId = 'prof123';

describe('/api/admin/professions/[id] API endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TODO: Adicionar testes para PUT /api/admin/professions/[id]

  describe('DELETE /api/admin/professions/[id]', () => {
    it('should delete a profession successfully as admin if no services or users are associated', async () => {
      mockedGetToken.mockResolvedValue({
        id: 'admin123',
        email: 'admin@example.com',
        role: Role.ADMIN
      });

      const mockProfession = { id: mockProfessionId, name: 'Profissão para Deletar', icon: 'trash', services: [] };
      (prisma.profession.findUnique as jest.Mock).mockResolvedValue(mockProfession);
      (prisma.user.count as jest.Mock).mockResolvedValue(0); // Nenhum usuário associado
      (prisma.profession.delete as jest.Mock).mockResolvedValue(mockProfession);

      const req = new NextRequest(`http://localhost/api/admin/professions/${mockProfessionId}`, {
        method: 'DELETE',
      });

      const response = await DELETE(req, { params: { id: mockProfessionId } });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('Profissão deletada com sucesso');
      expect(prisma.profession.delete).toHaveBeenCalledWith({ where: { id: mockProfessionId } });
      expect(createAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        adminId: 'admin123',
        action: 'PROFESSION_DELETE', // Usar AuditActions.PROFESSION_DELETE
        targetEntityId: mockProfessionId,
      }));
    });

    it('should return 403 if user is not admin', async () => {
      mockedGetToken.mockResolvedValue({ id: 'user123', email: 'user@example.com', role: Role.USER });
      const req = new NextRequest(`http://localhost/api/admin/professions/${mockProfessionId}`, {
        method: 'DELETE',
      });
      const response = await DELETE(req, { params: { id: mockProfessionId } });
      expect(response.status).toBe(403);
      expect(prisma.profession.delete).not.toHaveBeenCalled();
    });

    it('should return 404 if profession not found', async () => {
      mockedGetToken.mockResolvedValue({ id: 'admin123', email: 'admin@example.com', role: Role.ADMIN });
      (prisma.profession.findUnique as jest.Mock).mockResolvedValue(null);
      const req = new NextRequest(`http://localhost/api/admin/professions/nonexistentid`, {
        method: 'DELETE',
      });
      const response = await DELETE(req, { params: { id: 'nonexistentid' } });
      expect(response.status).toBe(404);
    });

    it('should return 400 if profession has associated services', async () => {
      mockedGetToken.mockResolvedValue({ id: 'admin123', email: 'admin@example.com', role: Role.ADMIN });
      const mockProfessionWithService = {
        id: mockProfessionId,
        name: 'Profissão Ocupada',
        services: [{ id: 'service1', title: 'Serviço Ativo' }]
      };
      (prisma.profession.findUnique as jest.Mock).mockResolvedValue(mockProfessionWithService);

      const req = new NextRequest(`http://localhost/api/admin/professions/${mockProfessionId}`, {
        method: 'DELETE',
      });
      const response = await DELETE(req, { params: { id: mockProfessionId } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('existem serviços associados');
      expect(prisma.profession.delete).not.toHaveBeenCalled();
    });

    it('should return 400 if profession has associated users', async () => {
        mockedGetToken.mockResolvedValue({ id: 'admin123', email: 'admin@example.com', role: Role.ADMIN });
        const mockProfessionWithUser = {
          id: mockProfessionId,
          name: 'Profissão Com Usuários',
          services: [] // Sem serviços diretos
        };
        (prisma.profession.findUnique as jest.Mock).mockResolvedValue(mockProfessionWithUser);
        (prisma.user.count as jest.Mock).mockResolvedValue(1); // Um usuário associado

        const req = new NextRequest(`http://localhost/api/admin/professions/${mockProfessionId}`, {
          method: 'DELETE',
        });
        const response = await DELETE(req, { params: { id: mockProfessionId } });
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toContain('existem usuários associados');
        expect(prisma.profession.delete).not.toHaveBeenCalled();
      });
  });
});
