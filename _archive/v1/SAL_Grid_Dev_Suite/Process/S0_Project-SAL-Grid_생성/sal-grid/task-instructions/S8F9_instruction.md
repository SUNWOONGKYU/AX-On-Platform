# S8F9: 관리자 활동 로그 뷰어

## Task 정보
- **Task ID**: S8F9
- **Task Name**: 관리자 활동 로그 뷰어
- **Stage**: S8 (개발 6차)
- **Area**: F (Frontend)
- **Priority**: Medium
- **Complexity**: Low
- **Execution Type**: AI-Only
- **Task Agent**: frontend-developer
- **Verification Agent**: code-reviewer
- **Dependencies**: S7S1

## Task 목표

관리자가 수행한 모든 액션의 이력을 시간순으로 조회할 수 있는 감사(audit) 로그 페이지를 구현한다. admin_activity_logs 테이블을 기반으로 한다.

## 상세 구현 요구사항

### 1. 로그 목록 테이블
- 컬럼: 번호, 액션 타입, 대상, 수행 관리자, 수행 일시, 상세 내용
- admin_activity_logs 테이블 조회 (최신순 정렬)
- 페이지네이션 (50건/페이지)

### 2. 액션 타입 필터
- 역할 변경 (role_change)
- 사용자 차단 (user_block)
- 사용자 차단 해제 (user_unblock)
- 게시글 삭제 (post_delete)
- 게시글 복구 (post_restore)
- 댓글 삭제 (comment_delete)
- 신고 처리 (report_handle)
- 공지사항 CRUD (announcement_create/update/delete)

### 3. 관리자별 필터
- 드롭다운 (전체 관리자 / 특정 관리자 선택)
- admin_activity_logs JOIN profiles 테이블

### 4. 날짜 범위 필터
- 시작일 ~ 종료일 date picker
- 빠른 선택: 오늘 / 최근 7일 / 최근 30일

### 5. 로그 상세 보기
- 행 클릭 시 상세 정보 모달
- before_value / after_value (변경 전후) 표시 (JSON 형태)
- IP 주소, User Agent (수집 시)

### 6. 내보내기 (선택 사항)
- CSV 다운로드 버튼 (현재 필터 결과 기준)

## 기술 스택
- Vanilla HTML/CSS/JS
- Supabase JS Client
- admin-common.css / admin-common.js

## 생성/수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `pages/admin/activity-log.html` | 관리자 활동 로그 뷰어 |

## 완료 기준

- [ ] 로그 목록이 admin_activity_logs 테이블 기반으로 정상 렌더링됨
- [ ] 액션 타입, 관리자, 날짜 필터가 정상 동작함
- [ ] 상세 모달이 정상 표시됨
- [ ] 비관리자 접근 시 리다이렉트 처리됨
