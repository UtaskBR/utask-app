// Script para atualizar importações do authOptions em todos os arquivos de API
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

// Padrões de importação a serem substituídos
const importPatterns = [
  // Padrão absoluto com @
  /import\s+\{\s*authOptions\s*\}\s*from\s+['"]@\/api\/auth\/\[\.\.\.\s*nextauth\]\/route['"]/g,
  // Padrão relativo com ../
  /import\s+\{\s*authOptions\s*\}\s*from\s+['"]\.\.\/\.\.\/auth\/\[\.\.\.\s*nextauth\]\/route['"]/g,
  /import\s+\{\s*authOptions\s*\}\s*from\s+['"]\.\.\/\.\.\/\.\.\/auth\/\[\.\.\.\s*nextauth\]\/route['"]/g,
  /import\s+\{\s*authOptions\s*\}\s*from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/auth\/\[\.\.\.\s*nextauth\]\/route['"]/g,
  // Padrão relativo com ../
  /import\s+\{\s*authOptions\s*\}\s*from\s+['"]\.\.\/auth\/\[\.\.\.\s*nextauth\]\/route['"]/g,
  // Outros padrões que possam existir
  /import\s+\{\s*authOptions\s*\}\s*from\s+['"]\.\.\/(\.\.\/)*auth\/\[\.\.\.\s*nextauth\]\/route['"]/g,
];

// Nova importação
const newImport = 'import { authOptions } from "@/app/lib/auth"';

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

// Função para atualizar as importações em um arquivo
async function updateImports(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    let updated = false;
    let newContent = content;

    for (const pattern of importPatterns) {
      if (pattern.test(newContent)) {
        newContent = newContent.replace(pattern, newImport);
        updated = true;
      }
    }

    if (updated) {
      await writeFile(filePath, newContent, 'utf8');
      console.log(`Atualizado: ${filePath}`);
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
    console.log('Iniciando atualização de importações...');
    console.log(`Diretório raiz: ${rootDir}`);
    console.log(`Diretório de API: ${apiDir}`);

    // Obter todos os arquivos TypeScript no diretório de API
    const files = await walkDir(apiDir);
    console.log(`Encontrados ${files.length} arquivos TypeScript para verificar.`);

    // Atualizar importações em cada arquivo
    let updatedCount = 0;
    for (const file of files) {
      const updated = await updateImports(file);
      if (updated) {
        updatedCount++;
      }
    }

    console.log(`Concluído! ${updatedCount} arquivos foram atualizados.`);
  } catch (error) {
    console.error('Erro:', error);
  }
}

main();
