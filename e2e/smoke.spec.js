// AX-On Platform — Playwright 스모크 테스트
// SAL-DA S2RL1 카드 개선 산출물
//
// 실행:
//   npx playwright install chromium
//   npx playwright test e2e/smoke.spec.js
//
// CLAUDE.md UI 검증 철칙: "curl 200 ≠ 동작함" — 실제 클릭으로 사용자 여정 검증

const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'https://www.ax-on.net';

const PAGES = [
  { path: '/',                title: /AX-On/,            h1: /AX-On|AI 전환/ },
  { path: '/about-ax.html',   title: /AX/,               h1: /AX란/ },
  { path: '/engagement.html', title: /인게이지먼트/,      h1: /인게이지먼트/ },
  { path: '/methodology.html',title: /방법론/,            h1: /방법론|SAL/ },
  { path: '/pool.html',       title: /전문가 풀/,         h1: /전문가/ },
  { path: '/community.html',  title: /커뮤니티/,          h1: /커뮤니티/ },
  { path: '/contact.html',    title: /문의/,              h1: /문의/ },
  { path: '/privacy.html',    title: /개인정보/,          h1: /개인정보/ },
  { path: '/terms.html',      title: /이용약관/,          h1: /이용약관/ }
];

test.describe('AX-On 8 페이지 스모크', () => {
  for (const p of PAGES) {
    test(`${p.path} → 200 + 콘텐츠 렌더`, async ({ page }) => {
      const res = await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded' });
      expect(res.status(), `${p.path} HTTP status`).toBe(200);
      await expect(page).toHaveTitle(p.title);
      // h1이 있으면 검증, community는 인증 게이트라 예외
      if (p.path !== '/community.html') {
        const h1 = page.locator('h1').first();
        await expect(h1, `${p.path} h1 should render`).toBeVisible({ timeout: 4000 });
      }
    });
  }
});

test.describe('네비 4메뉴 클릭 동작', () => {
  test('헤더의 4개 핵심 메뉴가 올바른 라우트로 이동', async ({ page }) => {
    await page.goto(BASE + '/');
    const navMenus = [
      { text: 'AX란',        path: 'about-ax.html' },
      { text: '인게이지먼트',  path: 'engagement.html' },
      { text: '방법론',        path: 'methodology.html' },
      { text: '전문가 풀',     path: 'pool.html' }
    ];
    for (const m of navMenus) {
      await page.goto(BASE + '/');
      const link = page.locator(`a:has-text("${m.text}")`).first();
      await expect(link, `nav: ${m.text}`).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(new RegExp(m.path), { timeout: 5000 });
    }
  });
});

test.describe('주요 CTA dead-link 차단', () => {
  test('index 랜딩의 주요 CTA가 모두 유효한 href를 가진다', async ({ page }) => {
    await page.goto(BASE + '/');
    const ctas = await page.locator('a.btn, .cta a, a.cta-button, .btn-primary').all();
    for (const a of ctas) {
      const href = await a.getAttribute('href');
      expect(href, 'CTA has href').not.toBeNull();
      expect(href.trim(), 'CTA href not empty').not.toBe('');
      expect(href.trim(), 'CTA href not bare #').not.toBe('#');
    }
  });
});

test.describe('contact 폼 종주', () => {
  test('문의 폼 입력 → 전송 버튼 활성화', async ({ page }) => {
    await page.goto(BASE + '/contact.html');
    const name = page.locator('input[name="name"], #name').first();
    const email = page.locator('input[type="email"], #email').first();
    const message = page.locator('textarea[name="message"], #message').first();

    if (await name.isVisible({ timeout: 3000 }).catch(() => false)) {
      await name.fill('테스트 사용자');
      await email.fill('test@example.com');
      await message.fill('Playwright 스모크 테스트 문의입니다.');
      const submitBtn = page.locator('button[type="submit"], .btn-submit').first();
      await expect(submitBtn, '제출 버튼 활성화').toBeEnabled();
      // 실제 제출은 하지 않음 (테스트 데이터 오염 방지)
    }
  });
});
