# S5D5: profiles/users_profiles 테이블 통합

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S5D5 |
| Task 이름 | profiles/users_profiles 테이블 통합 |
| Stage | S5 — 개발 3차 |
| Area | D — Database |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | claude-sonnet-4-6 |

## 배경 및 목적

현재 마이그레이션에 `profiles`와 `users_profiles` 두 테이블이 별도로 존재한다. 어느 테이블을 실제로 사용하는지 불분명하고, 데이터가 분산될 위험이 있다. 단일 `profiles` 테이블로 통합하여 사용자 프로필 데이터의 일관성을 확보하고, 관련 HTML 파일(특히 `profile.html`)이 하나의 테이블만 참조하도록 정리한다.

## 세부 작업 지시

1. 현재 마이그레이션에서 `profiles`와 `users_profiles` 각 테이블의 컬럼을 모두 파악한다.
2. 각 HTML 파일(profile.html, index.html, community.html 등)에서 어떤 테이블을 참조하는지 조사한다.
3. 통합 `profiles` 테이블 스키마를 설계한다:
   - `users_profiles`의 유용한 컬럼이 있으면 `profiles`에 통합
   - 예상 최종 컬럼: id (= auth.users.id), display_name, avatar_url, role (student/expert/admin), bio, phone, interests, notification_settings, created_at, updated_at
4. 마이그레이션 SQL에서 `users_profiles` 테이블 정의를 제거하거나 주석 처리한다.
5. `profiles` 테이블에 누락 컬럼이 있으면 ALTER TABLE ADD COLUMN으로 추가한다.
6. `users_profiles`를 참조하는 HTML/JS 코드가 있으면 `profiles`로 수정한다.
7. `auth.users`에 새 사용자 생성 시 `profiles` 테이블에 자동으로 행을 삽입하는 트리거가 있는지 확인하고, 없으면 추가한다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `supabase/migrations/00_RUN_ALL_IN_ORDER.sql` | users_profiles 테이블 제거, profiles 테이블 컬럼 통합 |
| `supabase/migrations/07_profiles_consolidation.sql` | 신규: 통합 마이그레이션 SQL |
| 관련 HTML/JS 파일 | users_profiles 참조를 profiles로 변경 |

## 완료 기준
- [ ] `profiles` 단일 테이블이 모든 필요 컬럼을 포함함
- [ ] `users_profiles` 테이블이 마이그레이션에서 제거됨
- [ ] 신규 사용자 가입 시 `profiles` 테이블에 자동으로 행 생성됨
- [ ] 모든 HTML/JS 파일이 `profiles` 테이블만 참조함
- [ ] RLS 정책이 통합 테이블에 올바르게 적용됨
- [ ] S5F1(마이페이지) 구현의 기반으로 활용 가능한 상태
