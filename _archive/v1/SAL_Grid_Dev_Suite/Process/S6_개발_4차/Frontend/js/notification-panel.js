// @task S6F1 — 알림 드롭다운 패널 UI
// @area F | @stage S6

/**
 * 커뮤니티 알림 드롭다운 패널 모듈
 * user_notifications 테이블에서 최근 알림 조회, 읽음 처리
 */

(function() {
  'use strict';

  const NOTIFICATION_LIMIT = 20;
  const TYPE_ICONS = {
    comment: '\uD83D\uDCAC',
    vote: '\uD83D\uDC4D',
    system: '\uD83D\uDCE2',
    mention: '\uD83D\uDCCC',
    reply: '\u21A9\uFE0F'
  };

  function getRelativeTime(dateStr) {
    var now = new Date();
    var date = new Date(dateStr);
    var diff = Math.floor((now - date) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return Math.floor(diff / 60) + '분 전';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
    if (diff < 604800) return Math.floor(diff / 86400) + '일 전';
    return date.toLocaleDateString('ko-KR');
  }

  function escapeHtml(str) {
    if (!str) return '';
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(str).replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  function createNotificationPanel() {
    if (document.getElementById('notification-panel')) return;

    var bellBtn = document.querySelector('.notification-bell, [data-notification-bell]');
    if (!bellBtn) return;

    // 배지 추가
    var badge = document.createElement('span');
    badge.id = 'notification-badge';
    badge.className = 'notification-badge';
    badge.style.cssText = 'display:none;position:absolute;top:-4px;right:-4px;background:#e74c3c;color:#fff;font-size:11px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;';
    bellBtn.style.position = 'relative';
    bellBtn.appendChild(badge);

    // 드롭다운 패널
    var panel = document.createElement('div');
    panel.id = 'notification-panel';
    panel.className = 'notification-dropdown';
    panel.style.cssText = 'display:none;position:absolute;top:100%;right:0;width:360px;max-height:480px;background:#fff;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.15);z-index:1000;overflow:hidden;';
    panel.innerHTML =
      '<div class="notification-header" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #eee;">' +
        '<span style="font-size:16px;font-weight:700;color:#1a1a2e;">알림</span>' +
        '<button id="mark-all-read" style="background:none;border:none;color:#6c5ce7;font-size:13px;cursor:pointer;font-weight:600;">모두 읽음</button>' +
      '</div>' +
      '<div id="notification-list" style="overflow-y:auto;max-height:360px;"></div>' +
      '<div class="notification-footer" style="padding:12px 20px;border-top:1px solid #eee;text-align:center;">' +
        '<a href="#" style="color:#6c5ce7;font-size:13px;text-decoration:none;font-weight:600;">모든 알림 보기</a>' +
      '</div>';

    bellBtn.parentElement.style.position = 'relative';
    bellBtn.parentElement.appendChild(panel);

    // 벨 클릭 토글
    bellBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        loadNotifications();
      }
    });

    // 외부 클릭 닫기
    document.addEventListener('click', function(e) {
      if (!panel.contains(e.target) && e.target !== bellBtn && !bellBtn.contains(e.target)) {
        panel.style.display = 'none';
      }
    });

    // 모두 읽음
    document.getElementById('mark-all-read').addEventListener('click', function() {
      markAllAsRead();
    });
  }

  async function loadNotifications() {
    if (typeof supabase === 'undefined') return;

    var listEl = document.getElementById('notification-list');
    if (!listEl) return;

    try {
      var userData = await supabase.auth.getUser();
      var user = userData.data && userData.data.user;
      if (!user) {
        listEl.innerHTML = '<div style="padding:40px 20px;text-align:center;color:#999;font-size:14px;">로그인 후 알림을 확인할 수 있습니다.</div>';
        return;
      }

      var result = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(NOTIFICATION_LIMIT);

      if (result.error) throw result.error;

      var notifications = result.data || [];
      renderNotifications(notifications);
      updateBadge(notifications);
    } catch (err) {
      listEl.innerHTML = '<div style="padding:40px 20px;text-align:center;color:#999;font-size:14px;">알림을 불러올 수 없습니다.</div>';
    }
  }

  function renderNotifications(notifications) {
    var listEl = document.getElementById('notification-list');
    if (!listEl) return;

    if (!notifications || notifications.length === 0) {
      listEl.innerHTML = '<div style="padding:40px 20px;text-align:center;color:#999;font-size:14px;">새로운 알림이 없습니다.</div>';
      return;
    }

    var html = '';
    notifications.forEach(function(n) {
      var icon = TYPE_ICONS[n.type] || TYPE_ICONS.system;
      var unreadStyle = n.is_read ? '' : 'background:#f8f7ff;';
      var unreadDot = n.is_read ? '' : '<span style="width:8px;height:8px;border-radius:50%;background:#6c5ce7;flex-shrink:0;"></span>';

      html += '<div class="notification-item" data-id="' + n.id + '" style="display:flex;align-items:flex-start;gap:12px;padding:14px 20px;cursor:pointer;transition:background 0.2s;' + unreadStyle + '" onmouseover="this.style.background=\'#f5f5f5\'" onmouseout="this.style.background=\'' + (n.is_read ? '' : '#f8f7ff') + '\'">' +
        '<span style="font-size:20px;flex-shrink:0;margin-top:2px;">' + icon + '</span>' +
        '<div style="flex:1;min-width:0;">' +
          '<p style="margin:0;font-size:14px;color:#333;line-height:1.4;' + (n.is_read ? '' : 'font-weight:600;') + '">' + escapeHtml(n.message || n.content || '알림') + '</p>' +
          '<span style="font-size:12px;color:#999;margin-top:4px;display:block;">' + getRelativeTime(n.created_at) + '</span>' +
        '</div>' +
        unreadDot +
      '</div>';
    });

    listEl.innerHTML = html;

    // 개별 알림 클릭 읽음 처리
    listEl.querySelectorAll('.notification-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var id = this.getAttribute('data-id');
        markAsRead(id, this);
      });
    });
  }

  function updateBadge(notifications) {
    var badge = document.getElementById('notification-badge');
    if (!badge) return;

    var unreadCount = 0;
    if (notifications) {
      notifications.forEach(function(n) {
        if (!n.is_read) unreadCount++;
      });
    }

    if (unreadCount > 0) {
      badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  async function markAsRead(notificationId, itemEl) {
    if (typeof supabase === 'undefined') return;
    try {
      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (itemEl) {
        itemEl.style.background = '';
        itemEl.style.fontWeight = 'normal';
        var dot = itemEl.querySelector('span[style*="border-radius:50%"]');
        if (dot) dot.remove();
      }

      // 배지 업데이트
      var items = document.querySelectorAll('.notification-item');
      var unread = 0;
      items.forEach(function(el) {
        if (el.style.background && el.style.background.indexOf('f8f7ff') !== -1) unread++;
      });
      var badge = document.getElementById('notification-badge');
      if (badge) {
        badge.textContent = unread > 0 ? String(unread) : '';
        badge.style.display = unread > 0 ? 'flex' : 'none';
      }
    } catch (err) {
      // 읽음 처리 실패 무시
    }
  }

  async function markAllAsRead() {
    if (typeof supabase === 'undefined') return;
    try {
      var userData = await supabase.auth.getUser();
      var user = userData.data && userData.data.user;
      if (!user) return;

      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      // UI 업데이트
      document.querySelectorAll('.notification-item').forEach(function(el) {
        el.style.background = '';
        var dot = el.querySelector('span[style*="border-radius:50%"]');
        if (dot) dot.remove();
      });

      var badge = document.getElementById('notification-badge');
      if (badge) badge.style.display = 'none';
    } catch (err) {
      // 전체 읽음 처리 실패 무시
    }
  }

  // 초기화
  document.addEventListener('DOMContentLoaded', function() {
    createNotificationPanel();
    if (typeof supabase !== 'undefined') {
      // 배지 업데이트용 초기 로드
      loadNotifications();
    }
  });

  // 전역 노출
  window.NotificationPanel = {
    load: loadNotifications,
    markAsRead: markAsRead,
    markAllAsRead: markAllAsRead
  };
})();
