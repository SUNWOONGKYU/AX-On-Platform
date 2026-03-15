// @task S7F10
// AX-On Platform — 비밀번호 재설정 로직 모듈
// 경로: Process/S7_개발_5차/Frontend/js/password-reset.js
//
// 제공 기능:
//  - PasswordResetModule: 재설정 요청, 갱신, 강도 계산, 쿨다운, 에러 핸들링

'use strict';

(function (global) {

  // ─────────────────────────────────────────────
  //  상수
  // ─────────────────────────────────────────────
  const COOLDOWN_SECONDS = 60;        // 재발송 쿨다운 (초)
  const TOKEN_VERIFY_TIMEOUT = 5000;  // 토큰 검증 타임아웃 (ms)

  // ─────────────────────────────────────────────
  //  비밀번호 강도 계산
  // ─────────────────────────────────────────────

  /**
   * 비밀번호 강도를 계산하여 0~3 레벨로 반환합니다.
   *   0 = 미입력
   *   1 = 약함  (빨강)
   *   2 = 중간  (노랑)
   *   3 = 강함  (초록)
   *
   * @param {string} password
   * @returns {{ level: number, label: string, score: number }}
   */
  function calculateStrength(password) {
    if (!password || password.length === 0) {
      return { level: 0, label: '', score: 0 };
    }

    let score = 0;

    // 기본 조건 (각 1점)
    if (password.length >= 8)           score += 1;
    if (/[A-Z]/.test(password))         score += 1;
    if (/[0-9]/.test(password))         score += 1;
    if (/[^A-Za-z0-9]/.test(password))  score += 1;

    // 길이 보너스
    if (password.length >= 12) score += 0.5;
    if (password.length >= 16) score += 0.5;

    // 레벨 분류
    let level, label;
    if (score < 2) {
      level = 1; label = '약함';
    } else if (score < 3.5) {
      level = 2; label = '중간';
    } else {
      level = 3; label = '강함';
    }

    return { level, label, score };
  }

  /**
   * 비밀번호가 최소 조건을 충족하는지 확인합니다.
   *  - 8자 이상
   *  - 대문자 포함
   *  - 숫자 포함
   *  - 특수기호 포함
   *
   * @param {string} password
   * @returns {boolean}
   */
  function isPasswordValid(password) {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  }

  /**
   * 비밀번호 조건별 충족 여부를 반환합니다.
   *
   * @param {string} password
   * @returns {{ length: boolean, upper: boolean, number: boolean, special: boolean }}
   */
  function getPasswordConditions(password) {
    return {
      length:  password.length >= 8,
      upper:   /[A-Z]/.test(password),
      number:  /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }

  // ─────────────────────────────────────────────
  //  이메일 마스킹
  // ─────────────────────────────────────────────

  /**
   * 이메일 앞부분을 ○으로 마스킹합니다.
   * 예: user@example.com → ○○○○@example.com
   *
   * @param {string} email
   * @returns {string}
   */
  function maskEmail(email) {
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    const maskLen = Math.min(local.length, 5);
    return '○'.repeat(maskLen) + '@' + domain;
  }

  // ─────────────────────────────────────────────
  //  에러 메시지 변환
  // ─────────────────────────────────────────────

  /**
   * Supabase / 네트워크 에러를 사용자 친화적 메시지로 변환합니다.
   *
   * @param {Error|object} err
   * @param {'request'|'update'|'verify'} context
   * @returns {string}
   */
  function getErrorMessage(err, context = 'request') {
    const msg    = err?.message || '';
    const status = err?.status;

    // 네트워크 오류
    if (msg.includes('Failed to fetch') || msg.includes('network') || msg.includes('fetch')) {
      return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
    }

    // 요청 제한
    if (status === 429 || msg.includes('rate') || msg.includes('Rate limit')) {
      return '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.';
    }

    // 세션/토큰 관련
    if (msg.includes('Auth session missing') || msg.includes('JWT expired') || msg.includes('token is expired')) {
      return '세션이 만료되었습니다. 비밀번호 재설정 링크를 다시 요청해주세요.';
    }
    if (msg.includes('invalid') && (msg.includes('token') || msg.includes('code'))) {
      return '유효하지 않은 링크입니다. 이메일의 최신 링크를 사용하거나 새로 요청해주세요.';
    }

    // 비밀번호 동일
    if (msg.includes('same_password') || msg.includes('Password should be different')) {
      return '새 비밀번호는 기존 비밀번호와 달라야 합니다.';
    }

    // 비밀번호 강도 미충족 (Supabase 서버 측 정책)
    if (msg.includes('Password should be at least')) {
      return '비밀번호가 보안 정책 기준에 미치지 않습니다. 더 복잡한 비밀번호를 사용해주세요.';
    }

    // 컨텍스트별 기본 메시지
    switch (context) {
      case 'request': return '이메일 발송에 실패했습니다. 이메일 주소를 확인하고 다시 시도해주세요.';
      case 'update':  return '비밀번호 재설정에 실패했습니다. 잠시 후 다시 시도해주세요.';
      case 'verify':  return '링크 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:        return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }

  // ─────────────────────────────────────────────
  //  쿨다운 관리
  // ─────────────────────────────────────────────

  let _cooldownRemaining = 0;
  let _cooldownInterval  = null;

  /**
   * 60초 재발송 쿨다운을 시작합니다.
   *
   * @param {{ onTick: (remaining: number) => void, onEnd: () => void }} callbacks
   */
  function startCooldown({ onTick, onEnd } = {}) {
    if (_cooldownInterval) clearInterval(_cooldownInterval);
    _cooldownRemaining = COOLDOWN_SECONDS;

    if (typeof onTick === 'function') onTick(_cooldownRemaining);

    _cooldownInterval = setInterval(() => {
      _cooldownRemaining -= 1;
      if (typeof onTick === 'function') onTick(_cooldownRemaining);
      if (_cooldownRemaining <= 0) {
        clearInterval(_cooldownInterval);
        _cooldownInterval = null;
        if (typeof onEnd === 'function') onEnd();
      }
    }, 1000);
  }

  /** 현재 쿨다운이 활성화 중인지 반환합니다. */
  function isCooldownActive() {
    return _cooldownRemaining > 0;
  }

  /** 남은 쿨다운 시간(초)을 반환합니다. */
  function getCooldownRemaining() {
    return _cooldownRemaining;
  }

  // ─────────────────────────────────────────────
  //  Supabase API 래퍼
  // ─────────────────────────────────────────────

  /**
   * 비밀번호 재설정 이메일을 발송합니다.
   *
   * @param {object} supabaseClient  — 초기화된 Supabase 클라이언트
   * @param {string} email           — 대상 이메일
   * @param {string} [redirectTo]    — 재설정 링크 클릭 후 리다이렉트될 URL
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async function requestPasswordReset(supabaseClient, email, redirectTo) {
    try {
      const options = redirectTo ? { redirectTo } : {};
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, options);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'request'), raw: err };
    }
  }

  /**
   * URL의 인증 코드/토큰을 검증하고 복구 세션을 수립합니다.
   * PKCE flow (?code=...) 와 implicit flow (#access_token) 모두 지원합니다.
   *
   * @param {object} supabaseClient
   * @returns {Promise<{ success: boolean, session?: object, error?: string }>}
   */
  async function verifyResetToken(supabaseClient) {
    const params  = new URLSearchParams(window.location.search);
    const hash    = window.location.hash;
    const code    = params.get('code');
    const hasHash = hash.includes('access_token') || hash.includes('type=recovery');

    // 파라미터 없음 — 유효하지 않은 링크
    if (!code && !hasHash) {
      return {
        success: false,
        error: 'no_params',
        message: '유효하지 않은 링크입니다. 이메일의 재설정 링크를 확인해주세요.',
      };
    }

    try {
      // PKCE flow: ?code=...
      if (code) {
        const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code);
        if (error) {
          return {
            success: false,
            error: 'expired_or_used',
            message: '링크가 만료되었거나 이미 사용되었습니다.',
          };
        }
        return { success: true, session: data?.session };
      }

      // Implicit flow: hash 포함
      if (hasHash) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
          return { success: true, session };
        }
      }

      // onAuthStateChange 대기 (최대 TOKEN_VERIFY_TIMEOUT ms)
      return await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          resolve({
            success: false,
            error: 'timeout',
            message: '링크 검증 시간이 초과되었습니다. 재설정 링크를 다시 요청해주세요.',
          });
        }, TOKEN_VERIFY_TIMEOUT);

        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
            clearTimeout(timeout);
            subscription.unsubscribe();
            resolve({ success: true, session });
          }
        });
      });

    } catch (err) {
      return {
        success: false,
        error: 'exception',
        message: getErrorMessage(err, 'verify'),
        raw: err,
      };
    }
  }

  /**
   * 새 비밀번호로 업데이트합니다.
   * Supabase Auth의 updateUser({ password }) API를 사용합니다.
   *
   * @param {object} supabaseClient
   * @param {string} newPassword
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async function updatePassword(supabaseClient, newPassword) {
    if (!isPasswordValid(newPassword)) {
      return {
        success: false,
        error: 'validation',
        message: '비밀번호 조건을 모두 충족해야 합니다 (8자 이상, 대문자, 숫자, 특수기호).',
      };
    }

    try {
      const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'update'), raw: err };
    }
  }

  // ─────────────────────────────────────────────
  //  RFC 5322 이메일 유효성 검증
  // ─────────────────────────────────────────────

  /**
   * RFC 5322 기준의 이메일 형식 검증을 수행합니다.
   *
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    const RFC5322 = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return RFC5322.test((email || '').trim());
  }

  // ─────────────────────────────────────────────
  //  Public API 노출
  // ─────────────────────────────────────────────

  global.PasswordResetModule = {
    // 강도 & 검증
    calculateStrength,
    isPasswordValid,
    getPasswordConditions,
    isValidEmail,
    maskEmail,

    // 에러 처리
    getErrorMessage,

    // 쿨다운
    startCooldown,
    isCooldownActive,
    getCooldownRemaining,

    // Supabase API
    requestPasswordReset,
    verifyResetToken,
    updatePassword,
  };

})(typeof window !== 'undefined' ? window : global);
