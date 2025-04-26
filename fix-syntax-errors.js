// Script para corrigir erros de sintaxe nas rotas de API
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

// Padrão para identificar o erro de sintaxe (parêntese extra)
const syntaxErrorPattern = /\)\s*\)\s*\{/g;
const correctedPattern = ') {';

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

// Função para corrigir erros de sintaxe em um arquivo
async function fixSyntaxErrors(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Verificar se o arquivo contém o erro de sintaxe
    if (!syntaxErrorPattern.test(content)) {
      return false;
    }
    
    // Corrigir o erro de sintaxe
    const newContent = content.replace(syntaxErrorPattern, correctedPattern);
    
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
    console.log('Iniciando correção de erros de sintaxe nas rotas...');
    console.log(`Diretório raiz: ${rootDir}`);
    console.log(`Diretório de API: ${apiDir}`);

    // Obter todos os arquivos de rota no diretório de API
    const files = await walkDir(apiDir);
    console.log(`Encontrados ${files.length} arquivos de rota para verificar.`);

    // Corrigir erros de sintaxe em cada arquivo
    let fixedCount = 0;
    for (const file of files) {
      const fixed = await fixSyntaxErrors(file);
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
