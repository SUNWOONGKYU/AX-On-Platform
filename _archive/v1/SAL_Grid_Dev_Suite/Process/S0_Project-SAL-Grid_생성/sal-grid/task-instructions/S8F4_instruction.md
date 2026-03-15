# S8F4: SEO 메타태그 전체 페이지 적용

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S8F4 |
| Task 이름 | SEO 메타태그 전체 페이지 적용 |
| Stage | S8 — 개발 6차 |
| Area | F — Frontend |
| Dependencies | S7F5 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
모든 페이지에 SEO 최적화된 메타태그를 일관되게 적용합니다. 공통 메타태그를 템플릿화하고 페이지별로 동적으로 주입하여 검색 엔진 최적화와 소셜 미디어 공유를 향상시킵니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S8_개발_6차/Frontend/js/seo.js` | SEO 메타태그 관리 함수 |
| `Process/S8_개발_6차/Frontend/public/data/seo-config.json` | 페이지별 SEO 설정 |
| `Process/S8_개발_6차/Frontend/index.html` | 기본 메타태그 |
| `Process/S8_개발_6차/Frontend/pages/**/*.html` | 페이지별 메타태그 |

## 세부 작업 지시
1. 공통 메타태그 템플릿
   - 위치: index.html 또는 공통 base.html
   - 기본 메타태그:
     ```html
     <!-- Character Set -->
     <meta charset="UTF-8">

     <!-- Viewport -->
     <meta name="viewport" content="width=device-width, initial-scale=1.0">

     <!-- Default Title & Description -->
     <title>SAL Grid - 전문가와 함께하는 온라인 학습 커뮤니티</title>
     <meta name="description" content="SAL Grid는 전문가들이 강의하는 온라인 학습 플랫폼입니다. 다양한 분야의 강의를 수강하고, 커뮤니티에 참여하세요.">

     <!-- Canonical -->
     <link rel="canonical" href="https://salgrid.com/">

     <!-- Robots -->
     <meta name="robots" content="index, follow, max-image-preview:large">

     <!-- Language -->
     <meta http-equiv="x-ua-compatible" content="IE=edge">
     <html lang="ko">

     <!-- Theme Color -->
     <meta name="theme-color" content="#007bff">

     <!-- Favicon & Apple Icon -->
     <link rel="icon" type="image/png" href="/favicon.ico">
     <link rel="apple-touch-icon" href="/apple-touch-icon.png">
     ```

2. 페이지별 동적 og 태그
   - Open Graph 메타태그:
     ```html
     <!-- og: title -->
     <meta property="og:title" content="{page_title}">

     <!-- og:description -->
     <meta property="og:description" content="{page_description}">

     <!-- og:image -->
     <meta property="og:image" content="{page_image_url}">
     <meta property="og:image:width" content="1200">
     <meta property="og:image:height" content="630">
     <meta property="og:image:type" content="image/png">

     <!-- og:url -->
     <meta property="og:url" content="{current_url}">

     <!-- og:type -->
     <meta property="og:type" content="website">

     <!-- og:site_name -->
     <meta property="og:site_name" content="SAL Grid">

     <!-- og:locale -->
     <meta property="og:locale" content="ko_KR">
     ```
   - 페이지별 예시:
     - 홈페이지: 일반적인 설명
     - 강의 페이지: 강의 제목, 썸네일, 강사명
     - 전문가 페이지: 전문가 이름, 프로필 사진, 약력
     - 게시글: 게시글 제목, 썸네일 (없으면 기본), 작성자

3. Twitter Card 지원
   - 메타태그:
     ```html
     <!-- twitter:card -->
     <meta name="twitter:card" content="summary_large_image">

     <!-- twitter:title -->
     <meta name="twitter:title" content="{page_title}">

     <!-- twitter:description -->
     <meta name="twitter:description" content="{page_description}">

     <!-- twitter:image -->
     <meta name="twitter:image" content="{page_image_url}">

     <!-- twitter:creator -->
     <meta name="twitter:creator" content="@salgrid">
     ```

4. 구조화 데이터
   - 페이지별 JSON-LD 스키마:
     ```json
     {
       "@context": "https://schema.org",
       "@type": "WebSite",
       "name": "SAL Grid",
       "url": "https://salgrid.com",
       "potentialAction": {
         "@type": "SearchAction",
         "target": "https://salgrid.com/search?q={search_term}",
         "query-input": "required name=search_term"
       }
     }
     ```
   - 강의 페이지:
     ```json
     {
       "@type": "Course",
       "name": "{course_name}",
       "description": "{course_description}",
       "image": "{course_image_url}",
       "instructor": {
         "@type": "Person",
         "name": "{instructor_name}"
       },
       "aggregateRating": {
         "@type": "AggregateRating",
         "ratingValue": "{rating}",
         "reviewCount": "{review_count}"
       }
     }
     ```
   - 게시글 페이지:
     ```json
     {
       "@type": "BlogPosting",
       "headline": "{post_title}",
       "description": "{post_excerpt}",
       "image": "{post_image_url}",
       "datePublished": "{created_at}",
       "dateModified": "{updated_at}",
       "author": {
         "@type": "Person",
         "name": "{author_name}"
       }
     }
     ```

## 완료 기준
- [ ] seo.js 파일 생성 및 메타태그 관리 함수 구현
- [ ] setPageMeta(title, description, imageUrl) 함수 구현
- [ ] setOGTags(ogData) 함수 구현
- [ ] setTwitterCard(twitterData) 함수 구현
- [ ] setStructuredData(schema) 함수 구현
- [ ] seo-config.json 생성 및 페이지별 설정 입력
- [ ] 모든 주요 페이지에 SEO 메타태그 적용
- [ ] Google Rich Results Test에서 구조화 데이터 검증
- [ ] Facebook Share Debugger에서 og 태그 검증
- [ ] Twitter Card Validator에서 Twitter Card 검증
- [ ] PageSpeed Insights에서 최적화 확인
- [ ] JSON 상태 업데이트 완료
