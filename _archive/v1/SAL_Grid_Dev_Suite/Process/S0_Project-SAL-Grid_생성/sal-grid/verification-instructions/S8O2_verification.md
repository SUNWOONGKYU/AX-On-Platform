# S8O2 검증 지시서

## 검증 정보
| 항목 | 값 |
|------|---|
| Task ID | S8O2 |
| Task 이름 | sitemap.xml + robots.txt |
| Verification Agent | code-reviewer-core |

## 검증 체크리스트

### 1. 파일 존재 확인
- [ ] sitemap.xml이 생성되었는가
- [ ] robots.txt가 생성되었는가
- [ ] @task S8O2 주석이 최상단에 있는가

### 2. 코드 품질
- [ ] 하드코딩된 API 키 없음
- [ ] 올바른 XML/텍스트 형식
- [ ] 환경 변수 올바르게 참조

### 3. 기능 검증
- [ ] Sitemap URL 유효성 검증
- [ ] robots.txt 규칙 정상 적용
- [ ] 검색 엔진 크롤링 제어 정상

### 4. 통합 검증
- [ ] S8F4 SEO 메타태그와 일관성
- [ ] 루트 디렉토리 위치 확인
