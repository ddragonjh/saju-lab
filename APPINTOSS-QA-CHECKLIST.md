# 앱인토스 QA 체크리스트

작성일: 2026-07-11

## 자동 점검

| 항목 | 명령 | 상태 |
|---|---|---|
| 정적 보안 검사 | `npm run lint` | 통과 |
| TypeScript 검사 | `npm run typecheck` | 통과 |
| 전체 계산/리딩 테스트 | `npm run test` | 통과 |
| 사주 테스트 | `npm run test:saju` | 통과 |
| 운세 테스트 | `npm run test:fortune` | 통과 |
| 타로 테스트 | `npm run test:tarot` | 통과 |
| 식별 테스트 | `npm run test:identity` | 통과 |
| Vite 빌드 | `npm run build` | 통과 |
| 공식 AIT 빌드 | `npm exec -- ait build` 및 `npm run build:appintoss` | 통과, deploymentId `019f4f52-313d-7fbe-9b90-0c4af9fffc58` |
| 업로드용 ZIP | `npm run bundle` | 통과 |
| 개인정보 검사 | `npm run check:privacy` | 통과 |
| 무료 정책 검사 | `npm run check:free-only` | 통과 |
| 앱인토스 정책 검사 | `npm run check:appintoss` | 통과 |
| 기존 웹 정적 테스트 | `node tests/static.test.js` | 통과 |

## 계산 테스트 범위

- 동일 입력 결과 일관성
- 23시 직전/직후
- 0시 직전/직후
- 자시 기준 변경
- 입춘 직전/직후
- 월주 변경 절기 직전/직후
- 윤년 2월 29일
- 태어난 시간 모름
- 간이 시각 보정 적용 전후
- 1930년 경계
- 현재 연도
- 2035년 경계
- 잘못된 날짜
- 남녀 대운 방향
- 오행 합계
- 십성 매핑
- 대운 배열
- 세운 간지
- 타로 카드 중복 방지
- 같은 날짜 운세 결과 일관성
- 같은 날짜 신점 메시지 일관성
- 별자리 경계일

## 수동 테스트

| 환경 | 상태 | 비고 |
|---|---|---|
| 앱인토스 샌드박스 | 운영자 확인 필요 | 콘솔/샌드박스 접근 필요 |
| 앱인토스 QR 테스트 | 운영자 확인 필요 | 실제 배포 ID 필요 |
| 실제 Toss 앱 | 운영자 확인 필요 | Android/iOS 각각 확인 |
| 최신 Android | 운영자 확인 필요 | anonymous key 성공/실패 확인 |
| 구형 Android | 운영자 확인 필요 | 성능, 뒤로가기, 저장소 확인 |
| 최신 iOS | 운영자 확인 필요 | Safe Area, 공유, 저장소 확인 |
| 320px 작은 화면 | 로컬 확인 권장 | 하단 탭/폼 줄바꿈 확인 |
| 큰 화면 | 로컬 확인 권장 | 카드 그리드/결과 섹션 확인 |
| 글자 크기 확대 | 운영자 확인 필요 | OS 설정 확대 상태 |
| 다크모드 | 앱 기본 다크 UI | 대비 수동 확인 |
| 느린 네트워크 | 운영자 확인 필요 | 초기 로드와 공유 실패 처리 |
| 오프라인 | 운영자 확인 필요 | 계산 기능은 동작해야 함 |
| 앱 백그라운드 복귀 | 운영자 확인 필요 | 저장 기록 유지 확인 |
| 연속 뒤로가기 | 운영자 확인 필요 | 앱 종료/화면 전환 확인 |
| 저장 데이터 삭제 | 로컬/실기기 확인 | 항목 삭제와 전체 삭제 |
| 딥링크 진입 | 운영자 확인 필요 | `intoss://unmyeonglab/...` |
| 공유 결과 진입 | 운영자 확인 필요 | 개인정보 없는 공개 요약 |

## 의존성 점검

`npm audit --omit=dev` 결과 32건(critical 1, high 12, moderate 3, low 16)의 경고가 남아 있다. 주요 원인은 `@apps-in-toss/web-framework`와 Granite/React Native 빌드 도구 하위 의존성이다. 일부는 `npm audit fix` 가능, 일부는 no fix available로 표시된다. 출시 전 공식 SDK 업데이트가 있는지 재확인한다.

## 접근성 체크

- 모든 입력에 명확한 label이 있다.
- 성별은 기본 선택되지 않는다.
- 라디오 그룹은 fieldset/legend로 묶었다.
- 오류 메시지는 `aria-live`로 알린다.
- 버튼 터치 영역은 최소 44px 이상이다.
- 키보드 포커스 스타일이 있다.
- `prefers-reduced-motion`에서 애니메이션을 줄인다.
- 점수는 색상만으로 구분하지 않고 숫자와 텍스트를 함께 표시한다.
