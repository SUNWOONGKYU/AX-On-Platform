# S7F9: 지식허브 카테고리/태그 확장

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S7F9 |
| Task 이름 | 지식허브 카테고리/태그 확장 |
| Stage | S7 — 개발 5차 |
| Area | F — Frontend |
| Dependencies | S6F5 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
지식허브 콘텐츠를 카테고리와 태그로 분류하여 사용자가 쉽게 관심 있는 콘텐츠를 발견할 수 있도록 합니다. 태그 기반 필터링과 관련 콘텐츠 추천으로 사용성을 높입니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S7_개발_5차/Frontend/pages/knowledge-hub/index.html` | 카테고리 사이드바 추가 |
| `Process/S7_개발_5차/Frontend/pages/knowledge-hub/[category].html` | 카테고리별 페이지 |
| `Process/S7_개발_5차/Frontend/js/knowledge-hub.js` | 카테고리/태그 필터링 로직 |
| `Process/S7_개발_5차/Frontend/css/knowledge-hub.css` | 스타일 확장 |
| `Process/S7_개발_5차/Database/knowledge_hub_schema.sql` | 카테고리/태그 테이블 |

## 세부 작업 지시
1. 카테고리 사이드바
   - 위치: 지식허브 페이지 좌측
   - 구조: 대분류 > 소분류 (2 레벨)
   - 기본 카테고리:
     - Programming: Python, JavaScript, Java, C++
     - Data Science: Machine Learning, Statistics, Data Analysis
     - Web Development: Frontend, Backend, Full Stack
     - DevOps: Docker, Kubernetes, CI/CD
     - Cloud: AWS, Azure, Google Cloud
   - UI:
     - 각 카테고리에 아이콘 및 콘텐츠 수 표시
     - 선택 시 해당 카테고리 콘텐츠로 필터링
     - 활성 상태: 배경색 변경
     - 모바일: 토글 버튼으로 열기/닫기

2. 태그 필터링
   - 태그 클라우드: 인기도에 따라 크기 다르게 표시
   - 다중 선택: 여러 태그 동시 선택 가능 (OR 조건)
   - 필터 칩: 선택된 태그를 칩 형식으로 상단에 표시
   - 태그 제거: 칩의 X 버튼으로 해제
   - 필터 초기화: "필터 초기화" 버튼

3. 관련 콘텐츠 추천
   - 현재 글 상세 페이지 하단에 배치
   - "관련된 글" 섹션: 같은 태그를 가진 다른 글 4-6개
   - 알고리즘: 공통 태그 수 + 조회수 기반 정렬
   - 카드 형식: 썸네일, 제목, 작성자, 조회수
   - 클릭: 해당 글로 이동

4. 태그 클라우드
   - 위치: 지식허브 메인 페이지 또는 사이드바 하단
   - 구성: 인기 태그 20-30개 표시
   - 크기: 사용 빈도에 따라 font-size 조정 (12px ~ 24px)
   - 색상: 기본(회색) → 마우스 오버 시 primary 색상으로 변경
   - 호버 이펙트: 태그 아래에 "포함된 글 {N}개" 표시
   - 클릭: 해당 태그로 필터링

## 완료 기준
- [ ] categories, article_tags, article_tag_mapping 테이블 생성
- [ ] 카테고리 사이드바 마크업 및 스타일링 완료
- [ ] 카테고리 필터링 로직 구현
- [ ] 태그 필터링 UI 및 로직 구현
- [ ] 태그 클라우드 생성 알고리즘 구현
- [ ] 관련 콘텐츠 추천 로직 구현
- [ ] 모바일 반응형 테스트 (사이드바 토글)
- [ ] 성능 최적화 (태그 캐싱)
- [ ] JSON 상태 업데이트 완료
