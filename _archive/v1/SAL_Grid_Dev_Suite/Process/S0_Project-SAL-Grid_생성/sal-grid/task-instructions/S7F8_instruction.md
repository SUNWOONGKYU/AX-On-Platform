# S7F8: 신고/차단 관리자 대시보드

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S7F8 |
| Task 이름 | 신고/차단 관리자 대시보드 |
| Stage | S7 — 개발 5차 |
| Area | F — Frontend |
| Dependencies | S6F3 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
플랫폼 내 부적절한 콘텐츠/사용자에 대한 신고를 관리하고, 신속한 처리 및 사용자 차단을 통해 커뮤니티의 건강성을 유지합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S7_개발_5차/Frontend/pages/admin/reports.html` | 신고 관리 페이지 |
| `Process/S7_개발_5차/Frontend/pages/admin/blocked-users.html` | 차단 사용자 관리 페이지 |
| `Process/S7_개발_5차/Frontend/js/admin-reports.js` | 신고 관리 로직 |
| `Process/S7_개발_5차/Database/admin_reports_rpc.sql` | Supabase RPC 함수 |

## 세부 작업 지시
1. 신고 목록 + 상세 보기
   - 목록 열 구성: 신고자, 신고 대상, 신고 사유, 신고일, 상태, 액션
   - 각 행 정보:
     - 신고자: 사용자 이름, 이메일 (익명 선택 가능)
     - 신고 대상: 사용자 이름 또는 게시물 제목
     - 신고 사유: "욕설/혐오" | "스팸" | "불법 내용" | "개인정보 노출" | "기타"
     - 신고일: "3시간 전", "2024-01-10" 형식
     - 상태: 대기 (주황) | 처리 중 (파랑) | 완료 (초록) 배지
   - 상세 보기:
     - 신고 내용/증거 표시
     - 신고 대상 콘텐츠 미리보기 (게시물인 경우)
     - 신고자 정보 (익명 제외)

2. 처리 액션(경고/차단/무시)
   - 경고 (Warning):
     - 대상 사용자에게 경고 메시지 발송
     - 경고 기록: users 테이블의 warning_count 증가
     - 3회 경고 시 자동 7일 임시 차단
   - 차단 (Ban):
     - 차단 기간 선택: 3일 | 7일 | 30일 | 영구 차단
     - 차단 사유: 위의 신고 사유 중 선택 또는 직접 입력
     - 효과: 사용자의 게시/댓글/강의 수강 불가
     - 차단 이메일: 차단 기간과 사유 안내
   - 무시 (Dismiss):
     - 신고 사실이 없다고 판단되는 경우
     - 신고 상태: "dismissed"로 변경
     - 신고자에게는 별도 통지 없음

3. 차단 사용자 목록
   - 열 구성: 차단된 사용자, 차단 사유, 차단 기간, 차단일, 액션
   - 각 행 정보:
     - 차단된 사용자: 프로필 사진, 이름, 이메일
     - 차단 사유: 신고 사유 또는 관리자 지정 사유
     - 차단 기간: "3일 (01-18 해제)", "영구" 표시
     - 차단일: 차단 시작 일시
   - 액션:
     - 조기 해제: "해제" 버튼 (해제 사유 입력)
     - 기간 연장: "연장" 버튼 (추가 기간 선택)
     - 상세: 차단 사유/신고 내용 조회

4. Supabase 연동
   - 테이블: reports (id, reporter_id, reported_user_id, reported_content_type, reported_content_id, reason, status, created_at, resolved_at, admin_id, resolution)
   - 테이블: user_blocks (id, user_id, blocked_at, block_until, block_reason, admin_id)
   - 테이블: warning_logs (id, user_id, admin_id, reason, created_at)
   - RPC 함수: `process_report(report_id, admin_id, action, block_duration, reason)`
   - RPC 함수: `unblock_user(user_id, admin_id, reason)`
   - RLS 정책: admin 역할만 접근 가능
   - 트리거: block 생성 시 user_status를 "blocked"로 업데이트
   - 자동 해제: block_until 시간 도래 시 자동으로 status 복구 (예약 함수)

## 완료 기준
- [ ] reports.html 신고 관리 페이지 마크업 완성
- [ ] blocked-users.html 차단 사용자 페이지 마크업 완성
- [ ] 신고 목록 테이블 및 상세 보기 구현
- [ ] 경고/차단/무시 액션 모달 구현
- [ ] 차단 사용자 목록 및 관리 구현
- [ ] Supabase RPC 함수 생성
- [ ] 자동 차단/해제 트리거 생성
- [ ] 경고 누적 자동 차단 로직 구현
- [ ] 차단 해제/연장 기능 테스트
- [ ] JSON 상태 업데이트 완료
