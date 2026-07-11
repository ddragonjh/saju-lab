# 운명연구소 앱인토스 빌드 안내

작성일: 2026-07-11  
대상: 앱인토스 비게임 WebView 미니앱  
앱 이름: 운명연구소  
앱 ID 후보: `unmyeong-lab`

## 목표

현재 GitHub Pages로 운영 중인 `saju-lab` 웹사이트는 그대로 유지하고, 앱인토스 제출용 앱을 `appintoss/`에 별도 구성했다. 앱 버전은 사업자등록 없는 개인 개발자 출시 범위를 기준으로 모든 사용자 노출 기능을 무료로 제공하며, 광고, 인앱 결제, 외부 결제, 실제 토스 로그인은 포함하지 않는다.

## 공식 문서 기준

- 앱인토스 WebView 개발: https://developers-apps-in-toss.toss.im/tutorials/webview.html
- 비게임 사용자 식별 `getAnonymousKey`: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/비게임/getAnonymousKey.html
- 앱인토스 저장소 `Storage`: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/저장소/Storage.html
- 뒤로가기 이벤트: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/이벤트%20제어/back-event.html
- 공유 링크: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/공유/getTossShareLink.html
- 향후 토스 로그인: https://developers-apps-in-toss.toss.im/login/develop.html

## 기술 선택

- React 18 + TypeScript + Vite
- `@apps-in-toss/web-framework@2.10.5`
- `@toss/tds-mobile@2.5.0`
- `@toss/tds-mobile-ait@2.5.0`
- 공통 계산/리딩 모듈: `shared/`
- 앱 전용 UI/저장/식별/공유: `appintoss/src/`

React 18을 사용한 이유는 Toss Design System 예시와 호환성이 안정적이고, 기존 정적 웹 로직을 WebView 앱으로 옮기기에 가장 작은 변경 폭이기 때문이다.

## 인증과 사용자 식별

현재 출시 빌드는 `VITE_AUTH_MODE=anonymous-toss`, `VITE_TOSS_LOGIN_ENABLED=false`를 기본값으로 사용한다.

앱 시작 순서:

1. `AnonymousTossIdentityProvider` 초기화
2. 앱인토스 환경에서 `getAnonymousKey()` 호출
3. 성공 시 반환된 hash를 내부 사용자 ID 네임스페이스로 사용
4. SDK 미지원, 샌드박스 외부 실행, 오류 발생 시 `GuestIdentityProvider`로 fallback
5. 모든 무료 기능은 게스트 상태에서도 이용 가능

주의: 이 방식은 실제 OAuth 로그인이나 토스 프로필 연동이 아니다. 앱 UI에서 토스 로그인 완료, 토스 계정 가입, 토스 프로필 조회처럼 오해될 표현을 사용하지 않는다.

## 기능 범위

포함:

- 사주 입력, 원국, 오행, 십성, 대운, 세운, 신살, 인연 후보 시기
- 오늘의 운세, 이주의 운세, 이달의 운세
- 별자리 직접 선택 및 생년월일 기반 별자리 결과
- 타로 22장 덱, 사용자 직접 3장 선택, 정/역방향, 저장, 공유
- 신점 메시지, 주제 선택, 날짜별 결정론적 결과, 저장, 공유
- 내 기록, 항목 삭제, 전체 삭제
- 개인정보처리방침, 이용약관, 면책 안내, 문의 안내

제외:

- 웹사이트의 로컬 이메일 회원가입
- 비밀번호/세션/프리미엄 상태
- 프리미엄 이용권, 이용권 해시, 결제 고지, 가격 문구
- 유료 궁합, 유료 질문 리딩, 유료 PDF, 외부 결제 유도
- 광고 SDK, 결제 SDK, 실제 `appLogin()` 호출

## 명령어

```bash
cd appintoss
npm install
npm run lint
npm run typecheck
npm run test
npm run test:saju
npm run test:fortune
npm run test:tarot
npm run test:identity
npm run build
npm exec -- ait build
npm run bundle
npm run check:privacy
npm run check:free-only
npm run check:appintoss
```

## 산출물

로컬 빌드 후 생성되는 산출물:

- 공식 AIT 산출물: `appintoss/unmyeong-lab.ait`
- 보조 ZIP 번들: `appintoss/dist-appintoss/unmyeong-lab-appintoss.zip`
- 웹 빌드: `appintoss/dist/web/`
- 최신 로컬 AIT 빌드 deploymentId: `019f4f3f-4cc5-758f-ac96-8a78b4037e23`

위 파일들은 로컬 제출/검증 산출물이므로 `.gitignore`에 포함했다.

## 알려진 한계

- 앱인토스 샌드박스 QR, 실제 Toss 앱, Android/iOS 실기기 검증은 콘솔 접근과 기기가 필요하므로 운영자가 직접 수행해야 한다.
- `@apps-in-toss` 빌드 도구의 하위 패키지 중 `@apps-in-toss/ait-format@1.0.0`은 Node 24 이상을 요구한다는 npm 경고가 있다. 현재 Node 22.23.1 환경에서도 빌드는 통과했지만, 운영 환경에서는 Node 24 이상 사용을 권장한다.
- `npm audit --omit=dev` 결과 32건(critical 1, high 12, moderate 3, low 16)의 취약점 경고가 표시됐다. 다수가 `@apps-in-toss/web-framework`/Granite/React Native 빌드 도구 하위 의존성에서 발생하며 일부는 현재 no fix available이다. 앱 소스는 외부 입력 HTML 삽입, URL 개인정보, 결제/광고 SDK를 사용하지 않지만, 출시 전 SDK 업데이트 가능 여부를 재확인해야 한다.
