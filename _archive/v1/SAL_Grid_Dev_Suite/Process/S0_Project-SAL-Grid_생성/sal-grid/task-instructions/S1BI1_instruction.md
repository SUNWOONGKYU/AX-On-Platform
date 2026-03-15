# S1BI1: Supabase 프로젝트 설정 및 클라이언트 구성

## Task 정보
- **Task ID**: S1BI1
- **Task Name**: Supabase 프로젝트 설정 및 클라이언트 구성
- **Stage**: S1 (기반 설정)
- **Area**: BI (Backend Infrastructure)
- **Dependencies**: -
- **Status**: Completed (소급 적용)

## Task 목표
Supabase 프로젝트를 생성하고 JavaScript 클라이언트를 설정한다.
프로젝트 전반에서 재사용되는 공통 유틸리티 함수를 정의한다.

- Supabase 프로젝트 생성 및 URL/API Key 확보
- `js/config.js` 파일에 Supabase 클라이언트 초기화 코드 작성
- 공통 유틸리티 함수 정의:
  - `escapeHtml()` - XSS 방지를 위한 HTML 이스케이프
  - `isSafeUrl()` - URL 안전성 검증
  - `isValidEmail()` - 이메일 형식 검증
  - `validateKoreanPhone()` - 한국 전화번호 형식 검증

## 프로젝트 정보
- **Supabase URL**: `https://gifxpfdnnfwufzdncmor.supabase.co`
- **클라이언트 라이브러리**: @supabase/supabase-js (CDN)

## 생성/수정 파일
- `js/config.js`

## 완료 기준
- [x] Supabase 프로젝트 생성 완료
- [x] `js/config.js` 파일 생성 및 클라이언트 초기화 코드 작성
- [x] `escapeHtml()` 함수 구현 및 동작 확인
- [x] `isSafeUrl()` 함수 구현 및 동작 확인
- [x] `isValidEmail()` 함수 구현 및 동작 확인
- [x] `validateKoreanPhone()` 함수 구현 및 동작 확인
- [x] 모든 페이지에서 `js/config.js` import 가능 확인
