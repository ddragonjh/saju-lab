const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dirs = ['src', path.join('..', 'shared')].map((dir) => path.resolve(root, dir));
const blocked = [/dangerouslySetInnerHTML/, /document\.write/, /eval\s*\(/, /console\.(log|debug|info)\s*\(/];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx|js|jsx|css|html)$/.test(entry.name) ? [full] : [];
  });
}

const failures = [];
for (const file of dirs.flatMap(walk)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of blocked) {
    if (pattern.test(text)) failures.push(`${path.relative(root, file)}: ${pattern}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('static checks passed');
