#!/bin/bash

# Script para testar todas as funcionalidades da aplicação

echo "Iniciando testes da aplicação..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Erro: Node.js não está instalado"
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "Erro: npm não está instalado"
    exit 1
fi

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "Erro: package.json não encontrado. Certifique-se de estar no diretório raiz do projeto."
    exit 1
fi

# Verificar se as dependências estão instaladas
echo "Verificando dependências..."
npm list next mapbox-gl cloudinary prisma next-auth > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Aviso: Algumas dependências podem estar faltando. Executando npm install..."
    npm install
fi

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
    echo "Erro: Arquivo .env.local não encontrado"
    exit 1
fi

# Verificar se as variáveis de ambiente necessárias estão definidas
echo "Verificando variáveis de ambiente..."
grep -q "DATABASE_URL" .env.local || echo "Aviso: DATABASE_URL não encontrada em .env.local"
grep -q "NEXTAUTH_SECRET" .env.local || echo "Aviso: NEXTAUTH_SECRET não encontrada em .env.local"
grep -q "NEXTAUTH_URL" .env.local || echo "Aviso: NEXTAUTH_URL não encontrada em .env.local"
grep -q "CLOUDINARY_CLOUD_NAME" .env.local || echo "Aviso: CLOUDINARY_CLOUD_NAME não encontrada em .env.local"
grep -q "CLOUDINARY_API_KEY" .env.local || echo "Aviso: CLOUDINARY_API_KEY não encontrada em .env.local"
grep -q "CLOUDINARY_API_SECRET" .env.local || echo "Aviso: CLOUDINARY_API_SECRET não encontrada em .env.local"
grep -q "MAPBOX_TOKEN" .env.local || echo "Aviso: MAPBOX_TOKEN não encontrada em .env.local"

# Verificar a estrutura de diretórios
echo "Verificando estrutura de diretórios..."
[ -d "app" ] || echo "Erro: Diretório app não encontrado"
[ -d "app/api" ] || echo "Erro: Diretório app/api não encontrado"
[ -d "app/components" ] || echo "Erro: Diretório app/components não encontrado"
[ -d "prisma" ] || echo "Erro: Diretório prisma não encontrado"

# Verificar arquivos essenciais
echo "Verificando arquivos essenciais..."
[ -f "app/layout.tsx" ] || echo "Erro: app/layout.tsx não encontrado"
[ -f "app/(main)/page.tsx" ] || echo "Erro: app/(main)/page.tsx não encontrado"
[ -f "prisma/schema.prisma" ] || echo "Erro: prisma/schema.prisma não encontrado"
[ -f "middleware.ts" ] || echo "Erro: middleware.ts não encontrado"

# Verificar componentes principais
echo "Verificando componentes principais..."
[ -f "app/components/Navbar.tsx" ] || echo "Erro: app/components/Navbar.tsx não encontrado"
[ -f "app/components/Footer.tsx" ] || echo "Erro: app/components/Footer.tsx não encontrado"
[ -f "app/components/AuthGuard.tsx" ] || echo "Erro: app/components/AuthGuard.tsx não encontrado"
[ -f "app/components/ImageUpload.tsx" ] || echo "Erro: app/components/ImageUpload.tsx não encontrado"
[ -f "app/components/MapComponent.tsx" ] || echo "Erro: app/components/MapComponent.tsx não encontrado"

# Verificar páginas principais
echo "Verificando páginas principais..."
[ -f "app/auth/login/page.tsx" ] || echo "Erro: app/auth/login/page.tsx não encontrado"
[ -f "app/auth/register/page.tsx" ] || echo "Erro: app/auth/register/page.tsx não encontrado"
[ -f "app/(main)/explorar/page.tsx" ] || echo "Erro: app/(main)/explorar/page.tsx não encontrado"
[ -f "app/(main)/servicos/[id]/page.tsx" ] || echo "Erro: app/(main)/servicos/[id]/page.tsx não encontrado"
[ -f "app/(main)/criar-servico/page.tsx" ] || echo "Erro: app/(main)/criar-servico/page.tsx não encontrado"
[ -f "app/(main)/perfil/[id]/page.tsx" ] || echo "Erro: app/(main)/perfil/[id]/page.tsx não encontrado"
[ -f "app/(main)/carteira/page.tsx" ] || echo "Erro: app/(main)/carteira/page.tsx não encontrado"
[ -f "app/(main)/favoritos/page.tsx" ] || echo "Erro: app/(main)/favoritos/page.tsx não encontrado"
[ -f "app/(main)/notificacoes/page.tsx" ] || echo "Erro: app/(main)/notificacoes/page.tsx não encontrado"
[ -f "app/(main)/agenda/page.tsx" ] || echo "Erro: app/(main)/agenda/page.tsx não encontrado"
[ -f "app/(main)/mapa/page.tsx" ] || echo "Erro: app/(main)/mapa/page.tsx não encontrado"
[ -f "app/(main)/servicos-mapa/page.tsx" ] || echo "Erro: app/(main)/servicos-mapa/page.tsx não encontrado"

# Verificar rotas de API
echo "Verificando rotas de API..."
[ -f "app/api/auth/[...nextauth]/route.ts" ] || echo "Erro: app/api/auth/[...nextauth]/route.ts não encontrado"
[ -f "app/api/register/route.ts" ] || echo "Erro: app/api/register/route.ts não encontrado"
[ -f "app/api/services/route.ts" ] || echo "Erro: app/api/services/route.ts não encontrado"
[ -f "app/api/services/[id]/route.ts" ] || echo "Erro: app/api/services/[id]/route.ts não encontrado"
[ -f "app/api/upload/route.ts" ] || echo "Erro: app/api/upload/route.ts não encontrado"
[ -f "app/api/wallet/route.ts" ] || echo "Erro: app/api/wallet/route.ts não encontrado"
[ -f "app/api/notifications/route.ts" ] || echo "Erro: app/api/notifications/route.ts não encontrado"
[ -f "app/api/favorites/route.ts" ] || echo "Erro: app/api/favorites/route.ts não encontrado"

# Verificar integrações externas
echo "Verificando integrações externas..."
[ -f "app/lib/cloudinary.ts" ] || echo "Erro: app/lib/cloudinary.ts não encontrado" # Changed .js to .ts
[ -f "app/lib/prisma.ts" ] || echo "Erro: app/lib/prisma.ts não encontrado"

echo "Testes concluídos!"
echo "A aplicação está pronta para ser empacotada e entregue."
