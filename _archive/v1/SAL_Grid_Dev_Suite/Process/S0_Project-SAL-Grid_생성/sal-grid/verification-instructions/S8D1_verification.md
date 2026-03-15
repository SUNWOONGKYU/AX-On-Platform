# S8D1 Verification: 공지사항/설정 테이블 생성

## Verification 정보
- **Task ID**: S8D1
- **Verification Agent**: code-reviewer
- **대상 파일**: supabase/migrations/20260305_create_announcements.sql

## 1. SQL 문법 검증
- [ ] SQL 파일이 에러 없이 파싱됨
- [ ] CREATE TABLE 문법이 올바름
- [ ] CHECK 제약 조건이 올바름 (type IN ('banner', 'page', 'popup'))
- [ ] REFERENCES 외래키가 올바름 (auth.users(id))
- [ ] DEFAULT 값이 올바름 (gen_random_uuid(), now(), true)

## 2. 테이블 스키마 검증
- [ ] id 컬럼: UUID, PK, DEFAULT gen_random_uuid()
- [ ] title 컬럼: TEXT NOT NULL
- [ ] content 컬럼: TEXT NOT NULL
- [ ] type 컬럼: TEXT NOT NULL CHECK (banner/page/popup)
- [ ] is_active 컬럼: BOOLEAN NOT NULL DEFAULT true
- [ ] start_date 컬럼: TIMESTAMPTZ (nullable)
- [ ] end_date 컬럼: TIMESTAMPTZ (nullable)
- [ ] created_by 컬럼: UUID FK → auth.users(id) ON DELETE SET NULL
- [ ] created_at 컬럼: TIMESTAMPTZ NOT NULL DEFAULT now()
- [ ] updated_at 컬럼: TIMESTAMPTZ NOT NULL DEFAULT now()

## 3. 인덱스 검증
- [ ] idx_announcements_is_active 인덱스가 있음
- [ ] idx_announcements_dates 인덱스가 있음 (start_date, end_date)
- [ ] idx_announcements_type 인덱스가 있음
- [ ] idx_announcements_created_at 인덱스가 있음 (DESC)

## 4. 트리거 검증
- [ ] updated_at 자동 갱신 트리거가 있음
- [ ] BEFORE UPDATE 트리거로 설정됨
- [ ] 함수 CREATE OR REPLACE로 멱등성 보장됨

## 5. RLS 정책 검증
- [ ] ALTER TABLE ... ENABLE ROW LEVEL SECURITY 있음
- [ ] 관리자 CRUD 정책이 user_roles 테이블을 참조함
- [ ] 관리자 정책에 admin, moderator 역할이 포함됨
- [ ] 일반 사용자 SELECT 정책: is_active=true AND 날짜 범위 조건
- [ ] anon 사용자도 활성 공지를 읽을 수 있음

## 6. 멱등성 검증
- [ ] IF NOT EXISTS 또는 CREATE OR REPLACE 사용으로 재실행 안전
- [ ] 정책명 중복 방지 처리됨 (DROP POLICY IF EXISTS 또는 동등한 처리)

## 7. 통합 검증
- [ ] S5D1(기존 스키마)과 충돌 없음
- [ ] user_roles 테이블이 S5D2에서 생성되었음을 확인

## 8. 종합 판정

| 항목 | 결과 |
|------|------|
| SQL 문법 | PASS / FAIL |
| 테이블 스키마 | PASS / FAIL |
| 인덱스 | PASS / FAIL |
| 트리거 | PASS / FAIL |
| RLS 정책 | PASS / FAIL |
| **최종** | **PASS / FAIL** |
