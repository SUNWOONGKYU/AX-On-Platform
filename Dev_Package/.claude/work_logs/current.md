# Work Log — AX-On Platform Mini Version

---

## 1. 미니버전 구현 + SAL Grid 소급 도입 (2026-03-11)

### 작업 상태: 완료

### 배경
기존 v1(12페이지, 14테이블)은 규모가 커서 전문가 30명 모집이 급선무.
전문가 풀 + 전문가 전용 커뮤니티 미니버전을 먼저 구축.

### 작업 내용

**Step 0: 아카이브**
- 기존 v1 HTML 파일 → `_archive/v1/` 이동
- 기존 SAL_Grid_Dev_Suite → `_archive/v1_SAL_Grid_Dev_Suite/` 이동

**Step 1: DB 마이그레이션**
- `supabase/migrations/10_ax_mini_version.sql` 생성
- ax_experts (22 컬럼), ax_posts, ax_comments 3테이블
- RLS + 인덱스

**Step 2: index.html 미니 랜딩 (691줄)**
- Hero + Why Join 4카드 + Stats + Nav + Footer
- Auth state 반영, IntersectionObserver fadeIn

**Step 3: pool.html 전문가 풀 (1,763줄)**
- 전문가 카드 그리드 + 리스트형 토글 + 검색
- 6단계 등록 폼 (프로필/AI역량/비전/상품/소셜/확인)
- Pill 선택, Step indicator, 전체화면 모달

**Step 4: community.html 전문가 커뮤니티 (1,358줄)**
- 전문가 게이팅 (ax_experts 등록 확인)
- 4카테고리 (공지사항/참고자료/자유토론/지식Hub)
- 아코디언 펼침 + 댓글

**Step 5: SAL Grid 소급 도입**
- Dev_Package 새로 생성 (Template 복사)
- S1-S2 6개 Task → Completed + Verified (소급)
- S3 2개 Task → Pending (테스트/배포)

### 소급 등록 Task (8개)

| Task ID | Task Name | Status |
|---------|-----------|--------|
| S1DB1 | ax_mini_version DB 마이그레이션 | Completed |
| S1DS1 | 미니버전 디자인 시스템 | Completed |
| S2FE1 | index.html 미니 랜딩 | Completed |
| S2FE2 | pool.html 전문가 목록 | Completed |
| S2FE3 | pool.html 6단계 등록 폼 | Completed |
| S2FE4 | community.html 전문가 커뮤니티 | Completed |
| S3TS1 | 통합 테스트 | Pending |
| S3DV1 | Vercel 배포 확인 | Pending |

### 다음 세션 시작점
1. S3TS1: 반응형/인증/CRUD 통합 테스트 실행
2. S3DV1: Vercel 배포 확인

---
