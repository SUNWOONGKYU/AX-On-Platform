# 27편 | 심화 - JavaScript

---

HTML로 구조를, CSS로 스타일을 만들었습니다. 이번 편에서는 JavaScript로 웹페이지에 **동적 기능**을 추가하는 방법을 다룹니다.

## 1. JavaScript란

### 1-1. 정의

**JavaScript**는 웹페이지에 **동적 기능**을 추가하는 프로그래밍 언어입니다.

집을 짓는다면 HTML이 뼈대, CSS가 인테리어라면, JavaScript는 **전자기기**입니다. 버튼을 누르면 불이 켜지고, 리모컨으로 TV를 조작하는 것처럼, 사용자의 행동에 반응하는 역할입니다.

### 1-2. JavaScript가 하는 일

- 버튼 클릭 시 동작
- 폼 입력값 검증
- 서버에서 데이터 불러오기 (AJAX)
- 페이지 내용 동적 변경
- 애니메이션 효과

---

## 2. 기본 문법

### 2-1. 변수 선언

```javascript
// let: 변경 가능
let count = 0;
count = 1;  // OK

// const: 변경 불가 (상수)
const PI = 3.14;
PI = 3;  // 에러!

// var: 옛날 방식 (쓰지 마세요)
var oldStyle = "deprecated";
```

**권장:** 기본적으로 `const` 사용, 변경 필요할 때만 `let`

### 2-2. 데이터 타입

```javascript
// 문자열
const name = "홍길동";
const greeting = `안녕하세요, ${name}님!`;  // 템플릿 리터럴

// 숫자
const age = 30;
const price = 29.99;

// 불리언
const isActive = true;
const isLoggedIn = false;

// 배열
const colors = ["red", "green", "blue"];
console.log(colors[0]);  // "red"

// 객체
const user = {
    name: "홍길동",
    age: 30,
    email: "hong@example.com"
};
console.log(user.name);  // "홍길동"
```

### 2-3. 연산자

```javascript
// 비교 연산자
==   // 값만 비교 (타입 무시)
===  // 값과 타입 모두 비교 (권장)
!=   // 값만 비교
!==  // 값과 타입 모두 비교 (권장)

// 예시
"1" == 1    // true  (위험!)
"1" === 1   // false (안전)

// 논리 연산자
&&  // AND
||  // OR
!   // NOT
```

---

## 3. 함수

### 3-1. 함수 선언

```javascript
// 함수 선언식
function greet(name) {
    return `안녕하세요, ${name}님!`;
}

// 함수 표현식
const greet2 = function(name) {
    return `안녕하세요, ${name}님!`;
};

// 화살표 함수 (권장)
const greet3 = (name) => {
    return `안녕하세요, ${name}님!`;
};

// 화살표 함수 (한 줄일 때)
const greet4 = (name) => `안녕하세요, ${name}님!`;
```

**4가지 방식 모두 같은 동작**을 합니다. 화살표 함수가 가장 간결합니다.

### 3-2. 함수 호출

```javascript
const message = greet("홍길동");
console.log(message);  // "안녕하세요, 홍길동님!"
```

---

## 4. 조건문과 반복문

### 4-1. 조건문

```javascript
// if문
if (age >= 18) {
    console.log("성인입니다");
} else if (age >= 13) {
    console.log("청소년입니다");
} else {
    console.log("어린이입니다");
}

// 삼항 연산자
const status = age >= 18 ? "성인" : "미성년";
```

### 4-2. 반복문

```javascript
// for문
for (let i = 0; i < 5; i++) {
    console.log(i);
}

// for...of (배열)
const fruits = ["사과", "바나나", "오렌지"];
for (const fruit of fruits) {
    console.log(fruit);
}

// forEach (배열 메서드)
fruits.forEach((fruit) => {
    console.log(fruit);
});
```

---

## 5. 배열 메서드

### 5-1. 자주 쓰는 메서드

```javascript
const numbers = [1, 2, 3, 4, 5];

// map: 변환
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10]

// filter: 조건에 맞는 것만
const even = numbers.filter(n => n % 2 === 0);
// [2, 4]

// find: 첫 번째 매칭
const found = numbers.find(n => n > 3);
// 4

// reduce: 누적
const sum = numbers.reduce((acc, n) => acc + n, 0);
// 15

// includes: 포함 여부
numbers.includes(3);  // true

// push/pop: 끝에서 추가/제거
numbers.push(6);   // [1, 2, 3, 4, 5, 6]
numbers.pop();     // 6 반환, [1, 2, 3, 4, 5]
```

### 5-2. 메서드 체이닝

```javascript
const users = [
    { name: "홍길동", age: 30 },
    { name: "김철수", age: 25 },
    { name: "이영희", age: 35 }
];

// 30세 이상 이름만 추출
const names = users
    .filter(user => user.age >= 30)
    .map(user => user.name);
// ["홍길동", "이영희"]
```

---

## 6. DOM 조작

### 6-1. 요소 선택

```javascript
// ID로 선택
const header = document.getElementById("header");

// CSS 선택자로 선택 (첫 번째 하나)
const button = document.querySelector(".btn-primary");

// CSS 선택자로 선택 (모두)
const items = document.querySelectorAll(".item");
```

### 6-2. 내용 변경

```javascript
// 텍스트 변경
element.textContent = "새로운 텍스트";

// HTML 변경
element.innerHTML = "<strong>굵은 텍스트</strong>";

// 속성 변경
img.src = "new-image.jpg";
input.value = "입력값";
link.href = "https://example.com";

// 클래스 조작
element.classList.add("active");
element.classList.remove("active");
element.classList.toggle("active");
```

### 6-3. 스타일 변경

```javascript
element.style.color = "red";
element.style.display = "none";
element.style.backgroundColor = "#f5f5f5";
```

---

## 7. 이벤트

### 7-1. 이벤트 리스너

```javascript
const button = document.querySelector("#submit-btn");

button.addEventListener("click", () => {
    console.log("버튼 클릭!");
});
```

### 7-2. 주요 이벤트

| 이벤트 | 발생 시점 |
|--------|----------|
| `click` | 클릭 |
| `submit` | 폼 제출 |
| `input` | 입력값 변경 |
| `change` | 값 변경 완료 |
| `keydown` | 키 누름 |
| `keyup` | 키 뗌 |
| `focus` | 포커스 얻음 |
| `blur` | 포커스 잃음 |
| `load` | 페이지 로드 완료 |

### 7-3. 이벤트 객체

```javascript
button.addEventListener("click", (event) => {
    event.preventDefault();  // 기본 동작 방지
    event.stopPropagation(); // 이벤트 전파 중단

    console.log(event.target);  // 클릭된 요소
});

// 폼 제출 시 페이지 새로고침 방지
form.addEventListener("submit", (e) => {
    e.preventDefault();
    // 폼 처리 로직
});
```

---

## 8. 비동기 처리

### 8-1. Promise와 async/await

```javascript
// Promise 방식
fetch("/api/users")
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

// async/await 방식 (권장)
async function getUsers() {
    try {
        const response = await fetch("/api/users");
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}
```

### 8-2. fetch API

```javascript
// GET 요청
const response = await fetch("/api/users");
const users = await response.json();

// POST 요청
const response = await fetch("/api/users", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        name: "홍길동",
        email: "hong@example.com"
    })
});
```

---

## 9. 실전 예시: 로그인 폼 처리

```javascript
// 폼 요소 선택
const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const errorMessage = document.querySelector("#error-message");

// 폼 제출 이벤트
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();  // 새로고침 방지

    const email = emailInput.value;
    const password = passwordInput.value;

    // 입력값 검증
    if (!email || !password) {
        errorMessage.textContent = "이메일과 비밀번호를 입력하세요";
        return;
    }

    try {
        // API 호출
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // 로그인 성공 → 대시보드로 이동
            window.location.href = "/dashboard";
        } else {
            // 로그인 실패
            errorMessage.textContent = data.message;
        }
    } catch (error) {
        errorMessage.textContent = "네트워크 오류가 발생했습니다";
    }
});
```

---

## 10. ES6+ 문법

### 10-1. 구조 분해 할당

```javascript
// 객체
const user = { name: "홍길동", age: 30 };
const { name, age } = user;

// 배열
const colors = ["red", "green", "blue"];
const [first, second] = colors;
```

### 10-2. 스프레드 연산자

```javascript
// 배열 복사/합치기
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];  // [1, 2, 3, 4, 5]

// 객체 복사/합치기
const user = { name: "홍길동" };
const updated = { ...user, age: 30 };
// { name: "홍길동", age: 30 }
```

### 10-3. 옵셔널 체이닝

```javascript
// 안전하게 중첩 속성 접근
const email = user?.profile?.email;

// 없으면 undefined 반환 (에러 X)
```

---

## 정리

JavaScript는 웹페이지에 **동적 기능**을 추가합니다.

**핵심 포인트:**
- `const`/`let`으로 변수 선언
- 화살표 함수 `() => {}` 사용
- 배열 메서드 (`map`, `filter`, `find`)
- DOM 조작 (`querySelector`, `addEventListener`)
- 비동기 처리 (`async`/`await`)

다음 편에서 TypeScript로 타입 안전성을 추가합니다.

---

**작성일: 2025-12-21 / 작성자: Claude Code**
