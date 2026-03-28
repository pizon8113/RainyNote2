/**
 * 아이콘 생성 스크립트 (Node.js)
 * 
 * 사용법:
 *   npm install sharp   (한 번만)
 *   node icons/generate-icons.js
 * 
 * icons/icon.svg → PNG 아이콘 세트를 자동 생성합니다.
 * sharp 모듈이 없으면 온라인 변환 방법을 안내합니다.
 */
const fs   = require('fs');
const path = require('path');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SVG_PATH  = path.join(__dirname, 'icon.svg');
const OUT_DIR   = __dirname;

async function generate() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.log('\n⚠️  sharp 모듈이 없습니다. 아래 방법 중 하나를 사용하세요:\n');
    console.log('방법 1 — npm으로 설치 후 재실행:');
    console.log('  npm install sharp');
    console.log('  node icons/generate-icons.js\n');
    console.log('방법 2 — 온라인 변환 (https://realfavicongenerator.net)');
    console.log('  icon.svg 파일을 업로드하면 모든 크기의 PNG를 다운로드할 수 있습니다.\n');
    console.log('방법 3 — 더미 PNG 자동 생성 (배포 테스트용):');
    createPlaceholderIcons();
    return;
  }

  const svgBuffer = fs.readFileSync(SVG_PATH);
  for (const size of SIZES) {
    const outPath = path.join(OUT_DIR, `icon-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`✅ icon-${size}.png 생성 완료`);
  }

  // favicon.ico (32×32 기반)
  const faviconPath = path.join(path.dirname(OUT_DIR), 'favicon.ico');
  await sharp(svgBuffer).resize(32, 32).png().toFile(faviconPath.replace('.ico','.png'));
  fs.copyFileSync(faviconPath.replace('.ico','.png'), faviconPath);
  console.log('✅ favicon.ico 생성 완료');
  console.log('\n🎉 모든 아이콘 생성 완료!');
}

/**
 * sharp 없이 단순한 플레이스홀더 PNG를 Base64로 생성
 * (실제 배포 전에 반드시 실제 아이콘으로 교체하세요)
 */
function createPlaceholderIcons() {
  // 1×1 픽셀 진한 파란 PNG (Base64)
  const tiny1px = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  SIZES.forEach(size => {
    const outPath = path.join(OUT_DIR, `icon-${size}.png`);
    if (!fs.existsSync(outPath)) {
      fs.writeFileSync(outPath, tiny1px);
      console.log(`📦 placeholder: icon-${size}.png`);
    }
  });
  const rootDir = path.dirname(OUT_DIR);
  const faviconPath = path.join(rootDir, 'favicon.ico');
  if (!fs.existsSync(faviconPath)) {
    fs.writeFileSync(faviconPath, tiny1px);
    console.log('📦 placeholder: favicon.ico');
  }
  console.log('\n⚡ 플레이스홀더 아이콘 생성 완료!');
  console.log('👉 배포 전에 icons/icon.svg를 기반으로 실제 PNG를 생성하세요.');
}

generate().catch(console.error);
