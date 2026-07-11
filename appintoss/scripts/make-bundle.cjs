const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const outDir = path.join(root, 'dist-appintoss');
const outFile = path.join(outDir, 'unmyeonglab-appintoss.zip');

if (!fs.existsSync(dist)) {
  console.error('dist folder not found. Run npm run build first.');
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const manifest = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else manifest.push(path.relative(dist, full).replace(/\\/g, '/'));
  }
}
walk(dist);

const manifestFile = path.join(outDir, 'manifest.json');
fs.writeFileSync(
  manifestFile,
  JSON.stringify(
    {
      appName: 'unmyeonglab',
      createdAt: new Date().toISOString(),
      files: manifest,
    },
    null,
    2,
  ),
);

const command = [
  '$ErrorActionPreference = "Stop";',
  `$dist = ${JSON.stringify(dist)};`,
  `$out = ${JSON.stringify(outFile)};`,
  '$items = Get-ChildItem -LiteralPath $dist -Force;',
  'Compress-Archive -LiteralPath $items.FullName -DestinationPath $out -Force;',
].join(' ');

execFileSync('powershell.exe', ['-NoProfile', '-Command', command], { stdio: 'inherit' });
console.log(`created ${path.relative(root, outFile)}`);
