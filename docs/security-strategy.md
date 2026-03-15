# @task S5S1
# AX-On Platform — Supabase 키 보안 전략

> 작성일: 2026-03-06

## 1. Supabase anon key 보안 원칙

### anon key 클라이언트 노출 — 설계상 정상

Supabase `anon key`는 **공개 키(public key)**로 설계되었습니다. 클라이언트 브라우저에서 노출되는 것은 의도된 동작입니다.

**보안은 RLS(Row Level Security)로 보장합니다:**
- 모든 테이블에 RLS 활성화 필수
- `auth.uid()`를 기준으로 본인 데이터만 접근 허용
- anon key로는 RLS를 우회할 수 없음

### 실제 보호 대상

| 키 종류 | 노출 허용 여부 | 이유 |
|---------|---------------|------|
| `anon key` | 허용 (RLS 적용 시) | 클라이언트 설계 목적 |
| `service_role key` | **절대 금지** | RLS 우회 가능, 전체 DB 접근 |
| `JWT secret` | **절대 금지** | 토큰 위변조 가능 |

## 2. 환경 변수 관리 방식

### Vercel 대시보드 등록 (필수)

Vercel 프로젝트 설정 → Environment Variables에 아래 값을 등록하세요:

```
SUPABASE_URL=https://gifxpfdnnfwufzdncmor.supabase.co
SUPABASE_ANON_KEY=<실제 anon key 값>
```

`service_role key`는 절대 등록하지 않습니다. Edge Function에서 필요한 경우 Supabase 대시보드의 Edge Function Secrets에 별도 등록합니다.

### API 엔드포인트 방식 (`/api/config`)

클라이언트는 직접 환경 변수에 접근할 수 없으므로, Vercel Serverless Function을 통해 설정을 전달합니다:

```
Browser → GET /api/config → Vercel Function → { supabaseUrl, supabaseAnonKey }
```

## 3. 키 로테이션 절차

1. Supabase 대시보드 → Project Settings → API → `anon key` Rotate
2. 새 키를 Vercel 대시보드 환경 변수에 업데이트
3. Vercel 재배포 (자동 또는 수동)
4. 구 키는 24시간 후 자동 만료

**권장 로테이션 주기**: 연 1회 또는 키 노출 의심 시 즉시

## 4. service_role key 절대 금지

```javascript
// ❌ 절대 금지 — 클라이언트 코드에 service_role key 사용
const supabase = createClient(url, SERVICE_ROLE_KEY);

// ✅ 올바른 방식 — anon key 사용 (RLS 적용)
const supabase = createClient(url, ANON_KEY);
```

service_role key가 필요한 작업(관리자 작업, 트리거 등)은 Supabase Edge Function 또는 서버 측에서만 처리합니다.

## 5. 현재 적용 현황

- [x] `js/config.js` — 하드코딩 키 제거, `/api/config` 동적 로드 방식 적용
- [x] `api/config.js` — Vercel Serverless Function으로 환경 변수 전달
- [x] `vercel.json` — 환경 변수 참조 설정 (`@supabase_url`, `@supabase_anon_key`)
- [x] `.gitignore` — `.env`, `.env.local` 등 민감 파일 제외
- [x] 모든 테이블에 RLS 활성화 (각 마이그레이션 파일 참조)
- [x] `service_role key` 클라이언트 코드 미사용 확인
