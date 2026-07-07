const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src');
const files = [];

function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(fullPath);
        } else if (entry.isFile() && fullPath.endsWith('.js')) {
            files.push(fullPath);
        }
    }
}

walk(root);

function parseExportProperties(text) {
    const parts = text
        .split(',')
        .map(part => part.trim())
        .filter(Boolean);
    return parts
        .map(part => {
            const [key, value] = part.split(':').map(p => p.trim());
            if (!value || value === key) {
                return key;
            }
            return `${value} as ${key}`;
        })
        .join(', ');
}

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    const importLines = [];
    const lines = content.split(/\r?\n/);
    const newLines = [];

    for (const line of lines) {
        const trimmed = line.trim();
        const destruct = trimmed.match(/^const\s+\{\s*([^}]+?)\s*\}\s*=\s*require\((['"])(.+?)\2\);?$/);
        const simple = trimmed.match(/^const\s+([A-Za-z0-9_$]+)\s*=\s*require\((['"])(.+?)\2\);?$/);
        const dotenv = trimmed.match(/^require\((['"])dotenv\1\)\.config\(\);?$/);

        if (dotenv) {
            importLines.push('import "dotenv/config";');
            continue;
        }

        if (destruct) {
            const [, names, , modulePath] = destruct;
            const specifier = modulePath.startsWith('.') ? `${modulePath}.js` : modulePath;
            importLines.push(`import { ${names} } from '${specifier}';`);
            continue;
        }

        if (simple) {
            const [, name, , modulePath] = simple;
            const specifier = modulePath.startsWith('.') ? `${modulePath}.js` : modulePath;
            importLines.push(`import ${name} from '${specifier}';`);
            continue;
        }

        newLines.push(line);
    }

    content = newLines.join('\n');
    if (importLines.length) {
        content = importLines.join('\n') + '\n' + content;
    }

    const exportObj = content.match(/module\.exports\s*=\s*\{([\s\S]*?)\};?/m);
    if (exportObj) {
        const body = exportObj[1].trim();
        const exports = parseExportProperties(body);
        content = content.replace(/module\.exports\s*=\s*\{([\s\S]*?)\};?/m, `export { ${exports} };`);
    } else {
        const exportDefault = content.match(/module\.exports\s*=\s*([\s\S]+?);?\s*$/m);
        if (exportDefault) {
            const value = exportDefault[1].trim();
            if (!value.includes('module.exports')) {
                content = content.replace(/module\.exports\s*=\s*([\s\S]+?);?\s*$/m, `export default ${value};`);
            }
        }
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${path.relative(process.cwd(), file)}`);
    }
}
