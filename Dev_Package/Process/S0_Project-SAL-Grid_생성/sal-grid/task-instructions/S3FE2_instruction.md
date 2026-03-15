# S3FE2 — admin.html 관리자 대시보드

> **소급 등록**: 2026-03-12 (실행일: 2026-03-11)

## 목표
관리자가 문의/전문가신청/수강신청/신고를 관리할 수 있는 어드민 대시보드를 생성한다.

## 구현 내용
1. **접근 제어**: JWT app_metadata.role === 'admin' + RLS is_admin() 이중 차단
2. **4탭 대시보드**: contact_inquiries, expert_applications, enrollments, reports
3. **기능**: 통계 카드, 상태 필터, 키워드 검색, 아코디언 상세, 상태 변경, 관리자 메모
4. **보안**: noindex/nofollow, escapeHtml 출력 sanitize, 공개 Nav에 링크 없음
5. **관리자 Nav 링크**: js/config.js에 injectAdminLink() 추가 → 전 페이지에서 admin만 보임

## 생성 파일
- `pages/admin/admin.html`
- `js/config.js` (injectAdminLink 함수 추가)

## 수정 파일
- `index.html`, `pool.html`, `community.html` (injectAdminLink 호출 + Footer 링크)
