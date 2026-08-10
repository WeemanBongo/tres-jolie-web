const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const partialsDir = path.join(root, 'src', 'partials');

const pages = [
  { src: path.join(root, 'src', 'pages', 'index.html'), out: path.join(root, 'index.html') },
  { src: path.join(root, 'src', 'pages', 'preise.html'), out: path.join(root, 'preise', 'index.html') },
];

function resolveIncludes(content) {
  return content.replace(/\{\{INCLUDE:([\w-]+)\}\}/g, (match, name) => {
    const partialPath = path.join(partialsDir, `_${name}.html`);
    if (!fs.existsSync(partialPath)) {
      throw new Error(`Partial nicht gefunden: ${partialPath} (referenziert als {{INCLUDE:${name}}})`);
    }
    return fs.readFileSync(partialPath, 'utf8').replace(/\n$/, '');
  });
}

for (const page of pages) {
  const raw = fs.readFileSync(page.src, 'utf8');
  const output = resolveIncludes(raw);
  fs.mkdirSync(path.dirname(page.out), { recursive: true });
  fs.writeFileSync(page.out, output, 'utf8');
  console.log(`Gebaut: ${path.relative(root, page.out)}`);
}
