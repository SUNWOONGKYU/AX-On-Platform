# S2F4: AI 전문가 페이지 구현

## Task 정보
- **Task ID**: S2F4
- **Task Name**: AI 전문가 페이지 구현
- **Stage**: S2 (핵심 개발)
- **Area**: F (Frontend)
- **Dependencies**: S1D1, S1BI1, S2D1
- **Status**: Completed (소급 적용)

## Task 목표
AI 전문가 목록을 조회하고 전문가 등록을 신청할 수 있는 페이지를 구현한다.
Supabase `experts` 및 `expert_applications` 테이블과 연동하며
액센트 색상으로 sky(#3b82f6)를 적용한다.

### 구현 내용
- **전문가 목록**: 카드 형태로 전문가 목록 표시
- **카테고리 필터**: expert_categories 기반 필터링
- **전문가 카드**: 이름, 전문 분야, 소개, 프로필 링크
- **전문가 등록 모달**: 전문가 등록 신청 폼 (expert_applications 저장)
- **페이지네이션**: 목록 페이지 처리

## 생성/수정 파일
- `expert.html`

## 완료 기준
- [x] Supabase `experts` 테이블 조회 및 목록 표시
- [x] `expert_categories` 기반 카테고리 필터 구현
- [x] 전문가 등록 신청 모달 구현
- [x] `expert_applications` 테이블 저장 연동
- [x] sky 액센트 색상 적용
- [x] 전문가 프로필 상세 페이지(expert-template.html) 링크 연결
- [x] 반응형 레이아웃 적용
