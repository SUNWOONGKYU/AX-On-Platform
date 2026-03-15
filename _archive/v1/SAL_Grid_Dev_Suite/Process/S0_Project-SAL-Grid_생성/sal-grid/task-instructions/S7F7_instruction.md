# S7F7: 문의 관리자 대시보드

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S7F7 |
| Task 이름 | 문의 관리자 대시보드 |
| Stage | S7 — 개발 5차 |
| Area | F — Frontend |
| Dependencies | S6F2 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
관리자가 사용자로부터의 문의를 효율적으로 관리하고, 신속하게 답변할 수 있는 대시보드를 제공합니다. 문의-답변의 전체 생명 주기를 추적하고 관리합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S7_개발_5차/Frontend/pages/admin/inquiries.html` | 문의 관리 페이지 |
| `Process/S7_개발_5차/Frontend/pages/admin/inquiry-detail.html` | 문의 상세 페이지 |
| `Process/S7_개발_5차/Frontend/js/admin-inquiries.js` | 문의 관리 로직 |
| `Process/S7_개발_5차/Database/admin_inquiries_rpc.sql` | Supabase RPC 함수 |

## 세부 작업 지시
1. 문의 목록 + 상세 보기
   - 목록 열 구성: 문의자, 제목, 카테고리, 작성일, 상태, 액션
   - 각 행 정보:
     - 문의자: 이름, 이메일
     - 제목: 최대 50자 표시
     - 카테고리: "강의 관련" | "기술 지원" | "결제" | "기타"
     - 작성일: "3일 전", "2024-01-10" 형식
     - 상태: 대기 중 (주황), 답변 완료 (초록) 배지
   - 목록 클릭: 상세 페이지로 이동 또는 모달 팝업
   - 상세 보기:
     - 전문의 내용 표시
     - 첨부파일 있으면 다운로드 링크
     - 작성자 정보 (프로필 사진, 이메일, 연락처)

2. 답변 작성 폼
   - 에디터: Rich Text Editor (Quill.js 또는 TinyMCE)
   - 서식 지원: 볼드, 이탤릭, 언더라인, 링크, 리스트
   - 템플릿: "감사합니다", "안내드립니다" 등 자주 쓰는 답변 저장 및 로드
   - 첨부파일: 이미지/PDF 첨부 가능 (최대 5MB)
   - 버튼: "임시 저장" | "답변 발송"
   - 미리보기: 답변 내용 미리보기

3. 상태 관리(대기/답변완료)
   - 상태 변경: 답변 발송 시 자동으로 "답변 완료"로 변경
   - 재열기: "답변 완료"된 문의에 대해 사용자의 재작성 시 "대기 중"으로 변경
   - 상태 필터: "모두" | "대기 중" | "답변 완료"
   - 정렬: 최신순, 오래된순, 상태별
   - 검색: 제목/본문/문의자 이름으로 검색

4. Supabase 연동
   - 테이블: inquiries (id, user_id, title, content, category, status, created_at, updated_at)
   - 테이블: inquiry_responses (id, inquiry_id, admin_id, response_content, created_at)
   - 쿼리: inquiries + inquiry_responses (LEFT JOIN)
   - RPC 함수: `submit_inquiry_response(inquiry_id, admin_id, response_content, attachment_url)`
   - RLS 정책: admin 역할만 조회/수정, 사용자는 자신의 문의만 조회
   - 트리거: response 저장 시 inquiries의 status를 "answered"로 자동 업데이트
   - 알림: 답변 발송 시 사용자에게 이메일 통지

## 완료 기준
- [ ] inquiries.html 목록 페이지 마크업 완성
- [ ] inquiry-detail.html 상세 페이지 마크업 완성
- [ ] 문의 목록 테이블 및 필터링 구현
- [ ] Rich Text Editor 답변 폼 구현
- [ ] 템플릿 저장/로드 기능 구현
- [ ] Supabase RPC 함수 생성
- [ ] 상태 자동 업데이트 트리거 생성
- [ ] 이메일 발송 로직 구현
- [ ] 첨부파일 업로드 기능 테스트
- [ ] JSON 상태 업데이트 완료
