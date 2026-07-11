const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dirs = [path.join(root, 'src'), path.resolve(root, '..', 'shared')];
const forbidden = [
  /innerHTML\s*=/,
  /dangerouslySetInnerHTML/,
  /console\.(log|debug|info)\s*\(/,
  /location\.search/,
  /URLSearchParams/,
  /[?&]birth(date)?=/i,
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx|js|jsx)$/.test(entry.name) ? [full] : [];
  });
}

const failures = [];
for (const file of dirs.flatMap(walk)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(text)) failures.push(`${path.relative(root, file)}: ${pattern}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('privacy checks passed');
