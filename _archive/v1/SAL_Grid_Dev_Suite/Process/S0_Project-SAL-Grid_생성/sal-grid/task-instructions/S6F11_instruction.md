# S6F11: 이메일 하드코딩 제거

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S6F11 |
| Task 이름 | 이메일 하드코딩 제거 |
| Stage | S6 — 개발 4차 |
| Area | F — Frontend |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | frontend-developer-core |

## 배경 및 목적

현재 코드베이스의 여러 파일에서 이메일 주소(예: `contact@ax-on.net`)가 하드코딩되어 있다. 운영 중에 이메일을 변경해야 할 때 모든 파일을 수정해야 하므로 유지보수가 어렵다. 이메일을 설정 파일에서 중앙집중식으로 관리하도록 변경한다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `pages/config.js` | 이메일 설정 상수 추가 |
| `pages/*.js` | 하드코딩된 이메일을 config에서 참조하도록 변경 |

## 세부 작업 지시

1. `config.js`에 이메일 설정 추가:
   ```javascript
   const EMAIL_CONFIG = {
     support: 'support@ax-on.net',
     contact: 'contact@ax-on.net',
     admin: 'admin@ax-on.net',
     // ... 기타 이메일
   };
   ```

2. 모든 JavaScript 파일에서 하드코딩된 이메일 검색:
   - `grep -r "contact@ax-on.net" pages/`
   - 기타 이메일 주소도 함께 찾기

3. 검색된 모든 이메일을 config 참조로 변경:
   - 예: `'contact@ax-on.net'` → `EMAIL_CONFIG.contact`

4. HTML 파일에서도 이메일이 있는지 확인:
   - `mailto:` 링크 검사
   - 필요시 JavaScript 변수로 동적 생성

5. 테스트:
   - 이메일 링크 클릭 시 올바른 이메일로 전달되는지 확인
   - 문의 양식 제출 시 설정된 이메일로 발송되는지 확인

## 완료 기준

- [ ] `config.js`에 이메일 설정 추가됨
- [ ] 모든 하드코딩된 이메일 찾아됨
- [ ] 모든 이메일을 config 참조로 변경됨
- [ ] 이메일 기능 정상 작동 확인
- [ ] 설정 변경 시 자동 반영됨
