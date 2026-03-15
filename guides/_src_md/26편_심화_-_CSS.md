# 26편 | 심화 - CSS

---

25편에서 HTML로 웹페이지의 구조를 만들었습니다. 이번 편에서는 CSS를 사용해 **스타일과 레이아웃**을 적용하는 방법을 깊이 다룹니다.

## 1. CSS란

### 1-1. 정의

**CSS(Cascading Style Sheets)**는 웹페이지의 **스타일**을 정의하는 언어입니다.

집을 짓는다면 HTML이 뼈대라면, CSS는 **인테리어**입니다. 벽지 색깔, 가구 배치, 조명 등 외관을 꾸미는 역할입니다.

### 1-2. CSS 적용 방법

```html
<!-- 1. 외부 파일 (권장) -->
<link rel="stylesheet" href="styles.css">

<!-- 2. head 내 style 태그 -->
<style>
    body { color: black; }
</style>

<!-- 3. 인라인 스타일 (비권장) -->
<div style="color: red;">텍스트</div>
```

**외부 파일 방식**을 권장합니다. HTML과 CSS를 분리하면 유지보수가 쉽습니다.

---

## 2. 선택자(Selector)

### 2-1. 기본 선택자

```css
/* 요소 선택자 */
p { color: blue; }

/* 클래스 선택자 */
.card { background: white; }

/* ID 선택자 */
#header { height: 60px; }

/* 전체 선택자 */
* { margin: 0; padding: 0; }
```

### 2-2. 조합 선택자

```css
/* 자손 선택자 (하위 모든 요소) */
nav a { color: white; }

/* 자식 선택자 (직접 자식만) */
ul > li { list-style: none; }

/* 여러 선택자 동시 적용 */
h1, h2, h3 { font-weight: bold; }

/* 클래스 조합 */
.btn.primary { background: blue; }
```

### 2-3. 가상 클래스

```css
/* 마우스 오버 */
button:hover { background: darkblue; }

/* 클릭 시 */
button:active { transform: scale(0.98); }

/* 포커스 */
input:focus { border-color: blue; }

/* 첫 번째/마지막 자식 */
li:first-child { font-weight: bold; }
li:last-child { border-bottom: none; }

/* n번째 자식 */
tr:nth-child(even) { background: #f5f5f5; }
```

---

## 3. 박스 모델

### 3-1. 구성 요소

모든 HTML 요소는 박스로 이루어져 있습니다.

```
┌─────────────────────────────┐
│          margin             │  ← 요소 바깥 여백
│  ┌──────────────────────┐   │
│  │       border         │   │  ← 테두리
│  │  ┌───────────────┐   │   │
│  │  │    padding    │   │   │  ← 요소 안쪽 여백
│  │  │  ┌─────────┐  │   │   │
│  │  │  │ content │  │   │   │  ← 실제 내용
│  │  │  └─────────┘  │   │   │
│  │  └───────────────┘   │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

### 3-2. 속성

```css
.box {
    /* 내용 크기 */
    width: 300px;
    height: 200px;

    /* 안쪽 여백 */
    padding: 20px;
    padding: 10px 20px;           /* 상하 10, 좌우 20 */
    padding: 10px 20px 30px 40px; /* 상 우 하 좌 */

    /* 테두리 */
    border: 1px solid #ccc;
    border-radius: 8px;  /* 둥근 모서리 */

    /* 바깥 여백 */
    margin: 20px;
    margin: 0 auto;  /* 가로 중앙 정렬 */
}
```

### 3-3. box-sizing

```css
/* 기본값: width = content만 */
box-sizing: content-box;

/* 권장: width = content + padding + border */
box-sizing: border-box;

/* 전체 요소에 적용 (권장) */
*, *::before, *::after {
    box-sizing: border-box;
}
```

---

## 4. Flexbox

### 4-1. 기본 개념

**Flexbox**는 1차원 레이아웃 시스템입니다. 가로 또는 세로 방향으로 요소를 배치합니다.

```css
.container {
    display: flex;  /* Flexbox 활성화 */
}
```

### 4-2. 주요 속성

```css
.container {
    display: flex;

    /* 방향 */
    flex-direction: row;      /* 가로 (기본) */
    flex-direction: column;   /* 세로 */

    /* 주축 정렬 */
    justify-content: flex-start;   /* 시작 */
    justify-content: center;       /* 중앙 */
    justify-content: flex-end;     /* 끝 */
    justify-content: space-between;/* 양끝 + 균등 */
    justify-content: space-around; /* 균등 (양쪽 여백) */

    /* 교차축 정렬 */
    align-items: stretch;     /* 늘리기 (기본) */
    align-items: flex-start;  /* 시작 */
    align-items: center;      /* 중앙 */
    align-items: flex-end;    /* 끝 */

    /* 줄바꿈 */
    flex-wrap: nowrap;  /* 안 함 (기본) */
    flex-wrap: wrap;    /* 줄바꿈 */

    /* 간격 */
    gap: 20px;
}
```

### 4-3. 자식 요소 속성

```css
.item {
    flex: 1;          /* 남은 공간 균등 분배 */
    flex: 2;          /* 다른 요소보다 2배 */
    flex-shrink: 0;   /* 줄어들지 않음 */
    align-self: center; /* 개별 정렬 */
}
```

### 4-4. 실전 예시: 가운데 정렬

```css
/* 완벽한 가운데 정렬 */
.center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
```

---

## 5. Grid

### 5-1. 기본 개념

**Grid**는 2차원 레이아웃 시스템입니다. 행과 열을 동시에 다룹니다.

```css
.container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;  /* 3열 균등 */
    grid-template-rows: auto auto;        /* 2행 */
    gap: 20px;
}
```

### 5-2. 열 정의

```css
.container {
    /* 고정 크기 */
    grid-template-columns: 200px 200px 200px;

    /* 비율 */
    grid-template-columns: 1fr 2fr 1fr;

    /* 반복 */
    grid-template-columns: repeat(3, 1fr);

    /* 최소/최대 */
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
```

### 5-3. 실전 예시: 카드 그리드

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    padding: 24px;
}
```

---

## 6. 반응형 디자인

### 6-1. 미디어 쿼리

```css
/* 기본 스타일 (모바일 우선) */
.container {
    width: 100%;
    padding: 16px;
}

/* 태블릿 (768px 이상) */
@media (min-width: 768px) {
    .container {
        max-width: 720px;
        margin: 0 auto;
    }
}

/* 데스크톱 (1024px 이상) */
@media (min-width: 1024px) {
    .container {
        max-width: 960px;
    }
}
```

### 6-2. 반응형 단위

| 단위 | 설명 | 사용 |
|------|------|------|
| `px` | 고정 픽셀 | 작은 요소 |
| `%` | 부모 기준 비율 | 너비 |
| `vw/vh` | 뷰포트 기준 | 전체 화면 |
| `rem` | 루트 폰트 크기 기준 | 폰트, 여백 |
| `em` | 부모 폰트 크기 기준 | 폰트 |

```css
html { font-size: 16px; }

.text {
    font-size: 1rem;    /* 16px */
    font-size: 1.5rem;  /* 24px */
}

.full-screen {
    width: 100vw;
    height: 100vh;
}
```

---

## 7. 색상과 배경

### 7-1. 색상 표현

```css
.element {
    /* 이름 */
    color: red;

    /* HEX */
    color: #ff0000;
    color: #f00;  /* 축약 */

    /* RGB */
    color: rgb(255, 0, 0);

    /* RGBA (투명도) */
    color: rgba(255, 0, 0, 0.5);

    /* HSL */
    color: hsl(0, 100%, 50%);
}
```

### 7-2. 배경

```css
.element {
    background-color: #f5f5f5;

    /* 이미지 */
    background-image: url('bg.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    /* 그라데이션 */
    background: linear-gradient(to right, #667eea, #764ba2);
}
```

---

## 8. 트랜지션과 애니메이션

### 8-1. 트랜지션

```css
.button {
    background: #3b82f6;
    transition: all 0.3s ease;
}

.button:hover {
    background: #2563eb;
    transform: translateY(-2px);
}
```

### 8-2. 애니메이션

```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.element {
    animation: fadeIn 0.5s ease-out;
}
```

---

## 9. 실전 예시: 버튼 스타일

```css
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background: #2563eb;
}

.btn-outline {
    background: transparent;
    border: 1px solid #3b82f6;
    color: #3b82f6;
}

.btn-outline:hover {
    background: #3b82f6;
    color: white;
}
```

---

## 정리

CSS는 웹페이지의 **외관과 레이아웃**을 담당합니다.

**핵심 포인트:**
- 선택자로 스타일 적용 대상 지정
- 박스 모델 이해 (content, padding, border, margin)
- Flexbox로 1차원 레이아웃
- Grid로 2차원 레이아웃
- 미디어 쿼리로 반응형

다음 편에서 JavaScript로 동적 기능을 추가합니다.

---

**작성일: 2025-12-21 / 작성자: Claude Code**
