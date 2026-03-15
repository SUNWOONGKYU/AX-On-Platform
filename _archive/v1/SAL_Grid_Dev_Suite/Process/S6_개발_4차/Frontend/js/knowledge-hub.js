// @task S6F2 — AI 지식 허브 사이드바 확장
// @area F | @stage S6

/**
 * community.html 오른쪽 사이드바 AI 지식 허브 콘텐츠 확장 모듈
 * DOMContentLoaded 시 자동으로 사이드바에 콘텐츠 주입
 */

(function() {
  'use strict';

  var KNOWLEDGE_HUB_DATA = {
    aiGuide: {
      title: 'AI 활용 가이드',
      icon: '\uD83D\uDCDA',
      items: [
        {
          title: 'ChatGPT 업무 활용 10가지 방법',
          desc: '일상 업무에 바로 적용할 수 있는 실전 프롬프트',
          icon: '\uD83D\uDCA1',
          url: '#ai-guide-chatgpt'
        },
        {
          title: 'AI 프롬프트 작성 기초 가이드',
          desc: '효과적인 프롬프트 작성을 위한 핵심 원칙',
          icon: '\u270D\uFE0F',
          url: '#ai-guide-prompt'
        },
        {
          title: 'Claude로 코드 작성하기',
          desc: 'AI 페어 프로그래밍의 실전 활용법',
          icon: '\uD83D\uDCBB',
          url: '#ai-guide-claude'
        }
      ]
    },
    salGrid: {
      title: 'SAL Grid 방법론',
      icon: '\uD83D\uDCCA',
      items: [
        {
          title: 'SAL Grid 개발 방법론이란?',
          desc: '3D 좌표계 기반 혁신적 프로젝트 관리',
          icon: '\uD83C\uDFAF',
          url: '#sal-grid-intro'
        },
        {
          title: '3D 좌표계로 프로젝트 관리하기',
          desc: 'Stage-Area-Level 실전 가이드',
          icon: '\uD83D\uDDFA\uFE0F',
          url: '#sal-grid-guide'
        }
      ]
    },
    successStories: {
      title: 'AI 창업 성공 사례',
      icon: '\uD83C\uDF1F',
      items: [
        {
          title: '시니어 AI 창업 성공 스토리',
          desc: '50대 이상 창업가들의 AI 활용 실전 경험',
          icon: '\uD83C\uDFC6',
          url: '#story-senior'
        },
        {
          title: 'AI 전문가 인터뷰',
          desc: '분야별 AI 전문가들의 인사이트',
          icon: '\uD83C\uDF99\uFE0F',
          url: '#story-interview'
        },
        {
          title: '기업 AX 프로젝트 사례',
          desc: '실제 기업의 AI 전환 성공 사례',
          icon: '\uD83C\uDFE2',
          url: '#story-enterprise'
        }
      ]
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(str).replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  function buildCategoryHtml(category) {
    var html = '<div class="hub-category" style="margin-bottom:20px;">';
    html += '<h4 style="font-size:13px;font-weight:700;color:#6c5ce7;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px 0;display:flex;align-items:center;gap:6px;">';
    html += '<span>' + category.icon + '</span> ' + escapeHtml(category.title);
    html += '</h4>';
    html += '<ul style="list-style:none;padding:0;margin:0;">';

    category.items.forEach(function(item) {
      html += '<li style="margin-bottom:8px;">';
      html += '<a href="' + escapeHtml(item.url) + '" class="hub-link" style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:8px;text-decoration:none;color:inherit;transition:background 0.2s;" onmouseover="this.style.background=\'#f8f7ff\'" onmouseout="this.style.background=\'transparent\'">';
      html += '<span style="font-size:18px;flex-shrink:0;margin-top:1px;">' + item.icon + '</span>';
      html += '<div>';
      html += '<div style="font-size:14px;font-weight:600;color:var(--ink,#1a1a2e);line-height:1.3;">' + escapeHtml(item.title) + '</div>';
      html += '<div style="font-size:12px;color:#888;margin-top:2px;line-height:1.3;">' + escapeHtml(item.desc) + '</div>';
      html += '</div>';
      html += '</a></li>';
    });

    html += '</ul></div>';
    return html;
  }

  function injectKnowledgeHub() {
    // AI 지식 허브 사이드바 섹션 찾기
    var hubSection = document.querySelector('.knowledge-hub, [data-knowledge-hub], .sidebar-knowledge');
    if (!hubSection) {
      // 사이드바 내부에서 "AI 지식 허브" 텍스트를 포함하는 요소 찾기
      var sidebar = document.querySelector('.sidebar-right, .community-sidebar, aside');
      if (!sidebar) return;

      var headings = sidebar.querySelectorAll('h3, h4, .sidebar-title');
      headings.forEach(function(h) {
        if (h.textContent.indexOf('AI 지식') !== -1 || h.textContent.indexOf('지식 허브') !== -1) {
          hubSection = h.parentElement;
        }
      });

      if (!hubSection) {
        // 사이드바 끝에 새 섹션 추가
        hubSection = document.createElement('div');
        hubSection.className = 'knowledge-hub-section';
        hubSection.style.cssText = 'background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);margin-top:20px;';

        var hubTitle = document.createElement('h3');
        hubTitle.style.cssText = 'font-size:16px;font-weight:700;color:var(--ink,#1a1a2e);margin:0 0 16px 0;display:flex;align-items:center;gap:8px;';
        hubTitle.innerHTML = '\uD83E\uDDE0 AI 지식 허브';
        hubSection.appendChild(hubTitle);

        sidebar.appendChild(hubSection);
      }
    }

    // 기존 콘텐츠 유지, 새 콘텐츠 추가
    var contentContainer = hubSection.querySelector('.hub-content');
    if (!contentContainer) {
      contentContainer = document.createElement('div');
      contentContainer.className = 'hub-content';
      hubSection.appendChild(contentContainer);
    }

    var html = '';
    html += buildCategoryHtml(KNOWLEDGE_HUB_DATA.aiGuide);
    html += '<hr style="border:none;border-top:1px solid #eee;margin:16px 0;">';
    html += buildCategoryHtml(KNOWLEDGE_HUB_DATA.salGrid);
    html += '<hr style="border:none;border-top:1px solid #eee;margin:16px 0;">';
    html += buildCategoryHtml(KNOWLEDGE_HUB_DATA.successStories);

    // 더보기 버튼
    html += '<div style="text-align:center;margin-top:16px;">';
    html += '<a href="#" style="display:inline-flex;align-items:center;gap:4px;color:#6c5ce7;font-size:13px;font-weight:600;text-decoration:none;padding:8px 16px;border:1px solid #6c5ce7;border-radius:20px;transition:all 0.2s;" onmouseover="this.style.background=\'#6c5ce7\';this.style.color=\'#fff\'" onmouseout="this.style.background=\'transparent\';this.style.color=\'#6c5ce7\'">';
    html += '\uD83D\uDD0D 더 많은 리소스 보기</a></div>';

    contentContainer.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', function() {
    injectKnowledgeHub();
  });

  window.KnowledgeHub = {
    inject: injectKnowledgeHub,
    data: KNOWLEDGE_HUB_DATA
  };
})();
