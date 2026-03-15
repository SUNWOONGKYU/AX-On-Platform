# S8F3: experts JSON 데이터 통합 관리

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S8F3 |
| Task 이름 | experts JSON 데이터 통합 관리 |
| Stage | S8 — 개발 6차 |
| Area | F — Frontend |
| Dependencies | S7F5 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
전문가 정보를 중앙의 JSON 파일에서 관리하여 여러 페이지에서 일관되게 사용할 수 있도록 합니다. 데이터 스키마를 정의하고, 각 페이지에서 fetch로 동적으로 로드하여 유지보수성을 높입니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S8_개발_6차/Frontend/public/data/experts.json` | 전문가 데이터 중앙 저장소 |
| `Process/S8_개발_6차/Frontend/js/experts-data.js` | 데이터 로드 및 캐싱 함수 |
| `Process/S8_개발_6차/Frontend/pages/experts/index.html` | 전문가 목록 페이지 |
| `Process/S8_개발_6차/Frontend/pages/experts/[slug].html` | 전문가 상세 페이지 |

## 세부 작업 지시
1. experts.json 중앙 데이터 파일 정리
   - 파일 위치: `/public/data/experts.json`
   - 구조:
     ```json
     {
       "version": "1.0.0",
       "lastUpdated": "2024-01-15T10:30:00Z",
       "experts": [
         {
           "id": "expert-001",
           "slug": "john-doe-python",
           "name": "John Doe",
           "title": "Python & Data Science Expert",
           "bio": "10년 이상의 파이썬 경험, 데이터 사이언스 전문가",
           "email": "john@example.com",
           "imageUrl": "/images/experts/john-doe.jpg",
           "specialty": ["Python", "Machine Learning", "Data Analysis"],
           "experience": 10,
           "rating": 4.8,
           "reviewCount": 120,
           "students": 5000,
           "courses": 15,
           "socialLinks": {
             "portfolio": "https://johndoe.com",
             "github": "https://github.com/johndoe",
             "linkedin": "https://linkedin.com/in/johndoe"
           },
           "courseIds": ["course-001", "course-002"],
           "certifications": ["Python Professional", "AWS Certified"],
           "description": "상세한 약력 및 경험 설명"
         }
       ]
     }
     ```
   - 스키마 검증: JSON Schema 또는 TypeScript 인터페이스로 검증
     ```typescript
     interface Expert {
       id: string;
       slug: string;
       name: string;
       title: string;
       bio: string;
       email: string;
       imageUrl: string;
       specialty: string[];
       experience: number;
       rating: number;
       reviewCount: number;
       students: number;
       courses: number;
       socialLinks: {
         portfolio?: string;
         github?: string;
         linkedin?: string;
       };
       courseIds: string[];
       certifications: string[];
       description: string;
     }
     ```

2. 각 페이지에서 fetch로 로드
   - 함수: `fetchExperts()` 및 `fetchExpertBySlug(slug)`
   - 구현:
     ```javascript
     // experts-data.js
     let expertsCache = null;
     const CACHE_DURATION = 3600000; // 1시간

     export async function fetchExperts() {
       if (expertsCache && Date.now() - expertsCache.timestamp < CACHE_DURATION) {
         return expertsCache.data;
       }
       const response = await fetch('/data/experts.json');
       const data = await response.json();
       expertsCache = { data: data.experts, timestamp: Date.now() };
       return data.experts;
     }

     export async function fetchExpertBySlug(slug) {
       const experts = await fetchExperts();
       return experts.find(e => e.slug === slug);
     }
     ```
   - 사용 예:
     ```javascript
     // 전문가 목록 페이지
     const experts = await fetchExperts();
     renderExpertsList(experts);

     // 전문가 상세 페이지
     const expert = await fetchExpertBySlug(slug);
     renderExpertDetail(expert);
     ```

3. 데이터 스키마 정의
   - 필수 필드: id, slug, name, title, bio, imageUrl
   - 선택 필드: email, socialLinks, certifications
   - 유효성 검증:
     - slug: 유일해야 함, URL 친화적 (소문자, 하이픈)
     - email: RFC 5322 형식
     - imageUrl: 유효한 URL
     - experience: 양수 정수
     - rating: 0 ~ 5 범위
   - 타입 검사: TypeScript 또는 런타임 검증 (Zod, Joi)

4. 검색/필터 지원
   - 검색 함수:
     ```javascript
     export function searchExperts(experts, keyword) {
       return experts.filter(e =>
         e.name.toLowerCase().includes(keyword.toLowerCase()) ||
         e.title.toLowerCase().includes(keyword.toLowerCase()) ||
         e.specialty.some(s => s.toLowerCase().includes(keyword.toLowerCase()))
       );
     }
     ```
   - 필터 함수:
     ```javascript
     export function filterExperts(experts, filters) {
       return experts.filter(e => {
         if (filters.minRating && e.rating < filters.minRating) return false;
         if (filters.specialty && !e.specialty.includes(filters.specialty)) return false;
         if (filters.minExperience && e.experience < filters.minExperience) return false;
         return true;
       });
     }
     ```
   - 정렬:
     ```javascript
     export function sortExperts(experts, sortBy) {
       const sorted = [...experts];
       switch (sortBy) {
         case 'rating': return sorted.sort((a, b) => b.rating - a.rating);
         case 'students': return sorted.sort((a, b) => b.students - a.students);
         case 'name': return sorted.sort((a, b) => a.name.localeCompare(b.name));
         default: return sorted;
       }
     }
     ```

## 완료 기준
- [ ] experts.json 파일 생성 및 모든 전문가 데이터 입력
- [ ] JSON 스키마 정의 및 검증 규칙 구현
- [ ] fetchExperts() 및 fetchExpertBySlug() 함수 구현
- [ ] 메모리 캐싱 기능 구현 (1시간 TTL)
- [ ] 검색 함수 구현 및 테스트
- [ ] 필터 함수 구현 및 테스트
- [ ] 정렬 함수 구현 및 테스트
- [ ] 전문가 목록 페이지 렌더링 확인
- [ ] 전문가 상세 페이지 렌더링 확인
- [ ] experts.json 파일 크기 최적화 (gzip 압축 < 50KB)
- [ ] JSON 상태 업데이트 완료
