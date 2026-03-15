# S7BI1: Google Analytics 연동

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S7BI1 |
| Task 이름 | Google Analytics 연동 |
| Stage | S7 — 개발 5차 |
| Area | BI — Backend_Infra |
| Dependencies | S5BI1 |
| 실행 방식 | Human-AI |
| Task Agent | backend-developer-core |

## 배경 및 목적
Google Analytics 4(GA4)를 연동하여 사용자 행동, 트래픽, 전환을 추적합니다. 핵심 이벤트를 정의하고 추적하여 플랫폼의 성능을 측정하고 개선 방향을 파악합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S7_개발_5차/Frontend/index.html` | GA4 gtag.js 스크립트 삽입 |
| `Process/S7_개발_5차/Frontend/js/analytics.js` | 이벤트 트래킹 함수 |
| `Process/S7_개발_5차/config/analytics-config.js` | GA4 설정 파일 |
| `Process/S7_개발_5차/docs/analytics-events.md` | 이벤트 문서 |

## 세부 작업 지시
1. GA4 측정 ID 설정 (PO 필요)
   - Google Analytics 계정 생성 (또는 기존 계정 사용)
   - 새 Google Analytics 4 속성 생성
   - 측정 ID 확인: G-XXXXXXXXXX 형식
   - 데이터 스트림 설정: 웹사이트 추가
   - 환경 변수 설정:
     ```javascript
     // .env 파일
     VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
     VITE_GA4_API_SECRET=your_api_secret (이벤트 API용, 선택)
     ```
   - 주의: 측정 ID는 공개해도 되지만 API Secret은 서버에서만 관리

2. gtag.js 삽입
   - 위치: 모든 HTML 페이지의 `<head>` 태그 내
   - 코드:
     ```html
     <!-- Google Analytics -->
     <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
     <script>
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', 'G-XXXXXXXXXX');
     </script>
     ```
   - 대안: Google Tag Manager (GTM) 사용 (선택)
   - SPA 환경 (Vercel): 라우팅 변경 시 pageview 자동 전송 설정

3. 주요 이벤트 트래킹
   - 페이지뷰 (자동): 기본 GA4 페이지뷰 추적
   - 로그인:
     - 이벤트 이름: `login`
     - 파라미터: `method` (Google, Kakao), `success` (true/false)
     - 트리거: 로그인 성공 후
   - 회원가입:
     - 이벤트 이름: `sign_up`
     - 파라미터: `method` (email, Google, Kakao)
     - 트리거: 회원가입 완료 후
   - 수강신청:
     - 이벤트 이름: `enroll_course`
     - 파라미터: `course_id`, `course_name`, `course_price`, `instructor_name`
     - 트리거: 수강신청 버튼 클릭 후 승인
   - 강의 시작:
     - 이벤트 이름: `start_course`
     - 파라미터: `course_id`, `course_name`
     - 트리거: 강의 페이지 진입
   - 강의 완료:
     - 이벤트 이름: `complete_course`
     - 파라미터: `course_id`, `course_name`, `duration_days`
     - 트리거: 강의 100% 완료
   - 게시글 작성:
     - 이벤트 이름: `create_post`
     - 파라미터: `category`, `content_length`
     - 트리거: 게시글 발행
   - 댓글 작성:
     - 이벤트 이름: `create_comment`
     - 파라미터: `post_id`, `content_length`
     - 트리거: 댓글 발행
   - 검색:
     - 이벤트 이름: `search`
     - 파라미터: `search_term`, `results_count`
     - 트리거: 검색 결과 반환
   - 페이지 스크롤:
     - 이벤트 이름: `scroll`
     - 파라미터: `scroll_percentage` (25, 50, 75, 100)
     - 트리거: 사용자 스크롤

4. 전환 목표 설정
   - 전환 1: 회원가입
     - 이벤트: `sign_up`
     - 가치: 1
   - 전환 2: 첫 수강신청
     - 이벤트: `enroll_course` (카운터: 첫 발생만)
     - 가치: 수강료
   - 전환 3: 강의 완료
     - 이벤트: `complete_course`
     - 가치: 과정 평가 점수
   - 전환 4: 게시글 작성
     - 이벤트: `create_post` (카운터: 최소 5개)
     - 가치: 커뮤니티 활성도 지표
   - Google Analytics에서 각 이벤트를 "전환"으로 표시

## 완료 기준
- [ ] GA4 측정 ID 획득 및 환경 변수 설정
- [ ] gtag.js 스크립트 모든 페이지에 삽입
- [ ] 로그인/회원가입 이벤트 트래킹 구현
- [ ] 수강신청/강의 완료 이벤트 트래킹 구현
- [ ] 게시글/댓글 작성 이벤트 트래킹 구현
- [ ] 검색 및 페이지 스크롤 이벤트 구현
- [ ] GA4 실시간 리포트에서 이벤트 수신 확인
- [ ] 전환 목표 설정 완료
- [ ] 테스트 환경에서 이벤트 전송 테스트
- [ ] 프로덕션 환경에서 최소 1주일 데이터 수집 후 검증
- [ ] JSON 상태 업데이트 완료
