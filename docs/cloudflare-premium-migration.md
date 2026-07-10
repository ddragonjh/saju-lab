# Cloudflare Workers 프리미엄 서버화 메모

현재 정적 패치는 원본 이용권 코드를 배포 폴더에서 제거하고, 브라우저 입력/XSS/예외 처리 위험을 줄입니다. 다만 프리미엄 판정과 프리미엄 렌더링 코드가 여전히 클라이언트 JS에 있으므로, 개발자 도구로 localStorage를 조작하는 사용자를 완전히 막을 수는 없습니다.

매출 보호가 목적이면 아래 항목은 Worker 쪽으로 옮겨야 합니다.

1. 이용권 검증
   - 원문 코드는 소유자만 보관합니다.
   - Worker에는 SHA-256 코드 해시 목록 또는 KV/D1의 코드 테이블만 둡니다.
   - `POST /api/redeem`에서 코드 형식, 해시 일치, 이미 사용된 코드 여부를 확인합니다.

2. 프리미엄 권한
   - 코드가 유효하면 Worker가 권한 토큰을 발급합니다.
   - 토큰은 Worker의 HMAC 서명 또는 KV 세션으로 검증합니다.
   - 브라우저 localStorage의 `premium=true`만으로는 프리미엄 결과를 열지 않게 바꿉니다.

3. 프리미엄 콘텐츠
   - 궁합, 월별 운세, 인생 타이밍 계산과 텍스트 조립을 Worker API로 이동합니다.
   - 프론트엔드는 `POST /api/premium/compat`, `POST /api/premium/monthly`, `POST /api/premium/timing` 결과만 표시합니다.
   - 이 단계가 되어야 프리미엄 로직과 텍스트가 클라이언트 코드에 그대로 노출되지 않습니다.

4. 권장 Cloudflare 구성
   - Workers 무료 티어
   - KV namespace: `PREMIUM_CODES`, `PREMIUM_SESSIONS`
   - Secret: `CODE_HASH_SALT`, `TOKEN_HMAC_SECRET`
   - Pages 또는 기존 정적 호스팅에서 `/api/*`만 Worker로 라우팅

5. 전환 순서
   - Worker 프로젝트 생성 및 KV 연결
   - 현재 `js/premium-hashes.js` 해시를 KV/Secret으로 이전
   - `MLAuth.redeem()`을 Worker fetch 호출로 교체
   - `PREMIUM.bind()`의 프리미엄 계산/HTML 생성을 Worker 응답 렌더링으로 교체
   - `js/premium-hashes.js` 제거
   - 배포 후 유효 코드 1개, 중복 사용, 잘못된 코드, 토큰 만료 케이스 테스트
