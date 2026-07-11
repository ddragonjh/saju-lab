# 앱인토스 출시 가이드

작성일: 2026-07-11

## 사전 준비

1. 앱인토스 개인 워크스페이스를 생성한다.
2. 콘솔에서 비게임 WebView 앱을 생성한다.
3. 앱 이름을 `운명연구소`로 등록한다.
4. 앱 ID 또는 appName을 `unmyeong-lab`으로 사용할 수 있는지 확인한다.
5. 앱 아이콘과 대표 이미지를 준비한다.
6. 개인정보처리방침과 이용약관 URL을 등록한다.
7. 문의 이메일 `ddragonjh@gmail.com` 수신 가능 여부를 확인한다.

## 로컬 빌드

```bash
cd appintoss
npm install
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

## 산출물

- 공식 업로드 후보: `appintoss/unmyeong-lab.ait`
- 보조 ZIP: `appintoss/dist-appintoss/unmyeong-lab-appintoss.zip`
- 최신 로컬 AIT 빌드 deploymentId: `019f4f3f-4cc5-758f-ac96-8a78b4037e23`

공식 콘솔이 `.ait` 업로드를 요구하면 `.ait` 파일을 사용하고, 정적 WebView ZIP 업로드 절차가 필요한 경우 보조 ZIP을 사용한다.

## 콘솔 등록 값

- 앱 이름: 운명연구소
- 앱 ID 후보: `unmyeong-lab`
- 개인정보처리방침 URL: https://ddragonjh.github.io/saju-lab/privacy.html
- 이용약관 URL: https://ddragonjh.github.io/saju-lab/terms.html
- 문의 이메일: ddragonjh@gmail.com
- 권한 요청: 없음
- 로그인: 실제 토스 로그인 없음
- 사용자 식별: 비게임 anonymous key

## QR/샌드박스 테스트

공식 문서상 샌드박스에서는 mock 사용자 키가 반환될 수 있으므로, 다음을 모두 확인한다.

1. 앱인토스 샌드박스에서 앱 실행
2. QR 또는 private link로 실제 Toss 앱 실행
3. `getAnonymousKey()` 성공 시 내 기록이 사용자별로 분리되는지 확인
4. SDK 미지원/브라우저 실행 시 게스트 모드로 기능이 계속 동작하는지 확인
5. 공유 링크가 `intoss://unmyeong-lab/...` 형태로 열리는지 확인
6. Android/iOS에서 뒤로가기와 Safe Area를 확인

## 운영자가 직접 해야 할 일

- 콘솔 앱 생성 및 앱 이름 확정
- 최종 아이콘 URL 입력
- 개인정보처리방침/이용약관 URL 등록
- 산출물 업로드
- 샌드박스 실행
- QR 테스트
- Android 실기기 테스트
- iOS 실기기 테스트
- 검수 요청
- 검수 의견 반영
- 출시 버튼 실행

## 주의사항

- 현재 빌드는 사업자 없는 개인 개발자 범위를 기준으로 실제 토스 로그인 `appLogin()`을 활성화하지 않는다.
- 앱 내부에 서버 Secret, 토스 로그인 Secret, 결제 키를 넣지 않는다.
- `@apps-in-toss/ait-format@1.0.0`은 Node 24 이상 요구 경고가 있으므로 출시 빌드 환경은 Node 24 이상을 권장한다.
- `npm audit --omit=dev`에서 32건(critical 1, high 12, moderate 3, low 16)의 의존성 경고가 확인됐다. 공식 SDK/빌드 도구 하위 의존성이 주 원인이므로 출시 전 `npm audit fix` 가능 항목과 앱인토스 SDK 업데이트 여부를 검토한다.
