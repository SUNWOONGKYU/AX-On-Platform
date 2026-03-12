# 25편 | 심화 - HTML

---

08편에서 HTML의 기본 개념을 소개했습니다. 이번 편에서는 HTML을 더 깊이 이해하고, 실제 웹페이지를 구성할 때 필요한 핵심 지식을 다룹니다.

## 1. HTML이란

### 1-1. 정의

**HTML(HyperText Markup Language)**은 웹페이지의 구조와 내용을 정의하는 마크업 언어입니다. 프로그래밍 언어가 아니라 **문서 구조를 표현하는 언어**입니다.

집을 짓는다면 HTML은 **뼈대와 벽**입니다. 방이 몇 개인지, 거실이 어디인지, 화장실이 어디인지를 정하는 역할입니다.

### 1-2. 작동 원리

```
브라우저가 HTML 파일 다운로드
         ↓
HTML 코드를 해석 (파싱)
         ↓
DOM(Document Object Model) 생성
         ↓
화면에 렌더링
```

브라우저는 HTML 코드를 위에서 아래로 순차적으로 읽으면서 화면을 그립니다.

---

## 2. HTML 기본 구조

### 2-1. 필수 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>페이지 제목</title>
</head>
<body>
    <!-- 실제 보이는 내용 -->
</body>
</html>
```

| 요소 | 역할 |
|------|------|
| `<!DOCTYPE html>` | HTML5 문서임을 선언 |
| `<html>` | 전체 문서의 루트 |
| `<head>` | 메타 정보 (보이지 않음) |
| `<body>` | 실제 화면에 보이는 내용 |

### 2-2. head 태그 필수 요소

```html
<head>
    <!-- 문자 인코딩 -->
    <meta charset="UTF-8">

    <!-- 반응형 뷰포트 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- 브라우저 탭 제목 -->
    <title>SSALWorks - AI 개발 협업 플랫폼</title>

    <!-- CSS 연결 -->
    <link rel="stylesheet" href="styles.css">

    <!-- 파비콘 -->
    <link rel="icon" href="favicon.ico">
</head>
```

---

## 3. 시맨틱 태그

### 3-1. 시맨틱 태그란

**시맨틱(Semantic) 태그**는 의미를 가진 태그입니다. `<div>` 대신 용도에 맞는 태그를 사용하면 코드 가독성과 SEO가 좋아집니다.

### 3-2. 주요 시맨틱 태그

```html
<header>     <!-- 페이지/섹션 상단 -->
<nav>        <!-- 내비게이션 메뉴 -->
<main>       <!-- 주요 콘텐츠 (페이지당 1개) -->
<article>    <!-- 독립적인 콘텐츠 -->
<section>    <!-- 주제별 구분 -->
<aside>      <!-- 사이드바, 부가 정보 -->
<footer>     <!-- 페이지/섹션 하단 -->
```

### 3-3. 올바른 구조 예시

```html
<body>
    <header>
        <nav>
            <a href="/">홈</a>
            <a href="/about">소개</a>
        </nav>
    </header>

    <main>
        <article>
            <h1>글 제목</h1>
            <p>본문 내용...</p>
        </article>

        <aside>
            <h2>관련 링크</h2>
        </aside>
    </main>

    <footer>
        <p>&copy; 2025 SSALWorks</p>
    </footer>
</body>
```

---

## 4. 자주 쓰는 태그

### 4-1. 텍스트 관련

```html
<h1> ~ <h6>  <!-- 제목 (h1이 가장 큼) -->
<p>          <!-- 문단 -->
<span>       <!-- 인라인 텍스트 -->
<strong>     <!-- 강조 (굵게) -->
<em>         <!-- 강조 (기울임) -->
<br>         <!-- 줄바꿈 -->
<hr>         <!-- 수평선 -->
```

### 4-2. 링크와 이미지

```html
<!-- 링크 -->
<a href="https://example.com">외부 링크</a>
<a href="/about">내부 링크</a>
<a href="#section1">같은 페이지 내 이동</a>
<a href="mailto:test@example.com">이메일 링크</a>

<!-- 이미지 -->
<img src="image.jpg" alt="이미지 설명" width="300">
```

**alt 속성**은 이미지가 로드되지 않을 때, 스크린 리더가 읽을 때 사용됩니다. 반드시 작성하세요.

### 4-3. 목록

```html
<!-- 순서 없는 목록 -->
<ul>
    <li>항목 1</li>
    <li>항목 2</li>
</ul>

<!-- 순서 있는 목록 -->
<ol>
    <li>첫 번째</li>
    <li>두 번째</li>
</ol>
```

### 4-4. 테이블

```html
<table>
    <thead>
        <tr>
            <th>이름</th>
            <th>나이</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>홍길동</td>
            <td>30</td>
        </tr>
    </tbody>
</table>
```

---

## 5. 폼(Form) 태그

### 5-1. 기본 구조

```html
<form action="/submit" method="POST">
    <label for="email">이메일</label>
    <input type="email" id="email" name="email" required>

    <label for="password">비밀번호</label>
    <input type="password" id="password" name="password" required>

    <button type="submit">로그인</button>
</form>
```

### 5-2. input 타입

| 타입 | 용도 |
|------|------|
| `text` | 일반 텍스트 |
| `email` | 이메일 (형식 검증) |
| `password` | 비밀번호 (가려짐) |
| `number` | 숫자 |
| `date` | 날짜 선택 |
| `checkbox` | 체크박스 |
| `radio` | 라디오 버튼 |
| `file` | 파일 업로드 |

### 5-3. 폼 요소

```html
<!-- 텍스트 영역 -->
<textarea name="content" rows="5"></textarea>

<!-- 드롭다운 -->
<select name="plan">
    <option value="free">무료</option>
    <option value="pro">프로</option>
</select>

<!-- 버튼 -->
<button type="submit">제출</button>
<button type="reset">초기화</button>
<button type="button">일반 버튼</button>
```

---

## 6. 블록 vs 인라인

### 6-1. 블록 요소

한 줄을 전부 차지하는 요소입니다.

```html
<div>, <p>, <h1>~<h6>, <ul>, <ol>, <li>, <table>
<header>, <nav>, <main>, <section>, <article>, <aside>, <footer>
```

### 6-2. 인라인 요소

내용만큼만 차지하는 요소입니다.

```html
<span>, <a>, <strong>, <em>, <img>, <input>, <button>
```

### 6-3. 중요한 규칙

- 블록 요소 안에 인라인 요소 O
- 인라인 요소 안에 블록 요소 X (오류)

```html
<!-- 올바름 -->
<div><span>텍스트</span></div>

<!-- 잘못됨 -->
<span><div>텍스트</div></span>
```

---

## 7. 속성(Attributes)

### 7-1. 전역 속성

모든 태그에서 사용 가능한 속성입니다.

```html
<div id="unique-id">         <!-- 고유 식별자 (페이지당 1개) -->
<div class="card">           <!-- 스타일 클래스 (여러 개 가능) -->
<div style="color: red;">    <!-- 인라인 스타일 (비권장) -->
<div title="설명">           <!-- 마우스 오버 시 툴팁 -->
<div data-id="123">          <!-- 커스텀 데이터 -->
<div hidden>                 <!-- 숨김 -->
```

### 7-2. id vs class

| 속성 | 특징 | 사용 |
|------|------|------|
| `id` | 고유, 페이지당 1개 | JavaScript에서 요소 선택 |
| `class` | 중복 가능, 여러 개 | CSS 스타일 적용 |

```html
<div id="main-content" class="container card">
```

---

## 8. 실전 예시: 로그인 페이지

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>로그인 - SSALWorks</title>
    <link rel="stylesheet" href="login.css">
</head>
<body>
    <main>
        <section class="login-container">
            <h1>로그인</h1>

            <form action="/api/auth/login" method="POST">
                <div class="form-group">
                    <label for="email">이메일</label>
                    <input type="email" id="email" name="email"
                           placeholder="example@email.com" required>
                </div>

                <div class="form-group">
                    <label for="password">비밀번호</label>
                    <input type="password" id="password" name="password"
                           minlength="8" required>
                </div>

                <button type="submit" class="btn-primary">로그인</button>
            </form>

            <div class="divider">또는</div>

            <button type="button" class="btn-google">
                Google로 로그인
            </button>

            <p class="signup-link">
                계정이 없으신가요? <a href="/signup">회원가입</a>
            </p>
        </section>
    </main>
</body>
</html>
```

---

## 정리

HTML은 웹페이지의 **구조와 내용**을 담당합니다.

**핵심 포인트:**
- 시맨틱 태그로 의미 있는 구조 작성
- form 태그로 사용자 입력 처리
- id는 고유, class는 스타일용
- alt, label 등 접근성 속성 필수

HTML만으로는 못생긴 페이지입니다. 다음 편에서 CSS로 스타일을 입힙니다.

---

**작성일: 2025-12-21 / 작성자: Claude Code**
