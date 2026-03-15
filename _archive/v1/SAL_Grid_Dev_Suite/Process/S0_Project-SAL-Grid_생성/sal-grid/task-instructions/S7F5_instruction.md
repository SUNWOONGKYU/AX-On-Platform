# S7F5: 전문가 SEO 개별 URL 페이지

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S7F5 |
| Task 이름 | 전문가 SEO 개별 URL 페이지 |
| Stage | S7 — 개발 5차 |
| Area | F — Frontend |
| Dependencies | S6F4 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
각 전문가마다 고유한 URL(/experts/{slug})을 제공하고, SEO 최적화를 통해 검색 엔진에서 발견 가능하도록 구성합니다. 구조화 데이터를 추가하여 Google Rich Snippets에 노출되도록 합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S7_개발_5차/Frontend/pages/experts/[slug].html` | 동적 전문가 프로필 페이지 |
| `Process/S7_개발_5차/Frontend/js/expert-detail.js` | 전문가 상세 데이터 로드 |
| `Process/S7_개발_5차/Frontend/js/seo.js` | SEO 메타태그 삽입 함수 |
| `Process/S7_개발_5차/Frontend/public/structured-data.json` | JSON-LD 구조화 데이터 |

## 세부 작업 지시
1. 전문가 상세 페이지 템플릿
   - URL 패턴: `/experts/{slug}` (예: `/experts/john-doe-python-expert`)
   - 페이지 구성:
     - 헤더: 전문가 프로필 사진, 이름, 타이틀
     - 소개: 약력, 전문 분야, 경력 years
     - 통계: 수강생 수, 총 코스, 평점
     - 코스 목록: 해당 전문가가 강의하는 코스 (카드 형식)
     - CTA: "강의 수강하기" 버튼
     - 하단: 연락처, 소셜 링크 (포트폴리오, GitHub 등)

2. SEO 메타태그 동적 삽입
   - Title: `{전문가이름} | {전공} | SAL Grid`
   - Description: 150자 제한, 약력 및 전공 요약
   - og:title, og:description, og:image (프로필 사진)
   - og:url: 페이지의 정규 URL
   - Canonical 태그: `<link rel="canonical" href="https://your-domain.com/experts/{slug}">`
   - robots: `index, follow, max-image-preview:large`
   - viewport: 반응형 메타태그 포함

3. 구조화 데이터 (JSON-LD)
   - Person 스키마: 이름, 이메일, 직급, 사진
   - AggregateRating: 평점, 리뷰 수
   - Organization: SAL Grid 정보 (로고, 연락처)
   - BreadcrumbList: 네비게이션 경로 (Home > Experts > {Name})
   - 예시 구조화 데이터:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "Person",
     "name": "John Doe",
     "jobTitle": "Python Expert",
     "image": "https://...",
     "aggregateRating": {
       "@type": "AggregateRating",
       "ratingValue": "4.8",
       "reviewCount": "120"
     }
   }
   ```

4. 소셜 공유 최적화
   - Twitter Card: summary_large_image 카드 타입
   - og:image 크기: 1200x630px 권장
   - 공유 버튼: Facebook, Twitter, LinkedIn 공유 버튼
   - WhatsApp: 공유 시 이름과 약력 포함
   - Slack: 썸네일 이미지 표시

## 완료 기준
- [ ] 동적 라우팅 설정 ([slug].html) 완료
- [ ] 전문가 데이터 페칭 및 렌더링
- [ ] SEO 메타태그 동적 삽입 (title, description, og)
- [ ] JSON-LD 구조화 데이터 생성
- [ ] Canonical URL 설정
- [ ] 소셜 공유 버튼 구현
- [ ] Google Rich Results Test에서 검증
- [ ] 모바일 반응형 테스트
- [ ] JSON 상태 업데이트 완료
