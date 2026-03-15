# S8O1: vercel.json 라우팅/리다이렉트 최적화

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S8O1 |
| Task 이름 | vercel.json 라우팅/리다이렉트 최적화 |
| Stage | S8 — 개발 6차 |
| Area | O — DevOps |
| Dependencies | S6F11 |
| 실행 방식 | Automated |
| Task Agent | devops-troubleshooter-core |

## 배경 및 목적
Vercel 배포 환경에서 vercel.json을 통해 SPA 라우팅을 올바르게 설정하고, 보안 헤더를 추가하며, 캐시 정책을 최적화합니다. 레거시 URL 리다이렉트도 처리하여 SEO 손실을 방지합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S8_개발_6차/Frontend/vercel.json` | Vercel 배포 설정 |
| `Process/S8_개발_6차/Frontend/public/_headers` | HTTP 헤더 설정 (선택) |
| `Process/S8_개발_6차/Frontend/public/_redirects` | Netlify 호환 리다이렉트 (참고) |

## 세부 작업 지시
1. SPA 라우팅 규칙
   - 문제: SPA에서 클라이언트 라우팅이 작동하지 않음
   - 해결: 모든 요청을 index.html로 라우팅
   - vercel.json 설정:
     ```json
     {
       "rewrites": [
         {
           "source": "/(.*)",
           "destination": "/index.html"
         }
       ]
     }
     ```
   - 주의: 정적 파일(CSS, JS, 이미지, API)은 먼저 매칭되어야 함
   - 더 정확한 설정:
     ```json
     {
       "rewrites": [
         {
           "source": "/api/(.*)",
           "destination": "/api/$1"
         },
         {
           "source": "/images/(.*)",
           "destination": "/images/$1"
         },
         {
           "source": "/(.*)",
           "destination": "/index.html"
         }
       ]
     }
     ```

2. 301 리다이렉트 설정
   - 용도: 레거시 URL → 새로운 URL로 영구 리다이렉트
   - 예시:
     ```json
     {
       "redirects": [
         {
           "source": "/old-course",
           "destination": "/courses/new-course",
           "permanent": true
         },
         {
           "source": "/blog/:slug",
           "destination": "/knowledge-hub/:slug",
           "permanent": true
         },
         {
           "source": "/expert/:name",
           "destination": "/experts/:name",
           "permanent": true
         }
       ]
     }
     ```
   - permanent: true → 301 리다이렉트 (SEO 점수 유지)
   - permanent: false → 302 리다이렉트 (임시)

3. 보안 헤더
   - vercel.json 설정:
     ```json
     {
       "headers": [
         {
           "source": "/(.*)",
           "headers": [
             {
               "key": "X-Content-Type-Options",
               "value": "nosniff"
             },
             {
               "key": "X-Frame-Options",
               "value": "SAMEORIGIN"
             },
             {
               "key": "X-XSS-Protection",
               "value": "1; mode=block"
             },
             {
               "key": "Referrer-Policy",
               "value": "strict-origin-when-cross-origin"
             },
             {
               "key": "Permissions-Policy",
               "value": "camera=(), microphone=(), geolocation=()"
             }
           ]
         },
         {
           "source": "/api/(.*)",
           "headers": [
             {
               "key": "Access-Control-Allow-Origin",
               "value": "*"
             },
             {
               "key": "Access-Control-Allow-Methods",
               "value": "GET, POST, PUT, DELETE, OPTIONS"
             }
           ]
         }
       ]
     }
     ```
   - CSP (Content Security Policy):
     ```json
     {
       "key": "Content-Security-Policy",
       "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:"
     }
     ```

4. 캐시 정책
   - vercel.json 설정:
     ```json
     {
       "headers": [
         {
           "source": "/static/(.*)",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "public, max-age=31536000, immutable"
             }
           ]
         },
         {
           "source": "/(css|js)/(.*)",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "public, max-age=31536000, immutable"
             }
           ]
         },
         {
           "source": "/index.html",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "public, max-age=3600, must-revalidate"
             }
           ]
         },
         {
           "source": "/api/(.*)",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "no-cache, no-store, must-revalidate"
             }
           ]
         }
       ]
     }
     ```
   - 전략:
     - 정적 애셋: 1년 캐시 (파일명에 hash 포함)
     - HTML: 1시간 캐시 (항상 새로운 버전 확인)
     - API: 캐시 없음 (동적 데이터)

## 완료 기준
- [ ] vercel.json 파일 생성
- [ ] SPA 라우팅 규칙 설정
- [ ] 정적 파일 우선 매칭 확인
- [ ] 레거시 URL 리다이렉트 규칙 추가
- [ ] 301 리다이렉트 테스트 (SEO 점수 유지 확인)
- [ ] 보안 헤더 추가 (X-Content-Type-Options, X-Frame-Options 등)
- [ ] CSP 헤더 설정 및 테스트
- [ ] 캐시 정책 설정 (정적 애셋, HTML, API별로 다르게)
- [ ] Vercel 배포 후 동작 확인
- [ ] 크롬 DevTools Network 탭에서 Cache-Control 헤더 확인
- [ ] 보안 헤더 검증 (https://securityheaders.com)
- [ ] JSON 상태 업데이트 완료
