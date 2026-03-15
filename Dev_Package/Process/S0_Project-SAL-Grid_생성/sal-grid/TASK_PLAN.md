# AX-On Platform Mini Version - Task Plan

> **작성일**: 2026-03-11
> **수정일**: 2026-03-12
> **버전**: v1.1
> **프로젝트**: AX-On Platform Mini Version
> **총 Task 수**: 12개
> **아키텍처**: Vanilla (HTML/CSS/JavaScript)

---

## Stage별 Task 수

| Stage | 한글명 | Task 수 | 상태 |
|-------|--------|---------|------|
| S0 | Project SAL Grid 생성 | - | - |
| S1 | 미니버전 준비 | 2 | Completed (소급) |
| S2 | 미니버전 구현 | 4 | Completed (소급) |
| S3 | 검증 및 배포 | 6 | In Progress (5/6 완료) |
| **합계** | | **12** | |

---

## Area별 분포

| Area | S1 | S2 | S3 | 합계 |
|------|----|----|-----|------|
| FE (Frontend) | | 4 | 3 | 7 |
| DB (Database) | 1 | | 1 | 2 |
| DS (Design) | 1 | | | 1 |
| TS (Testing) | | | 1 | 1 |
| DV (DevOps) | | | 1 | 1 |
| **합계** | **2** | **4** | **6** | **12** |

---

## S1 — 미니버전 준비

| Task ID | Task명 | Area | Status | Dependencies |
|---------|--------|------|--------|-------------|
| S1DB1 | ax_mini_version DB 마이그레이션 | DB | Completed | - |
| S1DS1 | 미니버전 디자인 시스템 (기존 CSS 재활용) | DS | Completed | - |

---

## S2 — 미니버전 구현

| Task ID | Task명 | Area | Status | Dependencies |
|---------|--------|------|--------|-------------|
| S2FE1 | index.html 미니 랜딩 페이지 | FE | Completed | S1DS1 |
| S2FE2 | pool.html 전문가 목록 (카드/리스트 토글, 검색) | FE | Completed | S1DB1, S1DS1 |
| S2FE3 | pool.html 6단계 전문가 등록 폼 | FE | Completed | S1DB1, S1DS1 |
| S2FE4 | community.html 전문가 전용 커뮤니티 | FE | Completed | S1DB1, S1DS1, S2FE2 |

---

## S3 — 검증 및 배포

| Task ID | Task명 | Area | Status | Dependencies |
|---------|--------|------|--------|-------------|
| S3DB1 | admin_notes/updated_at 컬럼 + RLS 마이그레이션 | DB | Completed (소급) | S1DB1 |
| S3FE1 | contact.html 문의하기 페이지 | FE | Completed (소급) | S3DB1, S2FE1 |
| S3FE2 | admin.html 관리자 대시보드 | FE | Completed (소급) | S3DB1, S3FE1 |
| S3FE3 | 로그인/회원가입 레이아웃 수정 + Google OAuth | FE | Completed (소급) | S2FE1 |
| S3TS1 | 반응형/인증/CRUD 통합 테스트 | TS | Pending | S2FE1~S2FE4, S3FE1~S3FE3 |
| S3DV1 | Vercel 배포 + ax-on.net 도메인 연결 | DV | Completed (소급) | S2FE1~S2FE4 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-03-11 | 최초 생성 (소급 도입: S1-S2 6개 Task Completed) |
| v1.1 | 2026-03-12 | S3 소급 등록: S3DB1, S3FE1, S3FE2, S3FE3 추가 + S3DV1 Completed 업데이트 (총 8→12 Task) |
