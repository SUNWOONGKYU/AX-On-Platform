# 29편 | 심화 - SQL

---

18편에서 데이터베이스 영역을 다뤘습니다. 이번 편에서는 **SQL(Structured Query Language)**을 깊이 있게 살펴봅니다. 데이터를 다루는 핵심 언어입니다.

## 1. SQL이란

### 1-1. 정의

**SQL**은 데이터베이스와 대화하는 언어입니다. 데이터를 조회, 추가, 수정, 삭제하는 모든 작업에 사용합니다.

### 1-2. SQL 종류

| 분류 | 설명 | 명령어 |
|------|------|--------|
| DDL | 구조 정의 | CREATE, ALTER, DROP |
| DML | 데이터 조작 | SELECT, INSERT, UPDATE, DELETE |
| DCL | 권한 제어 | GRANT, REVOKE |

---

## 2. 테이블 생성 (DDL)

### 2-1. CREATE TABLE

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2-2. 주요 데이터 타입

| 타입 | 설명 | 예시 |
|------|------|------|
| `VARCHAR(n)` | 가변 문자열 | 이름, 이메일 |
| `TEXT` | 긴 문자열 | 본문 내용 |
| `INTEGER` | 정수 | 나이, 수량 |
| `NUMERIC(p,s)` | 소수점 숫자 | 금액 |
| `BOOLEAN` | 참/거짓 | 활성 상태 |
| `TIMESTAMP` | 날짜+시간 | 생성일 |
| `UUID` | 고유 식별자 | ID |
| `JSONB` | JSON 데이터 | 설정 |

### 2-3. 제약 조건

```sql
-- PRIMARY KEY: 고유 식별자
id UUID PRIMARY KEY

-- NOT NULL: 필수값
email VARCHAR(255) NOT NULL

-- UNIQUE: 중복 불가
email VARCHAR(255) UNIQUE

-- DEFAULT: 기본값
created_at TIMESTAMP DEFAULT NOW()

-- FOREIGN KEY: 외래 키
user_id UUID REFERENCES users(id)

-- CHECK: 조건 검사
plan VARCHAR(20) CHECK (plan IN ('free', 'pro', 'enterprise'))
```

---

## 3. 데이터 조회 (SELECT)

### 3-1. 기본 조회

```sql
-- 모든 열 조회
SELECT * FROM users;

-- 특정 열만 조회
SELECT id, name, email FROM users;

-- 조건 조회
SELECT * FROM users WHERE plan = 'pro';

-- 정렬
SELECT * FROM users ORDER BY created_at DESC;

-- 개수 제한
SELECT * FROM users LIMIT 10;
SELECT * FROM users LIMIT 10 OFFSET 20;  -- 21~30번째
```

### 3-2. 조건 연산자

```sql
-- 비교
WHERE age > 18
WHERE age >= 18
WHERE age < 30
WHERE age <= 30
WHERE age != 25

-- 논리
WHERE plan = 'pro' AND status = 'active'
WHERE plan = 'free' OR plan = 'pro'
WHERE NOT status = 'cancelled'

-- 범위
WHERE age BETWEEN 18 AND 30

-- 목록
WHERE plan IN ('pro', 'enterprise')

-- 패턴 (LIKE)
WHERE email LIKE '%@gmail.com'  -- @gmail.com으로 끝나는
WHERE name LIKE '김%'           -- 김으로 시작하는

-- NULL 체크
WHERE deleted_at IS NULL
WHERE deleted_at IS NOT NULL
```

### 3-3. 집계 함수

```sql
-- 개수
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM users WHERE plan = 'pro';

-- 합계/평균/최대/최소
SELECT SUM(amount) FROM payments;
SELECT AVG(amount) FROM payments;
SELECT MAX(amount) FROM payments;
SELECT MIN(amount) FROM payments;

-- 그룹별 집계
SELECT plan, COUNT(*) as count
FROM users
GROUP BY plan;

-- 그룹 조건
SELECT plan, COUNT(*) as count
FROM users
GROUP BY plan
HAVING COUNT(*) > 10;
```

---

## 4. 데이터 추가 (INSERT)

```sql
-- 단일 행 추가
INSERT INTO users (email, name, password_hash)
VALUES ('hong@example.com', '홍길동', 'hashed_password');

-- 여러 행 추가
INSERT INTO users (email, name, password_hash)
VALUES
    ('kim@example.com', '김철수', 'hash1'),
    ('lee@example.com', '이영희', 'hash2');

-- 추가 후 결과 반환
INSERT INTO users (email, name, password_hash)
VALUES ('hong@example.com', '홍길동', 'hashed_password')
RETURNING id, email, created_at;
```

---

## 5. 데이터 수정 (UPDATE)

```sql
-- 단일 조건
UPDATE users
SET plan = 'pro'
WHERE id = 'user_123';

-- 여러 열 수정
UPDATE users
SET
    plan = 'enterprise',
    updated_at = NOW()
WHERE id = 'user_123';

-- 수정 후 결과 반환
UPDATE users
SET plan = 'pro'
WHERE id = 'user_123'
RETURNING *;
```

**주의:** WHERE 없이 UPDATE하면 **모든 행**이 수정됩니다!

---

## 6. 데이터 삭제 (DELETE)

```sql
-- 조건부 삭제
DELETE FROM users WHERE id = 'user_123';

-- 삭제 후 결과 반환
DELETE FROM users WHERE id = 'user_123'
RETURNING *;
```

**주의:** WHERE 없이 DELETE하면 **모든 행**이 삭제됩니다!

### 6-1. Soft Delete (권장)

실제 삭제 대신 삭제 표시:

```sql
-- 테이블에 deleted_at 열 추가
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

-- 삭제 시 시간만 기록
UPDATE users
SET deleted_at = NOW()
WHERE id = 'user_123';

-- 조회 시 삭제된 항목 제외
SELECT * FROM users WHERE deleted_at IS NULL;
```

---

## 7. JOIN

### 7-1. JOIN 종류

```
INNER JOIN: 양쪽 모두 있는 것만
LEFT JOIN:  왼쪽 테이블 기준 (오른쪽 없으면 NULL)
RIGHT JOIN: 오른쪽 테이블 기준
FULL JOIN:  양쪽 모두 포함
```

### 7-2. 예시

```sql
-- 사용자와 구독 정보 함께 조회
SELECT
    u.id,
    u.name,
    u.email,
    s.plan,
    s.status
FROM users u
INNER JOIN subscriptions s ON u.id = s.user_id;

-- 구독이 없는 사용자도 포함
SELECT
    u.id,
    u.name,
    s.plan
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id;
```

### 7-3. 다중 JOIN

```sql
SELECT
    u.name,
    s.plan,
    p.amount,
    p.created_at as payment_date
FROM users u
JOIN subscriptions s ON u.id = s.user_id
JOIN payments p ON s.id = p.subscription_id
WHERE p.status = 'completed'
ORDER BY p.created_at DESC;
```

---

## 8. 서브쿼리

### 8-1. WHERE 절에서

```sql
-- 결제한 적 있는 사용자
SELECT * FROM users
WHERE id IN (
    SELECT DISTINCT user_id FROM payments
);

-- 평균보다 많이 결제한 사용자
SELECT * FROM payments
WHERE amount > (
    SELECT AVG(amount) FROM payments
);
```

### 8-2. FROM 절에서

```sql
-- 월별 결제 합계에서 최대값
SELECT MAX(monthly_total)
FROM (
    SELECT
        DATE_TRUNC('month', created_at) as month,
        SUM(amount) as monthly_total
    FROM payments
    GROUP BY DATE_TRUNC('month', created_at)
) as monthly_payments;
```

---

## 9. 인덱스

### 9-1. 인덱스란

인덱스는 **책의 색인**과 같습니다. 전체를 읽지 않고 빠르게 찾습니다.

### 9-2. 인덱스 생성

```sql
-- 단일 열 인덱스
CREATE INDEX idx_users_email ON users(email);

-- 복합 인덱스
CREATE INDEX idx_users_plan_status ON users(plan, status);

-- 고유 인덱스
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
```

### 9-3. 인덱스 권장 대상

- WHERE 절에 자주 사용되는 열
- JOIN 조건에 사용되는 열
- ORDER BY 에 사용되는 열
- 고유해야 하는 열 (email 등)

---

## 10. 실전 예시

### 10-1. 사용자 + 구독 테이블

```sql
-- 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 구독 테이블
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    plan VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### 10-2. 자주 쓰는 쿼리

```sql
-- 활성 구독 사용자 조회
SELECT u.*, s.plan, s.expires_at
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE s.status = 'active'
ORDER BY u.created_at DESC;

-- 구독 만료 예정 사용자 (7일 이내)
SELECT u.email, s.plan, s.expires_at
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE s.expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days';

-- 플랜별 사용자 수
SELECT
    s.plan,
    COUNT(*) as user_count
FROM subscriptions s
WHERE s.status = 'active'
GROUP BY s.plan
ORDER BY user_count DESC;
```

---

## 정리

SQL은 데이터베이스와 대화하는 언어입니다.

**핵심 명령어:**
- `SELECT`: 조회
- `INSERT`: 추가
- `UPDATE`: 수정 (WHERE 필수!)
- `DELETE`: 삭제 (WHERE 필수!)
- `JOIN`: 테이블 연결

**주의사항:**
- UPDATE/DELETE는 반드시 WHERE 조건 확인
- 실제 삭제보다 Soft Delete 권장
- 자주 조회하는 열에 인덱스 추가

---

**작성일: 2025-12-21 / 작성자: Claude Code**
