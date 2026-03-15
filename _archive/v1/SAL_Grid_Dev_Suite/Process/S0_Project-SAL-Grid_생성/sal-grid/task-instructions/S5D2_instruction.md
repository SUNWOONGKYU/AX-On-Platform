# S5D2: 누락 테이블 4개 마이그레이션 추가

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S5D2 |
| Task 이름 | 누락 테이블 4개 마이그레이션 추가 |
| Stage | S5 — 개발 3차 |
| Area | D — Database |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | claude-sonnet-4-6 |

## 배경 및 목적

`expert_applications`, `enrollments`, `contact_inquiries`, `reports` 테이블이 마이그레이션 파일에 정의되지 않아 4개 폼(전문가 등록 신청, 수강신청, 문의 접수, 신고)이 모두 INSERT 실패 상태이다. 각 HTML 파일의 INSERT 쿼리와 컬럼이 정확히 일치하는 테이블 스키마를 작성하여 마이그레이션에 추가한다.

## 세부 작업 지시

1. `expert.html`의 전문가 신청 INSERT 쿼리를 분석하여 `expert_applications` 테이블 스키마를 설계한다.
   - 예상 컬럼: id (uuid), user_id (uuid, FK → auth.users), name, email, expertise_area, career_years, introduction, status (default 'pending'), created_at
2. `enrollment.html`의 수강신청 INSERT 쿼리를 분석하여 `enrollments` 테이블 스키마를 설계한다.
   - 예상 컬럼: id (uuid), user_id (uuid), program_id, program_name, applicant_name, email, phone, payment_status, created_at
3. `contact.html`의 문의 INSERT 쿼리를 분석하여 `contact_inquiries` 테이블 스키마를 설계한다.
   - 예상 컬럼: id (uuid), name, email, phone, inquiry_type, subject, message, status (default 'pending'), created_at
4. `community.html`의 신고 INSERT 쿼리를 분석하여 `reports` 테이블 스키마를 설계한다.
   - 예상 컬럼: id (uuid), reporter_id (uuid, FK → auth.users), target_type (post/comment), target_id (uuid), reason, description, status (default 'pending'), created_at
5. 각 테이블에 대해 별도 마이그레이션 SQL 파일을 작성한다.
6. 파일명은 순서를 보장하도록 `01_expert_applications.sql`, `02_enrollments.sql`, `03_contact_inquiries.sql`, `04_reports.sql` 형식으로 한다.
7. 실제 HTML 파일의 INSERT 쿼리를 직접 확인하여 컬럼명 불일치가 없도록 한다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `supabase/migrations/01_expert_applications.sql` | expert_applications 테이블 CREATE TABLE |
| `supabase/migrations/02_enrollments.sql` | enrollments 테이블 CREATE TABLE |
| `supabase/migrations/03_contact_inquiries.sql` | contact_inquiries 테이블 CREATE TABLE |
| `supabase/migrations/04_reports.sql` | reports 테이블 CREATE TABLE |

## 완료 기준
- [ ] `expert_applications` 테이블이 Supabase에 생성됨
- [ ] `enrollments` 테이블이 Supabase에 생성됨
- [ ] `contact_inquiries` 테이블이 Supabase에 생성됨
- [ ] `reports` 테이블이 Supabase에 생성됨
- [ ] 각 테이블의 컬럼이 해당 HTML 파일의 INSERT 쿼리와 정확히 일치함
- [ ] 4개 폼에서 데이터 저장이 정상적으로 동작함
- [ ] Supabase Table Editor에서 4개 테이블이 확인됨
