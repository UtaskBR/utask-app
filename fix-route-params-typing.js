// Script para corrigir a tipagem dos parâmetros de rota no Next.js 15
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

// Padrão para identificar funções de rota com tipo RouteParams
const routeParamsPattern = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(\s*([^,)]+)\s*,\s*context\s*:\s*RouteParams\s*\)/g;

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

// Função para extrair o nome do parâmetro do caminho do arquivo
function extractParamNames(filePath) {
  const relativePath = path.relative(apiDir, filePath);
  const pathSegments = relativePath.split(path.sep);
  const paramNames = [];
  
  for (const segment of pathSegments) {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      const paramName = segment.substring(1, segment.length - 1);
      if (paramName !== '...nextauth') { // Ignorar o caso especial do NextAuth
        paramNames.push(paramName);
      }
    }
  }
  
  return paramNames;
}

// Função para corrigir a tipagem dos parâmetros de rota
async function fixRouteParamsTyping(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Verificar se o arquivo contém o tipo RouteParams
    if (!content.includes('RouteParams') || !routeParamsPattern.test(content)) {
      return false;
    }
    
    // Extrair nomes de parâmetros do caminho do arquivo
    const paramNames = extractParamNames(filePath);
    if (paramNames.length === 0) {
      return false;
    }
    
    // Construir o objeto de parâmetros
    const paramsObject = paramNames.map(name => `${name}: string`).join(', ');
    
    // Criar a nova assinatura da função
    let newContent = content;
    
    // Remover a definição do tipo RouteParams se existir
    const routeParamsTypePattern = /type\s+RouteParams\s*=\s*\{\s*params\s*:\s*\{[^}]*\}\s*\}\s*;?/g;
    newContent = newContent.replace(routeParamsTypePattern, '');
    
    // Substituir a assinatura da função
    newContent = newContent.replace(routeParamsPattern, (match, method, requestParam) => {
      return `export async function ${method}(
  ${requestParam},
  { params }: { params: { ${paramsObject} } }
)`;
    });
    
    // Substituir referências a context.params.X por params.X
    for (const paramName of paramNames) {
      const contextParamPattern = new RegExp(`context\\.params\\.${paramName}\\b`, 'g');
      newContent = newContent.replace(contextParamPattern, `params.${paramName}`);
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
    console.log('Iniciando correção da tipagem dos parâmetros de rota...');
    console.log(`Diretório raiz: ${rootDir}`);
    console.log(`Diretório de API: ${apiDir}`);

    // Obter todos os arquivos de rota no diretório de API
    const files = await walkDir(apiDir);
    console.log(`Encontrados ${files.length} arquivos de rota para verificar.`);

    // Corrigir tipagem em cada arquivo
    let fixedCount = 0;
    for (const file of files) {
      const fixed = await fixRouteParamsTyping(file);
      if (fixed) {
        fixedCount++;
      }
    }

    console.log(`Concluído! ${fixedCount} arquivos foram corrigidos.`);
  } catch (error) {
    console.error('Erro:', error);
  }
}

main();
