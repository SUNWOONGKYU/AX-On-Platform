# S5S2 검증 지시서

## 검증 정보
| 항목 | 값 |
|------|---|
| Task ID | S5S2 |
| Task 이름 | RLS 정책 적용 |
| Verification Agent | AI Verification Agent |

## 검증 체크리스트

### 1. 파일 존재 확인
- [ ] 생성/수정된 파일이 올바른 경로에 존재하는가
- [ ] 파일명이 kebab-case를 따르는가

### 2. 코드 품질
- [ ] 하드코딩된 민감 값 없음
- [ ] 오류 처리 포함
- [ ] 불필요한 console.log 제거

### 3. 기능 검증
- [ ] 4개 테이블에 RLS 정책이 적용되었는가 확인
- [ ] anon 역할의 INSERT 권한 테스트 통과 확인
- [ ] authenticated 역할의 SELECT 권한 테스트 통과 확인

### 4. 통합 검증
- [ ] 선행 Task 결과와 호환
- [ ] 다른 페이지/기능과 충돌 없음
