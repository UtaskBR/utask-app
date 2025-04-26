// Script para corrigir erros de sintaxe em condicionais if
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

// Padrão para identificar condicionais if com parênteses ausentes
const conditionalErrorPattern = /if\s*\([^)]*?(?:&&|\|\|)[^)]*?\s*\{/g;

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

// Função para corrigir erros de sintaxe em condicionais if
async function fixConditionalSyntax(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    let updated = false;
    let newContent = content;
    
    // Encontrar todas as ocorrências do padrão
    const matches = newContent.match(conditionalErrorPattern);
    
    if (!matches) {
      return false;
    }
    
    // Para cada ocorrência, verificar se falta um parêntese
    for (const match of matches) {
      // Contar parênteses de abertura e fechamento
      const openCount = (match.match(/\(/g) || []).length;
      const closeCount = (match.match(/\)/g) || []).length;
      
      // Se houver mais parênteses de abertura do que de fechamento
      if (openCount > closeCount) {
        // Criar a versão corrigida com o parêntese adicional
        const corrected = match.replace('{', ') {');
        newContent = newContent.replace(match, corrected);
        updated = true;
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
      if (error.pattern.test(newContent)) {
        newContent = newContent.replace(error.pattern, error.replacement);
        updated = true;
      }
    }
    
    if (updated) {
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
    console.log('Iniciando correção de erros de sintaxe em condicionais if...');
    console.log(`Diretório raiz: ${rootDir}`);
    console.log(`Diretório de API: ${apiDir}`);

    // Obter todos os arquivos TypeScript no diretório de API
    const files = await walkDir(apiDir);
    console.log(`Encontrados ${files.length} arquivos TypeScript para verificar.`);

    // Corrigir erros de sintaxe em cada arquivo
    let fixedCount = 0;
    for (const file of files) {
      const fixed = await fixConditionalSyntax(file);
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
