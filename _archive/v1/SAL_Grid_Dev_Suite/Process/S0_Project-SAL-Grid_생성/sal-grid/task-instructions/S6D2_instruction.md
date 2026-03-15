# S6D2: 북마크 Supabase 동기화 테이블

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S6D2 |
| Task 이름 | 북마크 Supabase 동기화 테이블 |
| Stage | S6 — 개발 4차 |
| Area | D — Database |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | database-developer-core |

## 배경 및 목적

현재 사용자가 게시글을 북마크할 때 데이터가 로컬 `localStorage`에만 저장되고 있다. 이는 다른 기기에서 접속할 때 북마크가 동기화되지 않는 문제를 야기한다. `bookmarks` 테이블을 생성하여 사용자의 북마크를 Supabase에 저장하고, 로컬 데이터와 클라우드 데이터를 동기화한다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `supabase/migrations/XX_create_bookmarks_table.sql` | 북마크 테이블 생성 |

## 세부 작업 지시

1. `bookmarks` 테이블 설계:
   ```sql
   CREATE TABLE bookmarks (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(user_id, post_id) -- 같은 게시글 중복 북마크 방지
   );
   ```

2. RLS 정책 설정:
   - SELECT: 자신의 북마크만 조회 가능
   - INSERT: 자신의 북마크만 삽입 가능
   - DELETE: 자신의 북마크만 삭제 가능

3. 인덱스 생성 (성능 최적화):
   ```sql
   CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
   CREATE INDEX idx_bookmarks_post_id ON bookmarks(post_id);
   ```

4. 마이그레이션 실행 및 검증:
   - 테이블 생성 확인
   - RLS 정책 활성화 확인

## 완료 기준

- [ ] `bookmarks` 테이블 생성됨
- [ ] RLS 정책 설정 완료
- [ ] 인덱스 생성됨
- [ ] UNIQUE 제약 조건 적용됨
- [ ] 마이그레이션 실행 확인
- [ ] 다중 기기 동기화 가능한 구조
