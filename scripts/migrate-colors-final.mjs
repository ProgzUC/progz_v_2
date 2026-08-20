import fs from 'fs';
import path from 'path';

const replacements = [
  [/\b#333\b/g, 'var(--color-text)'],
  [/\b#555\b/g, 'var(--color-text-secondary)'],
  [/#15613b/gi, 'var(--color-primary-hover)'],
  [/#157347/gi, 'var(--color-primary-hover)'],
  [/#166e35/gi, 'var(--color-primary-hover)'],
  [/#1E8F45/gi, 'var(--color-primary)'],
  [/#1a6b28/gi, 'var(--color-primary-hover)'],
  [/#10a358/gi, 'var(--color-primary-bright)'],
  [/var\(--color-border-strong\)/g, 'var(--color-border)'],
];

function walkDir(dir, callback) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) {
      if (f !== 'node_modules') walkDir(fp, callback);
    } else if (f.endsWith('.css') && !fp.replace(/\\/g, '/').includes('styles/theme.css')) {
      callback(fp);
    }
  }
}

let count = 0;
walkDir('src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
    console.log('Updated:', filePath);
  }
});
console.log('Total files updated:', count);
