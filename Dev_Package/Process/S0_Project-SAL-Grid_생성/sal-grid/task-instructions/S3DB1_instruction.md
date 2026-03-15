# S3DB1 — admin_notes/updated_at 컬럼 + RLS 마이그레이션

> **소급 등록**: 2026-03-12 (실행일: 2026-03-11~12)

## 목표
어드민 대시보드(admin.html)에서 관리자가 상태 변경 및 메모를 저장할 수 있도록 DB 스키마를 확장한다.

## 대상 테이블
- `contact_inquiries` (문의)
- `expert_applications` (전문가 신청)
- `enrollments` (수강 신청)
- `reports` (신고)

## 실행 내용
1. 4개 테이블에 `admin_notes TEXT`, `updated_at TIMESTAMPTZ DEFAULT NOW()` 컬럼 추가
2. `update_updated_at_column()` 트리거 함수 생성
3. 4개 테이블에 BEFORE UPDATE 트리거 추가
4. RLS UPDATE 정책: `is_admin()` 기반
5. RLS SELECT 정책: 기존 `_select_auth` → `_select_admin` (is_admin()) 교체

## 생성 파일
- `supabase/migrations/20260311000001_admin_columns.sql`

## 실행 방법
- Supabase Management API (`POST /v1/projects/{ref}/database/query`)로 직접 실행
