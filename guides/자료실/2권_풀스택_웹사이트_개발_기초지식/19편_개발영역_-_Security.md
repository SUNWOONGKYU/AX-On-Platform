# 19편 | 개발 영역 - Security (보안)

---

누가 접근하고 무엇을 할 수 있는지 관리하는 영역, **Security**입니다. 인증(Authentication)과 인가(Authorization)를 통해 애플리케이션을 보호합니다.

---

## 인증 vs 인가

시작하기 전에 두 개념을 명확히 구분합니다.

| 구분 | 인증 (Authentication) | 인가 (Authorization) |
|-----|---------------------|---------------------|
| 질문 | "누구세요?" | "뭘 할 수 있나요?" |
| 목적 | 신원 확인 | 권한 확인 |
| 예시 | 로그인 | 관리자 페이지 접근 |
| 시점 | 먼저 | 나중에 |

**흐름:**
```
사용자 → [인증] 로그인 → [인가] 권한 확인 → 리소스 접근
```

---

## 19.1~19.4 Language, Runtime, Package Manager, Tools

Security 영역에서는 별도의 언어, 런타임, 패키지 관리자, 도구를 사용하지 않습니다. 기존 스택(TypeScript, Node.js)을 그대로 활용하며, Supabase Auth가 대부분의 기능을 제공합니다.

---

## 19.5 Library (라이브러리)

### Supabase Auth

Supabase에 내장된 인증 시스템입니다.

**지원하는 인증 방식:**
- 이메일/비밀번호
- 매직 링크 (비밀번호 없이 이메일로 로그인)
- 소셜 로그인 (Google, GitHub, Kakao 등)
- 전화번호 (SMS)

### 이메일/비밀번호 인증

**회원가입:**
```typescript
const { data, error } = await supabase.auth.signUp({
    email: 'user@example.com',
    password: 'securePassword123',
});
```

**로그인:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'securePassword123',
});
```

**로그아웃:**
```typescript
const { error } = await supabase.auth.signOut();
```

**현재 사용자 확인:**
```typescript
const { data: { user } } = await supabase.auth.getUser();

if (user) {
    console.log('로그인됨:', user.email);
} else {
    console.log('로그인 안 됨');
}
```

### 세션 관리

Supabase Auth는 JWT(JSON Web Token) 기반으로 세션을 관리합니다.

```typescript
// 세션 확인
const { data: { session } } = await supabase.auth.getSession();

// 세션 토큰
const accessToken = session?.access_token;

// 세션 갱신
const { data, error } = await supabase.auth.refreshSession();
```

**JWT 구조:**
```
header.payload.signature

예시:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIn0.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

---

## 19.6 Framework (프레임워크)

Security 영역에서는 별도의 프레임워크를 사용하지 않습니다. Supabase Auth가 프레임워크 역할을 합니다.

---

## 19.7 External Service (외부 서비스)

### OAuth (Open Authorization)

타사 서비스를 통해 로그인하는 표준 프로토콜입니다.

**흐름:**
```
1. 사용자 → "Google로 로그인" 클릭
2. 앱 → Google 인증 페이지로 리다이렉트
3. 사용자 → Google에서 로그인 및 권한 승인
4. Google → 앱으로 인증 코드 전달
5. 앱 → 인증 코드로 토큰 교환
6. 앱 → 로그인 완료
```

### Google OAuth

가장 널리 쓰이는 소셜 로그인입니다.

**Supabase에서 Google 로그인:**
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: 'https://yourapp.com/auth/callback',
    },
});
```

**설정 필요:**
1. Google Cloud Console에서 OAuth 클라이언트 생성
2. Supabase Dashboard에서 Google Provider 활성화
3. Client ID, Client Secret 입력

### Kakao OAuth

한국에서 많이 사용하는 소셜 로그인입니다.

**Supabase에서 Kakao 로그인:**
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
        redirectTo: 'https://yourapp.com/auth/callback',
    },
});
```

**설정 필요:**
1. Kakao Developers에서 앱 생성
2. Supabase Dashboard에서 Kakao Provider 활성화
3. REST API 키, Client Secret 입력

**SSALWorks**: Google OAuth와 Kakao OAuth를 지원합니다.

---

## 보안 모범 사례

### 1. 비밀번호 보안

```typescript
// ❌ 절대 안 됨: 평문 저장
const password = 'mypassword123';
db.insert({ password: password });

// ✅ Supabase Auth 사용 (자동으로 해싱)
await supabase.auth.signUp({
    email: 'user@example.com',
    password: 'mypassword123',  // 자동으로 bcrypt 해싱됨
});
```

### 2. HTTPS 필수

```
❌ http://yourapp.com   → 데이터 노출 위험
✅ https://yourapp.com  → 암호화된 통신
```

Vercel, Supabase 모두 HTTPS를 기본 제공합니다.

### 3. 환경 변수 관리

```typescript
// ❌ 절대 안 됨: 코드에 키 노출
const supabase = createClient(
    'https://xxx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // 노출!
);

// ✅ 환경 변수 사용
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);
```

### 4. RLS (Row Level Security)

데이터베이스 수준에서 접근 제어합니다.

```sql
-- 본인 데이터만 조회 가능
CREATE POLICY "Users can view own data"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- 본인 데이터만 수정 가능
CREATE POLICY "Users can update own data"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);
```

### 5. 입력값 검증

```typescript
import { z } from 'zod';

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

// 검증 후 사용
const result = LoginSchema.safeParse(input);
if (!result.success) {
    throw new Error('Invalid input');
}
```

---

## 인증 흐름 예시

### 회원가입 흐름

```
1. 사용자: 이메일, 비밀번호 입력
2. 프론트엔드: supabase.auth.signUp() 호출
3. Supabase: 이메일 확인 메일 발송
4. 사용자: 이메일 링크 클릭
5. Supabase: 계정 활성화
6. 프론트엔드: 로그인 완료, 대시보드 이동
```

### 소셜 로그인 흐름

```
1. 사용자: "Google로 로그인" 클릭
2. 프론트엔드: supabase.auth.signInWithOAuth() 호출
3. 브라우저: Google 로그인 페이지로 이동
4. 사용자: Google 계정으로 로그인
5. Google: 앱으로 리다이렉트
6. Supabase: 사용자 정보 저장, 세션 생성
7. 프론트엔드: 로그인 완료, 대시보드 이동
```

---

## 정리

| 기술 스택 | SSALWorks 선택 |
|----------|---------------|
| Language | - |
| Runtime | - |
| Package Manager | - |
| Tools | - |
| Library | **Supabase Auth** |
| Framework | - |
| External Service | **Google OAuth**, **Kakao OAuth** |

Security는 애플리케이션의 방패입니다. 다음 편에서는 코드 품질을 검증하는 **Testing**을 알아봅니다.

---

**작성일: 2025-12-21 / 글자수: 약 5,100자 / 작성자: Claude / 프롬프터: 써니**

