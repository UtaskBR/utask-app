// Este script automatiza a correção de tipagem para o Next.js 15.3.1
// Ele preserva todas as funcionalidades, incluindo o sistema de rating

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Função para encontrar todos os arquivos de rota
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts' || file === 'route.tsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Função para corrigir a tipagem dos parâmetros de rota
function fixRouteParamsTyping(filePath) {
  console.log(`Processando: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Verificar se o arquivo contém funções de rota (GET, POST, etc.)
  const routeMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  let hasRouteMethod = false;
  
  for (const method of routeMethods) {
    if (content.includes(`export async function ${method}`)) {
      hasRouteMethod = true;
      break;
    }
  }
  
  if (!hasRouteMethod) {
    console.log(`  Pulando: Não é um arquivo de rota API`);
    return false;
  }
  
  // Determinar se é uma rota dinâmica
  const isDynamicRoute = filePath.includes('[') && filePath.includes(']');
  
  // Padrão para encontrar funções de rota com parâmetros
  for (const method of routeMethods) {
    // Caso 1: Função com dois parâmetros, segundo com tipagem incorreta
    const pattern1 = new RegExp(`export async function ${method}\\s*\\(\\s*request\\s*:\\s*NextRequest\\s*,\\s*\\{\\s*params\\s*\\}\\s*:\\s*\\{\\s*params\\s*:\\s*(?!Promise<)[^\\}]+\\}\\s*\\)`, 'g');
    
    if (pattern1.test(content)) {
      if (isDynamicRoute) {
        // Para rotas dinâmicas, use Promise<{ paramName: string }>
        // Extrair os nomes dos parâmetros do caminho
        const routeSegments = filePath.split(path.sep);
        const paramNames = [];
        
        for (const segment of routeSegments) {
          if (segment.startsWith('[') && segment.endsWith(']')) {
            const paramName = segment.substring(1, segment.length - 1);
            if (paramName !== '...') { // Ignorar [...nextauth]
              paramNames.push(paramName);
            }
          }
        }
        
        let paramTyping = '';
        if (paramNames.length > 0) {
          paramTyping = `{ ${paramNames.map(name => `${name}: string`).join(', ')} }`;
        } else {
          paramTyping = '{}';
        }
        
        content = content.replace(pattern1, (match) => {
          return match.replace(/\{\s*params\s*:\s*(?!Promise<)[^}]+\}/, `{ params: Promise<${paramTyping}> }`);
        });
        
        // Adicionar resolução de Promise
        const functionBodyPattern = new RegExp(`export async function ${method}\\s*\\([^\\)]+\\)\\s*\\{([\\s\\S]*?)\\}\\s*(?:export|$)`, 'g');
        content = content.replace(functionBodyPattern, (match, body) => {
          if (!body.includes('const resolvedParams = await params')) {
            // Adicionar resolução de Promise no início do corpo da função
            const newBody = body.replace(/(\s*try\s*\{|\s*const)/, (m, g1) => {
              return `\n  const resolvedParams = await params;${g1}`;
            });
            
            // Substituir referências a params.X por resolvedParams.X
            let updatedBody = newBody;
            for (const paramName of paramNames) {
              const paramAccessPattern = new RegExp(`params\\.${paramName}`, 'g');
              updatedBody = updatedBody.replace(paramAccessPattern, `resolvedParams.${paramName}`);
            }
            
            return `export async function ${method}\\s*\\([^\\)]+\\) {${updatedBody}}`;
          }
          return match;
        });
      } else {
        // Para rotas não dinâmicas, use Promise<{}>
        content = content.replace(pattern1, (match) => {
          return match.replace(/\{\s*params\s*:\s*(?!Promise<)[^}]+\}/, `{ params: Promise<{}> }`);
        });
      }
      
      modified = true;
    }
    
    // Caso 2: Função com apenas um parâmetro (request)
    const pattern2 = new RegExp(`export async function ${method}\\s*\\(\\s*request\\s*:\\s*NextRequest\\s*\\)`, 'g');
    
    if (pattern2.test(content)) {
      // Adicionar o segundo parâmetro
      content = content.replace(pattern2, `export async function ${method}(request: NextRequest, { params }: { params: Promise<{}> })`);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Corrigido: ${filePath}`);
    return true;
  } else {
    console.log(`  Sem alterações necessárias: ${filePath}`);
    return false;
  }
}

// Função principal
function main() {
  const args = process.argv.slice(2);
  const rootDir = args[0] || '.';
  
  console.log(`Buscando arquivos de rota em: ${rootDir}`);
  const apiDir = path.join(rootDir, 'app', 'api');
  
  if (!fs.existsSync(apiDir)) {
    console.error(`Diretório API não encontrado: ${apiDir}`);
    return;
  }
  
  const routeFiles = findRouteFiles(apiDir);
  console.log(`Encontrados ${routeFiles.length} arquivos de rota`);
  
  let fixedCount = 0;
  
  routeFiles.forEach(file => {
    if (fixRouteParamsTyping(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\nResumo:`);
  console.log(`Total de arquivos processados: ${routeFiles.length}`);
  console.log(`Arquivos corrigidos: ${fixedCount}`);
  
  if (fixedCount > 0) {
    console.log(`\nAs correções foram aplicadas com sucesso!`);
    console.log(`Agora você pode executar 'npm run build' para verificar se os erros foram resolvidos.`);
  } else {
    console.log(`\nNenhuma correção foi necessária.`);
  }
}

main();
