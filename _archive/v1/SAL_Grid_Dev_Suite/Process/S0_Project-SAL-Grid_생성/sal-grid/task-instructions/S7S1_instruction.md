# S7S1: 관리자 Role 기반 접근 제어

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S7S1 |
| Task 이름 | 관리자 Role 기반 접근 제어 |
| Stage | S7 — 개발 5차 |
| Area | S — Security |
| Dependencies | S5S1 |
| 실행 방식 | Automated |
| Task Agent | security-specialist-core |

## 배경 및 목적
사용자의 역할(admin, moderator, user)에 따라 접근 가능한 페이지와 데이터를 제한하여 보안을 강화합니다. Supabase RLS 정책으로 데이터 수준의 접근 제어를 구현합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S7_개발_5차/Database/user_roles_schema.sql` | user_roles 테이블 스키마 |
| `Process/S7_개발_5차/Database/admin_rls_policies.sql` | Admin RLS 정책 |
| `Process/S7_개발_5차/Database/moderator_rls_policies.sql` | Moderator RLS 정책 |
| `Process/S7_개발_5차/Frontend/js/auth-utils.js` | Role 확인 유틸리티 함수 |
| `Process/S7_개발_5차/Frontend/js/route-guard.js` | 라우트 보호 로직 |

## 세부 작업 지시
1. user_roles 테이블 설계
   - 스키마:
   ```sql
   CREATE TABLE public.user_roles (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'moderator', 'admin')),
     granted_at TIMESTAMP DEFAULT NOW(),
     granted_by UUID REFERENCES auth.users(id),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```
   - 역할 정의:
     - user: 일반 사용자 (기본값)
     - moderator: 커뮤니티 감시, 신고 처리, 콘텐츠 삭제 권한
     - admin: 모든 관리 기능 (사용자 관리, 강의 승인, 시스템 설정)
   - 인덱스: (user_id) 추가하여 조회 성능 향상

2. RLS 정책 적용
   - admin 정책:
     - 모든 테이블에 "admin 역할의 모든 작업 허용" 정책
     - 예: `(auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'))`
   - moderator 정책:
     - reports, comments 테이블: 조회/수정 허용
     - users 테이블: 상태(status) 수정만 허용
     - content 삭제: 특정 조건(부적절한 콘텐츠)에서만 허용
   - user 정책:
     - 자신의 데이터만 조회/수정 허용
     - 다른 사용자의 민감한 정보(이메일, 결제 정보) 조회 불가
   - 공개 데이터:
     - 게시물, 댓글, 강의: 모든 사용자 조회 가능

3. 관리자 페이지 접근 제어
   - 클라이언트 단계:
     - `/admin/*` 라우트 접근 시 `checkAdminRole()` 함수 실행
     - role이 'admin'이 아니면 로그인 페이지/홈으로 리다이렉트
   - 서버 단계:
     - API 요청 시 Supabase RLS로 데이터 접근 제어
     - 권한 없는 데이터 접근 시 403 Forbidden 반환
   - 라우트 목록:
     - /admin/enrollments (수강신청 관리)
     - /admin/inquiries (문의 관리)
     - /admin/reports (신고 관리)
     - /admin/blocked-users (차단 사용자)
     - /admin/users (사용자 관리)
     - /admin/courses (강의 관리)
     - /admin/analytics (통계)

4. Role 확인 유틸리티 함수
   - `getCurrentUserRole()`: 현재 로그인한 사용자의 역할 반환
     ```javascript
     async function getCurrentUserRole() {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return null;
       const { data } = await supabase
         .from('user_roles')
         .select('role')
         .eq('user_id', user.id)
         .single();
       return data?.role || 'user';
     }
     ```
   - `isAdmin()`: admin 권한 확인
   - `isModerator()`: moderator 이상 권한 확인
   - `hasRole(requiredRole)`: 특정 역할 확인
   - `canAccess(resource)`: 리소스 접근 권한 확인

## 완료 기준
- [ ] user_roles 테이블 생성 및 인덱스 설정
- [ ] 초기 user_roles 데이터 삽입 (기존 사용자 user role로 설정)
- [ ] admin/moderator/user RLS 정책 생성
- [ ] auth-utils.js의 Role 확인 함수 구현
- [ ] route-guard.js에서 /admin 라우트 보호
- [ ] 관리자 페이지 접근 테스트 (admin 역할만 접근 가능)
- [ ] 일반 사용자의 관리 페이지 접근 시도 시 리다이렉트 확인
- [ ] Supabase RLS 정책 테스트 (데이터 수준 접근 제어)
- [ ] 역할 변경 시 권한 즉시 적용 확인
- [ ] JSON 상태 업데이트 완료
