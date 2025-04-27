/**
 * Script para corrigir automaticamente a tipagem em todas as rotas de API para compatibilidade com o Next.js 15.3.1
 * 
 * Este script:
 * 1. Corrige a tipagem dos parâmetros de rota para usar Promise
 * 2. Atualiza o código para aguardar a resolução da Promise
 * 3. Preserva todas as funcionalidades originais
 * 
 * Uso: node fix-nextjs-typing.js <diretório>
 * Exemplo: node fix-nextjs-typing.js ./app
 */

const fs = require('fs');
const path = require('path');

// Diretório a ser processado (padrão: ./app)
const targetDir = process.argv[2] || './app';

// Extensões de arquivo a serem processadas
const fileExtensions = ['.ts', '.tsx'];

// Padrão para identificar arquivos de rota
const routeFilePattern = /route\.(ts|tsx)$/;

// Contador de arquivos processados
let processedFiles = 0;
let modifiedFiles = 0;

/**
 * Função principal para processar um diretório recursivamente
 */
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Processar subdiretórios recursivamente
      processDirectory(filePath);
    } else if (
      stat.isFile() && 
      fileExtensions.includes(path.extname(file)) && 
      routeFilePattern.test(file)
    ) {
      // Processar arquivos de rota
      processRouteFile(filePath);
      processedFiles++;
    }
  }
}

/**
 * Função para processar um arquivo de rota
 */
function processRouteFile(filePath) {
  console.log(`Processando: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Padrão para identificar funções de rota (GET, POST, PUT, DELETE, etc.)
  const routeHandlerPattern = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(\s*([^)]*)\s*\)/g;
  
  // Substituir a tipagem dos parâmetros de rota
  content = content.replace(routeHandlerPattern, (match, method, params) => {
    // Verificar se já tem dois parâmetros
    if (params.includes(',')) {
      // Já tem dois parâmetros, verificar se o segundo parâmetro tem a tipagem correta
      const [firstParam, secondParam] = params.split(',').map(p => p.trim());
      
      // Verificar se o segundo parâmetro já tem a tipagem correta
      if (secondParam.includes('Promise<')) {
        return match; // Já está correto, não modificar
      }
      
      // Extrair o nome do parâmetro e a tipagem atual
      const paramMatch = secondParam.match(/{\s*([^}:]*)[^}]*}/);
      if (!paramMatch) {
        return match; // Não conseguiu extrair o nome do parâmetro, não modificar
      }
      
      const paramName = paramMatch[1].trim();
      
      // Verificar se é um parâmetro dinâmico (com [id] no caminho)
      const isDynamicParam = filePath.includes('[') && filePath.includes(']');
      
      if (isDynamicParam) {
        // Extrair o nome do parâmetro dinâmico do caminho
        const pathParts = filePath.split(path.sep);
        const dynamicParts = pathParts.filter(part => part.includes('[') && part.includes(']'));
        
        if (dynamicParts.length > 0) {
          const dynamicParam = dynamicParts[0].replace('[', '').replace(']', '');
          
          // Substituir a tipagem para usar Promise
          return `export async function ${method}(${firstParam}, { ${paramName} }: { ${paramName}: Promise<{ ${dynamicParam}: string }> })`;
        }
      }
      
      // Para rotas sem parâmetros dinâmicos
      return `export async function ${method}(${firstParam}, { ${paramName} }: { ${paramName}: Promise<{}> })`;
    } else {
      // Tem apenas um parâmetro, adicionar o segundo parâmetro com a tipagem correta
      // Verificar se é um parâmetro dinâmico (com [id] no caminho)
      const isDynamicParam = filePath.includes('[') && filePath.includes(']');
      
      if (isDynamicParam) {
        // Extrair o nome do parâmetro dinâmico do caminho
        const pathParts = filePath.split(path.sep);
        const dynamicParts = pathParts.filter(part => part.includes('[') && part.includes(']'));
        
        if (dynamicParts.length > 0) {
          const dynamicParam = dynamicParts[0].replace('[', '').replace(']', '');
          
          // Adicionar o segundo parâmetro com a tipagem correta
          return `export async function ${method}(${params}, { params }: { params: Promise<{ ${dynamicParam}: string }> })`;
        }
      }
      
      // Para rotas sem parâmetros dinâmicos
      return `export async function ${method}(${params}, { params }: { params: Promise<{}> })`;
    }
  });
  
  // Padrão para identificar acesso direto a parâmetros
  const directParamAccessPattern = /const\s+{\s*([^}]+)\s*}\s*=\s*params/g;
  
  // Substituir acesso direto a parâmetros por acesso via Promise
  content = content.replace(directParamAccessPattern, (match, paramList) => {
    return `const resolvedParams = await params\nconst { ${paramList} } = resolvedParams`;
  });
  
  // Padrão para identificar acesso direto a propriedades de params
  const directPropAccessPattern = /params\.([a-zA-Z0-9_]+)/g;
  
  // Substituir acesso direto a propriedades de params por acesso via Promise
  content = content.replace(directPropAccessPattern, (match, prop) => {
    // Verificar se já existe a linha const resolvedParams = await params
    if (content.includes('const resolvedParams = await params')) {
      return `resolvedParams.${prop}`;
    } else {
      // Adicionar a linha antes do primeiro acesso
      const index = content.indexOf(match);
      const beforeMatch = content.substring(0, index);
      const afterMatch = content.substring(index);
      
      // Verificar se estamos dentro de uma função assíncrona
      if (beforeMatch.lastIndexOf('async') > beforeMatch.lastIndexOf('{')) {
        content = beforeMatch + `const resolvedParams = await params\n` + afterMatch;
        return `resolvedParams.${prop}`;
      }
      
      return match; // Não modificar se não estiver em uma função assíncrona
    }
  });
  
  // Verificar se o conteúdo foi modificado
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Arquivo modificado: ${filePath}`);
    modifiedFiles++;
  } else {
    console.log(`Arquivo não modificado: ${filePath}`);
  }
}

// Iniciar o processamento
console.log(`Iniciando processamento no diretório: ${targetDir}`);
processDirectory(targetDir);
console.log(`Processamento concluído. ${processedFiles} arquivos processados, ${modifiedFiles} arquivos modificados.`);
