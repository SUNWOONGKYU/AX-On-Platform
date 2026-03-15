# S5S2: 누락 테이블 RLS 정책 적용

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S5S2 |
| Task 이름 | 누락 테이블 RLS 정책 적용 |
| Stage | S5 — 개발 3차 |
| Area | S — Security |
| Dependencies | S5D2 |
| 실행 방식 | AI-Only |
| Task Agent | claude-sonnet-4-6 |

## 배경 및 목적

S5D2에서 새로 생성된 4개 테이블(`expert_applications`, `enrollments`, `contact_inquiries`, `reports`)에는 RLS(Row Level Security) 정책이 아직 적용되지 않았다. RLS 없이 테이블이 공개되면 누구나 모든 레코드에 접근할 수 있어 개인정보 노출 위험이 있다. 각 테이블의 특성에 맞는 RLS 정책을 설계하고 적용한다.

## 세부 작업 지시

1. S5D2의 마이그레이션 결과를 확인하고 4개 테이블이 생성되었는지 검증한다.

2. `expert_applications` 테이블 RLS 정책:
   - RLS 활성화: `ALTER TABLE expert_applications ENABLE ROW LEVEL SECURITY;`
   - INSERT: anon 및 authenticated 사용자 허용 (신청 폼은 비로그인도 가능)
   - SELECT: admin 역할만 허용 (`auth.jwt() ->> 'role' = 'admin'` 또는 `profiles.role = 'admin'`)
   - UPDATE: admin만 허용 (신청 상태 변경)

3. `enrollments` 테이블 RLS 정책:
   - RLS 활성화
   - INSERT: anon 및 authenticated 허용
   - SELECT: 본인 레코드 (`user_id = auth.uid()`) 또는 admin

4. `contact_inquiries` 테이블 RLS 정책:
   - RLS 활성화
   - INSERT: anon 허용 (비로그인 문의 가능)
   - SELECT: admin만 허용
   - UPDATE: admin만 허용 (처리 상태 변경)

5. `reports` 테이블 RLS 정책:
   - RLS 활성화
   - INSERT: authenticated만 허용 (로그인 사용자만 신고 가능)
   - SELECT: 신고자 본인 또는 admin
   - UPDATE: admin만 허용

6. admin 역할 확인 헬퍼 함수 또는 공통 방식을 정의한다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `supabase/migrations/08_rls_policies_new_tables.sql` | 4개 테이블 RLS 활성화 및 정책 정의 |

## 완료 기준
- [ ] `expert_applications` 테이블 RLS 활성화 및 정책 적용
- [ ] `enrollments` 테이블 RLS 활성화 및 정책 적용
- [ ] `contact_inquiries` 테이블 RLS 활성화 및 정책 적용
- [ ] `reports` 테이블 RLS 활성화 및 정책 적용
- [ ] 비인가 사용자가 SELECT 시 빈 결과 또는 오류 반환 확인
- [ ] 폼 제출(INSERT)이 정상 동작함을 확인
- [ ] admin 계정으로 모든 레코드 조회 가능함을 확인
