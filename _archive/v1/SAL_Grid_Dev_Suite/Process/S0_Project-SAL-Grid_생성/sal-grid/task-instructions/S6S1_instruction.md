# S6S1: claude-code-guide.html 접근 제한

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S6S1 |
| Task 이름 | claude-code-guide.html 접근 제한 |
| Stage | S6 — 개발 4차 |
| Area | S — Security |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | security-specialist-core |

## 배경 및 목적

`claude-code-guide.html`은 개발 내부 문서로서 프로덕션 환경에서 공개되어서는 안 된다. 현재 누구나 이 파일에 접근할 수 있어 보안 위험이 있다. 접근 제한을 설정하여 인증된 관리자만 접근할 수 있도록 하거나, 프로덕션 환경에서 완전히 제외한다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `vercel.json` | 접근 제한 설정 |
| `pages/claude-code-guide.html` | 인증 확인 로직 추가 또는 삭제 |

## 세부 작업 지시

1. **옵션 1**: 프로덕션에서 파일 제거 (권장)
   - 개발 환경에서만 유지
   - 배포 시 제외하도록 설정 (`.vercelignore` 추가)

2. **옵션 2**: 접근 제한 설정 (필요시)
   - `vercel.json`에 Middleware 설정:
   ```json
   {
     "rewrites": [
       {
         "source": "/claude-code-guide.html",
         "destination": "/api/protected/claude-code-guide"
       }
     ]
   }
   ```
   - API 엔드포인트에서 인증 확인 후 콘텐츠 반환

3. **옵션 3**: robots.txt에서 검색 엔진 차단
   ```
   Disallow: /claude-code-guide.html
   ```

4. 접근 시도 로깅:
   - 누군가 접근을 시도했는지 모니터링

5. 검증:
   - 프로덕션 환경에서 파일 접근 불가 확인
   - 개발 환경에서는 접근 가능 확인

## 완료 기준

- [ ] 프로덕션에서 파일 접근 불가 확인
- [ ] 개발 환경에서 파일 접근 가능 유지 (필요시)
- [ ] `.vercelignore` 또는 배포 설정 수정됨
- [ ] 검색 엔진 차단 설정 완료 (robots.txt)
- [ ] 내부 문서로서 보안 강화됨
