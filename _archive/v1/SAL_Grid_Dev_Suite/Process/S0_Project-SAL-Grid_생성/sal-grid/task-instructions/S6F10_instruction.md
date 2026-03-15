# S6F10: 수강신청 URL 파라미터 검증

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S6F10 |
| Task 이름 | 수강신청 URL 파라미터 검증 |
| Stage | S6 — 개발 4차 |
| Area | F — Frontend |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | frontend-developer-core |

## 배경 및 목적

사용자가 프로그램 페이지의 수강신청 버튼을 클릭할 때 URL 파라미터로 전달되는 `program` 값이 검증되지 않으면 보안 및 데이터 무결성 문제가 발생할 수 있다. 화이트리스트 기반 검증으로 유효한 프로그램만 처리하도록 구현한다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `pages/enrollment.html` | 수강신청 페이지 |
| `pages/enrollment.js` | URL 파라미터 검증 로직 추가 |
| `pages/config.js` | 유효한 프로그램 목록 (화이트리스트) |

## 세부 작업 지시

1. `config.js`에 유효한 프로그램 목록 정의:
   ```javascript
   const VALID_PROGRAMS = [
     'python-basics',
     'web-development',
     'ai-fundamentals',
     // ... 기타 유효한 프로그램
   ];
   ```

2. `enrollment.js` 파일에 검증 함수 추가:
   ```javascript
   function validateProgramParam(param) {
     return VALID_PROGRAMS.includes(param);
   }
   ```

3. 페이지 로드 시 검증:
   - URL에서 `program` 파라미터 추출
   - `validateProgramParam()` 호출로 검증
   - 유효하지 않은 경우: 에러 페이지 또는 기본 프로그램으로 리다이렉트

4. 사용자 친화적 에러 처리:
   - "유효하지 않은 프로그램입니다" 메시지 표시
   - 유효한 프로그램 목록 제시
   - 홈으로 돌아가기 링크

5. 테스트:
   - 유효한 파라미터로 접근 → 정상 동작 확인
   - 유효하지 않은 파라미터로 접근 → 에러 메시지 표시 확인
   - 파라미터 없이 접근 → 기본값 또는 에러 처리 확인

## 완료 기준

- [ ] 유효한 프로그램 목록 정의됨
- [ ] 파라미터 검증 함수 구현됨
- [ ] 페이지 로드 시 자동 검증됨
- [ ] 유효하지 않은 파라미터 처리됨
- [ ] 사용자 친화적 에러 메시지 표시됨
- [ ] 화이트리스트 기반 검증 완료
