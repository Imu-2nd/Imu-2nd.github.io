/**
 * 사진 원본(media/photos/*.jpg)에서 웹용 이미지와 매니페스트를 생성합니다.
 *
 *   npm install
 *   npm run build:media
 *
 * 원본은 그대로 두고, 아래 결과물만 새로 씁니다.
 *   media/photos/w480/*.webp   갤러리 썸네일
 *   media/photos/w1600/*.webp  라이트박스 확대 이미지
 *   assets/js/photos.js        사진 목록 매니페스트 (크기 · 날짜 포함)
 *   assets/img/og.jpg          공유 미리보기 이미지
 *   assets/img/favicon-*.png   파비콘
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PHOTO_DIR = path.join(ROOT, 'media', 'photos');

/** 사진마다 붙일 날짜와 한 줄 설명. 파일명을 키로 씁니다. */
const CAPTIONS = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tools', 'captions.json'), 'utf8')
);

/** 공유 이미지·파비콘에 쓸 대표 사진 */
const COVER = 'arong-20.jpg';

const SIZES = [
  { dir: 'w480', width: 480, quality: 72 },
  { dir: 'w1600', width: 1600, quality: 82 },
];

const relPosix = (p) => path.relative(ROOT, p).split(path.sep).join('/');

async function main() {
  const files = fs
    .readdirSync(PHOTO_DIR)
    .filter((f) => /^arong-\d+\.jpg$/i.test(f))
    .sort();

  if (!files.length) throw new Error(`사진을 찾지 못했습니다: ${PHOTO_DIR}`);

  for (const { dir } of SIZES) {
    fs.mkdirSync(path.join(PHOTO_DIR, dir), { recursive: true });
  }
  fs.mkdirSync(path.join(ROOT, 'assets', 'img'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'assets', 'js'), { recursive: true });

  const manifest = [];

  for (const file of files) {
    const src = path.join(PHOTO_DIR, file);
    const base = file.replace(/\.jpg$/i, '');
    // .rotate() 를 먼저 걸어 EXIF 회전이 반영된 실제 표시 크기를 얻습니다.
    const rotated = sharp(src, { failOn: 'none' }).rotate();
    const { width, height } = await rotated.toBuffer({ resolveWithObject: true }).then((r) => r.info);

    for (const { dir, width: w, quality } of SIZES) {
      await sharp(src, { failOn: 'none' })
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality })
        .toFile(path.join(PHOTO_DIR, dir, `${base}.webp`));
    }

    const scale = Math.min(1, 480 / width);
    const meta = CAPTIONS[file] || {};
    manifest.push({
      id: base,
      thumb: `media/photos/w480/${base}.webp`,
      large: `media/photos/w1600/${base}.webp`,
      original: `media/photos/${file}`,
      w: Math.round(width * scale),
      h: Math.round(height * scale),
      date: meta.date || null,
      caption: meta.caption || null,
    });

    process.stdout.write(`  ${file} → ${width}×${height}\n`);
  }

  const js =
    '/* 자동 생성 파일 — 직접 수정하지 마세요. `npm run build:media` 로 다시 만듭니다. */\n' +
    '/* 사진 설명·날짜를 고치려면 tools/captions.json 을 수정하세요. */\n' +
    `window.ARONG_PHOTOS = ${JSON.stringify(manifest, null, 2)};\n`;
  fs.writeFileSync(path.join(ROOT, 'assets', 'js', 'photos.js'), js, 'utf8');

  const cover = path.join(PHOTO_DIR, COVER);
  await sharp(cover, { failOn: 'none' })
    .rotate()
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 82 })
    .toFile(path.join(ROOT, 'assets', 'img', 'og.jpg'));

  for (const size of [32, 180, 512]) {
    await sharp(cover, { failOn: 'none' })
      .rotate()
      .resize(size, size, { fit: 'cover', position: 'attention' })
      .png()
      .toFile(path.join(ROOT, 'assets', 'img', `favicon-${size}.png`));
  }

  console.log(`\n사진 ${manifest.length}장 처리 완료 → ${relPosix(path.join(ROOT, 'assets/js/photos.js'))}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
