---
title: "JavaScript ES6+ 주요 기능 정리"
date: 2025-01-25
tags: ["JavaScript", "ES6", "Programming"]
category: "Tutorial"
description: "ES6부터 추가된 JavaScript의 주요 기능들을 정리하고 예제와 함께 설명합니다."
---

# JavaScript ES6+ 주요 기능 정리

JavaScript ES6(ES2015)부터 추가된 주요 기능들을 정리해보겠습니다. 이 기능들은 현대적인 JavaScript 개발에 필수적입니다.

## 🔧 주요 기능들

### 1. 화살표 함수 (Arrow Functions)

기존 함수 선언보다 간결한 문법:

```javascript
// 기존 방식
function add(a, b) {
  return a + b;
}

// 화살표 함수
const add = (a, b) => a + b;

// 단일 매개변수
const square = (x) => x * x;

// 매개변수 없음
const greet = () => console.log("Hello!");
```

### 2. 템플릿 리터럴 (Template Literals)

문자열 보간과 멀티라인 지원:

```javascript
const name = "홍길동";
const age = 25;

// 기존 방식
const message = "안녕하세요, " + name + "님! 나이는 " + age + "세입니다.";

// 템플릿 리터럴
const message = `안녕하세요, ${name}님! 나이는 ${age}세입니다.`;

// 멀티라인
const html = `
  <div class="user">
    <h2>${name}</h2>
    <p>나이: ${age}세</p>
  </div>
`;
```

### 3. 구조 분해 할당 (Destructuring)

배열이나 객체에서 값을 추출하는 간편한 방법:

```javascript
// 배열 구조 분해
const numbers = [1, 2, 3, 4, 5];
const [first, second, ...rest] = numbers;
console.log(first); // 1
console.log(second); // 2
console.log(rest); // [3, 4, 5]

// 객체 구조 분해
const user = {
  name: "김철수",
  age: 30,
  email: "kim@example.com",
};

const { name, age, email } = user;
console.log(name); // 김철수

// 기본값 설정
const { name, age = 25 } = user;
```

### 4. 스프레드 연산자 (Spread Operator)

배열이나 객체를 펼치는 연산자:

```javascript
// 배열 합치기
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// 객체 합치기
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 }; // { a: 1, b: 2, c: 3, d: 4 }

// 함수 매개변수
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}
console.log(sum(1, 2, 3, 4)); // 10
```

### 5. Promise와 async/await

비동기 처리의 새로운 방법:

```javascript
// Promise
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("데이터 로드 완료");
    }, 1000);
  });
}

fetchData()
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

// async/await
async function loadData() {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

### 6. 클래스 (Classes)

객체 지향 프로그래밍을 위한 클래스 문법:

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    return `안녕하세요, ${this.name}입니다.`;
  }

  static createAdult(name) {
    return new Person(name, 18);
  }
}

class Student extends Person {
  constructor(name, age, grade) {
    super(name, age);
    this.grade = grade;
  }

  study() {
    return `${this.name}이(가) 공부하고 있습니다.`;
  }
}

const student = new Student("이영희", 20, 3);
console.log(student.greet()); // 안녕하세요, 이영희입니다.
console.log(student.study()); // 이영희이(가) 공부하고 있습니다.
```

### 7. 모듈 시스템 (Modules)

ES6 모듈 시스템:

```javascript
// math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

export default class Calculator {
  multiply(a, b) {
    return a * b;
  }
}

// main.js
import Calculator, { add, subtract } from "./math.js";

const calc = new Calculator();
console.log(add(5, 3)); // 8
console.log(subtract(5, 3)); // 2
console.log(calc.multiply(5, 3)); // 15
```

## 🎯 실제 활용 예제

다음은 위 기능들을 조합한 실제 예제입니다:

```javascript
// 사용자 데이터 처리 함수
async function processUsers(users) {
  const processedUsers = users
    .filter(({ age }) => age >= 18) // 성인만 필터링
    .map(({ name, age, email }) => ({
      // 필요한 필드만 추출
      name: name.toUpperCase(),
      age,
      email,
      isAdult: true,
    }))
    .sort((a, b) => a.name.localeCompare(b.name)); // 이름순 정렬

  return processedUsers;
}

// 사용 예제
const users = [
  { name: "김철수", age: 25, email: "kim@example.com" },
  { name: "이영희", age: 17, email: "lee@example.com" },
  { name: "박민수", age: 30, email: "park@example.com" },
];

processUsers(users).then((result) => {
  console.log("처리된 사용자:", result);
});
```

## 📚 추가 학습 자료

- [MDN JavaScript 가이드](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide)
- [ES6+ 기능 정리](https://es6-features.org/)
- [JavaScript.info](https://ko.javascript.info/)

## 🎉 마무리

ES6+의 주요 기능들을 살펴보았습니다. 이 기능들은 현대적인 JavaScript 개발에 필수적이며, 코드의 가독성과 유지보수성을 크게 향상시킵니다.

꾸준한 연습을 통해 이 기능들을 익숙하게 사용할 수 있도록 노력해보세요! 🚀
