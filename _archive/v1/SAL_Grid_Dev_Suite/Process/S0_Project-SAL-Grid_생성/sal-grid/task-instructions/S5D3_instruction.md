# S5D3: experts 테이블 컬럼 확장

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S5D3 |
| Task 이름 | experts 테이블 컬럼 확장 |
| Stage | S5 — 개발 3차 |
| Area | D — Database |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | claude-sonnet-4-6 |

## 배경 및 목적

`expert-template.html`은 전문가 프로필 상세 페이지로, `description`, `skills`, `career_history`, `portfolio`, `github_url`, `linkedin_url`, `location` 컬럼을 SELECT 쿼리에서 참조한다. 그러나 현재 `experts` 테이블에 이 컬럼들이 존재하지 않아 전문가 상세 페이지 로드 시 오류가 발생한다. ALTER TABLE로 7개 컬럼을 추가한다.

## 세부 작업 지시

1. `expert-template.html`의 Supabase SELECT 쿼리를 분석하여 필요한 컬럼 목록을 정확히 파악한다.
2. 각 컬럼의 적절한 데이터 타입을 결정한다:
   - `description`: TEXT (전문가 소개글, 긴 텍스트)
   - `skills`: TEXT[] 또는 JSONB (기술 스택 배열)
   - `career_history`: JSONB (경력 사항, 구조화된 데이터)
   - `portfolio`: JSONB 또는 TEXT (포트폴리오 링크/내용)
   - `github_url`: TEXT
   - `linkedin_url`: TEXT
   - `location`: TEXT (활동 지역)
3. 마이그레이션 SQL 파일을 작성한다:
   ```sql
   ALTER TABLE experts ADD COLUMN IF NOT EXISTS description TEXT;
   ALTER TABLE experts ADD COLUMN IF NOT EXISTS skills TEXT[];
   -- 나머지 컬럼 추가
   ```
4. `ADD COLUMN IF NOT EXISTS`를 사용하여 멱등성을 보장한다.
5. Supabase에 마이그레이션을 적용한다.
6. `expert-template.html`의 SELECT 쿼리가 오류 없이 실행되는지 확인한다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `supabase/migrations/05_experts_columns_extend.sql` | experts 테이블에 7개 컬럼 ALTER TABLE ADD COLUMN |

## 완료 기준
- [ ] `experts` 테이블에 `description` 컬럼 추가됨
- [ ] `experts` 테이블에 `skills` 컬럼 추가됨
- [ ] `experts` 테이블에 `career_history` 컬럼 추가됨
- [ ] `experts` 테이블에 `portfolio` 컬럼 추가됨
- [ ] `experts` 테이블에 `github_url` 컬럼 추가됨
- [ ] `experts` 테이블에 `linkedin_url` 컬럼 추가됨
- [ ] `experts` 테이블에 `location` 컬럼 추가됨
- [ ] `expert-template.html`의 SELECT 쿼리가 정상 실행됨
- [ ] 전문가 상세 페이지 로드 시 오류 없음
