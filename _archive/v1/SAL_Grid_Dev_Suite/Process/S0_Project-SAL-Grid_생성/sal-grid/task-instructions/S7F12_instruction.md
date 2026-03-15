# S7F12: 사용자 관리 페이지

## Task 정보
- **Task ID**: S7F12
- **Task Name**: 사용자 관리 페이지
- **Stage**: S7 (개발 5차)
- **Area**: F (Frontend)
- **Priority**: High
- **Complexity**: High
- **Execution Type**: AI-Only
- **Task Agent**: frontend-developer
- **Verification Agent**: code-reviewer
- **Dependencies**: S7S1

## Task 목표

관리자가 전체 사용자를 조회·검색·필터링하고, 개별 사용자의 상세 프로필을 확인하며, 역할(admin/moderator/user)을 변경하고, 계정을 정지/복구할 수 있는 통합 사용자 관리 페이지를 구현한다.

## 상세 구현 요구사항

### 1. 사용자 목록 테이블
- 컬럼: 번호, 이름, 이메일, 역할, 가입일, 상태(활성/정지), 액션
- Supabase `profiles` 테이블 + `user_roles` 테이블 JOIN 조회
- 페이지네이션 (20건/페이지)

### 2. 검색 및 필터
- 이름/이메일 키워드 검색
- 역할 필터 (전체 / admin / moderator / user)
- 상태 필터 (전체 / 활성 / 정지)
- 가입일 기간 필터 (시작일 ~ 종료일)

### 3. 사용자 상세 모달
- 프로필 이미지, 이름, 이메일, 가입일, 역할, 상태
- 활동 통계: 작성 게시글 수, 댓글 수, AX 프로젝트 접수 수
- 경고 이력 (warning_logs 테이블)

### 4. 역할 변경
- 드롭다운 선택 (admin / moderator / user)
- user_roles 테이블 UPDATE
- 변경 이력 기록 (admin_activity_logs)

### 5. 계정 정지/복구
- 정지 버튼 클릭 → 사유 입력 모달 → user_blocks 테이블 INSERT
- 복구 버튼 클릭 → user_blocks 테이블 UPDATE (is_active=false)
- 정지 사용자는 목록에서 빨간색 배지로 표시

### 6. 접근 제어
- S7S1의 관리자 Role 기반 접근 제어 활용 (admin 역할만 접근 가능)
- admin-common.js의 인증 체크 함수 재사용

## 기술 스택
- Vanilla HTML/CSS/JS
- Supabase JS Client
- admin-common.css / admin-common.js (S7F11에서 생성)

## 생성/수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `pages/admin/users.html` | 사용자 관리 페이지 |

## 구현 순서

1. 사용자 목록 테이블 렌더링 (Supabase 쿼리)
2. 검색/필터 기능 구현
3. 페이지네이션 구현
4. 상세 모달 구현
5. 역할 변경 / 계정 정지·복구 기능 구현

## 완료 기준

- [ ] 사용자 목록이 Supabase 실데이터 기반으로 렌더링됨
- [ ] 검색/필터가 정상 동작함
- [ ] 역할 변경 시 user_roles 테이블이 업데이트됨
- [ ] 계정 정지 시 user_blocks 테이블이 업데이트됨
- [ ] 비관리자 접근 시 리다이렉트 처리됨
