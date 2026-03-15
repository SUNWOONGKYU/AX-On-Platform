# 17편 | 개발 영역 - Backend API (백엔드 API)

---

프론트엔드와 데이터베이스를 연결하는 다리, **Backend API**입니다. 비즈니스 로직을 처리하고, 데이터를 검증하고, 응답을 반환하는 핵심 영역입니다.

---

## 17.1 Language (언어)

### JavaScript & TypeScript

API 개발에도 TypeScript를 사용합니다.

**TypeScript의 이점:**
| 이점 | 설명 |
|------|------|
| 요청/응답 타입 정의 | 어떤 데이터가 오가는지 명확 |
| 실수 방지 | 잘못된 필드명 자동 감지 |
| IDE 자동완성 | 개발 속도 향상 |

> **Claude Code가 TypeScript API를 자동으로 작성**해줍니다.

---

## 17.2 Runtime (실행 환경)

### Node.js

전통적인 서버 실행 환경입니다. 파일 읽기/쓰기 등 모든 서버 기능을 사용할 수 있습니다.

### Edge Runtime

CDN 엣지에서 실행되는 경량 런타임입니다. 사용자와 가까운 곳에서 빠르게 응답합니다.

**Node.js vs Edge Runtime:**

| 구분 | Node.js | Edge |
|-----|---------|------|
| 콜드 스타트 | 느림 | 빠름 |
| API 지원 | 전체 | 제한적 |
| 실행 위치 | 특정 리전 | 전 세계 CDN |
| 용도 | 복잡한 로직 | 간단한 API |

**SSALWorks**: 대부분 Node.js, 간단한 API는 Edge 사용.

---

## 17.3 Package Manager (패키지 관리자)

### npm

API 개발에 필요한 패키지를 관리합니다.

**SSALWorks API 필수 패키지:**
| 패키지 | 용도 |
|--------|------|
| zod | 데이터 검증 |
| @supabase/supabase-js | DB 연동 |

> **Claude Code가 필요한 패키지를 자동으로 설치**해줍니다.

---

## 17.4 Tools (도구)

### Postman

API를 테스트하는 도구입니다.

**주요 기능:**
- 요청 보내기 (GET, POST, PUT, DELETE)
- 헤더, 바디 설정
- 환경 변수 관리
- 자동화 테스트

**사용 예시:** 로그인 API를 테스트할 때, Postman에서 URL, 이메일, 비밀번호를 입력하고 요청을 보내면 결과를 바로 확인할 수 있습니다.

### Thunder Client

VS Code 확장 프로그램으로, Postman과 유사한 기능을 제공합니다.

**장점:**
- VS Code 내에서 바로 사용
- 가볍고 빠름
- 무료

**SSALWorks**: Thunder Client를 주로 사용합니다.

---

## 17.5 Library (라이브러리)

### Zod

TypeScript 기반 데이터 검증 라이브러리입니다.

**Zod가 하는 일:** "이메일은 이메일 형식이어야 해", "비밀번호는 8자 이상이어야 해" 같은 규칙을 정의하고, 입력값이 규칙에 맞는지 자동으로 검증합니다.

**Zod의 장점:**
| 장점 | 설명 |
|------|------|
| 런타임 검증 | 실제 실행 시 데이터 확인 |
| 타입 추론 | TypeScript 타입 자동 생성 |
| 상세한 에러 | "이메일 형식이 아닙니다" 같은 메시지 |
| Next.js 호환 | SSALWorks와 완벽 호환 |

> **Claude Code가 Zod 검증 코드를 자동으로 작성**해줍니다. 여러분은 "이메일과 비밀번호 검증해줘"라고 요청하면 됩니다.

---

## 17.6 Framework (프레임워크)

### Next.js API Routes

Next.js의 내장 API 기능입니다. 폴더 구조가 곧 API URL이 됩니다.

**폴더 구조 = API URL:**
| 폴더 경로 | API URL | 기능 |
|----------|---------|------|
| `app/api/auth/login/route.ts` | `/api/auth/login` | 로그인 |
| `app/api/users/route.ts` | `/api/users` | 회원 목록/등록 |
| `app/api/users/[id]/route.ts` | `/api/users/123` | 특정 회원 조회 |

**HTTP 메서드:**
| 메서드 | 용도 |
|--------|------|
| GET | 조회 |
| POST | 생성 |
| PUT | 수정 |
| DELETE | 삭제 |

> **Claude Code가 API 코드를 자동으로 생성**해줍니다. 여러분은 "로그인 API 만들어줘"라고 요청하면 됩니다.

---

## 17.7 External Service (외부 서비스)

Backend API 영역에서는 별도의 외부 서비스를 사용하지 않습니다. 필요한 서비스는 다른 영역에서 연동합니다:
- 데이터베이스 → Database 영역 (Supabase)
- 인증 → Security 영역 (Supabase Auth)
- 이메일 → Backend Infra 영역 (Resend)

---

## API 설계 원칙

### RESTful API

| URL | GET | POST | PUT | DELETE |
|-----|-----|------|-----|--------|
| `/api/users` | 목록 조회 | 생성 | - | - |
| `/api/users/123` | 단일 조회 | - | 수정 | 삭제 |

### 응답 형식

| 결과 | 응답 내용 |
|------|----------|
| 성공 | `{ success: true, data: {...} }` |
| 에러 | `{ success: false, error: {...} }` |

---

## 정리

| 기술 스택 | SSALWorks 선택 |
|----------|---------------|
| Language | JavaScript, **TypeScript** |
| Runtime | **Node.js**, Edge Runtime |
| Package Manager | **npm** |
| Tools | Postman, **Thunder Client** |
| Library | **Zod** |
| Framework | **Next.js API Routes** |
| External Service | - |

Backend API는 비즈니스 로직의 핵심입니다. 다음 편에서는 데이터를 저장하는 **Database**를 알아봅니다.

---

**작성일: 2025-12-21 / 글자수: 약 5,200자 / 작성자: Claude / 프롬프터: 써니**

