// Script para reverter caminhos de importação incorretos
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

// Padrão para identificar importações incorretas
const incorrectImportPattern = /import\s+\{\s*authOptions\s*\}\s*from\s+['"]@\/app\/lib\/auth['"]/g;
const correctImport = 'import { authOptions } from "@/lib/auth"';

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

// Função para reverter importações incorretas em um arquivo
async function revertImports(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Verificar se o arquivo contém o padrão incorreto
    if (!incorrectImportPattern.test(content)) {
      return false;
    }
    
    // Reverter para o caminho correto
    const newContent = content.replace(incorrectImportPattern, correctImport);
    
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
    console.log('Iniciando reversão de caminhos de importação incorretos...');
    console.log(`Diretório raiz: ${rootDir}`);
    console.log(`Diretório de API: ${apiDir}`);

    // Obter todos os arquivos TypeScript no diretório de API
    const files = await walkDir(apiDir);
    console.log(`Encontrados ${files.length} arquivos TypeScript para verificar.`);

    // Reverter importações em cada arquivo
    let fixedCount = 0;
    for (const file of files) {
      const fixed = await revertImports(file);
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
