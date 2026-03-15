# AX-On Platform - Task Plan

> **작성일**: 2026-03-05
> **수정일**: 2026-03-07
> **버전**: v1.5
> **프로젝트**: AX-On Platform
> **총 Task 수**: 76개
> **아키텍처**: Vanilla (HTML/CSS/JS)

---

## Stage별 Task 수

| Stage | 한글명 | Task 수 |
|-------|--------|---------|
| S0 | Project SAL Grid 생성 | - |
| S1 | 개발 준비 | 3 |
| S2 | 개발 1차 | 7 |
| S3 | 개발 2차 | 5 |
| S4 | 1차 배포 검증 | 2 |
| S5 | 개발 3차 | 12 |
| S6 | 개발 4차 | 17 |
| S7 | 개발 5차 | 14 |
| S8 | 개발 6차 | 10 |
| S9 | 개발 7차 (Deferred) | 6 |
| **합계** | | **76** |

---

## Area별 분포

| Area | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | 합계 |
|------|----|----|----|----|----|----|----|----|----|----|
| M (Documentation) | 1 | | | | | | | | 1 | 2 |
| U (Design) | | | | | | | | | | 0 |
| F (Frontend) | | 5 | 4 | | 3 | 12 | 12 | 7 | 3 | 46 |
| BI (Backend Infra) | 1 | | | | 1 | | | | 1 | 3 |
| BA (Backend APIs) | | | | | | | | | | 0 |
| D (Database) | 1 | 1 | | | 5 | 2 | | 1 | | 10 |
| S (Security) | | 1 | 1 | | 2 | 1 | 1 | | | 6 |
| T (Testing) | | | | 1 | | | | | 1 | 2 |
| O (DevOps) | | | | 1 | | | 2 | | | 3 |
| E (External) | | | | | 1 | 2 | 1 | | | 4 |
| C (Content) | | | | | | | | | | 0 |
| **합계** | **3** | **7** | **5** | **2** | **12** | **17** | **14** | **10** | **6** | **76** |

---

## S1 — 개발 준비

| Task ID | Task명 | Area | Dependencies | Status |
|---------|--------|------|-------------|--------|
| S1BI1 | Supabase 프로젝트 설정 및 클라이언트 구성 | BI | - | Completed |
| S1D1 | 디자인 시스템 구축 | D | - | Completed |
| S1M1 | 프로젝트 기획 문서 작성 | M | - | Completed |

---

## S2 — 개발 1차

| Task ID | Task명 | Area | Dependencies | Status |
|---------|--------|------|-------------|--------|
| S2D1 | 데이터베이스 스키마 설계 및 테이블 생성 | D | S1BI1 | Completed |
| S2S1 | 인증 시스템 구현 | S | S1BI1, S2D1 | Completed |
| S2F1 | 메인 랜딩 페이지 구현 | F | S1D1 | Completed |
| S2F2 | 우리의 창업 페이지 구현 | F | S1D1 | Completed |
| S2F3 | AX 프로젝트 접수 페이지 구현 | F | S1D1, S1BI1, S2D1 | Completed |
| S2F4 | AI 전문가 페이지 구현 | F | S1D1, S1BI1, S2D1 | Completed |
| S2F5 | 커뮤니티 페이지 구현 | F | S1D1, S1BI1, S2D1 | Completed |

---

## S3 — 개발 2차

| Task ID | Task명 | Area | Dependencies | Status |
|---------|--------|------|-------------|--------|
| S3F1 | 수강신청 페이지 구현 | F | S2F2 | Completed |
| S3F2 | 문의하기 페이지 구현 | F | S1D1, S1BI1 | Completed |
| S3F3 | 이용약관 및 개인정보처리방침 페이지 | F | S1D1 | Completed |
| S3F4 | 전문가 프로필 템플릿 구현 | F | S2F4 | Completed |
| S3S1 | 폼 보안 강화 | S | S2S1, S2F3, S2F4, S3F1, S3F2 | Completed |

---

## S4 — 1차 배포 검증

| Task ID | Task명 | Area | Dependencies | Status |
|---------|--------|------|-------------|--------|
| S4O1 | Vercel 배포 및 GitHub 자동 배포 설정 | O | S3S1 | Completed |
| S4T1 | 전체 폼 테스트 및 버그 수정 | T | S3S1 | Completed |

---

## S5 — 개발 3차: 버그 수정 + 핵심 기능 (12개)

| Task ID | Task 이름 | Area | Dependencies | Priority | Status |
|---------|-----------|------|-------------|----------|--------|
| S5D1 | 커뮤니티 투표 컬럼명 불일치 수정 | D | - | Critical | Pending |
| S5D2 | 누락 테이블 4개 마이그레이션 추가 | D | - | Critical | Pending |
| S5D3 | experts 테이블 컬럼 확장 | D | - | Critical | Pending |
| S5D4 | user_notifications 테이블 생성 | D | - | High | Pending |
| S5D5 | profiles/users_profiles 테이블 통합 | D | - | High | Pending |
| S5S1 | Supabase 키 환경 변수 분리 | S | - | Critical | Pending |
| S5S2 | 누락 테이블 RLS 정책 적용 | S | S5D2 | High | Pending |
| S5BI1 | community-images Storage Bucket 생성 | BI | - | Critical | Pending |
| S5F1 | 마이페이지(profile.html) 구현 | F | S5D5 | Critical | Pending |
| S5F2 | 커뮤니티 이미지 표시 로직 완성 | F | S5BI1 | High | Pending |
| S5F3 | OG 이미지/메타태그 도메인 수정 | F | - | High | Pending |
| S5E1 | AI 튜터 Edge Function 배포 | E | S5S1 | High | Pending |

---

## S6 — 개발 4차: 개선 + 부가 기능 (17개)

| Task ID | Task 이름 | Area | Dependencies | Priority | Status |
|---------|-----------|------|-------------|----------|--------|
| S6F1 | 알림 드롭다운 패널 UI 구현 | F | S5D4 | Medium | Pending |
| S6F2 | AI 지식 허브 사이드바 확장 | F | - | Medium | Pending |
| S6F3 | AX 프로젝트 관리자 대시보드 | F | - | Medium | Pending |
| S6F4 | 전문가 등록 관리자 검토 프로세스 | F | S5D2 | Medium | Pending |
| S6F5 | 투표 부분 렌더링 최적화 | F | S5D1 | Medium | Pending |
| S6F6 | 역할 필터 서버사이드 처리 | F | - | Medium | Pending |
| S6F7 | OG URL 메타태그 정비 | F | S5F3 | Low | Pending |
| S6F8 | CSS 공유 파일 분리 | F | - | Low | Pending |
| S6F9 | AI 튜터 챗봇 전 페이지 확대 | F | S5E1 | Low | Pending |
| S6F10 | 수강신청 URL 파라미터 검증 | F | - | Low | Pending |
| S6F11 | 이메일 하드코딩 제거 | F | - | Low | Pending |
| S6F12 | 네비게이션 인증 코드 모듈화 | F | - | Low | Pending |
| S6D1 | users_profiles updated_at 컬럼 추가 | D | S5D5 | Medium | Pending |
| S6D2 | 북마크 Supabase 동기화 테이블 | D | - | Low | Pending |
| S6E1 | 수강신청 결제 연동 | E | - | Medium | Pending |
| S6E2 | 문의 접수 담당자 알림 | E | - | Medium | Pending |
| S6S1 | claude-code-guide.html 접근 제한 | S | - | Low | Pending |

---

---

## S7 — 개발 5차 (14개)

| Task ID | Task 이름 | Area | Dependencies | Priority | Status |
|---------|-----------|------|-------------|----------|--------|
| S7F1 | 404/500 에러 페이지 | F | - | Medium | Pending |
| S7F2 | 마이페이지 세부 | F | S5F1 | Medium | Pending |
| S7F4 | 게시판 페이지네이션 | F | S2F5 | Medium | Pending |
| S7F5 | 전문가 SEO URL 페이지 | F | S2F4 | Medium | Pending |
| S7F6 | 수강신청 관리자 대시보드 | F | S3F1 | Medium | Pending |
| S7F7 | 문의 관리자 대시보드 | F | S3F2 | Medium | Pending |
| S7F8 | 신고/차단 관리자 대시보드 | F | S2F5 | Medium | Pending |
| S7F9 | 지식허브 카테고리/태그 확장 | F | S6F2 | Medium | Pending |
| S7F10 | 비밀번호 재설정 플로우 | F | S2S1 | Medium | Pending |
| S7F11 | 관리자 대시보드 홈 (통합 통계 위젯) | F | S7S1, S6F3, S6F4 | High | Pending |
| S7F12 | 사용자 관리 페이지 | F | S7S1 | High | Pending |
| S7F13 | 게시글/댓글 콘텐츠 직접 관리 페이지 | F | S7S1, S5D1 | Medium | Pending |
| S7S1 | 관리자 Role 기반 접근 제어 | S | S2S1 | High | Pending |
| S7E1 | 수강 확인 이메일 자동 발송 | E | S3F1 | Medium | Pending |

---

## S8 — 개발 6차 (10개)

| Task ID | Task 이름 | Area | Dependencies | Priority | Status |
|---------|-----------|------|-------------|----------|--------|
| S8D1 | 공지사항/설정 테이블 생성 | D | S5D1 | Medium | Completed |
| S8F1 | PWA 설정 | F | - | Medium | Completed |
| S8F2 | 댓글 대댓글 depth 확장 | F | S2F5 | Medium | Completed |
| S8F3 | experts JSON 통합 관리 | F | S5D3 | Medium | Completed |
| S8F4 | SEO 메타태그 전체 적용 | F | S5F3 | Medium | Completed |
| S8F5 | 이미지 Lazy Loading | F | S5F2 | Medium | Completed |
| S8F7 | 공지사항 관리 (CRUD) | F | S8D1 | Medium | Completed |
| S8F9 | 관리자 활동 로그 뷰어 | F | S7S1 | Medium | Completed |
| S8O1 | vercel.json 최적화 | O | S4O1 | Low | Completed |
| S8O2 | sitemap.xml + robots.txt | O | - | Low | Completed |

---

## S9 — 개발 7차: Deferred (6개)

> S7/S8에서 의존성 미해결로 보류된 Task를 모아둔 Stage

| Task ID | Task 이름 | Area | Dependencies | Priority | Status | 원래 ID |
|---------|-----------|------|-------------|----------|--------|---------|
| S9F1 | Kakao 소셜 로그인 연동 | F | S5S1 | Medium | Pending | S7F3 |
| S9BI1 | Google Analytics 연동 | BI | S5BI1 | Low | Pending | S7BI1 |
| S9F2 | 쿠키 동의 배너 구현 | F | S9BI1 | Low | Pending | S8F6 |
| S9F3 | 관리자 통합 통계/리포트 페이지 | F | S7F11, S9BI1 | Medium | Pending | S8F8 |
| S9T1 | E2E 테스트 | T | S7F2, S9F1 | Medium | Pending | S8T1 |
| S9M1 | 기술 문서 정리 | M | S9T1 | Low | Pending | S8M1 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-03-05 | 최초 생성 — 전체 17개 Task 소급 등록 (전 Task Completed + Verified 상태) |
| v1.1 | 2026-03-05 | S5/S6 29개 미래 Task 추가 (Pending) |
| v1.2 | 2026-03-05 | S7/S8 23개 Task 추가 (총 69개) |
| v1.3 | 2026-03-05 | 어드민 기능 7개 Task 추가 (S7F11, S7F12, S7F13, S8F7, S8F8, S8F9, S8D1) — 총 76개 |
| v1.4 | 2026-03-07 | S7/S8 Pending Task 6개를 S9(Deferred)로 이관 — S7F3→S9F1, S7BI1→S9BI1, S8F6→S9F2, S8F8→S9F3, S8T1→S9T1, S8M1→S9M1 |
| v1.5 | 2026-03-07 | S8 10개 Task 전체 실행 완료 (Completed+Verified) — S8D1, S8F1~S8F5, S8F7, S8F9, S8O1, S8O2 |
