# S7F10: 비밀번호 재설정 플로우

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S7F10 |
| Task 이름 | 비밀번호 재설정 플로우 |
| Stage | S7 — 개발 5차 |
| Area | F — Frontend |
| Dependencies | S5S2 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
사용자가 비밀번호를 잊었을 때 안전하고 간단한 재설정 프로세스를 제공합니다. 이메일 기반 토큰 검증을 통해 보안을 유지하면서 사용성을 확보합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S7_개발_5차/Frontend/pages/auth/forgot-password.html` | 비밀번호 찾기 페이지 |
| `Process/S7_개발_5차/Frontend/pages/auth/reset-password-confirm.html` | 이메일 발송 확인 페이지 |
| `Process/S7_개발_5차/Frontend/pages/auth/reset-password-token.html` | 토큰 검증 페이지 |
| `Process/S7_개발_5차/Frontend/pages/auth/reset-password-form.html` | 새 비밀번호 입력 페이지 |
| `Process/S7_개발_5차/Frontend/js/password-reset.js` | 비밀번호 재설정 로직 |

## 세부 작업 지시
1. 비밀번호 찾기 폼
   - 페이지: `/auth/forgot-password`
   - 입력 필드: 이메일 주소
   - 유효성 검증:
     - 이메일 형식 확인 (RFC 5322)
     - 실시간 피드백 (유효한 이메일 → 초록 체크, 무효 → 빨강 X)
   - 버튼: "재설정 링크 발송" (Submit)
   - 추가 옵션: "로그인 페이지로 돌아가기" 링크
   - 보안 메시지: "등록된 이메일로 재설정 링크를 발송합니다"

2. 이메일 발송 확인 UI
   - 페이지: `/auth/forgot-password-confirm`
   - 메시지: "성공적으로 재설정 링크를 발송했습니다"
   - 설명: "○○○○○@email.com 받은편지함을 확인해주세요 (스팸 폴더도 확인해주세요)"
   - 타이머: "5분 내 링크를 클릭해주세요. 링크 유효 시간: 5분"
   - 다시 발송: "이메일을 받지 못했다면 [다시 발송] 버튼"
   - 이메일 변경: "[다른 이메일로 시도] 링크"
   - 디자인: 체크 아이콘, 안내 톤으로 친화적 표현

3. 재설정 토큰 검증 페이지
   - URL 패턴: `/auth/reset-password?token={reset_token}`
   - 처리 흐름:
     1. URL에서 토큰 추출
     2. Supabase `verifyPasswordResetToken(token)` 호출
     3. 유효한 경우: 새 비밀번호 입력 페이지로 진행
     4. 무효/만료된 경우: 에러 메시지 표시
   - 에러 케이스:
     - "링크가 만료되었습니다. 다시 시도해주세요"
     - "유효하지 않은 링크입니다"
     - "링크를 이미 사용했습니다"
   - 재시도: "비밀번호 찾기로 돌아가기" 링크

4. 새 비밀번호 입력 폼
   - 페이지: `/auth/reset-password-form`
   - 입력 필드 2개:
     - 새 비밀번호: 최소 8자, 숫자/문자/특수기호 포함 (또는 최소 12자)
     - 비밀번호 확인: 일치 여부 실시간 확인
   - 유효성 검증:
     - 비밀번호 강도 표시: "약함" → "중간" → "강함" (색상: 빨강 → 노랑 → 초록)
     - 조건 체크리스트: ✓ 8자 이상, ✓ 대문자 포함, ✓ 숫자 포함, ✓ 특수기호 포함
     - 비밀번호 보기/숨기기 토글 버튼
   - 버튼: "비밀번호 재설정" (Submit)
   - 성공 메시지: "비밀번호가 재설정되었습니다. 로그인 페이지로 이동합니다" (3초 후 자동 이동)

## 완료 기준
- [ ] forgot-password.html 마크업 및 유효성 검증 완료
- [ ] reset-password-confirm.html 마크업 완료
- [ ] reset-password-token.html 토큰 검증 로직 구현
- [ ] reset-password-form.html 비밀번호 입력 폼 구현
- [ ] 비밀번호 강도 표시 구현
- [ ] Supabase resetPasswordForEmail() 함수 연동
- [ ] Supabase updateUser() 함수로 비밀번호 변경
- [ ] 5분 토큰 만료 시간 설정 확인
- [ ] 토큰 재사용 방지 확인
- [ ] 모든 단계의 에러 처리 테스트
- [ ] JSON 상태 업데이트 완료
