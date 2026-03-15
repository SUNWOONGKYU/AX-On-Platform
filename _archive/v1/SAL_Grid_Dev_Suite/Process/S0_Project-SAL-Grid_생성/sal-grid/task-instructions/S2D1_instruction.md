# S2D1: 데이터베이스 스키마 설계 및 테이블 생성

## Task 정보
- **Task ID**: S2D1
- **Task Name**: 데이터베이스 스키마 설계 및 테이블 생성
- **Stage**: S2 (핵심 개발)
- **Area**: D (Database)
- **Dependencies**: S1BI1
- **Status**: Completed (소급 적용)

## Task 목표
Supabase PostgreSQL 12+ 환경에서 AX-On Platform에 필요한 모든 테이블을 생성하고
Row Level Security(RLS) 정책을 설정한다.

### 생성 테이블 목록
| 테이블명 | 용도 |
|---------|------|
| `profiles` | 사용자 프로필 |
| `experts` | AI 전문가 정보 |
| `expert_categories` | 전문가 카테고리 |
| `expert_applications` | 전문가 등록 신청 |
| `community_posts` | 커뮤니티 게시글 |
| `community_comments` | 커뮤니티 댓글 |
| `post_votes` | 게시글 투표 |
| `comment_votes` | 댓글 투표 |
| `contact_inquiries` | 문의하기 |
| `enrollments` | 수강신청 |
| `reports` | 신고 |
| `ax_project_requests` | AX 프로젝트 접수 |

## 생성/수정 파일
- Supabase SQL Editor에서 직접 실행한 DDL 스크립트

## 완료 기준
- [x] 12개 테이블 생성 완료
- [x] 각 테이블에 적절한 컬럼 및 제약 조건 설정
- [x] RLS(Row Level Security) 활성화 및 정책 설정
- [x] 외래 키 관계 설정 완료
- [x] 인덱스 생성 완료
- [x] Supabase Dashboard에서 테이블 확인 완료
