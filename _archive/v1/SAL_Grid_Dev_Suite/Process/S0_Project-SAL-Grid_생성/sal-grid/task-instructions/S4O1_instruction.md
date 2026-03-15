# S4O1: Vercel 배포 및 GitHub 자동 배포 설정

## Task 정보
- **Task ID**: S4O1
- **Task Name**: Vercel 배포 및 GitHub 자동 배포 설정
- **Stage**: S4 (1차 배포 검증)
- **Area**: O (DevOps)
- **Dependencies**: S3S1
- **Status**: Completed (소급 적용)

## Task 목표
AX-On Platform을 Vercel에 배포하고 GitHub 연동을 통한 자동 배포(CI/CD) 환경을 구성한다.
GitHub main 브랜치에 push 시 Vercel이 자동으로 빌드 및 배포를 수행한다.

### 설정 내용
- **Vercel 프로젝트 연결**: GitHub 레포지토리와 Vercel 프로젝트 연결
- **자동 배포 설정**: main 브랜치 push → Vercel 자동 빌드/배포
- **Production URL**: `ax-on-platform.vercel.app`
- **vercel.json 설정**: 라우팅, 리다이렉트 규칙 정의
- **환경 변수**: Supabase URL, Anon Key Vercel 환경 변수 설정

## 생성/수정 파일
- `vercel.json`

## 완료 기준
- [x] Vercel 프로젝트 생성 및 GitHub 레포지토리 연결
- [x] `vercel.json` 설정 파일 생성
- [x] main 브랜치 push → 자동 배포 동작 확인
- [x] Production URL(`ax-on-platform.vercel.app`) 접속 확인
- [x] Vercel 환경 변수(Supabase 설정) 등록 완료
- [x] 모든 페이지 라우팅 정상 동작 확인
