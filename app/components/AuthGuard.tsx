'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Componente para proteger rotas no lado do cliente
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (status === 'unauthenticated') {
      // Redirecionar para a página de login com callback para retornar após autenticação
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  // Mostrar estado de carregamento enquanto verifica a autenticação
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  // Renderizar o conteúdo protegido apenas se o usuário estiver autenticado
  return session ? <>{children}</> : null;
}
