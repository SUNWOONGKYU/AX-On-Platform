# S7F6: 수강신청 관리자 대시보드

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S7F6 |
| Task 이름 | 수강신청 관리자 대시보드 |
| Stage | S7 — 개발 5차 |
| Area | F — Frontend |
| Dependencies | S6F1 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
관리자가 수강신청 현황을 한눈에 파악하고, 수강신청을 승인 또는 거절할 수 있는 대시보드를 제공합니다. 효율적인 신청 관리를 통해 관리 비용을 절감합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S7_개발_5차/Frontend/pages/admin/enrollments.html` | 수강신청 관리 페이지 |
| `Process/S7_개발_5차/Frontend/js/admin-enrollments.js` | 수강신청 관리 로직 |
| `Process/S7_개발_5차/Frontend/css/admin-dashboard.css` | 관리자 대시보드 스타일 |
| `Process/S7_개발_5차/Database/admin_enrollments_rpc.sql` | Supabase RPC 함수 |

## 세부 작업 지시
1. 수강신청 목록 테이블
   - 열 구성: 신청자, 신청 과정, 신청일시, 상태, 액션
   - 각 행 정보:
     - 신청자: 프로필 사진, 이름, 이메일
     - 신청 과정: 강사이름, 과정 제목
     - 신청일시: "2024-01-15 14:30" 형식
     - 상태: 대기 중 (주황), 승인됨 (초록), 거절됨 (빨강) 배지
   - 정렬: 신청일 기준 내림차순
   - 페이지네이션: 20개/페이지

2. 상태 필터링
   - 필터 버튼: "모두" | "대기 중" | "승인됨" | "거절됨"
   - 드롭다운: 과정별 필터 (복수 선택 가능)
   - 날짜 범위: "시작일 ~ 종료일" 피커
   - 검색: 신청자 이름/이메일 키워드 검색
   - 필터 결과: "총 {N}개 신청" 표시

3. 승인/거절 액션
   - 버튼 배치: 각 행 우측에 "승인" | "거절" 버튼
   - 승인 클릭:
     - 확인 모달: "○○ 사용자의 □□ 과정 수강신청을 승인하시겠습니까?"
     - 승인 후: 상태 변경, 안내 이메일 발송
     - 로그: admin_activity_logs에 기록
   - 거절 클릭:
     - 사유 입력 모달: "거절 사유 선택 (또는 입력)"
     - 거절 사유: 선택지 (정원 초과, 조건 미충족, 기타)
     - 거절 후: 상태 변경, 거절 이메일 발송
   - 일괄 작업: 체크박스로 여러 건 선택 후 일괄 승인/거절 가능

4. Supabase RPC 연동
   - RPC 함수 생성: `approve_enrollment(enrollment_id, admin_id)`
   - RPC 함수 생성: `reject_enrollment(enrollment_id, admin_id, reason)`
   - 쿼리: enrollments + users (신청자) + courses (과정) LEFT JOIN
   - RLS 정책: admin 역할만 조회/수정 가능
   - 트랜잭션: 상태 업데이트 + 로그 기록 + 이메일 발송 동시 처리

## 완료 기준
- [ ] enrollments.html 페이지 마크업 완성
- [ ] 수강신청 목록 테이블 구현
- [ ] 상태 필터링 UI 및 로직 구현
- [ ] 승인/거절 모달 및 액션 처리
- [ ] Supabase RPC 함수 생성 및 테스트
- [ ] 일괄 작업 기능 구현
- [ ] admin_activity_logs 기록 확인
- [ ] 관리자 권한 확인 (RLS)
- [ ] JSON 상태 업데이트 완료
