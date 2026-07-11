# 앱인토스 빌드에서 제거한 유료 기능

작성일: 2026-07-11

## 제거 원칙

앱인토스 출시 빌드는 개인 개발자 무료 비게임 앱으로 구성했다. 사용자에게 비용 지불, 외부 결제, 이용권 등록, 광고 시청, 잠금 해제를 요구하는 기능은 포함하지 않는다.

## 제거한 UI/기능

- 프리미엄 이용권 영역
- 이용권 코드 입력
- 이용권 해시 검증
- 가격 문구
- 구매 문의/입금 안내
- 결제 전 고지
- 유료 PDF 안내
- 유료 상세 결과 잠금
- 유료 궁합
- 유료 재회 시기
- 유료 상대방 속마음
- 유료 환승이별 분석
- 유료 이직운
- 유료 합격운
- 유료 승진운
- 유료 겉궁합/속궁합
- 외부 결제 링크
- 후원 링크
- 광고/리워드 광고

## 앱 빌드에 포함하지 않는 기존 파일

- `js/premium.js`
- `js/premium-hashes.js`
- `js/auth.js`의 로컬 이메일/비밀번호 계정 기능

기존 GitHub Pages 웹사이트 파일은 삭제하지 않았다. 앱인토스 앱은 `appintoss/`와 `shared/`를 별도 빌드 대상으로 사용하므로 기존 웹 배포를 깨뜨리지 않는다.

## 확인 방법

다음 명령으로 앱 소스와 빌드 결과를 검사한다.

```bash
cd appintoss
npm run build
npm exec -- ait build
npm run bundle
npm run check:free-only
npm run check:appintoss
```

`check:free-only`는 앱 소스와 사용자에게 노출되는 웹 번들에서 다음 계열 문자열을 검사한다.

- `premium`
- `premium-hashes`
- `purchase`
- `payment`
- `checkout`
- `tossPay`
- `in-app purchase`
- 이용권/구매/결제/가격/구독/광고/후원 계열 문구

참고: `@apps-in-toss/web-framework` 공식 SDK 런타임 내부에 결제/광고 관련 미사용 API 이름이 문자열로 존재할 수 있다. 앱 소유 소스와 사용자 노출 문구에서는 해당 기능을 호출하거나 표시하지 않는다.

