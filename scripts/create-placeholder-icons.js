/**
 * 배포 테스트용 플레이스홀더 PNG 아이콘 자동 생성
 * (sharp 불필요 — 순수 Node.js Buffer만 사용)
 *
 * 실행: node scripts/create-placeholder-icons.js
 */
const fs   = require('fs');
const path = require('path');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUT   = path.join(__dirname, '..', 'icons');

// 최소한의 유효한 PNG (1×1, #0d1b2a 파란 픽셀)
// 실제 배포 시에는 icons/generate-icons.js 로 교체하세요
const PNG_1X1_DARK_BLUE = Buffer.from([
  0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A, // PNG signature
  0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52, // IHDR chunk length=13
  0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01, // width=1, height=1
  0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53, // 8-bit RGB, CRC
  0xDE,0x00,0x00,0x00,0x0C,0x49,0x44,0x41, // IDAT chunk
  0x54,0x08,0xD7,0x63,0x60,0x18,0xD2,0x30, // compressed pixel
  0x00,0x00,0x00,0x04,0x00,0x01,0xE2,0x21, // (dark blue #0d1b2e)
  0xBC,0x33,0x00,0x00,0x00,0x00,0x49,0x45, // IEND
  0x4E,0x44,0xAE,0x42,0x60,0x82            // IEND CRC
]);

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

let created = 0;
SIZES.forEach(size => {
  const p = path.join(OUT, `icon-${size}.png`);
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, PNG_1X1_DARK_BLUE);
    console.log(`✅ icon-${size}.png`);
    created++;
  } else {
    console.log(`⏭️  icon-${size}.png (already exists)`);
  }
});

// favicon.ico
const ico = path.join(OUT, '..', 'favicon.ico');
if (!fs.existsSync(ico)) {
  fs.writeFileSync(ico, PNG_1X1_DARK_BLUE);
  console.log('✅ favicon.ico');
  created++;
}

console.log(`\n${created > 0 ? '🎉' : '✔️'} ${created}개 파일 생성 완료.`);
console.log('⚠️  이것은 배포 테스트용 플레이스홀더입니다.');
console.log('   실제 배포 전에 node icons/generate-icons.js 를 실행하세요.');
