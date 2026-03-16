// AX-On Platform 공통 유틸리티 (auth 페이지 공유)

// 비밀번호 표시 토글
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  btn.title = isPassword ? '비밀번호 숨기기' : '비밀번호 표시';
  btn.setAttribute('aria-label', isPassword ? '비밀번호 숨기기' : '비밀번호 표시');
  btn.setAttribute('aria-pressed', String(isPassword));
  btn.innerHTML = isPassword
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
}

// 인앱 브라우저(WebView) 감지
function isInAppBrowser() {
  const ua = navigator.userAgent || '';
  return /KAKAOTALK|NAVER|Instagram|FB_IAB|FBAN|FBAV|Line|DaumApps|SamsungBrowser\/\d+.*SamsungBrowser/i.test(ua)
    || (/wv|WebView/i.test(ua) && /Android/i.test(ua))
    || (!/Safari/i.test(ua) && /iPhone|iPad|iPod/i.test(ua));
}
