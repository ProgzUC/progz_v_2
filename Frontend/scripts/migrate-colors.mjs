import fs from 'fs';
import path from 'path';

const replacements = [
  [/\bwhite\b(?=\s*[;,)!])/gi, 'var(--color-surface)'],
  [/\bcolor:\s*white\b/gi, 'color: var(--color-text-on-primary)'],
  [/#fff\b/gi, 'var(--color-surface)'],
  [/#0d9f6e/gi, 'var(--color-primary-hover)'],
  [/#ff2b88/gi, 'var(--color-error)'],
  [/#ffe7f1/gi, 'var(--color-error-bg)'],
  [/font-family:\s*["']Inter["']/gi, 'font-family: var(--font-family-base)'],
  [/font-family:\s*["']Poppins["']/gi, 'font-family: var(--font-family-base)'],
  [/box-shadow:\s*0 4px 15px rgba\(0,\s*0,\s*0,\s*0\.1\)/gi, 'box-shadow: var(--shadow-sm)'],
  [/box-shadow:\s*0 4px 12px rgba\(0,\s*0,\s*0,\s*0\.08\)/gi, 'box-shadow: var(--shadow-sm)'],
  [/box-shadow:\s*0 10px 30px rgba\(0,\s*0,\s*0,\s*0\.12\)/gi, 'box-shadow: var(--shadow-md)'],
  [/border-radius:\s*10px/gi, 'border-radius: var(--radius-md)'],
  [/border-radius:\s*20px/gi, 'border-radius: var(--radius-lg)'],
  [/border-radius:\s*16px/gi, 'border-radius: var(--radius-lg)'],
  [/border-radius:\s*8px/gi, 'border-radius: var(--radius-sm)'],
];

function walkDir(dir, callback) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) {
      if (f !== 'node_modules') walkDir(fp, callback);
    } else if (f.endsWith('.css') && !fp.replace(/\\/g, '/').includes('styles/theme.css') && !fp.replace(/\\/g, '/').includes('styles/components.css')) {
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
