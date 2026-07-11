# 운명연구소 앱인토스 앱

이 디렉터리는 기존 GitHub Pages 웹사이트와 분리된 앱인토스 비게임 WebView 앱이다.

## 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm exec -- ait build
npm run bundle
npm run check:privacy
npm run check:free-only
npm run check:appintoss
```

## 정책

- 현재 인증 모드: `anonymous-toss`
- 실제 토스 로그인: 비활성화
- 이메일/비밀번호 회원가입: 없음
- 결제/광고/외부 결제: 없음
- 저장: 앱인토스 Storage 우선, 실패 시 localStorage fallback
- 공유: 앱인토스 공유 링크 우선, 실패 시 Web Share API/클립보드 fallback

