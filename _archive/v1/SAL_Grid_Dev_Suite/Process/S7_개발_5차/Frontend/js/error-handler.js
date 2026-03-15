// @task S7F1
// error-handler.js — AX-On Platform 전역 에러 핸들링 유틸리티

(function (global) {
  'use strict';

  /* ── 설정 ── */
  var CONFIG = {
    // 서버 에러 로그 전송 엔드포인트 (향후 활성화)
    logEndpoint: null, // 예: '/api/log-error'
    // 사용자 알림 표시 여부
    showNotifications: true,
    // 알림 자동 사라짐 시간 (ms)
    notificationDuration: 5000,
    // 디버그 모드 (console 상세 출력)
    debug: false,
    // 에러 페이지 경로 (상대 경로, 실제 배포 환경에서 조정)
    errorPages: {
      '404': '/404.html',
      '500': '/500.html'
    },
    // 현재 페이지 타입 (init 시 설정)
    pageType: null
  };

  /* ── 에러 레벨 상수 ── */
  var LEVEL = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    FATAL: 'fatal'
  };

  /* ── 내부 유틸리티 ── */

  /**
   * ISO 8601 타임스탬프 반환
   * @returns {string}
   */
  function getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * 현재 페이지 URL 반환
   * @returns {string}
   */
  function getCurrentUrl() {
    return global.location ? global.location.href : 'unknown';
  }

  /**
   * 유저 에이전트 반환
   * @returns {string}
   */
  function getUserAgent() {
    return global.navigator ? global.navigator.userAgent : 'unknown';
  }

  /**
   * 에러 객체를 직렬화 가능한 포맷으로 변환
   * @param {Error|string|unknown} err
   * @returns {Object}
   */
  function serializeError(err) {
    if (!err) return { message: 'Unknown error', type: 'Unknown' };
    if (typeof err === 'string') return { message: err, type: 'StringError' };
    if (err instanceof Error) {
      return {
        message: err.message || 'Unknown error',
        type: err.name || 'Error',
        stack: err.stack || null
      };
    }
    try {
      return { message: JSON.stringify(err), type: typeof err };
    } catch (_) {
      return { message: String(err), type: typeof err };
    }
  }

  /* ── 로그 엔트리 구조 ── */

  /**
   * 로그 엔트리 생성
   * @param {string} level - LEVEL 상수값
   * @param {string} message
   * @param {Object} [meta]
   * @returns {Object}
   */
  function createLogEntry(level, message, meta) {
    return {
      level: level,
      message: message,
      timestamp: getTimestamp(),
      url: getCurrentUrl(),
      userAgent: getUserAgent(),
      meta: meta || {}
    };
  }

  /* ── 콘솔 로거 ── */
  var Logger = {
    /**
     * 에러를 콘솔에 출력
     * @param {string} level
     * @param {string} message
     * @param {Object} [meta]
     */
    log: function (level, message, meta) {
      if (!global.console) return;
      var entry = createLogEntry(level, message, meta);
      var prefix = '[AX-On ErrorHandler]';
      switch (level) {
        case LEVEL.INFO:
          if (CONFIG.debug) console.info(prefix, message, meta || '');
          break;
        case LEVEL.WARN:
          console.warn(prefix, message, meta || '');
          break;
        case LEVEL.ERROR:
        case LEVEL.FATAL:
          console.error(prefix, message, meta || '');
          if (CONFIG.debug && entry.meta && entry.meta.stack) {
            console.error('Stack trace:', entry.meta.stack);
          }
          break;
        default:
          if (CONFIG.debug) console.log(prefix, message, meta || '');
      }
      return entry;
    }
  };

  /* ── 서버 에러 전송 (향후 활성화) ── */
  var Reporter = {
    /**
     * 에러를 서버로 전송 (현재는 로컬 스토리지 임시 저장 방식)
     * @param {Object} entry - createLogEntry 결과
     */
    send: function (entry) {
      // 1) 로컬 스토리지에 최근 10개 에러 누적 저장
      try {
        var stored = JSON.parse(localStorage.getItem('ax_error_log') || '[]');
        stored.unshift(entry);
        if (stored.length > 10) stored = stored.slice(0, 10);
        localStorage.setItem('ax_error_log', JSON.stringify(stored));
      } catch (_) {
        // 저장 실패 시 무시
      }

      // 2) 서버 전송 (엔드포인트가 설정된 경우)
      if (!CONFIG.logEndpoint) return;
      try {
        var body = JSON.stringify(entry);
        if (global.fetch) {
          global.fetch(CONFIG.logEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body,
            keepalive: true
          }).catch(function () {
            // 서버 전송 실패는 조용히 무시
          });
        } else if (global.XMLHttpRequest) {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', CONFIG.logEndpoint, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(body);
        }
      } catch (_) {
        // 전송 실패 시 무시
      }
    }
  };

  /* ── 사용자 알림 UI ── */
  var Notifier = {
    /**
     * 알림 컨테이너 생성 (최초 1회)
     * @returns {HTMLElement}
     */
    _getContainer: function () {
      var id = 'ax-error-notification-container';
      var el = document.getElementById(id);
      if (el) return el;
      el = document.createElement('div');
      el.id = id;
      el.setAttribute('role', 'alert');
      el.setAttribute('aria-live', 'polite');
      el.style.cssText = [
        'position:fixed',
        'bottom:24px',
        'right:24px',
        'z-index:9999',
        'display:flex',
        'flex-direction:column',
        'gap:10px',
        'pointer-events:none',
        'max-width:360px',
        'width:calc(100% - 48px)'
      ].join(';');
      document.body.appendChild(el);
      return el;
    },

    /**
     * 사용자 친화적 알림 표시
     * @param {string} message - 표시할 메시지
     * @param {'error'|'warn'|'info'} type
     * @param {number} [duration] - 자동 사라짐 시간 ms (0이면 수동 닫기)
     */
    show: function (message, type, duration) {
      if (!CONFIG.showNotifications) return;
      if (!document.body) return;

      var colors = {
        error: { bg: '#fff1f0', border: 'rgba(232,93,74,0.3)', icon: '#e85d4a', text: '#1a1a2e' },
        warn:  { bg: '#fffbeb', border: 'rgba(232,146,13,0.3)', icon: '#e8920d', text: '#1a1a2e' },
        info:  { bg: '#f0fdf9', border: 'rgba(13,148,136,0.3)', icon: '#0d9488', text: '#1a1a2e' }
      };
      var icons = {
        error: '⚠',
        warn: '⚡',
        info: 'ℹ'
      };
      var palette = colors[type] || colors.info;
      var container = this._getContainer();

      var toast = document.createElement('div');
      toast.style.cssText = [
        'background:' + palette.bg,
        'border:1px solid ' + palette.border,
        'border-radius:12px',
        'padding:14px 16px',
        'display:flex',
        'align-items:flex-start',
        'gap:10px',
        'font-family:\'Noto Sans KR\',sans-serif',
        'font-size:14px',
        'line-height:1.6',
        'color:' + palette.text,
        'box-shadow:0 4px 20px rgba(26,26,46,0.1)',
        'pointer-events:auto',
        'animation:axToastIn 0.3s ease',
        'word-break:keep-all'
      ].join(';');

      // 아이콘
      var iconEl = document.createElement('span');
      iconEl.textContent = icons[type] || icons.info;
      iconEl.style.cssText = 'color:' + palette.icon + ';font-size:16px;flex-shrink:0;margin-top:1px';
      toast.appendChild(iconEl);

      // 메시지
      var msgEl = document.createElement('span');
      msgEl.textContent = message;
      msgEl.style.flex = '1';
      toast.appendChild(msgEl);

      // 닫기 버튼
      var closeEl = document.createElement('button');
      closeEl.textContent = '×';
      closeEl.setAttribute('aria-label', '알림 닫기');
      closeEl.style.cssText = [
        'background:none',
        'border:none',
        'cursor:pointer',
        'font-size:18px',
        'line-height:1',
        'color:' + palette.icon,
        'flex-shrink:0',
        'padding:0',
        'opacity:0.6',
        'transition:opacity 0.2s'
      ].join(';');
      closeEl.addEventListener('mouseover', function () { closeEl.style.opacity = '1'; });
      closeEl.addEventListener('mouseout', function () { closeEl.style.opacity = '0.6'; });
      closeEl.addEventListener('click', function () { dismiss(toast, container); });
      toast.appendChild(closeEl);

      container.appendChild(toast);

      // 인라인 애니메이션 스타일 (중복 방지)
      if (!document.getElementById('ax-toast-style')) {
        var style = document.createElement('style');
        style.id = 'ax-toast-style';
        style.textContent = '@keyframes axToastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes axToastOut{from{opacity:1}to{opacity:0;transform:translateY(10px)}}';
        document.head.appendChild(style);
      }

      // 자동 사라짐
      var ms = (duration !== undefined) ? duration : CONFIG.notificationDuration;
      if (ms > 0) {
        setTimeout(function () { dismiss(toast, container); }, ms);
      }

      function dismiss(el, cont) {
        if (!el.parentNode) return;
        el.style.animation = 'axToastOut 0.25s ease forwards';
        setTimeout(function () {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 250);
      }
    }
  };

  /* ── fetch 에러 인터셉터 ── */
  var FetchInterceptor = {
    _originalFetch: null,

    /**
     * 전역 fetch를 래핑하여 HTTP 에러를 감지
     */
    install: function () {
      if (!global.fetch) return;
      if (this._originalFetch) return; // 이미 설치됨

      this._originalFetch = global.fetch;
      var self = this;

      global.fetch = function (input, init) {
        return self._originalFetch.call(global, input, init).then(function (response) {
          if (!response.ok) {
            var url = typeof input === 'string' ? input : (input.url || String(input));
            var errorMeta = {
              status: response.status,
              statusText: response.statusText,
              url: url
            };

            // 로그 기록
            var msg = 'HTTP ' + response.status + ' — ' + url;
            ErrorHandler.logError(LEVEL.WARN, msg, errorMeta);

            // 500대 에러: 사용자 알림
            if (response.status >= 500) {
              Notifier.show(
                '서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                'error'
              );
            }
            // 404: 개발 환경에서만 경고
            if (response.status === 404 && CONFIG.debug) {
              Notifier.show('요청한 리소스를 찾을 수 없습니다: ' + url, 'warn');
            }
          }
          return response;
        }).catch(function (err) {
          // 네트워크 에러 (CORS, 오프라인 등)
          ErrorHandler.logError(LEVEL.ERROR, 'Fetch network error', serializeError(err));
          Notifier.show('네트워크 연결을 확인해주세요.', 'error');
          throw err;
        });
      };
    },

    /**
     * 원본 fetch 복원
     */
    uninstall: function () {
      if (this._originalFetch) {
        global.fetch = this._originalFetch;
        this._originalFetch = null;
      }
    }
  };

  /* ── 전역 에러 핸들러 ── */
  var GlobalErrorHandler = {
    /**
     * window.onerror 등록
     */
    install: function () {
      // 1) 동기 JS 에러
      global.onerror = function (message, source, lineno, colno, error) {
        var meta = {
          source: source || 'unknown',
          line: lineno,
          col: colno,
          error: serializeError(error)
        };
        ErrorHandler.logError(LEVEL.ERROR, String(message), meta);
        Notifier.show('예기치 않은 오류가 발생했습니다. 페이지를 새로고침 해주세요.', 'error');
        return false; // 브라우저 기본 에러 처리도 실행
      };

      // 2) 비동기 Promise rejection
      global.addEventListener('unhandledrejection', function (event) {
        var reason = event.reason;
        var meta = { reason: serializeError(reason) };
        ErrorHandler.logError(LEVEL.ERROR, 'Unhandled Promise rejection', meta);
        // 네트워크 관련이 아닌 경우에만 알림
        if (!(reason instanceof TypeError && String(reason.message).indexOf('fetch') !== -1)) {
          Notifier.show('처리되지 않은 오류가 발생했습니다.', 'warn');
        }
      });

      // 3) 리소스 로드 에러 (이미지, 스크립트 등)
      global.addEventListener('error', function (event) {
        var target = event.target || event.srcElement;
        if (target && target !== global && (target.src || target.href)) {
          var resourceUrl = target.src || target.href;
          var tagName = target.tagName ? target.tagName.toLowerCase() : 'unknown';
          ErrorHandler.logError(LEVEL.WARN, 'Resource load failed', {
            tag: tagName,
            url: resourceUrl
          });
        }
      }, true /* capture */);
    }
  };

  /* ── 공개 API ── */
  var ErrorHandler = {
    /**
     * 초기화
     * @param {Object} [options]
     * @param {string} [options.pageType] - '404' | '500' | null
     * @param {boolean} [options.debug]
     * @param {string} [options.logEndpoint]
     * @param {boolean} [options.showNotifications]
     */
    init: function (options) {
      if (options) {
        if (options.pageType !== undefined) CONFIG.pageType = options.pageType;
        if (options.debug !== undefined) CONFIG.debug = options.debug;
        if (options.logEndpoint !== undefined) CONFIG.logEndpoint = options.logEndpoint;
        if (options.showNotifications !== undefined) CONFIG.showNotifications = options.showNotifications;
      }

      // 전역 핸들러 설치
      GlobalErrorHandler.install();
      // fetch 인터셉터 설치
      FetchInterceptor.install();

      // 에러 페이지 접속 시 로그
      if (CONFIG.pageType) {
        this.logError(LEVEL.INFO, 'Error page accessed', {
          errorCode: CONFIG.pageType,
          referrer: document.referrer || 'direct'
        });
      }
    },

    /**
     * 에러 로깅 (콘솔 + 서버 전송)
     * @param {string} level - LEVEL 상수
     * @param {string} message
     * @param {Object} [meta]
     */
    logError: function (level, message, meta) {
      var entry = Logger.log(level, message, meta);
      if (entry && (level === LEVEL.ERROR || level === LEVEL.FATAL)) {
        Reporter.send(entry);
      }
    },

    /**
     * 사용자에게 에러 알림 표시
     * @param {string} message
     * @param {'error'|'warn'|'info'} [type]
     * @param {number} [duration]
     */
    notify: function (message, type, duration) {
      Notifier.show(message, type || 'error', duration);
    },

    /**
     * 저장된 에러 로그 조회 (개발/디버깅용)
     * @returns {Array}
     */
    getStoredLogs: function () {
      try {
        return JSON.parse(localStorage.getItem('ax_error_log') || '[]');
      } catch (_) {
        return [];
      }
    },

    /**
     * 저장된 에러 로그 초기화
     */
    clearStoredLogs: function () {
      try {
        localStorage.removeItem('ax_error_log');
      } catch (_) {}
    },

    /**
     * HTTP 상태 코드에 따라 에러 페이지로 리다이렉트
     * @param {number} statusCode
     */
    redirectToErrorPage: function (statusCode) {
      var page = CONFIG.errorPages[String(statusCode)];
      if (page && global.location) {
        global.location.href = page;
      }
    },

    /* 레벨 상수 공개 */
    LEVEL: LEVEL
  };

  /* ── 전역 등록 ── */
  global.ErrorHandler = ErrorHandler;

}(typeof window !== 'undefined' ? window : this));
