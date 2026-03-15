# S8F5: 이미지 Lazy Loading 최적화

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S8F5 |
| Task 이름 | 이미지 Lazy Loading 최적화 |
| Stage | S8 — 개발 6차 |
| Area | F — Frontend |
| Dependencies | S6F4 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
페이지 로딩 성능을 향상시키기 위해 이미지를 지연 로드(Lazy Loading)합니다. 초기 페이지 로드 시 뷰포트에 보이는 이미지만 로드하고, 사용자 스크롤 시 필요한 이미지를 동적으로 로드합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S8_개발_6차/Frontend/js/lazy-loading.js` | Lazy Loading 구현 |
| `Process/S8_개발_6차/Frontend/css/placeholder.css` | 플레이스홀더 스타일 |
| `Process/S8_개발_6차/Frontend/pages/**/*.html` | loading="lazy" 속성 추가 |

## 세부 작업 지시
1. loading="lazy" 적용
   - HTML 마크업:
     ```html
     <!-- 기본 적용 -->
     <img src="/images/course-001.jpg" alt="강의명" loading="lazy">

     <!-- picture 태그와 함께 (반응형 이미지) -->
     <picture>
       <source srcset="/images/course-001-small.webp" media="(max-width: 576px)">
       <source srcset="/images/course-001-medium.webp" media="(max-width: 992px)">
       <img src="/images/course-001.jpg" alt="강의명" loading="lazy">
     </picture>
     ```
   - 적용 대상:
     - 강의 썸네일 이미지
     - 게시글 이미지
     - 전문가 프로필 이미지 (스크롤 시)
     - 사용자 아바타 (리스트에서)
   - 예외: 위에서 보이는 이미지 (hero, 헤더)는 `loading="eager"` 또는 생략

2. IntersectionObserver 폴백
   - 구현:
     ```javascript
     export function initLazyLoading() {
       if ('IntersectionObserver' in window) {
         // 모던 브라우저: IntersectionObserver 사용
         const imageObserver = new IntersectionObserver((entries, observer) => {
           entries.forEach(entry => {
             if (entry.isIntersecting) {
               const img = entry.target;
               img.src = img.dataset.src;
               img.srcset = img.dataset.srcset || '';
               img.classList.add('lazy-loaded');
               observer.unobserve(img);
             }
           });
         }, {
           rootMargin: '50px' // 50px 전에 로드 시작
         });

         document.querySelectorAll('img[data-src]').forEach(img => {
           imageObserver.observe(img);
         });
       } else {
         // 폴백: 모든 이미지 즉시 로드
         document.querySelectorAll('img[data-src]').forEach(img => {
           img.src = img.dataset.src;
           img.srcset = img.dataset.srcset || '';
         });
       }
     }
     ```
   - HTML 마크업:
     ```html
     <!-- loading="lazy"를 지원하지 않는 경우 -->
     <img
       src="/images/placeholder.gif"
       data-src="/images/course-001.jpg"
       data-srcset="/images/course-001-small.jpg 480w, /images/course-001-large.jpg 1200w"
       alt="강의명"
       class="lazy"
     >
     ```

3. 이미지 플레이스홀더
   - 플레이스홀더 전략:
     - 기본: 회색 배경 (LQIP - Low Quality Image Placeholder)
     - 블러 이미지: 원본의 10% 크기, 흐린 버전
     - 색상 도미넌트: 원본 이미지의 평균 색상
   - CSS 스타일:
     ```css
     .lazy {
       background-color: #e0e0e0;
       background-image: url('/images/placeholder-loading.gif');
       background-position: center;
       background-repeat: no-repeat;
       opacity: 0.7;
       transition: opacity 0.3s ease-in-out;
     }

     .lazy-loaded {
       opacity: 1;
       background-image: none;
     }
     ```
   - 플레이스홀더 이미지 생성:
     - 도구: ImageMagick, Sharp (Node.js)
     - 크기: 원본의 1-2% (예: 1200px → 20px)

4. WebP 변환 가이드
   - 구현: picture 태그로 WebP 우선 제공
     ```html
     <picture>
       <!-- WebP (모던 브라우저) -->
       <source srcset="/images/course-001.webp" type="image/webp">
       <!-- 폴백 (구형 브라우저) -->
       <img src="/images/course-001.jpg" alt="강의명" loading="lazy">
     </picture>
     ```
   - WebP 변환 도구:
     - cwebp (커맨드라인)
     - Sharp (Node.js)
     - Vercel Image Optimization (배포 시 자동)
   - 파일 크기: JPG 대비 25-35% 감소
   - CDN: 이미지 최적화 서비스 (Vercel, Cloudflare, ImageKit 등) 사용 권장

## 완료 기준
- [ ] loading="lazy" 속성을 모든 이미지에 추가
- [ ] lazy-loading.js 파일 생성 및 IntersectionObserver 구현
- [ ] initLazyLoading() 함수를 모든 페이지에서 호출
- [ ] 플레이스홀더 CSS 스타일 작성
- [ ] LQIP 이미지 생성 (각 섹션별 대표 이미지)
- [ ] picture 태그로 WebP 변환된 이미지 제공
- [ ] 초기 로딩 시간 측정 및 개선 확인 (First Contentful Paint 20% 감소 목표)
- [ ] Chrome DevTools에서 lazy loading 동작 확인
- [ ] 모바일 네트워크 스로틀링 환경에서 테스트
- [ ] Lighthouse 성능 점수 확인 (Performance > 75)
- [ ] JSON 상태 업데이트 완료
