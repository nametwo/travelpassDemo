# TravelPass 웹 (카드 소개 · 사용처 + 혜택)

정적 HTML 시안입니다. 서버 없이 파일을 열어도 되고, 로컬 서버로 띄우면 됩니다.

```bash
python3 -m http.server 8765
# http://localhost:8765/card-intro.html
```

- `card-intro.html` — 카드 소개
- `benefits.html` — 사용처 + 혜택 (탭: `#use` / `#benefit`)
- `assets/site.css`, `assets/site.js` — 공통 스타일·스크립트
- `assets/app/` — 앱 스크린샷 자리 (`wallet.png` `pay.png` `travel.png` `living.png` `transit.png`, `step-1~3.png`)
- `assets/hero.mp4` — 첫화면 배경 영상 자리
- `assets/card-front.png` — 실물 카드 앞면

스토어 링크는 `assets/site.js` 상단 `STORE` 상수에서 바꿉니다.
