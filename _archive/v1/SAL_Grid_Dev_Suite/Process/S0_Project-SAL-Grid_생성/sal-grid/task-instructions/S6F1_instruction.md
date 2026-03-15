# S6F1: 알림 드롭다운 패널 UI 구현

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S6F1 |
| Task 이름 | 알림 드롭다운 패널 UI 구현 |
| Stage | S6 — 개발 4차 |
| Area | F — Frontend |
| Dependencies | S5D4 |
| 실행 방식 | AI-Only |
| Task Agent | claude-sonnet-4-6 |

## 배경 및 목적

S5D4에서 `user_notifications` 테이블이 생성되었으나, `community.html`의 알림 버튼(벨 아이콘)을 클릭해도 드롭다운 패널이 표시되지 않는다. 알림 목록을 실시간으로 조회하고, 읽음/안읽음 상태를 시각적으로 구분하며, 읽음 처리가 가능한 드롭다운 패널 UI를 구현한다.

## 세부 작업 지시

1. `community.html`의 알림 버튼 요소를 파악하고, 클릭 이벤트를 바인딩한다.

2. 드롭다운 패널 HTML 구조를 작성한다:
   ```html
   <div id="notification-panel" class="notification-dropdown hidden">
     <div class="notification-header">
       <span>알림</span>
       <button id="mark-all-read">모두 읽음</button>
     </div>
     <div id="notification-list"></div>
     <div class="notification-footer">
       <a href="#">모든 알림 보기</a>
     </div>
   </div>
   ```

3. `loadNotifications()` 함수를 구현한다:
   - `user_notifications` 테이블에서 최근 20개 알림 조회
   - `order('created_at', { ascending: false })` 적용
   - 로그인 상태일 때만 호출

4. `renderNotifications(notifications)` 함수를 구현한다:
   - 읽지 않은 알림(is_read: false)에 강조 스타일 적용
   - 알림 타입에 따라 아이콘 구분 (댓글: 💬, 투표: 👍, 시스템: 📢)
   - 알림 내용, 시간(상대 시간 표시) 렌더링

5. 알림 클릭 시 읽음 처리 함수를 구현한다:
   - 개별 알림 클릭 시 `is_read: true`로 UPDATE
   - 읽음 처리 후 UI 즉시 업데이트 (해당 항목 스타일 변경)

6. "모두 읽음" 버튼 클릭 시 전체 읽음 처리를 구현한다.

7. 알림 벨 아이콘에 읽지 않은 알림 수 배지를 표시한다.

8. 드롭다운 외부 클릭 시 패널이 닫히도록 처리한다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `community.html` | 알림 드롭다운 패널 HTML, CSS, JS 추가 |

## 완료 기준
- [ ] 알림 버튼 클릭 시 드롭다운 패널이 표시됨
- [ ] `user_notifications` 테이블에서 최근 알림 20개가 로드됨
- [ ] 읽지 않은 알림이 시각적으로 강조 표시됨
- [ ] 알림 클릭 시 읽음 처리되고 UI가 즉시 업데이트됨
- [ ] "모두 읽음" 버튼이 정상 동작함
- [ ] 벨 아이콘에 읽지 않은 알림 수 배지가 표시됨
- [ ] 드롭다운 외부 클릭 시 패널이 닫힘
- [ ] 비로그인 상태에서 알림 버튼 클릭 시 적절한 처리
