const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.isFile() && full.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

function fixImportPath(modulePath) {
  if (modulePath.startsWith('.') && !modulePath.endsWith('.js')) {
    return `${modulePath}.js`;
  }
  return modulePath;
}

function processFile(file) {
  const original = fs.readFileSync(file, 'utf8');
  let content = original;

  const lines = content.split(/\r?\n/);
  const fixedLines = [];
  let modified = false;

  for (let line of lines) {
    let trimmed = line.trim();
    const destruct = trimmed.match(/^const\s+\{\s*([^}]+?)\s*\}\s*=\s*require\((['"])(.+?)\2\);?$/);
    const simple = trimmed.match(/^const\s+([A-Za-z0-9_$]+)\s*=\s*require\((['"])(.+?)\2\);?$/);
    const defaultImport = trimmed.match(/^const\s+([A-Za-z0-9_$]+)\s*=\s*require\((['"])(.+?)\2\);?$/);
    const moduleExportObj = trimmed.match(/^module\.exports\s*=\s*\{([\s\S]*)\};?$/);
    const moduleExportDefault = trimmed.match(/^module\.exports\s*=\s*([A-Za-z0-9_$]+);?$/);
    const exportDefaultFunc = trimmed.match(/^module\.exports\s*=\s*async\s*\((.*)\)\s*=>$/);
    const exportDefaultArrow = trimmed.match(/^module\.exports\s*=\s*([A-Za-z0-9_$]+)\s*=>\s*$/);
    const exportDefaultFn = trimmed.match(/^module\.exports\s*=\s*function\s*([A-Za-z0-9_$]*)\s*\((.*)\)\s*\{?$/);

    if (destruct) {
      const [, names, , modulePath] = destruct;
      const fixedModule = fixImportPath(modulePath);
      fixedLines.push(`import { ${names} } from '${fixedModule}';`);
      modified = true;
      continue;
    }

    if (simple) {
      const [, name, , modulePath] = simple;
      const fixedModule = fixImportPath(modulePath);
      if (modulePath === 'dotenv/config') {
        fixedLines.push(`import 'dotenv/config';`);
      } else {
        fixedLines.push(`import ${name} from '${fixedModule}';`);
      }
      modified = true;
      continue;
    }

    if (exportDefaultFunc) {
      const [, args] = exportDefaultFunc;
      fixedLines.push(`export default async (${args}) =>`);
      modified = true;
      continue;
    }

    if (exportDefaultArrow) {
      const [, fnName] = exportDefaultArrow;
      fixedLines.push(`export default ${fnName} =>`);
      modified = true;
      continue;
    }

    if (exportDefaultFn) {
      const [, fnName, args] = exportDefaultFn;
      if (fnName) {
        fixedLines.push(`export default function ${fnName}(${args}) {`);
      } else {
        fixedLines.push(`export default function(${args}) {`);
      }
      modified = true;
      continue;
    }

    if (moduleExportObj) {
      const [, body] = moduleExportObj;
      const names = body.split(',').map(p => p.trim()).filter(Boolean).map(part => {
        const [key, value] = part.split(':').map(s => s.trim());
        if (!value || value === key) return key;
        return `${value} as ${key}`;
      });
      fixedLines.push(`export { ${names.join(', ')} };`);
      modified = true;
      continue;
    }

    if (moduleExportDefault && !trimmed.includes('module.exports = {')) {
      const [, val] = moduleExportDefault;
      fixedLines.push(`export default ${val};`);
      modified = true;
      continue;
    }

    fixedLines.push(line);
  }

  content = fixedLines.join('\n');
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${path.relative(process.cwd(), file)}`);
  }
}

const srcDir = path.join(process.cwd(), 'src');
for (const file of walk(srcDir)) {
  processFile(file);
}
