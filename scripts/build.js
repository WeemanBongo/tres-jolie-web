const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const partialsDir = path.join(root, 'src', 'partials');
const checkOnly = process.argv.includes('--check');

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

function withGeneratedNotice(html, srcRelPath) {
  const notice = `<!-- AUTO-GENERATED FILE – NICHT DIREKT BEARBEITEN. Quelle: ${srcRelPath} (siehe scripts/build.js) -->`;
  return html.replace(/^(<!DOCTYPE[^>]*>)/i, `$1\n${notice}`);
}

let outOfSync = false;

for (const page of pages) {
  const raw = fs.readFileSync(page.src, 'utf8');
  const srcRelPath = path.relative(root, page.src).split(path.sep).join('/');
  const output = withGeneratedNotice(resolveIncludes(raw), srcRelPath);

  if (checkOnly) {
    const current = fs.existsSync(page.out) ? fs.readFileSync(page.out, 'utf8') : null;
    if (current !== output) {
      console.error(`Veraltet: ${path.relative(root, page.out)} stimmt nicht mit ${path.relative(root, page.src)} überein. Bitte "npm run build" ausführen und committen.`);
      outOfSync = true;
    }
    continue;
  }

  fs.mkdirSync(path.dirname(page.out), { recursive: true });
  fs.writeFileSync(page.out, output, 'utf8');
  console.log(`Gebaut: ${path.relative(root, page.out)}`);
}

if (checkOnly && outOfSync) {
  process.exit(1);
}
