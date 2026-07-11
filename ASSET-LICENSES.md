# 에셋 및 라이선스 기록

작성일: 2026-07-11

## 앱인토스 빌드

- 외부 이미지 에셋을 앱 빌드에 포함하지 않았다.
- 타로 카드는 CSS와 텍스트 데이터로 렌더링하며, 전통적인 메이저 아르카나 명칭을 사용한다.
- 별자리 명칭과 기호는 일반적으로 쓰이는 천문/점성술 표기를 사용한다.
- 폰트는 시스템 폰트를 우선 사용하며 Google Fonts를 앱인토스 빌드에 불러오지 않는다.
- 아이콘 최종 파일은 `[확인 필요]` 상태다. 콘솔 제출 전 직접 제작 또는 사용권이 명확한 아이콘으로 교체해야 한다.

## 웹사이트 기존 에셋

- `assets/og-image.png`는 GitHub Pages 공유 미리보기용으로 사용된다.
- `favicon.svg`, `site.webmanifest`, `404.html`, `robots.txt`, `sitemap.xml`은 기존 웹 운영을 위한 정적 에셋이다.
- 웹사이트 기존 에셋의 제작/사용권 출처는 운영자가 최종 확인해야 한다.

## 오픈소스 패키지

앱인토스 빌드 주요 패키지:

- `@apps-in-toss/web-framework`
- `@toss/tds-mobile`
- `@toss/tds-mobile-ait`
- `@emotion/react`
- `react`
- `react-dom`
- `vite`
- `typescript`

출시 전 `appintoss/package-lock.json` 기준으로 라이선스 검토와 `npm audit` 점검을 수행한다.

