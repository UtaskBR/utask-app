import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Exportar o middleware configurado com NextAuth
export default withAuth(
  // Função que será executada após a verificação de autenticação
  function middleware(req) {
    // Verificar se o usuário está autenticado e tem acesso à rota
    return NextResponse.next();
  },
  {
    // Configurações do middleware
    callbacks: {
      // Verificar se o usuário tem permissão para acessar a rota
      authorized({ token, req }) {
        // Se não houver token, o usuário não está autenticado
        return !!token;
      },
    },
    // Páginas personalizadas
    pages: {
      signIn: "/auth/login",
      error: "/auth/error",
    },
  }
);

// Configurar apenas rotas específicas que devem ser protegidas
// Todas as outras rotas serão públicas por padrão
export const config = {
  matcher: [
    "/meus-servicos/:path*",
    "/criar-servico/:path*",
    "/agenda/:path*",
    "/carteira/:path*",
    "/favoritos/:path*",
    "/notificacoes/:path*",
    "/perfil/editar/:path*",
    "/perfil/:path*",
    "/dashboard/:path*"
  ],
};
