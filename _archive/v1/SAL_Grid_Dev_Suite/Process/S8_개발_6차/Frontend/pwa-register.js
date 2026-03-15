// @task S8F1 — AX-On Platform PWA Service Worker Registration

'use strict';

(function () {
  // ── Guard: browser support check ──────────────────────────────────────────
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Worker is not supported in this browser.');
    return;
  }

  // ── Registration ──────────────────────────────────────────────────────────
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully.');
        console.log('[PWA] Scope:', registration.scope);

        // ── Update detection ───────────────────────────────────────────────
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          console.log('[PWA] New Service Worker found — installing...');

          newWorker.addEventListener('statechange', () => {
            console.log('[PWA] Service Worker state:', newWorker.state);

            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // A new version is ready; existing content is still served from cache.
              console.log('[PWA] New content available — notifying user.');
              notifyUpdateAvailable(registration);
            }
          });
        });
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });

    // ── Detect controller change (SW activated after skipWaiting) ──────────
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      console.log('[PWA] Controller changed — reloading page for new version.');
      window.location.reload();
    });
  });

  // ── Update notification UI ────────────────────────────────────────────────
  function notifyUpdateAvailable(registration) {
    // If a custom event listener exists on the page, dispatch instead of UI
    const customEvent = new CustomEvent('axon:sw-update-available', {
      detail: { registration },
      bubbles: true
    });
    const dispatched = window.dispatchEvent(customEvent);

    // Fallback: simple confirm dialog if no page-level handler consumed the event
    if (dispatched) {
      const accepted = window.confirm(
        'AX-On Platform의 새 버전이 준비되었습니다.\n지금 업데이트하시겠습니까?'
      );
      if (accepted) {
        applyUpdate(registration);
      }
    }
  }

  // ── Apply update: tell waiting SW to skip waiting ─────────────────────────
  function applyUpdate(registration) {
    const waitingWorker = registration.waiting;
    if (!waitingWorker) return;

    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  }
})();
