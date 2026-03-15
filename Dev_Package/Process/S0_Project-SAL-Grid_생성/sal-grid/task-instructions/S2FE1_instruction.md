# S2FE1 — index.html 미니 랜딩 페이지

## Task 정보
- **Task ID**: S2FE1 | **Stage**: 2 | **Area**: FE
- **Agent**: frontend-developer | **Type**: AI-Only | **Deps**: S1DS1

## 목적
미니버전 메인 페이지 — Hero, Why Join, Stats, Nav, Footer

## 세부 작업
1. Nav: 전문가 풀 | 커뮤니티 | 로그인/회원가입 (auth state 반영)
2. Hero: 그라데이션 타이틀 + CTA 2개
3. Why Join: 4카드 그리드 (auto-fill, minmax 260px)
4. Stats: ax_experts count fetch
5. Footer: 이용약관/개인정보/문의하기
6. IntersectionObserver fadeIn
7. Supabase init via AXON_CONFIG

## 완료 기준
- [ ] 691줄 single-file HTML
- [ ] 반응형 (375/768/1280px)
- [ ] Auth state Nav 전환
