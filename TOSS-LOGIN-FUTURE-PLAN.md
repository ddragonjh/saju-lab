# 향후 토스 로그인 전환 계획

작성일: 2026-07-11

현재 앱인토스 출시 빌드는 실제 토스 로그인 `appLogin()`을 호출하지 않는다. 사업자등록과 앱인토스 콘솔 승인이 완료된 뒤 아래 절차에 따라 전환한다.

## 전환 조건

- 사업자등록 완료
- 앱인토스 콘솔에서 토스 로그인 사용 신청
- Redirect/앱 설정 승인
- 서버 준비
- 개인정보처리방침과 이용약관 개정
- 기존 anonymous 저장 데이터 이전 정책 확정

## 현재 준비된 구조

`IdentityProvider` 인터페이스:

```ts
interface IdentityProvider {
  initialize(): Promise<IdentityResult>;
  getUserId(): string | null;
  getAuthMode(): 'anonymous-toss' | 'toss-login' | 'guest';
  logout(): Promise<void>;
  deleteLocalData(): Promise<void>;
}
```

구현체:

- `AnonymousTossIdentityProvider`: 현재 프로덕션용
- `GuestIdentityProvider`: SDK 실패/외부 브라우저 fallback
- `TossLoginIdentityProvider`: 향후 전환용 껍데기. 현재 빌드에서는 `appLogin()`을 호출하지 않음

## 토스 로그인 전환 절차

1. 앱인토스 콘솔에서 토스 로그인 기능을 신청한다.
2. 콘솔에서 요구하는 사업자 정보, 약관, 개인정보처리방침, redirect 설정을 등록한다.
3. 앱에서 로그인 버튼을 노출하기 전, 서버에 인가 코드 교환 API를 만든다.
4. 앱에서 `appLogin()`을 호출해 authorization code를 받는다.
5. authorization code는 짧은 유효시간과 1회 사용 특성이 있으므로 즉시 서버로 전송한다.
6. 서버에서 토스 토큰 엔드포인트와 통신해 Access Token/Refresh Token을 교환한다.
7. Access Token과 Refresh Token은 클라이언트 localStorage에 저장하지 않고 서버에 안전하게 저장한다.
8. 서버에서 사용자 정보 조회 API를 호출해 필요한 최소 정보만 저장한다.
9. 앱 클라이언트에는 자체 세션 또는 최소 식별자만 반환한다.

## anonymous hash 매핑

전환 시 기존 anonymous hash 기반 기록을 실제 로그인 계정과 연결할지 선택해야 한다.

권장 흐름:

1. 로그인 직후 현재 기기의 anonymous hash를 서버로 보낸다.
2. 서버가 해당 hash에 연결 가능한 로컬 기록 이전 안내를 내려준다.
3. 사용자가 동의하면 로컬 저장 기록을 서버 계정으로 업로드한다.
4. 동의하지 않으면 로컬 기록은 기기에만 남긴다.
5. 같은 anonymous hash가 여러 로그인 계정에 연결되지 않도록 충돌 정책을 둔다.

## 데이터 이전

이전 대상:

- 저장한 사주 결과
- 저장한 운세 결과
- 저장한 타로 결과
- 저장한 신점 메시지
- 저장한 별자리 결과
- 마지막 확인 날짜

이전 제외:

- 불필요한 콘솔/디버그 정보
- 공유 링크 기록
- anonymous hash 원문 공개
- 비밀번호 등 현재 앱에 존재하지 않는 정보

## 중복 계정 처리

- 동일 anonymous hash가 이미 다른 로그인 계정에 연결된 경우 자동 병합하지 않는다.
- 사용자에게 기존 계정 또는 현재 계정 중 선택하게 한다.
- 병합 전에는 저장 결과 수와 생성일 범위만 보여주고 상세 개인정보는 노출하지 않는다.

## 회원 탈퇴

탈퇴 시 처리:

- 서버 계정 비활성화 또는 삭제
- 서버 저장 결과 삭제
- 토큰 폐기
- 기기 내 저장 데이터 삭제 안내
- 법령상 보관 의무가 있다면 항목과 기간을 개인정보처리방침에 명시

## 토큰 폐기

- Refresh Token은 서버에서 관리한다.
- 로그아웃 시 서버 세션을 무효화한다.
- 탈퇴 또는 연결 해제 시 토스 정책에 맞춰 토큰 폐기 또는 재사용 불가 처리를 한다.
- 클라이언트에는 Access Token/Refresh Token을 저장하지 않는다.

## 개인정보처리방침 변경 항목

실제 토스 로그인 도입 시 다음을 추가해야 한다.

- 토스 로그인으로 수집하는 항목
- 토스에서 제공받는 사용자 정보 범위
- 서버 저장 항목
- 보유기간
- 탈퇴/삭제 방법
- 제3자 제공 여부
- 국외 이전 여부
- 처리위탁 여부
- 토큰 보관 및 폐기 방식
- anonymous hash와 로그인 계정 매핑 방식

