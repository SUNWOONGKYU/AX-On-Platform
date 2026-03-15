# S8O2: sitemap.xml + robots.txt 자동 생성

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S8O2 |
| Task 이명 | sitemap.xml + robots.txt 자동 생성 |
| Stage | S8 — 개발 6차 |
| Area | O — DevOps |
| Dependencies | S8F4 |
| 실행 방식 | Automated |
| Task Agent | devops-troubleshooter-core |

## 배경 및 목적
검색 엔진이 사이트의 모든 페이지를 효율적으로 크롤링할 수 있도록 sitemap.xml과 robots.txt를 자동으로 생성하고 관리합니다. 빌드 시 자동으로 생성되도록 설정하여 새로운 페이지 추가 시 수동 작업을 줄입니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S8_개발_6차/Frontend/scripts/generate-sitemap.js` | Sitemap 생성 스크립트 |
| `Process/S8_개발_6차/Frontend/scripts/generate-robots.js` | Robots.txt 생성 스크립트 |
| `Process/S8_개발_6차/Frontend/package.json` | 빌드 스크립트 수정 |
| `Process/S8_개발_6차/Frontend/public/sitemap.xml` | 생성된 sitemap |
| `Process/S8_개발_6차/Frontend/public/robots.txt` | 생성된 robots.txt |

## 세부 작업 지시
1. sitemap.xml 자동 생성 스크립트
   - 파일: `scripts/generate-sitemap.js`
   - 기능:
     ```javascript
     // generate-sitemap.js
     const fs = require('fs');
     const path = require('path');

     const SITE_URL = 'https://salgrid.com';
     const PAGES_DIR = path.join(__dirname, '../pages');

     function generateSitemap() {
       const urls = [];

       // 정적 페이지들
       const staticPages = [
         { url: '/', priority: '1.0', changefreq: 'daily' },
         { url: '/courses', priority: '0.9', changefreq: 'daily' },
         { url: '/knowledge-hub', priority: '0.9', changefreq: 'daily' },
         { url: '/community', priority: '0.8', changefreq: 'daily' },
         { url: '/experts', priority: '0.8', changefreq: 'weekly' },
         { url: '/about', priority: '0.7', changefreq: 'monthly' },
         { url: '/contact', priority: '0.6', changefreq: 'monthly' },
         { url: '/privacy-policy', priority: '0.5', changefreq: 'monthly' },
         { url: '/terms', priority: '0.5', changefreq: 'monthly' }
       ];

       // 동적 페이지들 (Supabase에서 조회)
       const courses = fetchCoursesFromDB(); // 구현 필요
       const experts = fetchExpertsFromDB(); // 구현 필요
       const articles = fetchArticlesFromDB(); // 구현 필요

       // 강의 페이지
       courses.forEach(course => {
         urls.push({
           url: `/courses/${course.id}`,
           priority: '0.7',
           changefreq: 'weekly',
           lastmod: new Date(course.updated_at).toISOString()
         });
       });

       // 전문가 페이지
       experts.forEach(expert => {
         urls.push({
           url: `/experts/${expert.slug}`,
           priority: '0.7',
           changefreq: 'monthly',
           lastmod: new Date(expert.updated_at).toISOString()
         });
       });

       // 게시글 페이지
       articles.forEach(article => {
         urls.push({
           url: `/knowledge-hub/${article.id}`,
           priority: '0.6',
           changefreq: 'weekly',
           lastmod: new Date(article.updated_at).toISOString()
         });
       });

       // XML 생성
       let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
       xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

       urls.forEach(item => {
         xml += '  <url>\n';
         xml += `    <loc>${SITE_URL}${item.url}</loc>\n`;
         if (item.lastmod) {
           xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
         }
         xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
         xml += `    <priority>${item.priority}</priority>\n`;
         xml += '  </url>\n';
       });

       xml += '</urlset>';

       // 파일 저장
       fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml);
       console.log('✓ sitemap.xml generated');
     }

     // 대용량 사이트용 sitemap 분할
     function generateSitemapIndex() {
       if (urls.length > 50000) {
         // Sitemap Index 생성 (최대 50,000 URL/파일)
         let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
         xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

         const totalFiles = Math.ceil(urls.length / 50000);
         for (let i = 1; i <= totalFiles; i++) {
           xml += '  <sitemap>\n';
           xml += `    <loc>${SITE_URL}/sitemap-${i}.xml</loc>\n`;
           xml += '  </sitemap>\n';
         }
         xml += '</sitemapindex>';
       }
     }

     generateSitemap();
     ```

2. robots.txt 생성 스크립트
   - 파일: `scripts/generate-robots.js`
   - 기능:
     ```javascript
     // generate-robots.js
     const fs = require('fs');
     const path = require('path');

     function generateRobots() {
       let robots = '# SAL Grid - robots.txt\n';
       robots += '# Generated automatically\n\n';

       // 모든 봇 허용
       robots += 'User-agent: *\n';
       robots += 'Allow: /\n';
       robots += 'Disallow: /admin/\n';
       robots += 'Disallow: /api/\n';
       robots += 'Disallow: /private/\n';
       robots += 'Disallow: /auth/\n\n';

       // Specific bots
       robots += 'User-agent: Googlebot\n';
       robots += 'Allow: /\n';
       robots += 'Crawl-delay: 1\n\n';

       robots += 'User-agent: Bingbot\n';
       robots += 'Allow: /\n';
       robots += 'Crawl-delay: 2\n\n';

       // Sitemap 참조
       robots += 'Sitemap: https://salgrid.com/sitemap.xml\n';

       // 파일 저장
       fs.writeFileSync(path.join(__dirname, '../public/robots.txt'), robots);
       console.log('✓ robots.txt generated');
     }

     generateRobots();
     ```

3. 빌드 시 자동 실행
   - package.json 수정:
     ```json
     {
       "scripts": {
         "build": "npm run generate:sitemap && npm run generate:robots && vite build",
         "generate:sitemap": "node scripts/generate-sitemap.js",
         "generate:robots": "node scripts/generate-robots.js",
         "dev": "vite"
       }
     }
     ```
   - 또는 Vercel 빌드 훅:
     ```json
     {
       "buildCommand": "npm run generate:sitemap && npm run generate:robots && vite build"
     }
     ```

4. Google Search Console 등록 가이드
   - 절차:
     1. Google Search Console (https://search.google.com/search-console) 접속
     2. "속성 추가" → URL 입력 (https://salgrid.com)
     3. 도메인 소유권 확인 (DNS 레코드 또는 HTML 파일)
     4. "Sitemaps" 메뉴 → "새 사이트맵 추가"
     5. "sitemap.xml" 입력 및 제출
     6. "robots.txt" 파일이 정상인지 확인
   - 검증:
     - 수집된 페이지 수 확인
     - 색인 생성 상태 확인
     - 크롤 오류 확인

## 완료 기준
- [ ] generate-sitemap.js 스크립트 구현
- [ ] generate-robots.js 스크립트 구현
- [ ] package.json 빌드 스크립트 수정
- [ ] 로컬에서 스크립트 실행하여 sitemap.xml 생성 확인
- [ ] 로컬에서 스크립트 실행하여 robots.txt 생성 확인
- [ ] 생성된 sitemap.xml 유효성 검증 (XML 형식)
- [ ] 생성된 robots.txt 문법 확인
- [ ] Vercel 빌드 시 자동 생성 확인
- [ ] Google Search Console에 sitemap.xml 등록
- [ ] Google Search Console에서 색인 상태 모니터링
- [ ] Bing Webmaster Tools에도 등록 (선택)
- [ ] JSON 상태 업데이트 완료
