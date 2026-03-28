/**
 * Rainy Note — 빌드 스크립트
 * HTML/CSS/JS 파일을 dist/ 폴더로 복사하고
 * 캐시 버스터 해시를 주입합니다.
 */
const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC  = path.resolve(__dirname, '..');
const DIST = path.resolve(SRC, 'dist');

// dist 폴더 초기화
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
fs.mkdirSync(DIST, { recursive: true });

// 복사할 파일/폴더 목록
const COPY_FILES = [
  'index.html',
  'admin.html',
  'manifest.json',
  'sw.js',
  'icons',
  'robots.txt',
  'sitemap.xml',
  '_redirects',
  'netlify.toml',
  'vercel.json',
];

function copyItem(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(f => copyItem(path.join(src, f), path.join(dest, f)));
  } else {
    fs.copyFileSync(src, dest);
  }
}

COPY_FILES.forEach(f => {
  copyItem(path.join(SRC, f), path.join(DIST, f));
});

// 캐시 버스터 해시 생성
const hash = crypto.randomBytes(4).toString('hex');

// index.html / admin.html 에 버전 메타 태그 주입
['index.html', 'admin.html'].forEach(file => {
  const fp = path.join(DIST, file);
  if (!fs.existsSync(fp)) return;
  let html = fs.readFileSync(fp, 'utf8');
  html = html.replace(
    '</head>',
    `  <meta name="build-hash" content="${hash}">\n</head>`
  );
  fs.writeFileSync(fp, html);
});

console.log(`✅ Build complete! hash=${hash}`);
console.log(`📁 Output: ${DIST}`);
