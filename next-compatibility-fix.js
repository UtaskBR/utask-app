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
    let content = await readFile(filePath, 'utf8');
    let updated = false;
    
    // Ignorar o arquivo de rota do NextAuth
    if (filePath.includes('[...nextauth]')) {
      console.log(`Ignorando arquivo NextAuth: ${filePath}`);
      return false;
    }
    
    const paramNames = extractParamNames(filePath);
    const hasParams = paramNames.length > 0;
    
    // 1. Remover definições de tipo RouteParams
    const routeParamsTypePattern = /type\s+RouteParams\s*=\s*\{\s*params\s*:\s*\{[^}]*\}\s*\}\s*;?/g;
    if (routeParamsTypePattern.test(content)) {
      content = content.replace(routeParamsTypePattern, '');
      updated = true;
      console.log(`Removida definição de tipo RouteParams em: ${filePath}`);
    }
    
    // 2. Corrigir a tipagem dos parâmetros nas funções de rota
    const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    
    for (const method of httpMethods) {
      // Padrão para encontrar funções de rota com o método específico
      // Captura funções com apenas um parâmetro ou com dois parâmetros
      const singleParamPattern = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(([^,)]*)\\)\\s*\\{`, 'g');
      const twoParamsPattern = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(([^,]*),\\s*([^)]*)\\)\\s*\\{`, 'g');
      
      // Verificar primeiro se há funções com apenas um parâmetro (request)
      let singleMatch;
      while ((singleMatch = singleParamPattern.exec(content)) !== null) {
        // Ignorar se já tem dois parâmetros (pode ser um falso positivo devido à regex)
        if (!singleMatch[0].includes(',')) {
          const fullMatch = singleMatch[0];
          const requestParam = singleMatch[1].trim();
          
          // Criar a nova assinatura da função com o parâmetro params vazio
          const newSignature = `export async function ${method}(
  ${requestParam},
  { params }: { params: Promise<{}> }
) {`;
          
          content = content.replace(fullMatch, newSignature);
          updated = true;
          console.log(`Adicionado parâmetro params vazio em função ${method} em: ${filePath}`);
        }
      }
      
      // Agora verificar funções com dois parâmetros
      let twoParamsMatch;
      while ((twoParamsMatch = twoParamsPattern.exec(content)) !== null) {
        const fullMatch = twoParamsMatch[0];
        const requestParam = twoParamsMatch[1].trim();
        const contextParam = twoParamsMatch[2].trim();
        
        // Verificar se o parâmetro de contexto precisa ser corrigido
        if (contextParam.includes('context:') || contextParam.includes('{ params }:')) {
          // Construir o objeto de parâmetros
          let paramsObject;
          if (hasParams) {
            paramsObject = paramNames.map(name => `${name}: string`).join(', ');
          } else {
            paramsObject = '';
          }
          
          // Criar a nova assinatura da função
          const newSignature = `export async function ${method}(
  ${requestParam},
  { params }: { params: Promise<{ ${paramsObject} }> }
) {`;
          
          content = content.replace(fullMatch, newSignature);
          updated = true;
          console.log(`Corrigida tipagem de parâmetros em função ${method} em: ${filePath}`);
        }
      }
    }
    
    // 3. Atualizar o acesso aos parâmetros no corpo da função
    if (updated && hasParams) {
      // Padrão para encontrar acesso direto a context.params
      const contextParamsPattern = /const\s+\{([^}]*)\}\s*=\s*context\.params/g;
      let contextMatch;
      
      while ((contextMatch = contextParamsPattern.exec(content)) !== null) {
        const fullMatch = contextMatch[0];
        const paramsList = contextMatch[1].trim();
        
        // Criar a nova forma de acessar os parâmetros
        const newAccess = `const resolvedParams = await params;
  const {${paramsList}} = resolvedParams`;
        
        content = content.replace(fullMatch, newAccess);
        console.log(`Atualizado acesso a parâmetros em: ${filePath}`);
      }
      
      // Padrão para encontrar acesso direto a params.X
      for (const paramName of paramNames) {
        const directAccessPattern = new RegExp(`(const|let|var)\\s+${paramName}\\s*=\\s*params\\.${paramName}`, 'g');
        if (directAccessPattern.test(content)) {
          const newAccess = `$1 resolvedParams = await params;
  $1 ${paramName} = resolvedParams.${paramName}`;
          content = content.replace(directAccessPattern, newAccess);
          console.log(`Atualizado acesso direto a params.${paramName} em: ${filePath}`);
        }
        
        // Substituir outras referências a context.params.X
        const contextParamPattern = new RegExp(`context\\.params\\.${paramName}\\b`, 'g');
        if (contextParamPattern.test(content)) {
          // Verificar se já temos a variável resolvedParams
          if (!content.includes('const resolvedParams = await params')) {
            // Adicionar a linha para resolver os parâmetros após a declaração da função
            const functionStartPattern = /\) {(\s*try {)?/;
            content = content.replace(functionStartPattern, ') {$1\n  const resolvedParams = await params;');
          }
          content = content.replace(contextParamPattern, `resolvedParams.${paramName}`);
          console.log(`Substituídas referências a context.params.${paramName} em: ${filePath}`);
        }
      }
    }
    
    if (updated) {
      await writeFile(filePath, content, 'utf8');
      console.log(`Arquivo atualizado: ${filePath}`);
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
    console.log('Iniciando correção de tipagem de parâmetros de rota para Next.js 15.3.1...');
    console.log(`Diretório raiz: ${rootDir}`);
    console.log(`Diretório de API: ${apiDir}`);

    // Obter todos os arquivos TypeScript no diretório de API
    const files = await walkDir(apiDir);
    console.log(`Encontrados ${files.length} arquivos de rota para verificar.`);

    // Corrigir a tipagem dos parâmetros em cada arquivo
    let fixedCount = 0;
    for (const file of files) {
      const fixed = await fixRouteParamsTyping(file);
      if (fixed) {
        fixedCount++;
      }
    }

    console.log(`Concluído! ${fixedCount} arquivos foram corrigidos.`);
    
    console.log('\nRecomendações finais:');
    console.log('1. Limpe o cache do Next.js removendo a pasta .next');
    console.log('2. Tente o build novamente com "npm run build"');
    console.log('3. Verifique se não há mais erros de tipagem');
  } catch (error) {
    console.error('Erro:', error);
  }
}

main();
