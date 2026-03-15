# S2F3: AX 프로젝트 접수 페이지 구현

## Task 정보
- **Task ID**: S2F3
- **Task Name**: AX 프로젝트 접수 페이지 구현
- **Stage**: S2 (핵심 개발)
- **Area**: F (Frontend)
- **Dependencies**: S1D1, S1BI1, S2D1
- **Status**: Completed (소급 적용)

## Task 목표
기업의 AI 전환(AX) 프로젝트 수요를 접수하는 4단계 스텝 위자드 폼을 구현한다.
완료된 접수 데이터는 Supabase `ax_project_requests` 테이블에 저장한다.

### 4단계 스텝 위자드
| 단계 | 내용 |
|------|------|
| Step 1 | 산업 선택 (제조, 유통, 금융, 의료 등) |
| Step 2 | 기업 규모 선택 (스타트업, SME, 중견기업, 대기업) |
| Step 3 | AX 분야 및 모듈 선택 |
| Step 4 | 기업 정보 입력 (회사명, 담당자, 연락처 등) |

### 액센트 색상
- teal(#0d9488) 일관 적용

## 생성/수정 파일
- `ax-project.html`

## 완료 기준
- [x] 4단계 스텝 위자드 UI 구현
- [x] 각 단계 이동 (Next/Back) 동작
- [x] Step 3 AX 분야/모듈 선택 UI 구현
- [x] Step 4 기업 정보 폼 유효성 검증
- [x] Supabase `ax_project_requests` 테이블 저장 연동
- [x] teal 액센트 색상 적용
- [x] 제출 완료 후 성공 메시지 표시
