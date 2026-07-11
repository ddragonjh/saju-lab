const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourceRoots = [path.join(root, 'src'), path.resolve(root, '..', 'shared'), path.join(root, 'granite.config.ts'), path.join(root, 'index.html')];
const distRoots = [path.join(root, 'dist', 'web')];
const checks = [
  { name: 'iframe 없음', pattern: /<iframe/i, shouldMatch: false },
  { name: '실제 appLogin 호출 없음', pattern: /appLogin\s*\(/, shouldMatch: false },
  { name: '결제 SDK 없음', pattern: /tossPay|checkout|payment/i, shouldMatch: false },
  { name: '인앱 결제 없음', pattern: /in-app purchase|iap/i, shouldMatch: false },
  { name: '광고 SDK 없음', pattern: /admob|adsbygoogle|rewarded/i, shouldMatch: false },
];

function walk(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(html|js|css|ts|tsx|json)$/.test(entry.name) ? [full] : [];
  });
}

const sourceFiles = sourceRoots.flatMap(walk);
const distFiles = distRoots.flatMap(walk);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const distText = distFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const all = `${sourceText}\n${distText}`;
const failures = [];
for (const check of checks) {
  const matched = check.name === 'iframe 없음' ? check.pattern.test(all) : check.pattern.test(sourceText);
  if (matched !== check.shouldMatch) failures.push(check.name);
}

const required = [
  ['getAnonymousKey 오류 처리', /getAnonymousKey[\s\S]*catch/],
  ['Safe Area 적용', /safe-area-inset/],
  ['뒤로가기 처리', /backEvent/],
  ['앱인토스 설정', /defineConfig[\s\S]*appName/],
];

for (const [name, pattern] of required) {
  if (!pattern.test(all)) failures.push(String(name));
}

const bundle = path.join(root, 'dist-appintoss', 'unmyeong-lab-appintoss.zip');
if (!fs.existsSync(bundle)) failures.push('앱인토스 업로드용 ZIP 없음');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('appintoss checks passed');
