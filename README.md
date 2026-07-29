# 아롱이 추모 공간

달나라로 간 아롱이와 함께한 날들을 모아 둔 정적 사이트입니다.
빌드 도구 없이 HTML/CSS/JS 그대로 GitHub Pages에서 동작합니다.

👉 <https://imu-2nd.github.io/>

## 폴더 구조

```
index.html               페이지 본문
404.html                 없는 주소로 들어왔을 때
assets/css/style.css     스타일 전체
assets/js/app.js         갤러리 · 라이트박스 · 발자국 동작
assets/js/photos.js      자동 생성 — 사진 목록 (직접 수정하지 마세요)
assets/img/              공유 이미지 · 파비콘 (자동 생성)
media/photos/*.jpg       사진 원본 (그대로 보관)
media/photos/w480/       갤러리용 축소본 (자동 생성)
media/photos/w1600/      확대보기용 (자동 생성)
media/videos/*.mp4       영상 원본
tools/build-media.mjs    위 '자동 생성' 항목을 만드는 스크립트
tools/captions.json      사진별 날짜와 한 줄 설명  ← 여기를 고치면 됩니다
```

원본 사진은 그대로 두고, 화면에는 가벼운 WebP만 내보냅니다.
덕분에 갤러리 첫 화면이 약 77MB → 0.5MB 로 줄었습니다.

## 자주 하는 수정

### 사진 설명·날짜 바꾸기

`tools/captions.json` 을 고친 뒤 아래를 실행하세요.

```bash
npm install
npm run build:media
```

### 사진 추가하기

1. `media/photos/` 에 `arong-27.jpg` 처럼 이어지는 번호로 넣습니다.
2. `tools/captions.json` 에 같은 파일명으로 항목을 추가합니다.
3. `npm run build:media` 를 실행합니다.

사진은 파일명 순서대로 나열됩니다.

### '함께한 날' 숫자 켜기

`assets/js/app.js` 맨 위 `PROFILE` 에 날짜를 넣으면
아롱이와 함께한 날수가 자동으로 계산되어 표시됩니다.
비워 두면 그 칸은 나타나지 않습니다.

```js
var PROFILE = {
  name: '아롱이',
  birth: '2015-04-01',     // 아롱이가 온 날
  farewell: '2026-03-17',  // 아롱이가 떠난 날
};
```

### 편지 글 바꾸기

`index.html` 의 `<section id="letterSection">` 안 문단을 그대로 고치면 됩니다.

## 로컬에서 미리 보기

```bash
npm run serve
```

`http://localhost:4173` 에서 열립니다. (영상 탐색을 위한 Range 요청까지 지원합니다.)
