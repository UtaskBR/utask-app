import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginContent from '../login-content'; // Adjust path as necessary
import { signIn } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn((key: string) => {
      if (key === 'callbackUrl') return '/';
      return null;
    }),
  }),
}));

describe('LoginContent', () => {
  beforeEach(() => {
    (signIn as jest.Mock).mockClear();
  });

  test('renders login form', () => {
    render(<LoginContent />);
    expect(screen.getByRole('heading', { name: /entre na sua conta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('shows error if email or password are empty on submit', async () => {
    render(<LoginContent />);
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText(/email e senha são obrigatórios/i)).toBeInTheDocument();
  });

  test('calls signIn and redirects on successful login', async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: true, error: null, url: '/' });
    const mockRouter = require('next/navigation').useRouter();

    render(<LoginContent />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
        callbackUrl: '/',
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  test('displays specific error message for EMAIL_NOT_VERIFIED', async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: false, error: 'EMAIL_NOT_VERIFIED' });
    render(<LoginContent />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'unverified@example.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/por favor, verifique seu email antes de fazer login/i)).toBeInTheDocument();
    });
  });

  test('displays generic error message for other signIn errors', async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: false, error: 'CredentialsSignin' }); // Common NextAuth error
    render(<LoginContent />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/email ou senha inválidos. por favor, tente novamente./i)).toBeInTheDocument();
    });
  });

  test('displays registered message if registered query param is present', () => {
    (require('next/navigation').useSearchParams as jest.Mock).mockReturnValueOnce({
      get: (key: string) => {
        if (key === 'registered') return 'true';
        if (key === 'callbackUrl') return '/';
        return null;
      },
    });
    render(<LoginContent />);
    expect(screen.getByText(/conta criada com sucesso! faça login para continuar./i)).toBeInTheDocument();
  });

});
