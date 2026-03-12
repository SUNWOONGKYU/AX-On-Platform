# 16편 | 개발 영역 - Backend Infra (백엔드 기반)

---

서버가 돌아가는 기반 환경, **Backend Infra**입니다. 실시간 통신, 파일 처리, 이메일 발송 등 서버 인프라를 구성하는 기술들을 다룹니다.

---

## 16.1 Language (언어)

### JavaScript & TypeScript

백엔드에서도 프론트엔드와 동일한 언어를 사용합니다.

```typescript
// 서버 사이드 TypeScript
import express from 'express';

const app = express();

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from server!' });
});
```

**장점:**
- 프론트엔드/백엔드 동일 언어 → 학습 비용 감소
- 코드 공유 가능 (유틸리티, 타입 정의)
- npm 생태계 공유

**SSALWorks**: TypeScript를 기본으로 사용합니다.

---

## 16.2 Runtime (실행 환경)

### Node.js

서버에서 JavaScript를 실행하는 런타임입니다.

```bash
node server.js    # Node.js로 서버 실행
```

**특징:**
- V8 엔진 기반 (Chrome과 동일)
- 비동기 I/O (높은 동시성)
- 이벤트 루프 기반
- 단일 스레드 (멀티 프로세스로 확장)

**버전 관리:**

```bash
# nvm으로 Node.js 버전 관리
nvm install 20
nvm use 20
node -v  # v20.x.x
```

**SSALWorks**: Node.js 20 LTS를 사용합니다.

### Node.js vs Browser

| 구분 | Browser | Node.js |
|-----|---------|---------|
| DOM | ✅ 있음 | ❌ 없음 |
| window | ✅ 있음 | ❌ 없음 |
| fs (파일) | ❌ 없음 | ✅ 있음 |
| 네트워크 | fetch | fetch, http |

---

## 16.3 Package Manager (패키지 관리자)

### npm & yarn

프론트엔드와 동일한 패키지 관리자를 사용합니다.

```bash
# 백엔드 패키지 설치 예시
npm install express socket.io
npm install -D nodemon typescript
```

**package.json 스크립트:**

```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

---

## 16.4 Tools (도구)

### Webpack

모듈 번들러입니다. 여러 파일을 하나로 묶어줍니다.

```javascript
// webpack.config.js
module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader' },
        ],
    },
};
```

**하는 일:**
- 여러 파일 → 하나의 번들로
- TypeScript → JavaScript 변환
- 코드 압축 (minify)
- 트리 쉐이킹 (사용 안 하는 코드 제거)

**참고**: Next.js를 사용하면 Webpack 설정이 자동으로 처리됩니다.

### nodemon

개발 중 파일 변경 시 자동으로 서버를 재시작합니다.

```bash
npx nodemon src/server.ts
# 파일 저장할 때마다 서버 자동 재시작
```

---

## 16.5 Library (라이브러리)

### Socket.io

실시간 양방향 통신 라이브러리입니다.

```javascript
// 서버
import { Server } from 'socket.io';

const io = new Server(server);

io.on('connection', (socket) => {
    console.log('사용자 연결됨');

    socket.on('chat', (message) => {
        io.emit('chat', message);  // 모든 사용자에게 전송
    });
});
```

```javascript
// 클라이언트
import { io } from 'socket.io-client';

const socket = io();

socket.emit('chat', '안녕하세요!');
socket.on('chat', (msg) => console.log(msg));
```

**사용 사례:**
- 실시간 채팅
- 실시간 알림
- 협업 도구 (동시 편집)
- 게임

### chokidar

파일 시스템 변경을 감지하는 라이브러리입니다.

```javascript
import chokidar from 'chokidar';

chokidar.watch('./uploads').on('all', (event, path) => {
    console.log(event, path);
    // add, change, unlink 등 이벤트 감지
});
```

**사용 사례:**
- 파일 업로드 감지
- 자동 빌드 트리거
- 로그 파일 모니터링

---

## 16.6 Framework (프레임워크)

Backend Infra 영역에서는 별도의 프레임워크를 사용하지 않습니다. Next.js가 API Routes를 통해 백엔드 기능을 제공하므로, 별도의 Express 등을 사용하지 않아도 됩니다.

---

## 16.7 External Service (외부 서비스)

### Resend (이메일 발송 서비스)

개발자 친화적인 이메일 API 서비스입니다.

```typescript
import { Resend } from 'resend';

const resend = new Resend('re_xxxxx');

await resend.emails.send({
    from: 'SSALWorks <noreply@ssalworks.com>',
    to: 'user@example.com',
    subject: '가입을 환영합니다!',
    html: '<h1>환영합니다!</h1><p>SSALWorks에 가입해 주셔서 감사합니다.</p>',
});
```

**특징:**
- 간단한 API
- React Email 지원 (React 컴포넌트로 이메일 작성)
- 높은 전달률
- 상세한 분석 (열람, 클릭 추적)

**사용 사례:**
- 회원가입 확인 이메일
- 비밀번호 재설정
- 결제 영수증
- 마케팅 이메일

**SSALWorks**: Resend를 이메일 발송에 사용합니다.

### 왜 Resend인가?

| 서비스 | 장점 | 단점 |
|-------|------|------|
| **Resend** | 간단한 API, React Email | 신생 서비스 |
| SendGrid | 안정성, 기능 풍부 | 복잡한 설정 |
| AWS SES | 저렴함 | 설정 어려움 |
| Mailgun | 좋은 전달률 | 유럽 중심 |

---

## 정리

| 기술 스택 | SSALWorks 선택 |
|----------|---------------|
| Language | JavaScript, **TypeScript** |
| Runtime | **Node.js** 20 LTS |
| Package Manager | **npm** |
| Tools | Webpack (Next.js 내장) |
| Library | Socket.io, chokidar |
| Framework | - (Next.js 사용) |
| External Service | **Resend** |

Backend Infra는 서버가 돌아가는 기반을 담당합니다. 다음 편에서는 비즈니스 로직을 처리하는 **Backend API**를 알아봅니다.

---

**작성일: 2025-12-21 / 글자수: 약 4,800자 / 작성자: Claude / 프롬프터: 써니**

