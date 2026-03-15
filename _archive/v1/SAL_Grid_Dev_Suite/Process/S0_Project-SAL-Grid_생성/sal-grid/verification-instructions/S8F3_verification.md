# S8F3 검증 지시서

## 검증 정보
| 항목 | 값 |
|------|---|
| Task ID | S8F3 |
| Task 이름 | experts JSON 통합 관리 |
| Verification Agent | code-reviewer-core |

## 검증 체크리스트

### 1. 파일 존재 확인
- [ ] experts.json 파일이 생성/수정되었는가
- [ ] JSON 스키마가 올바른가
- [ ] @task S8F3 주석이 최상단에 있는가

### 2. 코드 품질
- [ ] 하드코딩된 API 키 없음
- [ ] 오류 처리 포함
- [ ] 환경 변수 올바르게 참조

### 3. 기능 검증
- [ ] JSON 데이터 유효성 검증
- [ ] CRUD 작업 정상 작동
- [ ] 데이터 마이그레이션 정상

### 4. 통합 검증
- [ ] S5D3 experts 테이블과 동기화
- [ ] S2F4 AI 전문가 페이지와 호환성
