# S8F6: 쿠키 동의 배너 구현

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S8F6 |
| Task 이름 | 쿠키 동의 배너 구현 |
| Stage | S8 — 개발 6차 |
| Area | F — Frontend |
| Dependencies | S7BI1 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
GDPR 및 한국 개인정보보호법 준수를 위해 쿠키 동의 배너를 구현합니다. 사용자의 명시적 동의 없이 추적 쿠키(GA4)를 사용하지 않도록 합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S8_개발_6차/Frontend/js/cookie-consent.js` | 쿠키 동의 로직 |
| `Process/S8_개발_6차/Frontend/components/cookie-banner.html` | 쿠키 배너 마크업 |
| `Process/S8_개발_6차/Frontend/css/cookie-banner.css` | 배너 스타일 |
| `Process/S8_개발_6차/Frontend/index.html` | 배너 삽입 |

## 세부 작업 지시
1. 쿠키 동의 배너 UI
   - 위치: 페이지 하단 고정
   - 기본 상태:
     ```html
     <div id="cookie-banner" class="cookie-banner">
       <div class="cookie-content">
         <div class="cookie-message">
           <h3>쿠키 사용 안내</h3>
           <p>SAL Grid는 사용자 경험 향상을 위해 쿠키를 사용합니다. 쿠키 설정은 언제든지 변경할 수 있습니다.</p>
         </div>
         <div class="cookie-details">
           <button id="cookie-info-btn">자세히 보기</button>
         </div>
       </div>
       <div class="cookie-actions">
         <button id="cookie-reject" class="btn btn-secondary">거절</button>
         <button id="cookie-accept" class="btn btn-primary">모두 동의</button>
       </div>
     </div>
     ```
   - 스타일:
     - 배경: 반투명 검정 (rgba(0, 0, 0, 0.8))
     - 텍스트: 흰색
     - 버튼: Primary (동의) / Secondary (거절)
     - z-index: 9999 (최상단)
     - 높이: 120px (텍스트 + 버튼)
     - 모바일: 전체 폭, 세로 정렬

2. 동의 상태 localStorage 저장
   - 저장 데이터:
     ```javascript
     // localStorage 구조
     localStorage.setItem('cookie-consent', JSON.stringify({
       status: 'accepted', // 'accepted' | 'rejected' | 'pending'
       timestamp: 1705315200000,
       version: 1,
       categories: {
         necessary: true, // 필수 쿠키 (항상 true)
         analytics: true, // GA4 (사용자 선택)
         marketing: false // 마케팅 쿠키 (사용자 선택)
       }
     }));
     ```
   - 구현:
     ```javascript
     function saveConsentChoice(choice) {
       const consentData = {
         status: choice,
         timestamp: Date.now(),
         version: 1,
         categories: {
           necessary: true,
           analytics: choice === 'accepted',
           marketing: choice === 'accepted'
         }
       };
       localStorage.setItem('cookie-consent', JSON.stringify(consentData));
     }
     ```

3. GA 조건부 로드
   - 구현:
     ```javascript
     function loadGoogleAnalytics() {
       const consent = JSON.parse(localStorage.getItem('cookie-consent') || '{}');
       if (consent.categories?.analytics === true) {
         // GA4 태그 동적 로드
         const script = document.createElement('script');
         script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
         script.async = true;
         document.head.appendChild(script);

         window.dataLayer = window.dataLayer || [];
         function gtag(){dataLayer.push(arguments);}
         gtag('js', new Date());
         gtag('config', 'G-XXXXXXXXXX');
       }
     }

     // 페이지 로드 시 호출
     document.addEventListener('DOMContentLoaded', () => {
       loadGoogleAnalytics();
     });
     ```
   - GA 데이터 전송 제어:
     ```javascript
     gtag('consent', 'update', {
       'analytics_storage': consent.categories.analytics ? 'granted' : 'denied'
     });
     ```

4. 개인정보처리방침 링크
   - 배너에 "개인정보처리방침" 링크 추가:
     ```html
     <div class="cookie-footer">
       <a href="/privacy-policy" target="_blank">개인정보처리방침</a> |
       <a href="/terms" target="_blank">이용약관</a>
     </div>
     ```
   - 개인정보처리방침 내용:
     - 쿠키 사용 목적
     - 쿠키 보유 기간
     - 사용자 권리 (동의 철회 방법)

## 완료 기준
- [ ] cookie-banner.html 마크업 생성
- [ ] cookie-banner.css 스타일링 완료
- [ ] 쿠키 배너 UI 테스트 (데스크톱/모바일)
- [ ] 동의/거절 버튼 동작 확인
- [ ] localStorage에 동의 상태 저장 확인
- [ ] GA4 조건부 로드 구현
- [ ] 동의하지 않은 경우 GA 스크립트 로드 안 됨 확인
- [ ] 동의 후 페이지 새로고침 시 GA 로드 확인
- [ ] 개인정보처리방침 페이지 링크 연결
- [ ] 브라우저 DevTools에서 localStorage 동의 데이터 확인
- [ ] JSON 상태 업데이트 완료
