# S8M1: 기술 문서 및 API 문서 정리

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S8M1 |
| Task 이름 | 기술 문서 및 API 문서 정리 |
| Stage | S8 — 개발 6차 |
| Area | M — Documentation |
| Dependencies | S8T1 |
| 실행 방식 | Automated |
| Task Agent | documentation-writer-core |

## 배경 및 목적
SAL Grid 플랫폼의 완벽한 기술 문서를 정리하여 팀원, 새로운 개발자, 그리고 운영 팀이 쉽게 이해하고 유지보수할 수 있도록 합니다. API 엔드포인트, 아키텍처, 배포 프로세스를 명확히 문서화합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S8_개발_6차/Frontend/README.md` | 프로젝트 소개 및 시작 가이드 |
| `Process/S8_개발_6차/docs/API.md` | API 엔드포인트 문서 |
| `Process/S8_개발_6차/docs/ARCHITECTURE.md` | 아키텍처 설명서 |
| `Process/S8_개발_6차/docs/DEPLOYMENT.md` | 배포 가이드 |
| `Process/S8_개발_6차/docs/DATABASE.md` | 데이터베이스 스키마 문서 |

## 세부 작업 지시
1. README.md 최종 정리
   - 구조:
     ```markdown
     # SAL Grid - 온라인 학습 플랫폼

     ## 개요
     SAL Grid는 전문가들이 강의하는 온라인 학습 플랫폼입니다.
     사용자는 다양한 분야의 강의를 수강하고, 커뮤니티에 참여하며, 지식을 공유할 수 있습니다.

     ## 주요 기능
     - **강의 관리**: 강의 검색, 수강신청, 수강
     - **커뮤니티**: 게시글 작성, 댓글, 토론
     - **지식허브**: 기술 문서 및 튜토리얼 공유
     - **전문가 네트워크**: 강사 프로필 및 평가
     - **사용자 관리**: 프로필, 활동 내역, 설정
     - **관리자 기능**: 승인, 신고 처리, 통계 분석

     ## 기술 스택
     - **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
     - **Backend**: Supabase (PostgreSQL, Edge Functions)
     - **호스팅**: Vercel
     - **Database**: PostgreSQL (Supabase)
     - **인증**: Supabase Auth (Email, Google OAuth, Kakao OAuth)
     - **스토리지**: Supabase Storage

     ## 시스템 요구사항
     - Node.js >= 18.0
     - npm >= 9.0 또는 yarn >= 3.0
     - 브라우저: Chrome, Firefox, Safari, Edge (최신 2개 버전)

     ## 설치 및 실행

     ### 1. 저장소 클론
     \`\`\`bash
     git clone https://github.com/your-org/sal-grid.git
     cd sal-grid
     \`\`\`

     ### 2. 의존성 설치
     \`\`\`bash
     npm install
     \`\`\`

     ### 3. 환경 변수 설정
     \`\`\`bash
     cp .env.example .env.local
     \`\`\`

     필요한 환경 변수:
     - VITE_SUPABASE_URL: Supabase 프로젝트 URL
     - VITE_SUPABASE_KEY: Supabase 공개 API 키
     - VITE_GA4_MEASUREMENT_ID: Google Analytics 측정 ID

     ### 4. 로컬 개발 서버 실행
     \`\`\`bash
     npm run dev
     \`\`\`

     브라우저에서 http://localhost:5173 열기

     ### 5. 빌드
     \`\`\`bash
     npm run build
     \`\`\`

     ## 폴더 구조
     \`\`\`
     sal-grid/
     ├── frontend/
     │   ├── pages/           # 페이지 구성
     │   ├── components/      # 재사용 컴포넌트
     │   ├── js/              # 비즈니스 로직
     │   ├── css/             # 스타일시트
     │   ├── public/          # 정적 파일
     │   └── tests/           # 테스트 파일
     ├── docs/                # 기술 문서
     ├── scripts/             # 유틸 스크립트
     └── package.json
     \`\`\`

     ## 개발 가이드
     - [API 문서](./docs/API.md)
     - [아키텍처](./docs/ARCHITECTURE.md)
     - [데이터베이스](./docs/DATABASE.md)
     - [배포 가이드](./docs/DEPLOYMENT.md)

     ## 기여 방법
     1. Fork the repository
     2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
     3. Commit changes (\`git commit -m 'Add amazing feature'\`)
     4. Push to the branch (\`git push origin feature/amazing-feature\`)
     5. Open a Pull Request

     ## 라이센스
     MIT License - see LICENSE file

     ## 지원
     - 문제 보고: GitHub Issues
     - 질문: GitHub Discussions
     - 이메일: support@salgrid.com
     ```

2. API 엔드포인트 문서
   - 파일: `docs/API.md`
   - 구조:
     ```markdown
     # API 문서

     ## 기본 정보
     - **Base URL**: https://api.salgrid.com
     - **인증**: Bearer Token (JWT)
     - **응답 형식**: JSON

     ## 인증 API

     ### 회원가입
     \`\`\`
     POST /auth/signup
     Content-Type: application/json

     {
       "email": "user@example.com",
       "password": "SecurePassword123!",
       "name": "John Doe"
     }

     Response 201:
     {
       "id": "user-uuid",
       "email": "user@example.com",
       "name": "John Doe",
       "created_at": "2024-01-15T10:30:00Z"
     }
     \`\`\`

     ### 로그인
     \`\`\`
     POST /auth/login
     Content-Type: application/json

     {
       "email": "user@example.com",
       "password": "SecurePassword123!"
     }

     Response 200:
     {
       "access_token": "eyJ...",
       "refresh_token": "refresh...",
       "user": {
         "id": "user-uuid",
         "email": "user@example.com"
       }
     }
     \`\`\`

     ## 강의 API

     ### 강의 목록 조회
     \`\`\`
     GET /courses?page=1&pageSize=20&sort=recent
     Authorization: Bearer {token}

     Response 200:
     {
       "data": [
         {
           "id": "course-uuid",
           "title": "강의 제목",
           "description": "강의 설명",
           "instructor_id": "user-uuid",
           "price": 50000,
           "rating": 4.8,
           "students_count": 120,
           "created_at": "2024-01-10T10:00:00Z"
         }
       ],
       "total": 150,
       "page": 1,
       "pageSize": 20
     }
     \`\`\`

     ### 강의 상세 조회
     \`\`\`
     GET /courses/{course_id}
     Authorization: Bearer {token}

     Response 200:
     {
       "id": "course-uuid",
       "title": "강의 제목",
       ...detailed course data...
     }
     \`\`\`

     ## 게시글 API

     ### 게시글 목록
     \`\`\`
     GET /posts?category=general&page=1&limit=20
     Authorization: Bearer {token}

     Response 200:
     {
       "data": [...],
       "total": 500,
       "page": 1
     }
     \`\`\`

     ...추가 엔드포인트 작성...
     ```

3. 아키텍처 문서
   - 파일: `docs/ARCHITECTURE.md`
   - 내용:
     ```markdown
     # SAL Grid 아키텍처

     ## 시스템 다이어그램
     \`\`\`
     [사용자 브라우저]
            ↓
     [Vercel (Frontend)]
            ↓
     [Supabase (Backend)]
            ├── PostgreSQL (Database)
            ├── Auth (인증)
            ├── Storage (파일 저장소)
            └── Edge Functions (비즈니스 로직)
     \`\`\`

     ## 주요 계층

     ### Frontend 계층
     - HTML/CSS/JavaScript
     - 상태 관리: localStorage, sessionStorage
     - API 통신: Fetch API
     - 호스팅: Vercel

     ### Backend 계층
     - Supabase PostgreSQL
     - Row Level Security (RLS)
     - Realtime Subscriptions
     - Edge Functions for business logic

     ### 데이터 흐름
     1. 사용자가 Frontend에서 작업 수행
     2. JavaScript가 API 요청 생성
     3. Supabase로 요청 전송
     4. RLS 정책으로 권한 확인
     5. Database에서 데이터 조회/수정
     6. 결과를 Frontend로 반환

     ...상세 내용...
     ```

4. 배포 가이드
   - 파일: `docs/DEPLOYMENT.md`
   - 내용:
     ```markdown
     # 배포 가이드

     ## Vercel 배포

     ### 전제 조건
     - Vercel 계정
     - GitHub 저장소 연결
     - 환경 변수 설정 완료

     ### 배포 단계
     1. Vercel 대시보드 접속
     2. "New Project" 클릭
     3. GitHub 저장소 선택
     4. 환경 변수 입력
     5. "Deploy" 클릭

     ### CI/CD 파이프라인
     - GitHub Push → Vercel 자동 빌드 → 배포
     - 배포 예상 시간: 3-5분

     ...상세 배포 절차...
     ```

5. 데이터베이스 스키마 문서
   - 파일: `docs/DATABASE.md`
   - 내용:
     ```markdown
     # 데이터베이스 스키마

     ## users 테이블
     | 컬럼 | 타입 | 설명 |
     |------|------|------|
     | id | UUID | 기본 키 |
     | email | VARCHAR | 이메일 주소 |
     | name | VARCHAR | 사용자 이름 |
     | avatar_url | VARCHAR | 프로필 사진 URL |
     | created_at | TIMESTAMP | 생성 일시 |

     ## courses 테이블
     | 컬럼 | 타입 | 설명 |
     |------|------|------|
     | id | UUID | 기본 키 |
     | title | VARCHAR | 강의 제목 |
     | instructor_id | UUID | 강사 ID |
     | price | INT | 강의료 |
     | ...기타 필드... |

     ...추가 테이블...
     ```

## 완료 기준
- [ ] README.md 완성 및 최종 검토
- [ ] API.md에 모든 주요 엔드포인트 문서화
- [ ] API 요청/응답 예시 포함
- [ ] ARCHITECTURE.md에 시스템 구성 설명
- [ ] 아키텍처 다이어그램 생성 (ASCII 또는 이미지)
- [ ] DEPLOYMENT.md에 배포 절차 명시
- [ ] DATABASE.md에 모든 테이블 스키마 문서화
- [ ] 문서에 코드 샘플 포함
- [ ] 문서의 하이퍼링크 연결 확인
- [ ] 마크다운 형식 검증 (깨진 링크, 문법 오류 없음)
- [ ] 개발자가 읽고 쉽게 이해할 수 있는지 검토
- [ ] JSON 상태 업데이트 완료
