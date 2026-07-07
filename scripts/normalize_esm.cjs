const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

function addJsExtension(modulePath) {
  if (!modulePath.startsWith('.') || modulePath.endsWith('.js')) {
    return modulePath;
  }
  return `${modulePath}.js`;
}

function normalizeImports(content) {
  content = content.replace(/const\s+\{\s*([^}]+?)\s*\}\s*=\s*require\s*\(\s*(['"])([\s\S]+?)\2\s*\)\s*;?/g, (_, names, quote, mod) => {
    return `import { ${names.trim()} } from '${addJsExtension(mod.trim())}';`;
  });

  content = content.replace(/const\s+([A-Za-z0-9_$]+)\s*=\s*require\s*\(\s*(['"])([\s\S]+?)\2\s*\)\s*;?/g, (_, name, quote, mod) => {
    if (mod.trim() === 'dotenv/config') {
      return `import 'dotenv/config';`;
    }
    return `import ${name} from '${addJsExtension(mod.trim())}';`;
  });

  content = content.replace(/import\s+([^\s]+)\s+from\s+['"](.+?)['"];/g, (_, spec, mod) => {
    return `import ${spec} from '${addJsExtension(mod)}';`;
  });
  content = content.replace(/import\s+\{\s*([^}]+?)\s*\}\s+from\s+['"](.+?)['"];/g, (_, names, mod) => {
    return `import { ${names.trim()} } from '${addJsExtension(mod)}';`;
  });

  return content;
}

function normalizeExports(content) {
  content = content.replace(/module\.exports\s*=\s*\{([\s\S]*?)\};?/g, (_, body) => {
    const exports = body
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .map(item => {
        const [key, value] = item.split(':').map(s => s.trim());
        if (!value || value === key) return key;
        return `${value} as ${key}`;
      })
      .join(', ');
    return `export { ${exports} };`;
  });

  content = content.replace(/module\.exports\s*=\s*async\s*\(/g, 'export default async (');
  content = content.replace(/module\.exports\s*=\s*function\s*([A-Za-z0-9_$]*)\s*\(/g, (_, name) => {
    return name ? `export default function ${name}(` : 'export default function(';
  });
  content = content.replace(/module\.exports\s*=\s*([A-Za-z0-9_$]+)\s*=>/g, 'export default $1 =>');
  content = content.replace(/module\.exports\s*=\s*([A-Za-z0-9_$]+);/g, 'export default $1;');

  content = content.replace(/export default\s+([A-Za-z0-9_$]+)\s*=>\s*\{;/g, 'export default $1 => {');
  content = content.replace(/export default async\s+([A-Za-z0-9_$]+)\s*=>\s*\{;/g, 'export default async $1 => {');
  content = content.replace(/export default async\s*\(;\s*([\s\S]*?)\)\s*=>/g, 'export default async ($1) =>');
  content = content.replace(/export default\s*\(;\s*([\s\S]*?)\)\s*=>/g, 'export default ($1) =>');
  content = content.replace(/export default async\s*\(\s*;\s*/g, 'export default async (');
  content = content.replace(/export default\s*\(\s*;\s*/g, 'export default (');

  return content;
}

function normalizeMisc(content) {
  content = content.replace(/\bBuffer\.from\(/g, 'new Uint8Array(');
  content = content.replace(/\.toString\(\s*['"]utf8['"]\s*\)/g, 'new TextDecoder().decode');
  content = content.replace(/export default async payload => \{;/g, 'export default async payload => {');
  content = content.replace(/export default payload => \{;/g, 'export default payload => {');
  content = content.replace(/export default async \(;\s*([\s\S]*?)\)\s*=>/g, 'export default async ($1) =>');
  content = content.replace(/export default \(;\s*([\s\S]*?)\)\s*=>/g, 'export default ($1) =>');
  return content;
}

const src = path.join(__dirname, '..', 'src');
for (const file of walk(src)) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = normalizeImports(content);
  content = normalizeExports(content);
  content = normalizeMisc(content);
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Normalized ${path.relative(process.cwd(), file)}`);
  }
}
