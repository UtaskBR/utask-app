import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import VerifyEmailPage from '../page'; // The default export from app/auth/verify-email/page.tsx
import { Suspense } from 'react';

// Mock next/navigation's useSearchParams
let mockToken: string | null = null;
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn((key: string) => {
      if (key === 'token') return mockToken;
      return null;
    }),
  }),
}));

// Mock global fetch
global.fetch = jest.fn();

// Helper to render with Suspense
const renderWithSuspense = (ui: React.ReactElement) => {
  return render(<Suspense fallback={<div>Loading...</div>}>{ui}</Suspense>);
}

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    mockToken = null; // Reset token
  });

  test('shows loading state initially then error if no token is provided', async () => {
    mockToken = null;
    renderWithSuspense(<VerifyEmailPage />);
    // It might briefly show "Loading..." from Suspense, then the component's own loading/error
    // Check for the component's specific message when no token
    await waitFor(() => {
        expect(screen.getByText(/nenhum token de verificação fornecido/i)).toBeInTheDocument();
    });
  });

  test('shows loading state then "token not found" if token is empty string', async () => {
    mockToken = ""; // Test with empty string token
    renderWithSuspense(<VerifyEmailPage />);
    await waitFor(() => {
      expect(screen.getByText(/token de verificação não encontrado na url/i)).toBeInTheDocument();
    });
  });


  test('calls API and displays success message for a valid token', async () => {
    mockToken = 'valid-token';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Email verificado com sucesso!' }),
    });

    renderWithSuspense(<VerifyEmailPage />);

    expect(screen.getByText(/verificando seu token/i)).toBeInTheDocument(); // Initial loading

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/auth/verify-email?token=${mockToken}`);
    });

    await waitFor(() => {
      expect(screen.getByText(/email verificado com sucesso!/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /ir para login/i })).toBeInTheDocument();
    });
  });

  test('calls API and displays error message for an invalid token', async () => {
    mockToken = 'invalid-token';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Token inválido ou expirado.' }),
    });

    renderWithSuspense(<VerifyEmailPage />);
    expect(screen.getByText(/verificando seu token/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/auth/verify-email?token=${mockToken}`);
    });

    await waitFor(() => {
      expect(screen.getByText(/token inválido ou expirado./i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /tentar registrar novamente/i })).toBeInTheDocument();
    });
  });

  test('displays generic error message if API call fails unexpectedly', async () => {
    mockToken = 'some-token';
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    renderWithSuspense(<VerifyEmailPage />);
    expect(screen.getByText(/verificando seu token/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/auth/verify-email?token=${mockToken}`);
    });

    await waitFor(() => {
      expect(screen.getByText(/ocorreu um erro ao tentar verificar seu email./i)).toBeInTheDocument();
    });
  });
});
