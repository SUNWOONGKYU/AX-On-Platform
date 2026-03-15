# S6F6: 역할 필터 서버사이드 처리

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S6F6 |
| Task 이름 | 역할 필터 서버사이드 처리 |
| Stage | S6 — 개발 4차 |
| Area | F — Frontend |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | frontend-developer-core |

## 배경 및 목적

현재 전문가 목록이나 커뮤니티 피드에서 역할(Role) 필터링이 클라이언트 측에서 수행되고 있다. 이는 전체 데이터를 로드한 후 필터링하므로 대량의 데이터에서 성능이 저하될 수 있다. Supabase에서 제공하는 View 또는 RPC(Remote Procedure Call)를 이용하여 서버 측에서 필터링을 수행하도록 변경한다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `supabase/migrations/XX_add_role_filters.sql` | View 또는 RPC 함수 생성 |
| `pages/community.js` | 서버사이드 필터링 API 호출로 변경 |
| `pages/experts.js` | 서버사이드 필터링 API 호출로 변경 |

## 세부 작업 지시

1. Supabase에서 필터링 View 또는 RPC 함수 생성:
   - View: `experts_by_role(role TEXT)` View 생성
   - 또는 RPC: `get_experts_by_role(p_role TEXT)` 함수 생성

2. `community.js` 수정:
   - 기존: 전체 게시글 로드 후 클라이언트에서 필터링
   - 변경: `supabase.rpc('get_posts_by_role', { p_role })` 호출

3. `experts.js` 수정:
   - 기존: 전체 전문가 로드 후 클라이언트에서 필터링
   - 변경: `supabase.rpc('get_experts_by_role', { p_role })` 호출

4. 성능 최적화:
   - 페이지네이션 추가 (필요시)
   - 캐싱 전략 검토

5. 테스트:
   - 필터 선택 시 올바른 데이터만 로드되는지 확인
   - 네트워크 요청 크기 감소 확인

## 완료 기준

- [ ] Supabase View 또는 RPC 함수 생성됨
- [ ] `community.js` 서버사이드 필터링으로 변경됨
- [ ] `experts.js` 서버사이드 필터링으로 변경됨
- [ ] 필터 결과 정확성 확인됨
- [ ] 성능 향상 (로드 시간 감소)
- [ ] 클라이언트 필터링 코드 제거됨
