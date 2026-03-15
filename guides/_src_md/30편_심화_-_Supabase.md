# 30편 | 심화 - Supabase

---

18편에서 데이터베이스 영역을 다루면서 Supabase를 소개했습니다. 이번 편에서는 Supabase를 **실전에서 활용하는 방법**을 깊이 다룹니다.

## 1. Supabase란

### 1-1. 정의

**Supabase**는 오픈소스 Firebase 대안입니다. PostgreSQL 데이터베이스를 기반으로 인증, 스토리지, 실시간 기능을 제공합니다.

### 1-2. 제공 기능

| 기능 | 설명 |
|------|------|
| Database | PostgreSQL 데이터베이스 |
| Auth | 이메일, OAuth 인증 |
| Storage | 파일 업로드/다운로드 |
| Realtime | 실시간 데이터 구독 |
| Edge Functions | 서버리스 함수 |

### 1-3. 왜 Supabase인가

- **무료 티어** 제공 (개인 프로젝트에 충분)
- PostgreSQL 기반 (표준 SQL)
- **RLS**(Row Level Security)로 보안 강화
- SDK로 쉬운 연동

### 1-4. 무료 티어 제한 (2025년 기준)

| 항목 | 무료 제한 |
|------|----------|
| Database | 500 MB |
| 프로젝트 수 | 2개 |
| 파일 스토리지 | 1 GB |
| 대역폭 | 10 GB/월 |
| Edge Functions | 500,000 호출/월 |

---

## 2. 프로젝트 설정

### 2-1. 프로젝트 생성

1. https://supabase.com 접속 → GitHub 로그인
2. **New Project** 클릭
3. 정보 입력:
   - Project name: my-project
   - Database Password: (강력한 비밀번호)
   - Region: Northeast Asia (Tokyo)
4. **Create new project**

### 2-2. API 키 확인

Project Settings → API에서 확인:

| 키 | 용도 |
|----|------|
| `anon` key | 클라이언트에서 사용 (공개 가능) |
| `service_role` key | 서버에서만 사용 (비밀!) |
| URL | API 엔드포인트 |

---

## 3. 테이블 생성

### 3-1. SQL Editor 사용

```sql
-- 사용자 테이블 (auth.users와 연동)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 구독 테이블
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    plan VARCHAR(20) NOT NULL DEFAULT 'free',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);
```

### 3-2. 인덱스 추가

```sql
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

## 4. Row Level Security (RLS)

### 4-1. RLS란

**RLS**는 행 단위 보안 정책입니다. 사용자가 자신의 데이터만 접근하도록 제한합니다.

### 4-2. RLS 활성화

```sql
-- RLS 활성화 (필수!)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
```

### 4-3. 정책 생성

```sql
-- profiles: 본인 데이터만 조회/수정
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- subscriptions: 본인 구독만 조회
CREATE POLICY "Users can view own subscriptions"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);
```

### 4-4. 주요 함수

| 함수 | 설명 |
|------|------|
| `auth.uid()` | 현재 로그인한 사용자 ID |
| `auth.jwt()` | JWT 토큰 전체 |
| `auth.role()` | 사용자 역할 |

---

## 5. JavaScript SDK

### 5-1. 설치 및 초기화

```javascript
// npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://xxx.supabase.co',
    'your-anon-key'
);
```

### 5-2. 데이터 조회 (SELECT)

```javascript
// 전체 조회
const { data, error } = await supabase
    .from('profiles')
    .select('*');

// 조건 조회
const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active');

// 관계 데이터 함께 조회
const { data, error } = await supabase
    .from('subscriptions')
    .select(`
        *,
        profiles (name, avatar_url)
    `)
    .eq('user_id', userId);

// 정렬 및 제한
const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
```

### 5-3. 데이터 추가 (INSERT)

```javascript
const { data, error } = await supabase
    .from('profiles')
    .insert({
        id: userId,
        name: '홍길동',
        avatar_url: null
    })
    .select();  // 추가된 데이터 반환
```

### 5-4. 데이터 수정 (UPDATE)

```javascript
const { data, error } = await supabase
    .from('profiles')
    .update({ name: '새 이름' })
    .eq('id', userId)
    .select();
```

### 5-5. 데이터 삭제 (DELETE)

```javascript
const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
```

---

## 6. 인증 (Auth)

### 6-1. 이메일 회원가입

```javascript
const { data, error } = await supabase.auth.signUp({
    email: 'user@example.com',
    password: 'securepassword123'
});
```

### 6-2. 이메일 로그인

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'securepassword123'
});
```

### 6-3. OAuth 로그인 (Google)

```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: 'https://yoursite.com/callback'
    }
});
```

### 6-4. 현재 사용자 확인

```javascript
// 현재 세션
const { data: { session } } = await supabase.auth.getSession();

// 현재 사용자
const { data: { user } } = await supabase.auth.getUser();
```

### 6-5. 로그아웃

```javascript
const { error } = await supabase.auth.signOut();
```

---

## 7. 스토리지 (Storage)

### 7-1. 버킷 생성 (Dashboard)

1. Storage → New bucket
2. 이름 입력 (예: `avatars`)
3. Public/Private 선택

### 7-2. 파일 업로드

```javascript
const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${userId}/avatar.png`, file, {
        cacheControl: '3600',
        upsert: true
    });
```

### 7-3. 파일 URL 가져오기

```javascript
// 공개 URL
const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(`${userId}/avatar.png`);

console.log(data.publicUrl);
```

### 7-4. 파일 삭제

```javascript
const { error } = await supabase.storage
    .from('avatars')
    .remove([`${userId}/avatar.png`]);
```

---

## 8. 실시간 구독 (Realtime)

```javascript
// 실시간 구독
const subscription = supabase
    .channel('subscriptions-changes')
    .on(
        'postgres_changes',
        {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${userId}`
        },
        (payload) => {
            console.log('변경 감지:', payload);
        }
    )
    .subscribe();

// 구독 해제
subscription.unsubscribe();
```

---

## 9. 실전 예시: 사용자 프로필

### 9-1. 테이블 생성

```sql
-- profiles 테이블
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책
CREATE POLICY "Public profiles are viewable"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 회원가입 시 자동 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
```

### 9-2. 프로필 조회/수정

```javascript
// 프로필 조회
async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    return { data, error };
}

// 프로필 수정
async function updateProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

    return { data, error };
}
```

---

## 10. 환경 변수 설정

### 10-1. 로컬 개발

```javascript
// .env.local
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
```

### 10-2. Vercel 배포

1. Vercel → Project → Settings → Environment Variables
2. 추가:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

---

## 정리

Supabase는 **PostgreSQL 기반 백엔드 서비스**입니다.

**핵심 기능:**
- Database: PostgreSQL + RLS
- Auth: 이메일, OAuth 인증
- Storage: 파일 업로드
- Realtime: 실시간 구독

**RLS 필수:**
- 테이블마다 RLS 활성화
- 정책으로 접근 권한 설정
- `auth.uid()`로 현재 사용자 확인

---

**작성일: 2025-12-21 / 작성자: Claude Code**
