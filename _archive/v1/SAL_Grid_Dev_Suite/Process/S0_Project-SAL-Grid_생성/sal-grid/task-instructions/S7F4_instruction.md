# S7F4: 게시판 페이지네이션 구현

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S7F4 |
| Task 이름 | 게시판 페이지네이션 구현 |
| Stage | S7 — 개발 5차 |
| Area | F — Frontend |
| Dependencies | S6F5 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
지식허브/커뮤니티 게시판에 페이지네이션 및 무한스크롤 옵션을 추가하여 대량의 게시물을 효율적으로 관리하고 사용자 경험을 개선합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S7_개발_5차/Frontend/pages/community/index.html` | 페이지네이션 UI |
| `Process/S7_개발_5차/Frontend/pages/knowledge-hub/index.html` | 페이지네이션 UI |
| `Process/S7_개발_5차/Frontend/js/pagination.js` | 페이지네이션 컴포넌트 |
| `Process/S7_개발_5차/Frontend/css/pagination.css` | 페이지네이션 스타일 |

## 세부 작업 지시
1. 페이지네이션 컴포넌트 구현
   - 페이지 크기: 20개 항목/페이지 (사용자 선택 가능: 10, 20, 50)
   - UI: "이전 < 1 2 3 ... 10 > 다음" 형식
   - 활성 페이지: 하이라이트 처리 (배경색 변경)
   - 첫/마지막 페이지에서: 이전/다음 버튼 비활성화
   - 반응형: 모바일에서 숫자 페이지 축약 ("..." 표시)

2. 무한스크롤 옵션
   - 토글 버튼: 페이지네이션 ↔ 무한스크롤 전환
   - IntersectionObserver API: 사용자가 페이지 끝에 도달하면 다음 페이지 자동 로드
   - 로딩 인디케이터: 로드 중 상태 표시
   - 더 이상 항목 없음: 마지막 페이지 도달 시 메시지 표시

3. URL 파라미터 동기화
   - 쿼리 스트링: `?page=1&pageSize=20&sort=recent` 형식
   - 히스토리 API: window.history.pushState로 URL 업데이트
   - 뒤로가기: 이전 페이지/페이지 크기로 복원
   - 북마크 지원: URL 직접 입력 시 해당 페이지에서 시작

4. 로딩 인디케이터
   - 스켈레톤 로딩: 게시물 항목 위치에 회색 placeholder 표시
   - 로딩 바: 상단에 프로그레스 바 표시 (1-3초)
   - 취소 버튼: 로딩 중 취소 옵션 제공
   - 에러 처리: 로드 실패 시 재시도 버튼

## 완료 기준
- [ ] 페이지네이션 컴포넌트 구현 및 스타일링
- [ ] 무한스크롤 옵션 구현
- [ ] URL 파라미터 동기화 기능
- [ ] IntersectionObserver 로드 트리거
- [ ] 로딩 인디케이터 UI 및 로직
- [ ] 페이지 크기 변경 기능 테스트
- [ ] 모바일/데스크톱 반응형 테스트
- [ ] JSON 상태 업데이트 완료
