import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterPage from '../page'; // The default export from app/auth/register/page.tsx

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('RegisterPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (global.fetch as jest.Mock).mockClear();
    // Default mock for states and cities API to avoid console errors during render
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/localidades/estados')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ sigla: 'SP', nome: 'São Paulo' }]),
        });
      }
      if (url.includes('/api/localidades/estados/SP')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, nome: 'São Paulo City' }]),
        });
      }
      // For the registration POST call, specific tests will override this.
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: { id: '123' }, message: 'Success' })
      });
    });
  });

  test('renders the registration form', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('heading', { name: /crie sua conta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha \*/i)).toBeInTheDocument(); // Use ^ to match start
    expect(screen.getByLabelText(/confirmar senha \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf \*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  test('shows error if required fields are missing on submit', async () => {
    render(<RegisterPage />);
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    expect(await screen.findByText(/nome, email, senha e cpf são obrigatórios/i)).toBeInTheDocument();
  });

  test('shows error if passwords do not match', async () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/nome completo \*/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email \*/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/cpf \*/i), { target: { value: '111.222.333-44' } });
    fireEvent.change(screen.getByLabelText(/^senha \*/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha \*/i), { target: { value: 'password456' } });

    // Need to select state and city as they are now required by the form's handleSubmit
    // Wait for states to load and select one
    await screen.findByText('São Paulo'); // ensure state dropdown is populated
    fireEvent.change(screen.getByLabelText(/estado \*/i), { target: { value: 'SP' } });
    // Wait for cities to load and select one
    await screen.findByText('São Paulo City'); // ensure city dropdown is populated
    fireEvent.change(screen.getByLabelText(/cidade \*/i), { target: { value: 'São Paulo City' } });

    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    expect(await screen.findByText(/as senhas não coincidem/i)).toBeInTheDocument();
  });

  test('shows error if CPF has incorrect number of digits', async () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/nome completo \*/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email \*/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^senha \*/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha \*/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/cpf \*/i), { target: { value: '111.222.333' } }); // Incomplete CPF

    await screen.findByText('São Paulo');
    fireEvent.change(screen.getByLabelText(/estado \*/i), { target: { value: 'SP' } });
    await screen.findByText('São Paulo City');
    fireEvent.change(screen.getByLabelText(/cidade \*/i), { target: { value: 'São Paulo City' } });

    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    expect(await screen.findByText(/cpf deve conter 11 dígitos/i)).toBeInTheDocument();
  });

  test('submits form and displays success message on successful registration', async () => {
    (global.fetch as jest.Mock).mockImplementation((url:string) => {
      if (url.includes('/api/register')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: { id: 'mockUserId', name: 'Test User', email: 'test@example.com' },
            message: 'Registration successful. Please verify your email.',
            emailVerificationToken: 'mockToken'
          }),
        });
      }
      // Handle states/cities calls
      if (url.includes('/api/localidades/estados/SP')) return Promise.resolve({ ok: true, json: () => Promise.resolve([{id:1, nome: 'São Paulo City'}])});
      if (url.includes('/api/localidades/estados')) return Promise.resolve({ ok: true, json: () => Promise.resolve([{sigla:'SP', nome: 'São Paulo'}])});
      return Promise.reject(new Error(`Unhandled fetch: ${url}`));
    });

    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/nome completo \*/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email \*/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^senha \*/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha \*/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/cpf \*/i), { target: { value: '111.222.333-44' } });

    await screen.findByText('São Paulo');
    fireEvent.change(screen.getByLabelText(/estado \*/i), { target: { value: 'SP' } });
    await screen.findByText('São Paulo City');
    fireEvent.change(screen.getByLabelText(/cidade \*/i), { target: { value: 'São Paulo City' } });

    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByText(/cadastro realizado com sucesso!/i)).toBeInTheDocument();
      expect(screen.getByText(/verifique seu email para ativar sua conta/i)).toBeInTheDocument();
    });
    // Form should be hidden or cleared. Check that a prominent field like "Nome completo" is gone.
    expect(screen.queryByLabelText(/nome completo \*/i)).not.toBeInTheDocument();
  });

  test('displays error message from backend if registration fails', async () => {
    (global.fetch as jest.Mock).mockImplementation((url:string) => {
      if (url.includes('/api/register')) {
        return Promise.resolve({
          ok: false, // Simulate backend error
          json: () => Promise.resolve({ error: 'Email já cadastrado (mock backend)' }),
        });
      }
      if (url.includes('/api/localidades/estados/SP')) return Promise.resolve({ ok: true, json: () => Promise.resolve([{id:1, nome: 'São Paulo City'}])});
      if (url.includes('/api/localidades/estados')) return Promise.resolve({ ok: true, json: () => Promise.resolve([{sigla:'SP', nome: 'São Paulo'}])});
      return Promise.reject(new Error(`Unhandled fetch: ${url}`));
    });

    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/nome completo \*/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email \*/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^senha \*/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha \*/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/cpf \*/i), { target: { value: '111.222.333-44' } });

    await screen.findByText('São Paulo');
    fireEvent.change(screen.getByLabelText(/estado \*/i), { target: { value: 'SP' } });
    await screen.findByText('São Paulo City');
    fireEvent.change(screen.getByLabelText(/cidade \*/i), { target: { value: 'São Paulo City' } });

    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(await screen.findByText(/email já cadastrado \(mock backend\)/i)).toBeInTheDocument();
  });
});
