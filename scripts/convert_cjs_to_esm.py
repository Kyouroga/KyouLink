from pathlib import Path
import re

root = Path('src')
js_files = list(root.rglob('*.js'))

re_export_default = re.compile(r"module\.exports\s*=\s*([^\s;]+)\s*;", re.MULTILINE)
re_export_obj = re.compile(r"module\.exports\s*=\s*\{([\s\S]*?)\};", re.MULTILINE)
re_require = re.compile(r"const\s+([A-Za-z0-9_$]+)\s*=\s*require\((['\"])(.+?)\2\);")
re_require_destruct = re.compile(r"const\s+\{\s*([^}]+?)\s*\}\s*=\s*require\((['\"])(.+?)\2\);")

for path in js_files:
    text = path.read_text(encoding='utf-8')
    original = text

    imports = []
    lines = text.splitlines()
    new_lines = []
    for line in lines:
        m = re_require_destruct.match(line)
        if m:
            group, quote, mod = m.groups()
            imports.append(f"import {{ {group} }} from '{mod}.js';")
            continue
        m = re_require.match(line)
        if m:
            name, quote, mod = m.groups()
            if name == 'require':
                new_lines.append(line)
                continue
            imports.append(f"import {name} from '{mod}.js';")
            continue
        new_lines.append(line)

    text = '\n'.join(new_lines)

    if imports:
        # Remove all require lines from original text and prepend imports
        text = text
        for line in lines:
            if re_require_destruct.match(line) or re_require.match(line):
                if re_require.match(line) and re_require.match(line).group(1) == 'require':
                    continue
                text = text.replace(line + '\n', '')
        text = '\n'.join(imports) + '\n\n' + text

    # replace module.exports patterns
    m = re_export_obj.search(text)
    if m:
        body = m.group(1).strip()
        # preserve as export { ... };
        names = [item.split(':')[0].strip() for item in body.split(',') if item.strip()]
        text = re_export_obj.sub(f"export {{ {', '.join(names)} }};", text)
    else:
        m = re_export_default.search(text)
        if m:
            exported = m.group(1).strip()
            text = re_export_default.sub(f"export default {exported};", text)

    # remove any extra semicolon if export object substitution left it
    if text.endswith('export { ;'):
        text = text.replace('export { ;', 'export { };')

    if text != original:
        path.write_text(text, encoding='utf-8')
        print(f'Updated {path}')
