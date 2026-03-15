# 18편 | 개발 영역 - Database (데이터베이스)

---

모든 데이터를 저장하고 관리하는 창고, **Database**입니다. 회원 정보, 게시글, 주문 내역 등 애플리케이션의 모든 데이터가 여기에 저장됩니다.

---

## 18.1 Language (언어)

### SQL (Structured Query Language)

데이터베이스와 대화하는 언어입니다.

**데이터 조회 (SELECT):**
```sql
-- 모든 사용자 조회
SELECT * FROM users;

-- 특정 조건으로 조회
SELECT name, email FROM users WHERE status = 'active';

-- 정렬
SELECT * FROM posts ORDER BY created_at DESC;

-- 제한
SELECT * FROM posts LIMIT 10;
```

**데이터 삽입 (INSERT):**
```sql
INSERT INTO users (name, email, password)
VALUES ('홍길동', 'hong@example.com', 'hashed_password');
```

**데이터 수정 (UPDATE):**
```sql
UPDATE users
SET name = '김철수'
WHERE id = 123;
```

**데이터 삭제 (DELETE):**
```sql
DELETE FROM users WHERE id = 123;
```

**테이블 생성:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 18.2 Runtime (실행 환경)

### PostgreSQL

오픈소스 관계형 데이터베이스입니다.

**특징:**
- ACID 트랜잭션 지원
- JSON 데이터 타입 지원
- 전문 검색 (Full-Text Search)
- 확장성 (Extensions)

**주요 데이터 타입:**

| 타입 | 설명 | 예시 |
|-----|------|------|
| `UUID` | 고유 식별자 | `'a1b2c3d4-...'` |
| `VARCHAR(n)` | 가변 길이 문자열 | `'홍길동'` |
| `TEXT` | 긴 텍스트 | 게시글 본문 |
| `INTEGER` | 정수 | `42` |
| `BOOLEAN` | 참/거짓 | `true`, `false` |
| `TIMESTAMP` | 날짜/시간 | `'2025-12-21 15:30:00'` |
| `JSONB` | JSON 데이터 | `{"key": "value"}` |

**SSALWorks**: Supabase가 제공하는 PostgreSQL을 사용합니다.

---

## 18.3 Package Manager (패키지 관리자)

Database 영역에서는 패키지 관리자를 사용하지 않습니다. 데이터베이스는 SQL로 직접 관리합니다.

---

## 18.4 Tools (도구)

### Supabase Dashboard

웹 기반 데이터베이스 관리 도구입니다.

**주요 기능:**
- **Table Editor**: 테이블 생성/수정/삭제
- **SQL Editor**: SQL 쿼리 직접 실행
- **Database**: 스키마, 인덱스, 정책 관리
- **Authentication**: 사용자 관리
- **Storage**: 파일 저장소
- **Logs**: 쿼리 로그, 에러 로그

**사용법:**
1. https://supabase.com 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 기능 선택

### pgAdmin

PostgreSQL 전용 GUI 관리 도구입니다.

**특징:**
- 로컬 설치형
- 복잡한 쿼리 작성에 유용
- ERD (Entity Relationship Diagram) 지원

**SSALWorks**: Supabase Dashboard를 주로 사용합니다.

---

## 18.5 Library (라이브러리)

### @supabase/supabase-js

Supabase JavaScript 클라이언트입니다.

**설치:**
```bash
npm install @supabase/supabase-js
```

**초기화:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);
```

**데이터 조회:**
```typescript
// 전체 조회
const { data, error } = await supabase
    .from('users')
    .select('*');

// 조건 조회
const { data } = await supabase
    .from('users')
    .select('name, email')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10);
```

**데이터 삽입:**
```typescript
const { data, error } = await supabase
    .from('users')
    .insert({ name: '홍길동', email: 'hong@example.com' })
    .select();
```

**데이터 수정:**
```typescript
const { data, error } = await supabase
    .from('users')
    .update({ name: '김철수' })
    .eq('id', 123)
    .select();
```

**데이터 삭제:**
```typescript
const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', 123);
```

**SSALWorks**: 모든 DB 작업에 supabase-js를 사용합니다.

---

## 18.6 Framework (프레임워크)

Database 영역에서는 별도의 프레임워크를 사용하지 않습니다. Supabase가 ORM 없이도 충분한 기능을 제공합니다.

---

## 18.7 External Service (외부 서비스)

### Supabase (BaaS - Backend as a Service)

Firebase의 오픈소스 대안으로, PostgreSQL 기반의 BaaS입니다.

**Supabase가 제공하는 기능:**

| 기능 | 설명 |
|-----|------|
| **Database** | PostgreSQL 데이터베이스 |
| **Auth** | 인증/인가 시스템 |
| **Storage** | 파일 저장소 |
| **Realtime** | 실시간 데이터 동기화 |
| **Edge Functions** | 서버리스 함수 |

**왜 Supabase인가?**

| 항목 | Firebase | Supabase |
|-----|----------|----------|
| 데이터베이스 | NoSQL | **PostgreSQL** (SQL) |
| 오픈소스 | ❌ | ✅ |
| 셀프호스팅 | ❌ | ✅ |
| 가격 | 비쌈 | 저렴함 |
| 확장성 | 제한적 | PostgreSQL 생태계 |

**Supabase 무료 플랜:**
- 500MB 데이터베이스
- 1GB 파일 스토리지
- 50,000 MAU (월간 활성 사용자)
- 무제한 API 요청

**SSALWorks**: Supabase를 데이터베이스 서비스로 사용합니다.

---

## 데이터베이스 설계 원칙

### 1. 정규화

데이터 중복을 최소화합니다.

```sql
-- ❌ 나쁜 예: 중복 데이터
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_name VARCHAR(100),  -- 중복!
    user_email VARCHAR(255), -- 중복!
    product_name VARCHAR(100)
);

-- ✅ 좋은 예: 정규화
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),  -- 외래 키
    product_name VARCHAR(100)
);
```

### 2. 인덱스

자주 검색하는 컬럼에 인덱스를 추가합니다.

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

### 3. RLS (Row Level Security)

행 단위 보안 정책입니다.

```sql
-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 정책: 본인 게시글만 수정 가능
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id);
```

---

## 정리

| 기술 스택 | SSALWorks 선택 |
|----------|---------------|
| Language | **SQL** |
| Runtime | **PostgreSQL** |
| Package Manager | - |
| Tools | **Supabase Dashboard**, pgAdmin |
| Library | **@supabase/supabase-js** |
| Framework | - |
| External Service | **Supabase (BaaS)** |

Database는 애플리케이션의 심장입니다. 다음 편에서는 인증과 인가를 담당하는 **Security**를 알아봅니다.

---

**작성일: 2025-12-21 / 글자수: 약 5,400자 / 작성자: Claude / 프롬프터: 써니**

