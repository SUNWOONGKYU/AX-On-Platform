# S7E1: 수강 확인 이메일 자동 발송

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S7E1 |
| Task 이름 | 수강 확인 이메일 자동 발송 |
| Stage | S7 — 개발 5차 |
| Area | E — External |
| Dependencies | S6F1, S6E1 |
| 실행 방식 | Automated |
| Task Agent | backend-developer-core |

## 배경 및 목적
수강신청이 승인되었을 때 자동으로 사용자에게 확인 이메일을 발송합니다. 강의 정보, 시작 날짜, 접속 링크 등을 포함하여 사용자의 학습 시작을 촉진합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S7_개발_5차/Email/templates/enrollment-confirmation.html` | 이메일 템플릿 |
| `Process/S7_개발_5차/Backend/functions/send-enrollment-email.js` | Resend/SendGrid 연동 |
| `Process/S7_개발_5차/Database/enrollment_triggers.sql` | 승인 트리거 설정 |
| `Process/S7_개발_5차/Database/email_logs_schema.sql` | 발송 로그 스키마 |

## 세부 작업 지시
1. 이메일 템플릿 작성
   - 파일: `enrollment-confirmation.html`
   - 구성:
     - 헤더: SAL Grid 로고
     - 인사말: "안녕하세요, {user_name}님!"
     - 제목: "수강신청이 승인되었습니다"
     - 강의 정보:
       - 강의명: {course_name}
       - 강사: {instructor_name}
       - 강의 설명: {course_description} (200자 이내)
       - 강의 시작일: {start_date}
       - 강의 기간: {duration} (예: 8주)
       - 강의 난이도: {difficulty}
     - CTA: "강의 시작하기" 버튼 (href: `/courses/{course_id}`)
     - 추가 정보:
       - 시작 전 준비물 (필요한 경우)
       - 문의: 이메일/연락처
     - 푸터: 회사 주소, 구독 취소 링크
   - 디자인:
     - 반응형: 모바일 320px 이상 지원
     - 색상: 기존 브랜드 컬러 사용
     - 폰트: Helvetica, Arial 등 웹 안전 폰트

2. Resend/SendGrid API 연동
   - 사용 서비스: Resend (추천) 또는 SendGrid
   - 환경 변수:
     - RESEND_API_KEY 또는 SENDGRID_API_KEY
     - FROM_EMAIL: "noreply@salgrid.com"
   - 함수: `sendEnrollmentConfirmationEmail(enrollmentId)`
     ```javascript
     async function sendEnrollmentConfirmationEmail(enrollmentId) {
       // 1. enrollments + users + courses 조인으로 데이터 조회
       // 2. 템플릿에 데이터 대입
       // 3. Resend API 호출
       // 4. 발송 결과를 email_logs에 기록
     }
     ```
   - 에러 처리:
     - API 실패 시: 재시도 로직 (3회)
     - 이메일 주소 무효: 로그 기록, 관리자 알림
     - 네트워크 오류: exponential backoff로 재시도

3. 승인 트리거 설정
   - 이벤트: enrollments.status가 'pending'에서 'approved'로 변경
   - 트리거:
     ```sql
     CREATE TRIGGER enrollment_approved
     AFTER UPDATE OF status ON enrollments
     FOR EACH ROW
     WHEN (NEW.status = 'approved' AND OLD.status = 'pending')
     EXECUTE FUNCTION send_enrollment_email(NEW.id);
     ```
   - 처리: Edge Function 또는 Supabase Function으로 `sendEnrollmentConfirmationEmail()` 호출
   - 타이밍: 승인 직후 1초 내 발송 시작

4. 발송 로그 기록
   - 테이블: email_logs
   - 스키마:
     ```sql
     CREATE TABLE email_logs (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       enrollment_id UUID NOT NULL REFERENCES enrollments(id),
       recipient_email VARCHAR(255) NOT NULL,
       email_type VARCHAR(50) NOT NULL,
       status VARCHAR(20) NOT NULL,
       sent_at TIMESTAMP,
       attempt_count INT DEFAULT 1,
       last_error VARCHAR(500),
       created_at TIMESTAMP DEFAULT NOW()
     );
     ```
   - 기록 항목:
     - 수신자 이메일
     - 발송 상태: pending → sent / failed
     - 발송 시간
     - 실패 사유 (실패한 경우)
     - 재시도 횟수
   - 쿼리: 발송 로그 조회, 실패 이메일 재발송

## 완료 기준
- [ ] enrollment-confirmation.html 템플릿 완성
- [ ] 템플릿의 반응형 디자인 테스트 (모바일/데스크톱)
- [ ] Resend 또는 SendGrid API 키 설정
- [ ] sendEnrollmentConfirmationEmail() 함수 구현
- [ ] 트리거 생성 및 테스트
- [ ] email_logs 테이블 생성
- [ ] 발송 테스트 (실제 이메일 수신 확인)
- [ ] 재시도 로직 테스트 (API 실패 시나리오)
- [ ] 로그 기록 확인
- [ ] 발송 실패 시 관리자 알림 설정
- [ ] JSON 상태 업데이트 완료
