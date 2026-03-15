# S5D1: 커뮤니티 투표 컬럼명 불일치 수정

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S5D1 |
| Task 이름 | 커뮤니티 투표 컬럼명 불일치 수정 |
| Stage | S5 — 개발 3차 |
| Area | D — Database |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | claude-sonnet-4-6 |

## 배경 및 목적

`community.html`의 투표 기능은 `vote_type` 컬럼으로 INSERT/SELECT를 시도하지만, DB 마이그레이션 파일에는 `post_votes.vote`, `comment_votes.vote`로 컬럼이 정의되어 있다. 이 불일치로 인해 투표 기능 전체가 400 에러를 반환하고 있다. 마이그레이션 SQL을 수정하여 컬럼명을 `vote_type`으로 통일한다.

## 세부 작업 지시

1. `supabase/migrations/00_RUN_ALL_IN_ORDER.sql` 파일을 열어 `post_votes` 테이블 정의를 확인한다.
2. `post_votes` 테이블의 `vote` 컬럼명을 `vote_type`으로 변경한다 (line 217 근방).
3. `comment_votes` 테이블의 `vote` 컬럼명을 `vote_type`으로 변경한다 (line 239 근방).
4. 각 테이블의 CHECK 제약조건에서 `vote` 참조도 `vote_type`으로 함께 수정한다.
   - 예: `CHECK (vote IN ('up', 'down'))` → `CHECK (vote_type IN ('up', 'down'))`
5. 변경 후 SQL 문법 오류가 없는지 검토한다.
6. Supabase 대시보드 또는 CLI로 마이그레이션을 재실행하여 스키마를 갱신한다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `supabase/migrations/00_RUN_ALL_IN_ORDER.sql` | post_votes.vote → vote_type, comment_votes.vote → vote_type, CHECK 제약조건 수정 |

## 완료 기준
- [ ] `post_votes` 테이블의 컬럼명이 `vote_type`으로 변경됨
- [ ] `comment_votes` 테이블의 컬럼명이 `vote_type`으로 변경됨
- [ ] CHECK 제약조건이 `vote_type` 컬럼을 올바르게 참조함
- [ ] 마이그레이션 재실행 후 스키마 적용 확인
- [ ] `community.html`에서 투표(UP/DOWN) 동작 시 400 에러가 발생하지 않음
- [ ] 투표 후 투표 수가 정상적으로 업데이트됨
