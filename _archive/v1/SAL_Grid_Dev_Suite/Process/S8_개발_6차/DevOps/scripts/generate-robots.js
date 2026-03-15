// @task S8O2
// generate-robots.js
// AX-On Platform - robots.txt 자동 생성 스크립트
// Site: https://ax-on.vercel.app

'use strict';

const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.resolve(__dirname, '../public/robots.txt');

const ROBOTS_CONTENT = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/

User-agent: Googlebot
Allow: /
Crawl-delay: 1

Sitemap: https://ax-on.vercel.app/sitemap.xml
`;

try {
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, ROBOTS_CONTENT, 'utf8');
  console.log('robots.txt generated');
} catch (err) {
  console.error('Error generating robots.txt:', err.message);
  process.exit(1);
}
