# S5F2: 커뮤니티 이미지 표시 로직 완성

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S5F2 |
| Task 이름 | 커뮤니티 이미지 표시 로직 완성 |
| Stage | S5 — 개발 3차 |
| Area | F — Frontend |
| Dependencies | S5BI1 |
| 실행 방식 | AI-Only |
| Task Agent | frontend-developer-core |

## 배경 및 목적

커뮤니티 페이지에서 게시글 카드 및 상세 뷰에 첨부된 이미지가 표시되지 않고 있다. S5BI1에서 `community-images` Storage Bucket이 생성되었으나, 프론트엔드에서 이미지 URL을 올바르게 구성하지 못하고 있다. Supabase Storage에서 이미지를 조회하여 게시글과 댓글에 표시하는 로직을 완성한다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `pages/community.html` | 게시글 카드에 이미지 표시 UI 추가 |
| `pages/community.js` | 이미지 URL 구성 로직 및 표시 함수 추가 |

## 세부 작업 지시

1. Supabase Storage에서 이미지 URL을 구성하는 함수를 작성한다:
   - `getImageUrl(bucketName, filePath)` 함수 구현
   - 기본 포맷: `https://{SUPABASE_URL}/storage/v1/object/public/{bucketName}/{filePath}`

2. `community.js`에서 게시글 렌더링 시 이미지를 표시한다:
   - 게시글 목록(피드)에서 게시글당 첫 번째 이미지 표시
   - 게시글 상세 뷰에서 모든 이미지 표시
   - 이미지 로드 실패 시 대체 아이콘 표시

3. `community.html`에서 이미지 표시 UI를 업데이트한다:
   - 게시글 카드에 `<img>` 엘리먼트 추가
   - 반응형 이미지 크기 조정
   - 이미지 클릭 시 전체 크기 보기 모달 추가 (선택사항)

4. 이미지 캐싱 및 로딩 성능 최적화 고려

## 완료 기준

- [ ] 이미지 URL 구성 함수 구현됨
- [ ] 게시글 카드에 이미지 표시됨
- [ ] 게시글 상세에 모든 이미지 표시됨
- [ ] 이미지 로드 실패 시 대체 UI 표시
- [ ] 반응형 이미지 크기 조정 완료
- [ ] 게시글 카드/상세에서 이미지가 정상 표시됨
- [ ] Storage 404 에러 해결됨
