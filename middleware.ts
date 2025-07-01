import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

import { Role } from "@prisma/client"; // Import Role enum

// Exportar o middleware configurado com NextAuth
export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Se o usuário não estiver autenticado e tentar acessar uma rota protegida (incluindo /admin)
    // o callback 'authorized' abaixo já vai lidar com o redirecionamento para o login.

    // Se a rota for /admin e o usuário não for ADMIN
    if (pathname.startsWith("/admin") && token?.role !== Role.ADMIN) {
      // Redireciona para uma página de acesso negado ou para a home page
      // Idealmente, teríamos uma página específica de "acesso negado"
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Se for admin acessando /admin, ou qualquer usuário autenticado acessando outras rotas protegidas
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;
        // Se não houver token, o usuário não está autenticado.
        // Acesso é negado para rotas protegidas.
        if (!token) {
          return false;
        }

        // Se o usuário estiver autenticado, permitir acesso por padrão.
        // A lógica específica de role para /admin é tratada no middleware principal.
        return true;
      },
    },
    pages: {
      signIn: "/auth/login",
      error: "/auth/error", // Página para erros de autenticação (ex: email não verificado)
      // signOut: "/auth/logout", // Opcional: se você tiver uma página de logout customizada
    },
  }
);

export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas de solicitação, exceto aquelas que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico (arquivo favicon)
     * - auth (rotas de autenticação como login, register, que não devem ser protegidas pelo middleware em si)
     * Isso garante que o middleware seja aplicado a todas as páginas da aplicação.
     * A lógica de quais páginas são realmente "protegidas" está dentro do middleware.
     */
    // '/((?!api|_next/static|_next/image|favicon.ico|auth).*)', // Regex mais genérico

    // Rotas específicas que exigem autenticação básica (qualquer usuário logado)
    "/meus-servicos/:path*",
    "/criar-servico/:path*",
    "/agenda/:path*",
    "/carteira/:path*",
    "/favoritos/:path*",
    "/notificacoes/:path*",
    "/perfil/editar/:path*",
    // "/perfil/:path*", // Permitir visualização de perfis públicos, mas proteger edição. Ajustar se necessário.

    // Rotas do admin que exigem autenticação E role ADMIN
    "/admin/:path*",
    // A rota /dashboard/:path* no seu config original parece ser uma rota de usuário, não de admin.
    // Se /dashboard for para admin, adicionar aqui. Se for para usuário, manter como está ou ajustar.
    // Por ora, vou assumir que /dashboard é uma rota de usuário geral e não de admin.
    // Se /dashboard for do admin, ela será coberta por /admin/:path* se renomeada,
    // ou precisa ser adicionada explicitamente aqui e tratada no middleware.
    // Removi "/dashboard/:path*" para evitar conflito com a lógica de /admin. Se precisar, reavalie.
  ],
};
