// Script abrangente para verificar e corrigir problemas de compatibilidade com o Next.js 15
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
    } else if (isTypeScriptFile(file)) {
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

// Função para corrigir problemas de compatibilidade em um arquivo
async function fixCompatibilityIssues(filePath) {
  try {
    let content = await readFile(filePath, 'utf8');
    let updated = false;
    
    // 1. Corrigir importações do authOptions
    const incorrectImportPattern = /import\s+\{\s*authOptions\s*\}\s*from\s+['"]@\/app\/lib\/auth['"]/g;
    const correctImport = 'import { authOptions } from "@/lib/auth"';
    
    if (incorrectImportPattern.test(content)) {
      content = content.replace(incorrectImportPattern, correctImport);
      updated = true;
      console.log(`Corrigida importação do authOptions em: ${filePath}`);
    }
    
    // 2. Corrigir erros de sintaxe em condicionais if
    const conditionalErrorPattern = /if\s*\([^)]*?(?:&&|\|\|)[^)]*?\s*\{/g;
    const matches = content.match(conditionalErrorPattern);
    
    if (matches) {
      for (const match of matches) {
        // Contar parênteses de abertura e fechamento
        const openCount = (match.match(/\(/g) || []).length;
        const closeCount = (match.match(/\)/g) || []).length;
        
        // Se houver mais parênteses de abertura do que de fechamento
        if (openCount > closeCount) {
          // Criar a versão corrigida com o parêntese adicional
          const corrected = match.replace('{', ') {');
          content = content.replace(match, corrected);
          updated = true;
          console.log(`Corrigido erro de sintaxe em condicional if em: ${filePath}`);
        }
      }
    }
    
    // Verificar casos específicos conhecidos
    const specificErrors = [
      {
        pattern: /if\s*\(user\.image && user\.image\.includes\("res\.cloudinary\.com"\)\s*\{/g,
        replacement: 'if (user.image && user.image.includes("res.cloudinary.com")) {'
      },
      {
        pattern: /if\s*\(!professionIds \|\| !Array\.isArray\(professionIds\)\s*\{/g,
        replacement: 'if (!professionIds || !Array.isArray(professionIds)) {'
      }
    ];
    
    for (const error of specificErrors) {
      if (error.pattern.test(content)) {
        content = content.replace(error.pattern, error.replacement);
        updated = true;
        console.log(`Corrigido erro específico em: ${filePath}`);
      }
    }
    
    // 3. Corrigir tipagem dos parâmetros de rota
    if (filePath.includes('route.ts')) {
      const paramNames = extractParamNames(filePath);
      
      if (paramNames.length > 0) {
        // Verificar se o arquivo contém funções de rota
        const routeHandlerPattern = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(\s*([^,)]+)\s*,\s*([^)]+)\)\s*\{/g;
        let match;
        
        // Resetar o índice do regex para começar do início
        routeHandlerPattern.lastIndex = 0;
        
        // Armazenar todas as correspondências para processamento posterior
        const matches = [];
        while ((match = routeHandlerPattern.exec(content)) !== null) {
          matches.push({
            fullMatch: match[0],
            method: match[1],
            requestParam: match[2],
            contextParam: match[3]
          });
        }
        
        // Processar cada correspondência
        for (const match of matches) {
          // Verificar se a tipagem atual não é a correta
          if (match.contextParam.includes('RouteParams') || 
              match.contextParam.includes('{ params }') ||
              !match.contextParam.includes('context:')) {
            
            // Construir o objeto de parâmetros
            const paramsObject = paramNames.map(name => `${name}: string`).join(', ');
            
            // Criar a nova assinatura da função
            const newSignature = `export async function ${match.method}(
  ${match.requestParam},
  context: { params: { ${paramsObject} } }
) {`;
            
            content = content.replace(match.fullMatch, newSignature);
            updated = true;
            console.log(`Corrigida tipagem de parâmetros em função ${match.method} em: ${filePath}`);
          }
        }
        
        // Remover a definição do tipo RouteParams se existir
        const routeParamsTypePattern = /type\s+RouteParams\s*=\s*\{\s*params\s*:\s*\{[^}]*\}\s*\}\s*;?/g;
        if (routeParamsTypePattern.test(content)) {
          content = content.replace(routeParamsTypePattern, '');
          updated = true;
          console.log(`Removida definição de tipo RouteParams em: ${filePath}`);
        }
      }
    }
    
    // 4. Corrigir erros de sintaxe com parênteses extras
    const syntaxErrorPattern = /\)\s*\)\s*\{/g;
    const correctedPattern = ') {';
    
    if (syntaxErrorPattern.test(content)) {
      content = content.replace(syntaxErrorPattern, correctedPattern);
      updated = true;
      console.log(`Corrigido erro de sintaxe com parênteses extras em: ${filePath}`);
    }
    
    // 5. Verificar e corrigir o arquivo de rota do NextAuth
    if (filePath.includes('[...nextauth]/route.ts')) {
      // Verificar se o arquivo exporta authOptions
      if (content.includes('export const authOptions')) {
        // Criar a versão corrigida
        const correctedContent = `import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };`;
        
        content = correctedContent;
        updated = true;
        console.log(`Corrigido arquivo de rota do NextAuth em: ${filePath}`);
      }
    }
    
    if (updated) {
      await writeFile(filePath, content, 'utf8');
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
    console.log('Iniciando verificação abrangente de compatibilidade com o Next.js 15...');
    console.log(`Diretório raiz: ${rootDir}`);
    console.log(`Diretório de API: ${apiDir}`);

    // Obter todos os arquivos TypeScript no diretório de API
    const files = await walkDir(apiDir);
    console.log(`Encontrados ${files.length} arquivos TypeScript para verificar.`);

    // Corrigir problemas de compatibilidade em cada arquivo
    let fixedCount = 0;
    for (const file of files) {
      const fixed = await fixCompatibilityIssues(file);
      if (fixed) {
        fixedCount++;
      }
    }

    console.log(`Concluído! ${fixedCount} arquivos foram corrigidos.`);
    
    // Verificar se o arquivo auth.ts existe em /app/lib/
    const authLibPath = path.join(rootDir, 'app/lib/auth.ts');
    try {
      await fs.promises.access(authLibPath);
      console.log(`Arquivo auth.ts encontrado em ${authLibPath}`);
    } catch (error) {
      console.log(`Arquivo auth.ts não encontrado em ${authLibPath}. Verifique se ele existe e está no local correto.`);
    }
    
    console.log('\nVerificação concluída. Recomendações finais:');
    console.log('1. Verifique se o arquivo auth.ts está em /app/lib/');
    console.log('2. Verifique se o arquivo route.ts está em /app/api/auth/[...nextauth]/');
    console.log('3. Limpe o cache do Next.js removendo a pasta .next');
    console.log('4. Tente o build novamente com "npm run build"');
  } catch (error) {
    console.error('Erro:', error);
  }
}

main();
