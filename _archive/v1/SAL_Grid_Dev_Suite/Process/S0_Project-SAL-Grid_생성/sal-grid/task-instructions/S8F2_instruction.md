# S8F2: 댓글 대댓글 depth 확장

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S8F2 |
| Task 이름 | 댓글 대댓글 depth 확장 |
| Stage | S8 — 개발 6차 |
| Area | F — Frontend |
| Dependencies | S6F6 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
댓글에 대댓글을 달 수 있는 nested comment 시스템을 구현합니다. 깊이를 3단계로 제한하여 UI 복잡도를 관리하면서 충분한 대화 흐름을 제공합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S8_개발_6차/Frontend/js/comments.js` | 재귀적 댓글 렌더링 |
| `Process/S8_개발_6차/Frontend/components/comment-tree.js` | 댓글 트리 컴포넌트 |
| `Process/S8_개발_6차/Frontend/css/comments.css` | 댓글 스타일 확장 |
| `Process/S8_개발_6차/Database/comments_schema.sql` | depth 필드 추가 |

## 세부 작업 지시
1. 재귀적 댓글 렌더링
   - 데이터 구조: 각 댓글에 parent_comment_id 필드
   - 렌더링 함수:
     ```javascript
     function renderCommentTree(comments, parentId = null, depth = 0) {
       return comments
         .filter(c => c.parent_comment_id === parentId)
         .map(comment => {
           return `
             <div class="comment comment-depth-${depth}">
               <div class="comment-header">
                 <img src="${comment.user.avatar}" class="avatar">
                 <span class="username">${comment.user.name}</span>
                 <span class="timestamp">${formatTime(comment.created_at)}</span>
               </div>
               <div class="comment-content">${comment.content}</div>
               <div class="comment-actions">
                 <button onclick="replyComment(${comment.id})">답글</button>
                 <button onclick="likeComment(${comment.id})">좋아요 (${comment.likes})</button>
               </div>
               ${depth < 3 ? renderCommentTree(comments, comment.id, depth + 1) : ''}
             </div>
           `;
         }).join('');
     }
     ```
   - 최적화: 클라이언트에서 재귀 계산 대신 서버에서 이미 계산된 depth 사용

2. depth 제한(3단계)
   - depth 0: 원본 게시물에 달린 댓글
   - depth 1: depth 0 댓글에 달린 대댓글
   - depth 2: depth 1 댓글에 달린 대댓글
   - depth 3 이상: "이 댓글에 답글을 달 수 없습니다" 메시지 표시
   - 대신 depth 2 댓글에서 원본 depth 0으로 이동하는 "최상위 댓글로 답글 달기" 옵션 제공
   - UI: 답글 버튼 활성화/비활성화 조건
     ```javascript
     const canReply = comment.depth < 3;
     ```

3. 접기/펼치기 UI
   - 자식 댓글이 있으면 댓글 좌측에 접기/펼치기 아이콘 표시
   - 클릭 시 하위 댓글 숨김/표시
   - 상태 저장: localStorage에 접기 상태 저장 (예: `comment-${id}-collapsed: true`)
   - 애니메이션: 0.3초 duration의 슬라이드 인/아웃
   - 표시: "○ {child_count}개 답글" 링크로 펼친 댓글 수 표시

4. Supabase 쿼리 최적화
   - 스키마 변경:
     ```sql
     ALTER TABLE comments ADD COLUMN parent_comment_id UUID;
     ALTER TABLE comments ADD COLUMN depth INT DEFAULT 0;
     CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
     CREATE INDEX idx_comments_post_depth ON comments(post_id, depth);
     ```
   - 쿼리: 한 번에 모든 댓글 로드 (게시물당 최대 500개)
     ```sql
     SELECT * FROM comments
     WHERE post_id = $1
     ORDER BY depth ASC, parent_comment_id ASC, created_at ASC
     ```
   - 페이지네이션: depth 0 댓글 20개 기준 (자식은 모두 로드)
   - 캐싱: 댓글 데이터 30초 메모리 캐시

## 완료 기준
- [ ] comments 테이블에 parent_comment_id, depth 필드 추가
- [ ] 재귀적 렌더링 함수 구현
- [ ] depth 3 제한 구현
- [ ] 접기/펼치기 UI 구현
- [ ] 상태 저장 (localStorage) 구현
- [ ] 답글 작성 폼 UI (인덴트 표시)
- [ ] Supabase 인덱스 생성
- [ ] 쿼리 성능 테스트 (응답 시간 < 1초)
- [ ] 깊이별 들여쓰기 CSS 스타일링
- [ ] 모바일 반응형 테스트
- [ ] JSON 상태 업데이트 완료
