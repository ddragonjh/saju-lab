# 배포 및 보안 헤더 안내

## 현재 배포

- 현재 사이트는 GitHub Pages URL `https://ddragonjh.github.io/saju-lab/`로 배포합니다.
- GitHub Pages는 저장소의 `_headers` 파일을 응답 헤더로 적용하지 않습니다. 따라서 `_headers`는 Cloudflare Pages 등 보안 헤더를 지원하는 환경으로 이전할 때 사용하는 기준 파일입니다.

## GitHub Pages 한계

다음 헤더는 HTML `<meta>`만으로 완전히 대체할 수 없거나 GitHub Pages에서 직접 설정할 수 없습니다.

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Content-Security-Policy`의 `frame-ancestors`
- `Permissions-Policy`

HTML에는 가능한 범위의 CSP와 referrer meta를 넣었지만, 운영 보안을 강화하려면 헤더 지원 호스팅이 필요합니다.

## Cloudflare Pages 이전 절차

1. Cloudflare Pages에서 GitHub 저장소 `ddragonjh/saju-lab`를 연결합니다.
2. 빌드 명령은 비워두고, 배포 디렉터리는 저장소 루트(`/`)로 설정합니다.
3. `_headers` 파일이 배포 결과에 포함되는지 확인합니다.
4. 배포 후 다음 명령으로 응답 헤더를 확인합니다.

```powershell
Invoke-WebRequest -Uri "https://배포도메인/" -Method Head | Select-Object -ExpandProperty Headers
```

5. 확인해야 할 헤더:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` 또는 `frame-ancestors 'none'`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Strict-Transport-Security`

## Google Search Console 등록

1. Google Search Console에서 URL prefix 속성으로 `https://ddragonjh.github.io/saju-lab/`를 추가합니다.
2. 권장 방식은 HTML 파일 인증입니다. 제공된 인증 파일을 저장소 루트에 추가해 배포합니다.
3. 인증 후 `sitemap.xml`을 제출합니다.
4. 개인 생년월일과 이름이 URL 파라미터에 들어가지 않는지 확인합니다.

## 네이버 서치어드바이저 등록

1. 네이버 서치어드바이저에서 사이트를 추가합니다.
2. HTML 파일 인증을 선택하고 인증 파일을 저장소 루트에 추가해 배포합니다.
3. 인증 후 `robots.txt`와 `sitemap.xml`을 제출합니다.
4. 검색 노출 문구가 운세 결과를 확정 표현처럼 보이게 하지 않는지 점검합니다.
