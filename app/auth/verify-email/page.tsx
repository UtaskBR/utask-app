'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token) {
      setError("Token de verificação não encontrado na URL.");
      setIsLoading(false);
      return;
    }

    const verifyToken = async () => {
      setIsLoading(true);
      setError(null);
      setMessage(null);
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Falha ao verificar o email.");
        }
        setMessage(data.message || "Email verificado com sucesso!");
      } catch (err: any) {
        setError(err.message || "Ocorreu um erro ao tentar verificar seu email.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-secondary-900">Verificação de Email</h2>

        {isLoading && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Verificando seu token...</p>
          </div>
        )}

        {message && !isLoading && (
          <div className="p-4 bg-green-50 border border-green-300 rounded-md">
            <p className="text-green-700">{message}</p>
            <Link href="/auth/login" className="mt-4 inline-block btn-primary">
              Ir para Login
            </Link>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-md">
            <p className="text-red-700">{error}</p>
            <Link href="/auth/register" className="mt-4 inline-block btn-secondary">
              Tentar Registrar Novamente
            </Link>
          </div>
        )}

        {!isLoading && !message && !error && !token && (
             <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md">
                <p className="text-yellow-700">Nenhum token de verificação fornecido. Se você seguiu um link, verifique se ele está correto.</p>
             </div>
        )}
      </div>
    </div>
  );
}

// It's good practice to wrap client components that use `useSearchParams` in `<Suspense>`
// as recommended by Next.js documentation.
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
