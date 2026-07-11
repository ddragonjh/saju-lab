const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const distWeb = path.join(root, 'dist', 'web');
if (!fs.existsSync(distWeb)) {
  console.error('dist folder not found. Run npm run build first.');
  process.exit(1);
}

const sourceForbidden = [
  /premium/i,
  /premium-hashes/i,
  /purchase/i,
  /payment/i,
  /checkout/i,
  /tossPay/i,
  /in-app purchase/i,
  /광고/,
  /가격/,
  /구매/,
  /결제/,
  /이용권/,
  /구매하기/,
  /결제하기/,
  /계좌이체/,
  /후원하기/,
  /구독/,
  /프리미엄/,
  /유료 결과/,
];

const userFacingForbidden = [
  /premium/i,
  /premium-hashes/i,
  /광고/,
  /가격/,
  /구매/,
  /결제/,
  /이용권/,
  /구매하기/,
  /결제하기/,
  /계좌이체/,
  /후원하기/,
  /구독/,
  /프리미엄/,
  /유료 결과/,
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(html|js|css|json)$/.test(entry.name) ? [full] : [];
  });
}

const failures = [];
const sourceRoots = [path.join(root, 'src'), path.resolve(root, '..', 'shared')];
for (const file of sourceRoots.flatMap((dir) => (fs.existsSync(dir) ? walk(dir) : []))) {
  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of sourceForbidden) {
    if (pattern.test(text)) failures.push(`${path.relative(root, file)}: ${pattern}`);
  }
}

for (const file of walk(distWeb)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of userFacingForbidden) {
    if (pattern.test(text)) failures.push(`${path.relative(root, file)}: ${pattern}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('free-only checks passed');
