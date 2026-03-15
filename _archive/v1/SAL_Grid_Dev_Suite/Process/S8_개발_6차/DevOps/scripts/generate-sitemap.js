// @task S8O2
// generate-sitemap.js
// AX-On Platform - sitemap.xml 자동 생성 스크립트
// Site: https://ax-on.vercel.app

'use strict';

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ax-on.vercel.app';
const OUTPUT_PATH = path.resolve(__dirname, '../public/sitemap.xml');

const pages = [
  { loc: '/',                       priority: '1.0', changefreq: 'daily'   },
  { loc: '/startup.html',           priority: '0.9', changefreq: 'weekly'  },
  { loc: '/ax-project.html',        priority: '0.9', changefreq: 'weekly'  },
  { loc: '/expert.html',            priority: '0.8', changefreq: 'weekly'  },
  { loc: '/community.html',         priority: '0.8', changefreq: 'daily'   },
  { loc: '/enrollment.html',        priority: '0.7', changefreq: 'monthly' },
  { loc: '/contact.html',           priority: '0.6', changefreq: 'monthly' },
  { loc: '/claude-code-guide.html', priority: '0.7', changefreq: 'weekly'  },
  { loc: '/terms.html',             priority: '0.3', changefreq: 'yearly'  },
  { loc: '/privacy.html',           priority: '0.3', changefreq: 'yearly'  },
];

function getLastmod() {
  return new Date().toISOString().split('T')[0];
}

function buildSitemap(pages) {
  const lastmod = getLastmod();
  const urlEntries = pages.map(({ loc, priority, changefreq }) => {
    return [
      '  <url>',
      `    <loc>${SITE_URL}${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlEntries,
    '</urlset>',
  ].join('\n');
}

try {
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const xml = buildSitemap(pages);
  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
  console.log('sitemap.xml generated');
} catch (err) {
  console.error('Error generating sitemap.xml:', err.message);
  process.exit(1);
}
