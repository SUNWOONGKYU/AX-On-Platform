# S9T1 검증 지시서

## 검증 정보
- **Task ID**: S9T1
- **Task Name**: E2E 테스트
- **Verification Agent**: qa-specialist
- **Task Agent**: test-runner-core

## 검증 체크리스트

### 1. 파일 존재 확인
- [ ] `tests/e2e/auth.spec.js` 존재
- [ ] `tests/e2e/enrollment.spec.js` 존재
- [ ] `tests/e2e/community.spec.js` 존재
- [ ] `playwright.config.js` 존재
- [ ] `@task S9T1` 주석 존재

### 2. 기능 검증
- [ ] Playwright 설정 정상
- [ ] 인증 플로우 테스트 통과 (이메일 + Kakao)
- [ ] 수강신청 플로우 테스트 통과
- [ ] 커뮤니티 플로우 테스트 통과
- [ ] CI/CD 연동 가능한 스크립트 존재

### 3. 코드 품질
- [ ] 테스트 케이스 명확한 네이밍
- [ ] 적절한 assertion 사용
- [ ] 테스트 간 독립성 보장

### 4. 통합 검증
- [ ] S7F2, S9F1 결과물 테스트 커버
- [ ] 다른 테스트와 충돌 없음
