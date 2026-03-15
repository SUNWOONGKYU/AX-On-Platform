# S7F2: 마이페이지 세부 기능 구현

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S7F2 |
| Task 이름 | 마이페이지 세부 기능 구현 |
| Stage | S7 — 개발 5차 |
| Area | F — Frontend |
| Dependencies | S5F2 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
마이페이지의 하위 기능들(프로필 수정, 활동 내역, 설정)을 구현하여 사용자가 자신의 정보와 활동을 관리할 수 있는 완전한 기능을 제공합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S7_개발_5차/Frontend/pages/mypage/index.html` | 마이페이지 메인 |
| `Process/S7_개발_5차/Frontend/pages/mypage/profile-edit.html` | 프로필 편집 페이지 |
| `Process/S7_개발_5차/Frontend/pages/mypage/activity.html` | 활동 내역 페이지 |
| `Process/S7_개발_5차/Frontend/pages/mypage/settings.html` | 설정 페이지 |
| `Process/S7_개발_5차/Frontend/js/mypage.js` | 마이페이지 로직 |

## 세부 작업 지시
1. 프로필 편집 UI 구현
   - 프로필 사진: 업로드/변경 기능 (이미지 크롭 미리보기)
   - 기본 정보: 이름, 이메일 (읽기 전용), 소개글 (250자 제한)
   - 전문가 정보 (선택적): 전공, 경력, 인증서
   - 소셜 링크: 포트폴리오, 깃허브, 블로그 URL
   - 저장 버튼: 유효성 검증 후 Supabase 연동

2. 활동 내역 탭 구현
   - 수강 내역: 수강중/완료 과정 목록 (강사 이름, 진행률)
   - 게시글: 작성한 게시글 목록 (제목, 카테고리, 작성일, 댓글 수)
   - 댓글: 작성한 댓글 목록 (원문 미리보기, 작성일, 좋아요 수)
   - 각 탭에 페이지네이션 또는 무한스크롤 적용

3. 알림 설정 구현
   - 이메일 알림: 수강신청 결과, 신강좌 추천, 답변 알림 (토글)
   - 푸시 알림: 브라우저 푸시 활성화/비활성화
   - 마케팅: 뉴스레터, 이벤트 정보 수신 동의 (토글)
   - 설정 저장: localStorage 및 Supabase user_preferences 테이블 연동

4. Supabase 연동
   - 프로필 수정: `UPDATE public.users` 쿼리
   - 활동 조회: enrollments, posts, comments 테이블 JOIN
   - 설정 저장: `public.user_preferences` 테이블 UPSERT
   - RLS 정책: 자신의 데이터만 접근 가능하도록 설정

## 완료 기준
- [ ] 프로필 편집 페이지 UI 완성 및 유효성 검증
- [ ] 활동 내역 탭 (수강/게시글/댓글) 구현
- [ ] 알림 설정 페이지 구현
- [ ] Supabase 쿼리 및 RLS 정책 설정 완료
- [ ] 프로필 사진 업로드 기능 테스트
- [ ] 데이터 저장 및 로드 기능 확인
- [ ] JSON 상태 업데이트 완료
