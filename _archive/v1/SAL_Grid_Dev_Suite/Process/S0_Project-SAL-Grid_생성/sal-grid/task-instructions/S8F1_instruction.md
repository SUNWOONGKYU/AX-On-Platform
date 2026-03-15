# S8F1: PWA 설정 (오프라인 지원)

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S8F1 |
| Task 이름 | PWA 설정 (오프라인 지원) |
| Stage | S8 — 개발 6차 |
| Area | F — Frontend |
| Dependencies | S7F1 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
Progressive Web App(PWA)으로 SAL Grid를 설정하여 오프라인에서도 기본 기능을 사용할 수 있게 합니다. 모바일 앱처럼 설치 가능하고, 네트워크 연결 상태와 관계없이 빠른 로딩을 제공합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S8_개발_6차/Frontend/public/manifest.json` | PWA 매니페스트 |
| `Process/S8_개발_6차/Frontend/public/service-worker.js` | Service Worker 등록 |
| `Process/S8_개발_6차/Frontend/index.html` | Service Worker 등록 스크립트 |
| `Process/S8_개발_6차/Frontend/js/offline-handler.js` | 오프라인 페이지 로직 |
| `Process/S8_개발_6차/Frontend/css/offline.css` | 오프라인 페이지 스타일 |

## 세부 작업 지시
1. manifest.json 작성
   - 파일 위치: `/public/manifest.json`
   - 필수 항목:
     ```json
     {
       "name": "SAL Grid - 온라인 학습 플랫폼",
       "short_name": "SAL Grid",
       "description": "전문가와 함께하는 온라인 학습 커뮤니티",
       "start_url": "/",
       "scope": "/",
       "display": "standalone",
       "orientation": "portrait",
       "background_color": "#ffffff",
       "theme_color": "#007bff",
       "icons": [
         {
           "src": "/icons/icon-192x192.png",
           "sizes": "192x192",
           "type": "image/png"
         },
         {
           "src": "/icons/icon-512x512.png",
           "sizes": "512x512",
           "type": "image/png"
         }
       ],
       "screenshots": [
         {
           "src": "/screenshots/screenshot-1.png",
           "sizes": "540x720",
           "type": "image/png",
           "form_factor": "narrow"
         }
       ]
     }
     ```
   - 아이콘 생성: 192x192px, 512x512px (PNG)
   - 스크린샷: 540x720px (모바일) 및 1280x720px (데스크톱)
   - HTML에 링크: `<link rel="manifest" href="/manifest.json">`

2. Service Worker 등록
   - 파일 위치: `/public/service-worker.js`
   - 기능:
     - Install 단계: 필수 애셋 캐싱 (HTML, CSS, JS, 폰트)
     - Activate 단계: 이전 캐시 삭제
     - Fetch 단계: 캐시 우선 / 네트워크 우선 전략
   - 캐시 전략:
     ```javascript
     // Install 이벤트
     self.addEventListener('install', (event) => {
       event.waitUntil(
         caches.open('v1').then((cache) => {
           return cache.addAll([
             '/',
             '/index.html',
             '/css/style.css',
             '/js/main.js',
             '/offline.html'
           ]);
         })
       );
     });

     // Fetch 이벤트 (캐시 우선)
     self.addEventListener('fetch', (event) => {
       event.respondWith(
         caches.match(event.request).then((response) => {
           return response || fetch(event.request);
         }).catch(() => {
           return caches.match('/offline.html');
         })
       );
     });
     ```
   - HTML 등록:
     ```javascript
     if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('/service-worker.js');
     }
     ```

3. 오프라인 캐시 전략
   - 전략 1: Cache First (캐시 우선, 네트워크 폴백)
     - 적용: 정적 애셋 (CSS, JS, 이미지)
     - 효과: 빠른 로딩
   - 전략 2: Network First (네트워크 우선, 캐시 폴백)
     - 적용: API 요청, 동적 콘텐츠
     - 효과: 항상 최신 데이터 시도
   - 전략 3: Stale While Revalidate
     - 적용: 자주 변경되지 않는 데이터 (강의 목록)
     - 효과: 즉시 캐시된 버전 제공, 백그라운드에서 갱신
   - 캐시 만료: 7일 이상 오래된 캐시 삭제

4. 설치 프롬프트
   - 사용자가 설치 가능하면 "홈 화면에 추가" 프롬프트 표시
   - 구현:
     ```javascript
     let deferredPrompt;
     window.addEventListener('beforeinstallprompt', (e) => {
       e.preventDefault();
       deferredPrompt = e;
       // "설치" 버튼 표시
       document.getElementById('install-btn').style.display = 'block';
     });

     document.getElementById('install-btn').addEventListener('click', async () => {
       if (deferredPrompt) {
         deferredPrompt.prompt();
         const { outcome } = await deferredPrompt.userChoice;
         deferredPrompt = null;
       }
     });
     ```
   - 위치: 헤더 또는 사이드바에 "앱 설치" 버튼

## 완료 기준
- [ ] manifest.json 작성 및 검증
- [ ] 아이콘 이미지 생성 (192x192, 512x512)
- [ ] 스크린샷 이미지 생성 (540x720, 1280x720)
- [ ] Service Worker 파일 생성
- [ ] Service Worker 등록 스크립트 HTML에 삽입
- [ ] 캐시 전략 구현 및 테스트
- [ ] 오프라인 페이지 (offline.html) 생성
- [ ] 설치 프롬프트 구현
- [ ] 크롬 DevTools에서 PWA 동작 확인
- [ ] 실제 모바일 기기에서 설치 테스트
- [ ] 오프라인 상태에서 캐시된 페이지 조회 확인
- [ ] JSON 상태 업데이트 완료
