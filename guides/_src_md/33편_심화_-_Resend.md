# 33편 | 심화 - Resend

---

14편에서 외부 서비스로 Resend를 소개했습니다. 이번 편에서는 Resend를 사용해 **이메일을 발송하는 실전 방법**을 다룹니다.

## 1. Resend란

### 1-1. 정의

**Resend**는 개발자를 위한 이메일 API 서비스입니다. 회원가입 인증, 비밀번호 재설정, 알림 등 트랜잭셔널 이메일을 쉽게 발송합니다.

### 1-2. 왜 Resend인가

| 장점 | 설명 |
|------|------|
| 간단한 API | 몇 줄의 코드로 이메일 발송 |
| 높은 전달률 | 스팸함에 안 가도록 최적화 |
| React Email | React로 이메일 템플릿 작성 |
| 무료 티어 | 월 3,000통 무료 |

### 1-3. 무료 티어 제한

| 항목 | 무료 제한 |
|------|----------|
| 월 발송량 | 3,000통 |
| 일 발송량 | 100통 |
| 도메인 | 1개 |
| API 키 | 무제한 |

---

## 2. 설정하기

### 2-1. 계정 생성

1. https://resend.com 접속
2. GitHub 또는 Google로 가입
3. Dashboard 접속

### 2-2. API 키 생성

1. **API Keys** → **Create API Key**
2. 이름 입력 (예: `production`)
3. Permission: **Full access** 또는 **Sending access**
4. 키 복사 (한 번만 표시!)

```
re_xxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2-3. 도메인 인증 (선택)

기본은 `onboarding@resend.dev`로 발송됩니다.
자체 도메인 사용 시:

1. **Domains** → **Add Domain**
2. 도메인 입력 (예: `mail.example.com`)
3. DNS 레코드 추가:

| Type | Name | Value |
|------|------|-------|
| MX | mail | feedback-smtp.resend.com |
| TXT | mail | v=spf1 include:resend.com ~all |
| TXT | resend._domainkey.mail | 제공된 값 |

---

## 3. 기본 사용법

### 3-1. 설치

```bash
npm install resend
```

### 3-2. 기본 발송

```javascript
import { Resend } from 'resend';

const resend = new Resend('re_xxxxx...');

async function sendEmail() {
    const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',  // 또는 자체 도메인
        to: 'user@example.com',
        subject: '안녕하세요!',
        html: '<p>이메일 본문입니다.</p>'
    });

    if (error) {
        console.error('발송 실패:', error);
        return;
    }

    console.log('발송 성공:', data.id);
}
```

### 3-3. 여러 수신자

```javascript
await resend.emails.send({
    from: 'noreply@example.com',
    to: ['user1@example.com', 'user2@example.com'],
    subject: '공지사항',
    html: '<p>중요 공지입니다.</p>'
});
```

### 3-4. CC/BCC

```javascript
await resend.emails.send({
    from: 'noreply@example.com',
    to: 'user@example.com',
    cc: ['manager@example.com'],
    bcc: ['admin@example.com'],
    subject: '보고서',
    html: '<p>첨부 보고서입니다.</p>'
});
```

---

## 4. HTML 이메일 템플릿

### 4-1. 간단한 템플릿

```javascript
function welcomeEmailTemplate(name) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>환영합니다!</h1>
        </div>
        <div class="content">
            <p>안녕하세요, ${name}님!</p>
            <p>SSALWorks에 가입해주셔서 감사합니다.</p>
            <p><a href="https://ssalworks.com/dashboard" class="button">시작하기</a></p>
        </div>
    </div>
</body>
</html>
    `;
}

// 사용
await resend.emails.send({
    from: 'SSALWorks <noreply@ssalworks.com>',
    to: 'user@example.com',
    subject: 'SSALWorks에 오신 것을 환영합니다!',
    html: welcomeEmailTemplate('홍길동')
});
```

### 4-2. 이메일 인증 템플릿

```javascript
function verificationEmailTemplate(code) {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        .code { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #3b82f6; }
    </style>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>이메일 인증</h2>
        <p>아래 인증 코드를 입력해주세요:</p>
        <p class="code">${code}</p>
        <p>이 코드는 10분간 유효합니다.</p>
        <p style="color: #666; font-size: 12px;">본인이 요청하지 않았다면 이 이메일을 무시하세요.</p>
    </div>
</body>
</html>
    `;
}
```

### 4-3. 비밀번호 재설정 템플릿

```javascript
function passwordResetTemplate(resetLink) {
    return `
<!DOCTYPE html>
<html>
<body>
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>비밀번호 재설정</h2>
        <p>비밀번호 재설정을 요청하셨습니다.</p>
        <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>
        <p>
            <a href="${resetLink}"
               style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                비밀번호 재설정
            </a>
        </p>
        <p style="color: #666; font-size: 12px;">
            이 링크는 1시간 후 만료됩니다.<br>
            본인이 요청하지 않았다면 이 이메일을 무시하세요.
        </p>
    </div>
</body>
</html>
    `;
}
```

---

## 5. Vercel 서버리스 함수에서 사용

### 5-1. 환경변수 설정

Vercel Dashboard → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| RESEND_API_KEY | re_xxxxx... |

### 5-2. API 함수 작성

```javascript
// api/email/send-welcome.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, name } = req.body;

    if (!email || !name) {
        return res.status(400).json({ error: 'email과 name이 필요합니다' });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'SSALWorks <noreply@ssalworks.com>',
            to: email,
            subject: 'SSALWorks에 오신 것을 환영합니다!',
            html: `<p>안녕하세요, ${name}님! 가입을 환영합니다.</p>`
        });

        if (error) {
            console.error('Resend 에러:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true, id: data.id });
    } catch (error) {
        console.error('발송 실패:', error);
        return res.status(500).json({ error: '이메일 발송 실패' });
    }
}
```

### 5-3. 프론트엔드에서 호출

```javascript
async function sendWelcomeEmail(email, name) {
    const response = await fetch('/api/email/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
    });

    const result = await response.json();

    if (result.success) {
        console.log('이메일 발송 완료');
    } else {
        console.error('발송 실패:', result.error);
    }
}
```

---

## 6. 실전 예시: 이메일 인증 시스템

### 6-1. 인증 코드 생성

```javascript
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
```

### 6-2. 인증 코드 발송 API

```javascript
// api/email/send-verification.js
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;

    // 인증 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);  // 10분 후

    // DB에 저장
    const { error: dbError } = await supabase
        .from('verification_codes')
        .upsert({
            email,
            code,
            expires_at: expiresAt.toISOString()
        });

    if (dbError) {
        return res.status(500).json({ error: 'DB 저장 실패' });
    }

    // 이메일 발송
    const { error: emailError } = await resend.emails.send({
        from: 'SSALWorks <noreply@ssalworks.com>',
        to: email,
        subject: '[SSALWorks] 이메일 인증 코드',
        html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>이메일 인증</h2>
                <p>아래 인증 코드를 입력해주세요:</p>
                <p style="font-size: 32px; font-weight: bold; color: #3b82f6;">${code}</p>
                <p>이 코드는 10분간 유효합니다.</p>
            </div>
        `
    });

    if (emailError) {
        return res.status(500).json({ error: '이메일 발송 실패' });
    }

    return res.status(200).json({ success: true });
}
```

### 6-3. 인증 코드 확인 API

```javascript
// api/email/verify-code.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, code } = req.body;

    // DB에서 코드 확인
    const { data, error } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (error || !data) {
        return res.status(400).json({ error: '잘못된 인증 코드입니다' });
    }

    // 사용된 코드 삭제
    await supabase
        .from('verification_codes')
        .delete()
        .eq('email', email);

    return res.status(200).json({ success: true, verified: true });
}
```

---

## 7. 이메일 작성 팁

### 7-1. 스팸 방지

- **From 주소**: 인증된 도메인 사용
- **제목**: 스팸 키워드 피하기 (무료, 긴급 등)
- **본문**: HTML/텍스트 비율 적절히
- **구독 취소**: 링크 포함 (마케팅 이메일)

### 7-2. 이메일 클라이언트 호환성

```html
<!-- 인라인 스타일 사용 (외부 CSS 지원 안 됨) -->
<div style="font-family: Arial, sans-serif;">

<!-- 테이블 레이아웃 (호환성 최고) -->
<table width="600" cellpadding="0" cellspacing="0">
    <tr>
        <td style="padding: 20px;">내용</td>
    </tr>
</table>

<!-- 웹 폰트 대신 시스템 폰트 -->
font-family: Arial, Helvetica, sans-serif;
```

### 7-3. 테스트

1. 실제 이메일로 발송 테스트
2. Gmail, Outlook, 네이버 등 여러 클라이언트 확인
3. 모바일에서도 확인

---

## 8. 문제 해결

### 문제 1: 스팸함으로 분류

**해결:**
- 도메인 인증 (SPF, DKIM)
- From 주소 일관성 유지
- 구독 취소 링크 추가

### 문제 2: 발송 한도 초과

**해결:**
- 일일 100통 제한 확인
- 유료 플랜 업그레이드
- 발송 큐 구현

### 문제 3: 이미지가 안 보임

**해결:**
- 절대 URL 사용
- alt 텍스트 추가
- 이미지 호스팅 서비스 사용

---

## 정리

Resend는 **개발자 친화적인 이메일 API**입니다.

**핵심 사용법:**
- `resend.emails.send()`로 발송
- HTML 템플릿으로 디자인
- 환경변수로 API 키 관리

**무료 티어로 충분:**
- 월 3,000통, 일 100통
- 개인 프로젝트에 적합

도메인 인증하면 전달률이 높아집니다.

---

**작성일: 2025-12-21 / 작성자: Claude Code**
