// @task S6F9
// AX-On Platform — AI 튜터 챗봇 위젯 (전 페이지 공통)
// index.html 전용 챗봇을 독립 모듈로 추출하여 모든 페이지에서 사용 가능

(function () {
  'use strict';

  /* ── 챗봇 HTML 주입 ─────────────────────────────── */
  function injectChatbotHTML() {
    // 이미 존재하면 중복 삽입 방지
    if (document.getElementById('chatbot-widget-root')) return;

    const root = document.createElement('div');
    root.id = 'chatbot-widget-root';
    root.innerHTML = `
      <button id="floatingTutor" class="chatbot-float-btn" aria-label="AI 튜터 열기">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
      <div id="chatWindow" class="chatbot-window" style="display:none;">
        <div class="chatbot-header">
          <span>AI 튜터</span>
          <button id="chatClose" class="chatbot-close" aria-label="닫기">&times;</button>
        </div>
        <div id="chatMessages" class="chatbot-messages">
          <div class="chatbot-msg bot">안녕하세요! AX-On Platform AI 튜터입니다. 무엇이든 물어보세요 😊</div>
        </div>
        <div class="chatbot-input-wrap">
          <input id="chatInput" type="text" placeholder="메시지를 입력하세요..." autocomplete="off" />
          <button id="chatSendBtn" class="chatbot-send">전송</button>
        </div>
      </div>
    `;
    document.body.appendChild(root);
  }

  /* ── 챗봇 CSS 주입 ─────────────────────────────── */
  function injectChatbotCSS() {
    if (document.getElementById('chatbot-widget-style')) return;

    const style = document.createElement('style');
    style.id = 'chatbot-widget-style';
    style.textContent = `
      .chatbot-float-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--violet, #6c5ce7);
        color: #fff;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(108,92,231,.35);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9998;
        transition: transform .2s, box-shadow .2s;
      }
      .chatbot-float-btn:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 24px rgba(108,92,231,.45);
      }
      .chatbot-window {
        position: fixed;
        bottom: 96px;
        right: 24px;
        width: 380px;
        max-width: calc(100vw - 32px);
        height: 500px;
        max-height: calc(100vh - 140px);
        background: var(--surface, #fff);
        border-radius: var(--radius, 16px);
        box-shadow: 0 8px 32px rgba(0,0,0,.18);
        display: flex;
        flex-direction: column;
        z-index: 9999;
        overflow: hidden;
      }
      .chatbot-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
        background: var(--violet, #6c5ce7);
        color: #fff;
        font-weight: 700;
        font-size: 15px;
      }
      .chatbot-close {
        background: none;
        border: none;
        color: #fff;
        font-size: 22px;
        cursor: pointer;
        line-height: 1;
        padding: 0 4px;
      }
      .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .chatbot-msg {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.55;
        word-break: break-word;
      }
      .chatbot-msg.bot {
        align-self: flex-start;
        background: var(--surface-warm, #f8f7f4);
        color: var(--ink, #1a1a2e);
      }
      .chatbot-msg.user {
        align-self: flex-end;
        background: var(--violet, #6c5ce7);
        color: #fff;
      }
      .chatbot-msg.typing {
        align-self: flex-start;
        background: var(--surface-warm, #f8f7f4);
        color: var(--ink-muted, #636e72);
        font-style: italic;
      }
      .chatbot-input-wrap {
        display: flex;
        gap: 8px;
        padding: 12px 14px;
        border-top: 1px solid rgba(0,0,0,.08);
      }
      .chatbot-input-wrap input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid rgba(0,0,0,.12);
        border-radius: 8px;
        font-size: 14px;
        outline: none;
      }
      .chatbot-input-wrap input:focus {
        border-color: var(--violet, #6c5ce7);
      }
      .chatbot-send {
        padding: 10px 18px;
        background: var(--violet, #6c5ce7);
        color: #fff;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        white-space: nowrap;
      }
      .chatbot-send:disabled {
        opacity: .5;
        cursor: not-allowed;
      }
      @media (max-width: 480px) {
        .chatbot-window {
          bottom: 0;
          right: 0;
          width: 100vw;
          height: 100vh;
          max-height: 100vh;
          border-radius: 0;
        }
        .chatbot-float-btn {
          bottom: 16px;
          right: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── 키워드 응답 데이터 ─────────────────────────── */
  var keywordResponses = {
    'AI': [
      'AX-On은 AI를 활용한 비즈니스 혁신을 돕는 플랫폼입니다. 구체적으로 어떤 분야에 관심이 있으신가요?',
      'AI 전문가들이 직접 프로젝트를 수행합니다. 산업별 맞춤 AI 솔루션이 필요하시면 말씀해주세요!',
      'AX(AI Transformation)는 단순 도구 도입이 아닌, 업무 프로세스 자체를 AI로 혁신하는 것입니다.'
    ],
    '전문가': [
      '각 분야 10년 이상 경력의 시니어 AI 전문가들이 함께합니다. 전문가 프로필을 확인해보세요!',
      '우리 전문가들은 실제 기업 프로젝트 경험이 풍부합니다. 어떤 분야의 전문가를 찾고 계신가요?',
      '전문가 매칭은 산업, 기술 스택, 프로젝트 규모를 고려하여 최적의 전문가를 연결해드립니다.'
    ],
    '프로젝트': [
      '기업 AX 프로젝트는 진단→설계→구현→검증 4단계로 진행됩니다. 프로젝트 문의 페이지에서 상담 신청하세요!',
      '소기업(6-12개월), 중기업(1-2년), 중견기업(2-3년) 규모별 맞춤 프로젝트를 제공합니다.',
      '프로젝트 접수는 산업 선택 → 규모 선택 → 필요 분야 체크 → 기업 정보 입력 순서로 진행됩니다.'
    ],
    '교육': [
      '시니어 AI 창업 교육 과정이 준비되어 있습니다. 바이브코딩 스페셜, MVP 캠프, 마스터 코스 중 선택하세요!',
      '50+ 시니어 전문가를 위한 AI 창업 교육으로, 실습 중심의 커리큘럼을 제공합니다.',
      '교육 과정은 온라인과 오프라인 병행으로 진행되며, 수료 후 실제 프로젝트에 참여할 수 있습니다.'
    ],
    '수강': [
      '수강신청은 상단 메뉴의 "수강신청" 버튼을 클릭하시면 됩니다!',
      '수강 관련 문의는 수강신청 페이지에서 프로그램을 선택한 후 신청서를 작성해주세요.',
      '현재 모집 중인 과정: 바이브코딩 스페셜, MVP 캠프, 마스터 코스'
    ],
    '문의': [
      '문의사항이 있으시면 상단의 "문의하기" 메뉴를 이용해주세요. 빠르게 답변드리겠습니다!',
      '전화, 이메일, 온라인 폼으로 문의하실 수 있습니다. 어떤 방법이 편하신가요?',
      '담당자가 영업일 기준 1-2일 내에 연락드리겠습니다.'
    ],
    '커뮤니티': [
      '커뮤니티에서 다른 전문가들과 교류하고 최신 AI 트렌드를 공유할 수 있습니다!',
      '커뮤니티 게시판에서 프로젝트 사례, 기술 공유, Q&A를 이용해보세요.',
      '전문가 네트워킹 이벤트도 정기적으로 개최됩니다. 커뮤니티 페이지를 확인해주세요!'
    ],
    'AX': [
      'AX(AI Transformation)는 기업의 AI 전환을 의미합니다. 단순 도구 도입이 아닌 비즈니스 모델 혁신입니다.',
      'AX-On Platform은 AX를 위한 전문가, 교육, 프로젝트를 한 곳에서 제공합니다.',
      'AX 프로젝트에 관심이 있으시면 "프로젝트 문의" 페이지를 방문해주세요!'
    ]
  };

  var chatKeywordCounters = {};

  /* ── 헬퍼 함수 ─────────────────────────────────── */
  function addMsg(role, text) {
    var container = document.getElementById('chatMessages');
    if (!container) return;
    var div = document.createElement('div');
    div.className = 'chatbot-msg ' + role;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    var container = document.getElementById('chatMessages');
    if (!container) return;
    var div = document.createElement('div');
    div.className = 'chatbot-msg typing';
    div.id = 'chatTyping';
    div.textContent = '답변을 생각하고 있어요...';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function removeTyping() {
    var el = document.getElementById('chatTyping');
    if (el) el.remove();
  }

  function getKeywordResponse(msg) {
    var keys = Object.keys(keywordResponses);
    for (var i = 0; i < keys.length; i++) {
      var keyword = keys[i];
      if (msg.includes(keyword)) {
        if (!chatKeywordCounters[keyword]) chatKeywordCounters[keyword] = 0;
        var arr = keywordResponses[keyword];
        var idx = chatKeywordCounters[keyword] % arr.length;
        chatKeywordCounters[keyword]++;
        return arr[idx];
      }
    }
    return null;
  }

  async function getBotResponse(msg) {
    // 1차: Edge Function (AI 응답)
    try {
      if (typeof AXON_CONFIG !== 'undefined' && AXON_CONFIG.SUPABASE_URL) {
        var res = await fetch(AXON_CONFIG.SUPABASE_URL + '/functions/v1/ai-tutor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AXON_CONFIG.SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ message: msg })
        });
        if (res.ok) {
          var data = await res.json();
          if (data.reply) return data.reply;
        }
      }
    } catch (e) {
      // Edge Function 실패 시 키워드 폴백
    }

    // 2차: 키워드 매칭
    var kwResp = getKeywordResponse(msg);
    if (kwResp) return kwResp;

    // 3차: 기본 응답
    return '좋은 질문이시네요! 더 정확한 답변을 위해 상단 메뉴의 "문의하기"를 통해 전문 상담을 받아보시는 것을 추천드립니다.';
  }

  /* ── 전송 핸들러 ───────────────────────────────── */
  async function handleSend() {
    var input = document.getElementById('chatInput');
    var sendBtn = document.getElementById('chatSendBtn');
    if (!input || !sendBtn) return;

    var msg = input.value.trim();
    if (!msg) return;

    addMsg('user', msg);
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    showTyping();

    try {
      var reply = await getBotResponse(msg);
      removeTyping();
      addMsg('bot', reply);
    } catch (e) {
      removeTyping();
      addMsg('bot', '죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }

  /* ── 이벤트 바인딩 ─────────────────────────────── */
  function bindEvents() {
    var floatingBtn = document.getElementById('floatingTutor');
    var chatWindow = document.getElementById('chatWindow');
    var chatClose = document.getElementById('chatClose');
    var chatInput = document.getElementById('chatInput');
    var chatSendBtn = document.getElementById('chatSendBtn');

    if (!floatingBtn || !chatWindow) return;

    floatingBtn.addEventListener('click', function () {
      var isOpen = chatWindow.style.display !== 'none';
      chatWindow.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen && chatInput) chatInput.focus();
    });

    if (chatClose) {
      chatClose.addEventListener('click', function () {
        chatWindow.style.display = 'none';
      });
    }

    if (chatSendBtn) {
      chatSendBtn.addEventListener('click', handleSend);
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleSend();
      });
    }

    // ESC 키로 닫기
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && chatWindow.style.display !== 'none') {
        chatWindow.style.display = 'none';
      }
    });
  }

  /* ── 초기화 ─────────────────────────────────────── */
  function initChatbot() {
    injectChatbotCSS();
    injectChatbotHTML();
    bindEvents();

    // AXON_CONFIG가 있으면 초기화 시도 (없어도 키워드 폴백으로 동작)
    if (typeof AXON_CONFIG !== 'undefined' && typeof AXON_CONFIG.init === 'function') {
      AXON_CONFIG.init().catch(function () {
        // 설정 로드 실패해도 챗봇은 키워드 모드로 동작
      });
    }
  }

  // DOM 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }

  // 외부 접근용
  window.ChatbotWidget = { init: initChatbot };
})();
