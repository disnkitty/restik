const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const manifestPath = path.join(publicDir, 'gallery-manifest.json');

const IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
  '.avif',
]);

const EXCLUDED_BASENAMES = new Set([
  'gallery-manifest.json',
  'manifest.json',
  'vite.svg',
  'favicon.ico',
]);

const isPlaceholder = (basename) =>
  /^sample\d+\./i.test(basename) || /^placeholder/i.test(basename);

const collectImages = (dir, baseDir = dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectImages(fullPath, baseDir));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;
    if (EXCLUDED_BASENAMES.has(entry.name)) continue;
    if (isPlaceholder(entry.name)) continue;

    files.push(path.relative(baseDir, fullPath).split(path.sep).join('/'));
  }

  return files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

if (!fs.existsSync(publicDir)) {
  console.error('Public folder not found:', publicDir);
  process.exit(1);
}

const files = collectImages(publicDir);
fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2), 'utf8');
console.log('Wrote gallery manifest with', files.length, 'files to', manifestPath);
