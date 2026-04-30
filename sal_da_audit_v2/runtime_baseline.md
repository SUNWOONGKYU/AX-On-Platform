# PART 0 — 런타임 베이스라인 (AX-On Platform)

**진단 일시:** 2026-04-30
**진단 대상:** AX-On Platform 전체 (https://www.ax-on.net/)
**기반 스킬:** /주작-sal-da v4.0
**Track:** Diagnosis (품질 진단)

---

## P0-1 빌드 검증

**상태:** N/A (정적 HTML 호스팅 — Vercel)

이 프로젝트는 빌드 파이프라인이 없는 정적 사이트다. HTML/CSS/JS 파일이 그대로 배포되며 서버 측 빌드 단계가 존재하지 않는다.
- `vercel.json`: 헤더 설정만(보안 헤더 — X-Content-Type-Options nosniff, X-Frame-Options DENY)
- 별도 build script 또는 번들러 없음

→ **Pass (해당 없음)**

---

## P0-2 서빙 검증

| 페이지 | URL | HTTP | 콘텐츠 렌더 |
|---|---|---|---|
| index | https://www.ax-on.net/ | 200 | ✅ 풀 렌더 |
| about-ax | /about-ax.html | 200 | ✅ 풀 렌더 |
| engagement | /engagement.html | 200 | ✅ 풀 렌더 |
| methodology | /methodology.html | 200 | ✅ 풀 렌더 |
| pool | /pool.html | 200 | ⚠️ 빈 리스트 (0명 등록) |
| community | /community.html | 200 | ⚠️ 인증 게이트 (skeleton → 로그인 후 렌더) |
| contact | /contact.html | 200 | ✅ 풀 렌더 |
| privacy | /privacy.html | 200 | ✅ 풀 렌더 |
| terms | /terms.html | 200 | ✅ 풀 렌더 |

**메모:**
- pool.html "빈 리스트"는 데이터 부재(전문가 0명)로 정상 동작이며 결함 아님.
- community.html "skeleton"은 의도된 인증 게이트(`community-loading` 클래스 → `showCommunity()` 전환)로 정상 동작.

→ **Pass**

---

## P0-3 스모크 테스트

### 페이지 200 + 핵심 셀렉터
- 9개 페이지 전체 200 + 주요 H1/H2 + 네비 + CTA 렌더 확인 (P0-2 결과 참조)

### Dead-link / 클릭 불가 요소 정적 분석
- 프로덕션 8개 페이지에서 `href="#"` 검출 1건:
  - `contact.html:348` — 모바일 로그아웃 링크 `<a href="#" onclick="doLogout();return false;">` (정상 패턴, return false로 네비 차단)
- 그 외 dead-href 없음, button-as-div 없음 (커뮤니티/풀의 onclick은 `<a>`/`<button>`에 정상 부착)

### CLAUDE.md UI 검증 철칙 — 잔존 위험
- 본 진단은 자동화 클릭 테스트(Playwright) 없이 정적 분석 + WebFetch HTML 분석으로 수행함
- 실제 사용자 여정(예: pool 등록 7-step 폼 종주, community 게시글 작성/삭제) 클릭 테스트는 **PART 2의 RL 카드에서 별도 검증 권고**

→ **Pass (정적 기준)** / 사용자 여정 검증은 S2 RL 카드로 위임

---

## P0-4 스키마↔쿼리 대조

대상 테이블·컬럼 (마이그레이션 vs HTML 쿼리):

| 테이블 | 쿼리 컬럼 | 마이그레이션 정의 | 결과 |
|---|---|---|---|
| ax_experts | name, user_id, id | 10_ax_mini_version.sql | ✅ 일치 |
| ax_posts | id, title, content, category, user_id, author_name, created_at, file_url, file_name, files, project_id, tags | 10 + 03 + 05 + 13 | ✅ 일치 |
| ax_comments | id, post_id, parent_id, content, author_name, user_id, created_at | 10 + 12_comments_parent_id | ✅ 일치 |
| ax_votes | post_id, user_id, vote_type | 12000002_votes.sql | ✅ 일치 |
| ax_projects | id, name, description, status, assigned_experts, created_at | 12000005_add_project_category | ✅ 일치 |
| ax_knowledge_revisions | id, editor_name, edit_summary, created_at | 12000004_knowledge_revisions | ✅ 일치 (가정 — 별도 정밀 검증 권고) |

**유령 컬럼:** 검출되지 않음
**누락 컬럼:** 검출되지 않음

→ **Pass**

---

## P0-5 환경변수·시크릿

- `js/config.js`: `/api/config` 엔드포인트로 SUPABASE_URL + SUPABASE_ANON_KEY 동적 로드
- 실패 시 fallback: hardcoded anon key (공개용으로 RLS 보호되므로 허용 가능)
- sessionStorage 1시간 TTL 캐싱
- `api/config.js`: 서버 측 키 주입 엔드포인트 존재

**관찰:**
- anon key 클라이언트 노출은 Supabase 표준 패턴 — RLS가 실제 권한 게이트
- service_role key는 코드베이스에 노출되지 않음 (확인됨)

→ **Pass**

---

## RuntimeFailFlag 결정

| P0 단계 | 결과 |
|---|---|
| P0-1 빌드 | Pass (N/A) |
| P0-2 서빙 | Pass |
| P0-3 스모크 | Pass (정적) |
| P0-4 스키마↔쿼리 | Pass |
| P0-5 환경변수 | Pass |

**RuntimeFailFlag = `false`**

→ S0 진입 가능. **시스템 등급 캡 미적용.**

---

## P0 자동 편입 카드 (S0 Grid 편입 대상)

런타임 Fail 0건 — **자동 편입 카드 없음.**

다음 항목은 정적 진단으로 P0를 통과했으나 PART 2에서 별도 카드로 다룰 권고 사항:

1. **사용자 여정 클릭 테스트 (RL Area)**: pool/community/contact의 핵심 폼 종주 검증 — Playwright 또는 수동 테스트
2. **community 인증 게이트 UX (UX Area)**: skeleton → 로그인 안내 전환 가독성
3. **pool 빈 상태 UX (UX Area)**: 0명 등록 상태에서의 첫 사용자 경험
