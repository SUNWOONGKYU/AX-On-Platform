# S5S1: Supabase 키 환경 변수 분리

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S5S1 |
| Task 이름 | Supabase 키 환경 변수 분리 |
| Stage | S5 — 개발 3차 |
| Area | S — Security |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | claude-sonnet-4-6 |

## 배경 및 목적

현재 `js/config.js`에 `SUPABASE_URL`과 `SUPABASE_ANON_KEY`가 평문으로 하드코딩되어 있다. 이 값들이 Git 저장소에 커밋되면 공개 저장소에서 노출될 위험이 있다. Vercel 환경 변수로 분리하여 소스 코드에서 민감한 값을 제거한다. 단, Supabase anon key는 설계상 클라이언트에서 사용되므로 RLS(Row Level Security)로 보호되는 것이 전제이며, 이에 대한 보안 전략도 함께 문서화한다.

## 세부 작업 지시

1. 현재 `js/config.js`의 하드코딩 방식을 분석한다.
2. Vanilla JS + Vercel 환경에서 환경 변수를 주입하는 방법을 검토하고 채택한다:
   - **방안 A (권장)**: Vercel Edge Config 또는 `vercel.json`의 `env` 설정에서 빌드 시 `config.js`를 생성하는 스크립트 작성
   - **방안 B**: `vercel.json`에 `rewrites` 설정으로 `/api/config` 엔드포인트를 만들고, 페이지 로드 시 fetch로 설정값 조회
   - **방안 C**: Vercel에서 정적 파일 빌드 시 환경 변수를 주입하는 `build` 스크립트 작성
3. 채택한 방안을 구현한다.
4. `.gitignore`에 민감한 설정 파일이 포함되어 있는지 확인하고, 필요시 추가한다.
5. `vercel.json`에 환경 변수 설정 예시를 추가한다.
6. Supabase anon key 보안에 대한 전략을 문서화한다:
   - anon key는 RLS로 보호되므로 클라이언트 노출은 설계상 정상
   - 키 로테이션 주기 및 절차
   - service_role key는 절대 클라이언트에 노출 금지

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `js/config.js` | 하드코딩된 키 제거, 환경 변수 참조 방식으로 변경 |
| `vercel.json` | 환경 변수 설정 추가 |
| `.gitignore` | 민감한 파일 제외 확인 |
| `docs/security-strategy.md` | Supabase 키 보안 전략 문서 |

## 완료 기준
- [ ] `js/config.js`에 평문 키가 없음
- [ ] Vercel 대시보드에 환경 변수가 등록됨
- [ ] 프로덕션 배포 후 정상 동작 확인
- [ ] `.gitignore`에 민감 파일이 등록됨
- [ ] Supabase anon key 보안 전략이 문서화됨
- [ ] service_role key가 클라이언트 코드에 없음을 확인
