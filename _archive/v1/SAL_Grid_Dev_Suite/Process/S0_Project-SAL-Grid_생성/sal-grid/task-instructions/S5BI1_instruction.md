# S5BI1: community-images Storage Bucket 생성

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S5BI1 |
| Task 이름 | community-images Storage Bucket 생성 |
| Stage | S5 — 개발 3차 |
| Area | BI — Backend Integration |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | claude-sonnet-4-6 |

## 배경 및 목적

`community.html`의 이미지 첨부 기능은 Supabase Storage의 `community-images` 버킷에 업로드를 시도하지만, 해당 버킷이 생성되어 있지 않아 업로드가 실패한다. 버킷을 생성하고 적절한 접근 정책을 설정하여 이미지 업로드 및 공개 조회가 가능하도록 한다.

## 세부 작업 지시

1. Supabase 대시보드 또는 SQL로 `community-images` 버킷을 생성한다:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('community-images', 'community-images', true);
   ```
2. 버킷을 public으로 설정하여 업로드된 이미지의 공개 URL 접근을 허용한다.
3. Storage 정책을 설정한다:
   - 읽기(SELECT): 모든 사용자(anon 포함) 허용
     ```sql
     CREATE POLICY "Public read community images"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'community-images');
     ```
   - 업로드(INSERT): 로그인한 사용자(authenticated)만 허용
     ```sql
     CREATE POLICY "Authenticated upload community images"
     ON storage.objects FOR INSERT
     WITH CHECK (bucket_id = 'community-images' AND auth.role() = 'authenticated');
     ```
   - 삭제(DELETE): 본인 업로드 파일만 삭제 허용
     ```sql
     CREATE POLICY "Delete own community images"
     ON storage.objects FOR DELETE
     USING (bucket_id = 'community-images' AND owner = auth.uid());
     ```
4. 파일 크기 제한을 설정한다 (권장: 5MB).
5. 허용 MIME 타입을 설정한다: `image/jpeg`, `image/png`, `image/gif`, `image/webp`.
6. `community.html`에서 업로드 후 반환되는 공개 URL 형식을 확인하고, 필요시 URL 생성 코드를 수정한다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `supabase/migrations/09_storage_community_images.sql` | community-images 버킷 생성 및 정책 설정 |
| `community.html` | 업로드 후 공개 URL 처리 로직 확인/수정 |

## 완료 기준
- [ ] `community-images` 버킷이 Supabase Storage에 생성됨
- [ ] 버킷이 public으로 설정됨
- [ ] 인증된 사용자가 이미지 업로드 가능함
- [ ] 비인가 사용자도 이미지 URL로 조회 가능함
- [ ] 이미지 업로드 후 community.html에서 미리보기 표시됨
- [ ] 지원 파일 형식(jpg, png, gif, webp) 업로드 정상 동작
- [ ] 5MB 초과 파일 업로드 시 적절한 오류 메시지 표시
