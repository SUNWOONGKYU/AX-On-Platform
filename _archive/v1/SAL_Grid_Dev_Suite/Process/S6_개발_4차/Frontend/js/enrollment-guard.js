// @task S6F10
// AX-On Platform — 수강신청 URL 파라미터 화이트리스트 검증
// enrollment.html의 preSelectProgram() IIFE를 대체하여
// program 파라미터에 화이트리스트 검증을 추가

(function () {
  'use strict';

  // 허용된 프로그램 ID 화이트리스트 (enrollment.html의 radio value와 일치)
  var VALID_PROGRAMS = [
    'vibe-coding-special',
    'mvp-camp',
    'master-course'
  ];

  function validateAndSelectProgram() {
    var params = new URLSearchParams(window.location.search);
    var program = params.get('program');

    if (!program) return;

    // 화이트리스트 검증 — 허용된 값만 통과
    if (VALID_PROGRAMS.indexOf(program) === -1) {
      console.warn('[enrollment-guard] 유효하지 않은 program 파라미터:', program);
      return;
    }

    // 안전한 값만 querySelector에 전달
    var radio = document.querySelector('input[name="program"][value="' + program + '"]');
    if (radio) {
      radio.checked = true;
      if (typeof updateStepIndicator === 'function') {
        updateStepIndicator();
      }
    }
  }

  validateAndSelectProgram();
})();
