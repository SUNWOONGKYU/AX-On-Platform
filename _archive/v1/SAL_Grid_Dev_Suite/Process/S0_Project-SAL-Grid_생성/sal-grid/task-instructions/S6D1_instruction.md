# S6D1: users_profiles updated_at 컬럼 추가

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S6D1 |
| Task 이름 | users_profiles updated_at 컬럼 추가 |
| Stage | S6 — 개발 4차 |
| Area | D — Database |
| Dependencies | S5D5 |
| 실행 방식 | AI-Only |
| Task Agent | database-developer-core |

## 배경 및 목적

`users_profiles` 테이블에 프로필 수정 이력을 추적하기 위한 `updated_at` 컬럼이 없어, 언제 프로필이 마지막으로 수정되었는지 알 수 없다. `updated_at` 컬럼을 추가하고, 프로필이 수정될 때마다 자동으로 현재 시간으로 업데이트되도록 트리거를 설정한다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `supabase/migrations/XX_add_updated_at_to_users_profiles.sql` | 새 마이그레이션 파일 |

## 세부 작업 지시

1. 마이그레이션 파일 생성:
   ```sql
   ALTER TABLE users_profiles ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
   ```

2. 업데이트 트리거 생성:
   ```sql
   CREATE OR REPLACE TRIGGER update_users_profiles_updated_at
   BEFORE UPDATE ON users_profiles
   FOR EACH ROW
   EXECUTE FUNCTION update_updated_at_column();
   ```

3. `update_updated_at_column()` 함수가 없으면 생성:
   ```sql
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```

4. 기존 레코드의 `updated_at`을 생성 시간으로 설정 (선택사항):
   ```sql
   UPDATE users_profiles SET updated_at = created_at WHERE updated_at IS NULL;
   ```

5. Supabase에서 마이그레이션 실행 및 검증:
   - 테이블 구조 확인
   - 트리거 정상 작동 확인

## 완료 기준

- [ ] `updated_at` 컬럼 추가됨
- [ ] UPDATE 트리거 생성됨
- [ ] 프로필 수정 시 `updated_at` 자동 업데이트됨
- [ ] 기존 레코드 처리 완료
- [ ] Supabase에서 마이그레이션 실행 확인
