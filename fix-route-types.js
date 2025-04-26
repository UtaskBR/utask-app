// Script para corrigir problemas de tipagem nas rotas de API do Next.js 15
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Diretório raiz do projeto
const rootDir = process.argv[2] || '.';
const apiDir = path.join(rootDir, 'app/api');

// Padrões para identificar funções de rota com problemas de tipagem
const routeHandlerPattern = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(\s*([^,)]+)\s*,\s*\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*([^}]+)\s*\}\s*\}/g;

// Função para verificar se um arquivo é um arquivo TypeScript
const isTypeScriptFile = (file) => {
  return file.endsWith('.ts') || file.endsWith('.tsx');
};

// Função para percorrer diretórios recursivamente
async function walkDir(dir) {
  const files = await readdir(dir);
  const results = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      const subResults = await walkDir(filePath);
      results.push(...subResults);
    } else if (isTypeScriptFile(file) && file === 'route.ts') {
      results.push(filePath);
    }
  }

  return results;
}

// Função para corrigir a tipagem em um arquivo
async function fixRouteTypes(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    let updated = false;
    
    // Verificar se o arquivo contém funções de rota com o padrão problemático
    const hasRouteHandlers = routeHandlerPattern.test(content);
    routeHandlerPattern.lastIndex = 0; // Resetar o índice do regex
    
    if (!hasRouteHandlers) {
      return false;
    }
    
    // Extrair informações do caminho do arquivo para determinar os parâmetros
    const relativePath = path.relative(apiDir, filePath);
    const pathSegments = relativePath.split(path.sep);
    const paramNames = [];
    
    // Identificar segmentos de caminho que são parâmetros dinâmicos (começam com '[' e terminam com ']')
    for (const segment of pathSegments) {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const paramName = segment.substring(1, segment.length - 1);
        if (paramName !== '...nextauth') { // Ignorar o caso especial do NextAuth
          paramNames.push(paramName);
        }
      }
    }
    
    if (paramNames.length === 0) {
      return false; // Não há parâmetros dinâmicos neste caminho
    }
    
    // Construir o tipo de parâmetros com base nos segmentos do caminho
    const paramsTypeContent = paramNames.map(name => `${name}: string;`).join('\n    ');
    const paramsTypeDefinition = `
// Tipo correto para os parâmetros no Next.js 15
type RouteParams = {
  params: {
    ${paramsTypeContent}
  };
};
`;
    
    // Substituir as funções de rota com o formato correto
    let newContent = content;
    
    // Adicionar a definição de tipo se ainda não existir
    if (!newContent.includes('type RouteParams')) {
      // Encontrar um bom lugar para inserir a definição de tipo (após importações)
      const importEndIndex = newContent.lastIndexOf('import');
      if (importEndIndex !== -1) {
        const importLineEndIndex = newContent.indexOf('\n', importEndIndex);
        if (importLineEndIndex !== -1) {
          newContent = newContent.substring(0, importLineEndIndex + 1) + 
                      '\n' + paramsTypeDefinition + 
                      newContent.substring(importLineEndIndex + 1);
          updated = true;
        }
      }
    }
    
    // Substituir as funções de rota
    newContent = newContent.replace(routeHandlerPattern, (match, method, requestParam, paramsDef) => {
      return `export async function ${method}(
  ${requestParam},
  context: RouteParams
)`;
    });
    
    // Substituir referências a params.X por context.params.X
    for (const paramName of paramNames) {
      const paramAccessPattern = new RegExp(`params\\.${paramName}\\b`, 'g');
      newContent = newContent.replace(paramAccessPattern, `context.params.${paramName}`);
    }
    
    if (newContent !== content) {
      await writeFile(filePath, newContent, 'utf8');
      console.log(`Corrigido: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error);
    return false;
  }
}

// Função principal
async function main() {
  try {
    console.log('Iniciando correção de tipagem nas rotas...');
    console.log(`Diretório raiz: ${rootDir}`);
    console.log(`Diretório de API: ${apiDir}`);

    // Obter todos os arquivos de rota no diretório de API
    const files = await walkDir(apiDir);
    console.log(`Encontrados ${files.length} arquivos de rota para verificar.`);

    // Corrigir tipagem em cada arquivo
    let fixedCount = 0;
    for (const file of files) {
      const fixed = await fixRouteTypes(file);
      if (fixed) {
        fixedCount++;
      }
    }

    console.log(`Concluído! ${fixedCount} arquivos de rota foram corrigidos.`);
  } catch (error) {
    console.error('Erro:', error);
  }
}

main();
