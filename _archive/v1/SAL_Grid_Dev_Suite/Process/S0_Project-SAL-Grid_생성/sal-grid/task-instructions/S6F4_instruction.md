# S6F4: 전문가 등록 관리자 검토 프로세스

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S6F4 |
| Task 이름 | 전문가 등록 관리자 검토 프로세스 |
| Stage | S6 — 개발 4차 |
| Area | F — Frontend |
| Dependencies | S5D2 |
| 실행 방식 | AI-Only |
| Task Agent | frontend-developer-core |

## 배경 및 목적

플랫폼에 새로운 전문가가 등록을 신청할 때, 관리자가 이를 검토하고 승인/거부할 수 있는 프로세스가 필요하다. S5D2에서 생성된 `expert_applications` 테이블에 저장된 신청 정보를 조회하고, 관리자가 검토 후 승인하면 `experts` 테이블에 자동으로 등록되도록 구현한다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `pages/expert-review.html` | 전문가 신청 검토 페이지 HTML |
| `pages/expert-review.js` | 신청 조회, 승인/거부 로직 |

## 세부 작업 지시

1. `expert-review.html` 파일 생성:
   - 검토 대기 중인 전문가 신청 목록
   - 각 신청 항목: 이름, 전공, 경력, 소개, 신청일
   - 상세 보기 모달 (신청자 정보 전체 조회)
   - 승인/거부 버튼

2. `expert-review.js` 작성:
   - 관리자 권한 확인
   - `expert_applications` 테이블에서 미검토 신청 조회
   - 상세 보기 모달 로직
   - 승인 버튼 클릭 시:
     - `experts` 테이블에 신규 전문가 등록
     - `expert_applications` 상태를 "approved"로 업데이트
   - 거부 버튼 클릭 시:
     - `expert_applications` 상태를 "rejected"로 업데이트
     - 거부 사유 입력 필드 추가

3. 검토 이력 기록:
   - 검토일, 검토자, 검토 결과 저장

4. CSS 스타일링:
   - 모달 디자인
   - 버튼 스타일 (승인/거부 구분)
   - 반응형 디자인

## 완료 기준

- [ ] `expert-review.html` 파일 생성됨
- [ ] 신청 목록 조회 기능 완료
- [ ] 상세 보기 모달 구현됨
- [ ] 승인 기능: `experts` 테이블 등록 완료
- [ ] 거부 기능: 상태 업데이트 완료
- [ ] 검토 이력 기록됨
- [ ] 관리자만 접근 가능
