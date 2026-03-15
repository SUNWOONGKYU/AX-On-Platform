# AX-On Platform — Claude Code 작업 요청서

## 프로젝트 개요

**프로젝트명**: AX-On Platform (AI 전문가 풀 미니버전)
**목적**: AI 전문가 30명 이상을 모집·관리하고, 커뮤니티를 운영하는 웹 플랫폼
**작성일**: 2026년 3월 11일
**요청자**: 써니

---

## 1. 기술 스택

- **프론트엔드**: 바닐라 HTML / CSS / JavaScript (프레임워크 없음)
- **백엔드/DB**: Supabase (Auth + Database + Storage)
- **배포**: Vercel (정적 사이트 배포)
- **별도 빌드 도구 없음** — HTML 파일 그대로 배포

---

## 2. 현재 완료된 작업

Claude.ai에서 아래 산출물이 만들어졌으며, 이를 기반으로 실제 배포 가능한 프로젝트를 구축해야 합니다.

### 2-1. 항목 기준 가이드 (아티팩트)
- AI 전문가 개인별 미니 풀스택 웹사이트에 포함될 26개 항목 정의
- 9개 섹션: 프로필 / AI 역량 / 비전 & 목표 / 상품 & 서비스 / AI 아바타 챗봇 / 콘텐츠 & 소셜 / 회원가입 & 인터랙션 / 배포 / AX-On Platform 연동

### 2-2. 플랫폼 프로토타입 (React 아티팩트)
- 인증 (이메일+비밀번호 / Google 소셜 로그인)
- 전문가 풀 (카드형/리스트형 전환, 전문가 등록 6단계 폼)
- 커뮤니티 (공지사항/참고자료/자유토론/지식 Hub 4개 카테고리)

---

## 3. Claude Code에게 요청하는 작업

### Phase 1: 프로젝트 초기 셋업

#### 3-1. 프로젝트 구조 생성

```
ax-on-platform/
├── index.html              # 로그인/회원가입 페이지
├── pool.html               # 전문가 풀 목록 + 등록
├── community.html          # 커뮤니티 게시판
├── css/
│   └── style.css           # 전체 스타일
├── js/
│   ├── supabase-config.js  # Supabase 클라이언트 설정
│   ├── auth.js             # 인증 로직
│   ├── pool.js             # 전문가 풀 로직
│   ├── register.js         # 전문가 등록 폼 로직
│   └── community.js        # 커뮤니티 로직
└── README.md
```

#### 3-2. Supabase 연동
- Supabase JS 클라이언트는 CDN으로 로드
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  ```
- `supabase-config.js`에서 URL, anon key 설정
- 환경변수 대신 config 파일에서 직접 관리 (배포 시 교체)

#### 3-3. 데이터베이스 테이블 생성 (Supabase SQL Editor에서 실행)

```sql
-- 전문가 등록
CREATE TABLE ax_experts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  birth_date date,
  gender text,
  email text,
  phone text,
  tagline text,
  education text,
  career text,
  profile_image_url text,
  ai_experience text,
  ai_projects text,
  ai_tools text[],
  can_build_chatbot text,
  want_to_do text,
  vision text,
  interest_areas text,
  books text,
  products text,
  services text,
  sns_links jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 커뮤니티 게시글
CREATE TABLE ax_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  author_name text,
  category text NOT NULL,
  title text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now()
);

-- 댓글
CREATE TABLE ax_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES ax_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  author_name text,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS 정책
ALTER TABLE ax_experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ax_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ax_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "인증된 사용자 읽기" ON ax_experts FOR SELECT TO authenticated USING (true);
CREATE POLICY "본인 등록" ON ax_experts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "인증된 사용자 읽기" ON ax_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "인증된 사용자 글쓰기" ON ax_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "인증된 사용자 읽기" ON ax_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "인증된 사용자 댓글" ON ax_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

#### 3-4. 인증 설정
- Supabase Auth 연동
- 이메일 + 비밀번호 회원가입 (이메일 인증)
- Google OAuth 소셜 로그인
- 로그인/회원가입 페이지: `index.html`
- 로그인 상태 확인 → 미로그인 시 `index.html`로 리다이렉트

---

### Phase 2: 핵심 기능 구현

#### 3-5. 전문가 풀 페이지 (`pool.html`)

**전문가 목록 보기**
- 카드형 뷰: 프로필사진(또는 이니셜) + 이름 + 한줄소개 + AI도구 태그 + 챗봇제작가능여부
- 리스트형 뷰: 이름 + 소개 + AI도구 태그 (간결)
- 카드형 ↔ 리스트형 토글 버튼
- 등록 인원수 표시
- 등록 완료 사용자에게는 "등록 완료" 상태 표시

**전문가 등록 폼** (pool.html 내 또는 별도 섹션)
- 6단계 스텝 폼 (진행 상태 바 포함)
- Step 1 — 프로필:
  - 이름 (실명, 필수)
  - 생년월일 (필수, 비공개 표시)
  - 성별 (필수, 비공개 표시, 남성/여성 토글)
  - 이메일 (필수)
  - 핸드폰번호 (필수, 비공개 표시)
  - 한 줄 소개
  - 학력
  - 경력/이력 (textarea)
  - 프로필 사진 URL
- Step 2 — AI 역량:
  - AI 활용 경험 (textarea)
  - 대표 프로젝트 (textarea)
  - 활용 AI 도구 (복수 태그 선택)
  - AI 챗봇 직접 제작 가능 여부 (가능/불가능/학습 중 토글)
- Step 3 — 비전 & 목표:
  - 하고 싶은 일 (textarea)
  - 미래 비전 (textarea)
  - 관심/협업 분야 (복수 태그 선택)
- Step 4 — 상품 & 서비스:
  - 저서/출판물 (textarea, 빈칸 허용)
  - 판매 상품 (textarea, 빈칸 허용)
  - 제공 서비스 (textarea, 빈칸 허용)
- Step 5 — 콘텐츠 & 소셜:
  - YouTube, Instagram, LinkedIn, 블로그/브런치, X(Twitter), 기타 URL
- Step 6 — 확인 & 등록:
  - 입력 내용 전체 리뷰 표시
  - 등록 버튼
  - 수정하기 버튼 (이전 스텝으로)

**AI 도구 태그 목록**:
Claude, ChatGPT, Gemini, Grok, Cursor, Copilot, Midjourney, DALL-E, Stable Diffusion, Perplexity, Vrew, ElevenLabs, Runway, NotebookLM, Suno

**관심/협업 분야 태그 목록**:
AI 교육, AI 개발, AI 컨설팅, 핀테크, 헬스케어, 부동산, 마케팅, 콘텐츠 제작, 시니어 창업, 영상 제작, 챗봇 개발, 데이터 분석, 디자인, 법률, 회계/세무, 기타

#### 3-6. 커뮤니티 페이지 (`community.html`)

**게시판 기능**
- 4개 카테고리: 공지사항, 참고자료, 자유토론, 지식 Hub
- 카테고리 필터 버튼 (전체 + 4개)
- 글쓰기: 카테고리 선택 + 제목 + 본문
- 참고자료의 경우 본문에 URL 링크 포함하는 방식
- 글 클릭 시 펼쳐서 본문 + 댓글 표시 (아코디언)
- 댓글 입력 + 등록 기능

**접근 제어**
- 전문가 등록 완료한 사용자만 커뮤니티 이용 가능
- 미등록 사용자: "전문가 등록을 먼저 완료해주세요" 안내 표시

---

### Phase 3: 배포

#### 3-7. Vercel 배포
- GitHub 저장소에 push
- Vercel에서 정적 사이트로 배포 (빌드 명령어 없음, Output Directory: `.`)
- 배포 후 Supabase Auth > Redirect URL에 배포 도메인 추가

#### 3-8. Supabase 추가 설정
- Auth > Providers > Google OAuth 활성화
- Auth > Email 인증 활성화
- Auth > Site URL 및 Redirect URLs에 배포 도메인 등록

---

## 4. 디자인 가이드

### 컬러 팔레트
| 용도 | 색상 |
|------|------|
| Primary (올리브) | `#2B5C3F` |
| Primary Light | `#3D7A54` |
| Mint (액센트) | `#5CBFA0` |
| Orange (강조) | `#E87B3C` |
| 배경 | `#FAFBF9` |
| 카드 | `#FFFFFF` |
| 보더 | `#D4DFD6` |
| 텍스트 | `#2A2A2A` |
| 서브텍스트 | `#6B7B6E` |
| 연한배경 | `#E8F0E8` |

### 카테고리별 색상
| 카테고리 | 색상 |
|----------|------|
| 공지사항 | `#DC2626` |
| 참고자료 | `#2563EB` |
| 자유토론 | `#2B5C3F` |
| 지식 Hub | `#E87B3C` |

### UI 원칙
- 모바일 반응형 필수
- 카드형 UI, 둥근 모서리 (border-radius: 10~14px)
- 태그 선택은 pill 형태 (border-radius: 20px)
- 최소한의 애니메이션 (transition: 0.2~0.3s)
- 폰트: Noto Sans KR (Google Fonts CDN)
- CSS 변수로 컬러 관리

---

## 5. 주의사항

1. **바닐라 HTML/CSS/JS로 구현** — 프레임워크 사용하지 않음
2. **이름은 반드시 실명** — 등록 폼에서 필수 입력
3. **생년월일, 성별, 핸드폰번호는 비공개** — DB에 저장하되 전문가 풀 목록에는 표시하지 않음
4. **기술 스택은 표시하지 않음** — 사이트 자체가 역량의 증명
5. **전문가 풀 웹사이트 URL / GitHub URL은 이 단계에서 받지 않음** — 나중에 별도로 받을 예정
6. **커뮤니티는 전문가 등록 완료자만 이용 가능**
7. **Supabase JS는 CDN으로 로드** — npm 빌드 불필요

---

## 6. 향후 확장 계획 (이번 작업 범위 아님)

- 전문가 개인별 미니 풀스택 웹사이트 제작 (각자 독립 사이트)
- 웹사이트 URL 등록 및 AX-On Platform 연동
- SME(중소기업) 매칭 기능
- AI 서비스 마켓플레이스
- AI 교육 시스템
- 2027 정부 AI 에이전트 마켓플레이스 연동

---

**끝.**
*이 문서는 AX-On Platform의 전문가 풀 미니버전 구축을 위한 Claude Code 작업 요청서입니다.*
