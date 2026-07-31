# Vue.js 학습 리뷰 노트

## 문서 목적

- 강의 PDF 98페이지 이전에 학습한 내용을 복습하기 위한 기준 문서
- 날씨 Mockup 과제에서 각 문법이 어떻게 사용됐는지 연결
- 추후 개념 리뷰, 코드 리뷰, 이해도 확인 퀴즈 제작에 활용

## 학습 범위

### 1. Vue.js와 프로젝트 기본 구조

Vue.js는 화면을 컴포넌트 단위로 구성하는 프론트엔드 JavaScript 프레임워크다. 데이터가 바뀌면 연결된 화면도 다시 렌더링되는 반응성을 제공한다.

주요 프로젝트 파일과 폴더:

| 경로              | 역할                                      |
| ----------------- | ----------------------------------------- |
| `index.html`      | 브라우저가 처음 읽는 HTML 진입점          |
| `src/main.js`     | Vue 애플리케이션을 생성하고 `#app`에 연결 |
| `src/App.vue`     | 애플리케이션의 최상위 컴포넌트            |
| `src/components/` | 재사용 가능한 작은 화면 컴포넌트          |
| `src/views/`      | 페이지 단위 컴포넌트                      |
| `src/router/`     | URL과 화면을 연결하는 라우팅 설정         |
| `src/stores/`     | Pinia 전역 상태 저장소                    |
| `public/`         | 빌드 과정 없이 제공되는 정적 파일         |
| `src/assets/`     | Vite가 처리하는 이미지, CSS 등의 자원     |

주요 명령어:

```bash
npm run dev
npm run build
```

- `npm run dev`: 개발 서버 실행
- `npm run build`: 배포 가능한 정적 파일 생성

### 2. SFC 구조

Vue 컴포넌트는 일반적으로 `.vue` 확장자를 가진 Single File Component로 작성한다.

```vue
<script setup>
// 데이터와 함수
</script>

<template>
  <!-- 화면 구조 -->
</template>

<style scoped>
/* 현재 컴포넌트에 적용할 스타일 */
</style>
```

- `<script setup>`: JavaScript 상태와 기능
- `<template>`: 사용자에게 보이는 HTML 구조
- `<style scoped>`: 현재 컴포넌트에만 적용되는 CSS
- 컴포넌트 파일명은 두 단어 이상의 PascalCase 사용 권장

### 3. 컴포넌트 연결

자식 컴포넌트를 부모 컴포넌트에서 import한 후 템플릿에 배치한다.

```vue
<script setup>
import WeatherMockup from './components/practices/basic/WeatherMockup.vue'
</script>

<template>
  <WeatherMockup />
</template>
```

현재 과제에서는 `App.vue`가 부모이고 `WeatherMockup.vue`가 자식이다.

### 4. 반응성 데이터와 `ref`

화면에 표시되고 변경 결과가 즉시 반영되어야 하는 값은 `ref()`로 선언한다.

```js
import { ref } from 'vue'

const count = ref(0)
```

스크립트에서는 `.value`로 값을 읽거나 변경한다.

```js
count.value++
```

템플릿에서는 `.value`를 사용하지 않는다.

```vue
<p>{{ count }}</p>
<button @click="count++">증가</button>
```

일반 변수는 내부 값이 변경되더라도 Vue가 화면을 다시 렌더링해야 한다는 사실을 알 수 없다. `ref()`는 값의 변경을 Vue가 추적할 수 있게 한다.

날씨 과제 적용:

```js
const weatherList = ref([...])
const searchCity = ref('')
const selectedMessage = ref('카드를 클릭하거나 검색해 보세요.')
```

### 5. 텍스트 보간법

JavaScript 값을 화면의 텍스트로 출력할 때 `{{ }}`를 사용한다.

```vue
<p>{{ message }}</p>
```

간단한 JavaScript 표현식도 사용할 수 있다.

```vue
<p>{{ welcomeMessage.toUpperCase() }}</p>
<p>{{ count + 1 }}</p>
```

복잡한 처리나 여러 동작은 보간법 안에 작성하지 않고 `<script setup>`의 함수로 분리하는 것이 좋다.

날씨 과제 적용:

```vue
<h3>{{ weather.name }} ({{ weather.status }})</h3>
<p>현재 기온: {{ weather.temp }}°C</p>
<p>검색 중인 도시: {{ searchCity }}</p>
```

### 6. Vue Directive

Directive는 `v-`로 시작하는 Vue 전용 HTML 속성이다. HTML 요소를 JavaScript 데이터 및 동작과 연결한다.

| Directive   | 역할                                         |
| ----------- | -------------------------------------------- |
| `v-html`    | 문자열을 HTML로 해석하여 출력                |
| `v-text`    | 요소의 텍스트 내용 출력                      |
| `v-bind`    | HTML 속성과 JavaScript 값 연결               |
| `v-model`   | Form 입력값과 상태를 양방향 연결             |
| `v-if`      | 조건이 참일 때 요소 렌더링                   |
| `v-else-if` | 앞 조건이 거짓일 때 추가 조건 확인           |
| `v-else`    | 앞의 모든 조건이 거짓일 때 렌더링            |
| `v-show`    | CSS `display`를 사용하여 요소 표시 여부 전환 |
| `v-for`     | 배열이나 객체를 반복 렌더링                  |
| `v-on`      | 이벤트 리스너 연결                           |
| `v-pre`     | Vue 문법을 해석하지 않고 그대로 출력         |
| `v-cloak`   | Vue 렌더링 전 템플릿 노출 방지               |
| `v-once`    | 최초 한 번만 렌더링                          |
| `v-memo`    | 지정한 값이 바뀔 때만 영역 갱신              |

#### `v-html` 주의사항

사용자 입력이나 신뢰할 수 없는 데이터를 `v-html`로 출력하면 XSS 공격 위험이 있다.

```vue
<div v-html="userInput"></div>
```

일반 텍스트는 가능한 한 안전한 보간법을 사용한다.

```vue
<div>{{ userInput }}</div>
```

### 7. `v-bind`

HTML 속성에 JavaScript 값을 연결한다.

```vue
<a v-bind:href="dynamicUrl">링크</a>
```

일반적으로 `:` 축약형을 사용한다.

```vue
<a :href="dynamicUrl">링크</a>
```

날씨 과제에서는 검색창의 value와 반복 요소의 key를 연결한다.

```vue
<input :value="searchCity" />
<article :key="weather.id"></article>
```

#### Class Binding

조건에 따라 CSS 클래스를 추가할 수 있다.

```vue
<p :class="{ warning: isWarning }">상태</p>
```

```vue
<div :class="[baseClass, isError ? 'error' : 'normal']"></div>
```

#### Style Binding

JavaScript 값을 인라인 스타일과 연결할 수 있다.

```vue
<p :style="{ color: textColor, fontSize: fontSize + 'px' }">
  텍스트
</p>
```

일반적인 디자인은 class binding과 CSS 사용이 권장되고, 동적으로 계산되는 수치나 색상에는 style binding을 사용할 수 있다.

### 8. 조건부 렌더링

#### `v-if`, `v-else-if`, `v-else`

조건에 맞지 않는 요소는 DOM에서 생성되지 않는다.

```vue
<p v-if="score >= 90">A</p>
<p v-else-if="score >= 80">B</p>
<p v-else>재시험</p>
```

날씨 과제 적용:

```vue
<span v-if="weather.temp >= 25">🔥 더움 (25도 이상)</span>
<span v-else>❄️ 선선함 (25도 미만)</span>
```

#### `v-show`

요소를 DOM에 유지한 채 `display: none`으로 숨긴다.

```vue
<div v-show="isVisible">자주 열고 닫는 영역</div>
```

- 전환이 드문 조건부 화면: `v-if`
- 표시 여부가 자주 바뀌는 화면: `v-show`

### 9. `v-for`

배열이나 객체의 각 항목을 반복하여 렌더링한다.

```vue
<li v-for="item in items" :key="item.id">
  {{ item.name }}
</li>
```

배열의 index도 받을 수 있다.

```vue
<li v-for="(item, index) in items" :key="item.id">
  {{ index + 1 }}. {{ item.name }}
</li>
```

`v-for`를 사용할 때는 Vue가 각 요소를 정확히 식별할 수 있도록 고유하고 안정적인 `:key`를 연결해야 한다.

날씨 과제 적용:

```vue
<article v-for="weather in weatherList" :key="weather.id">
  {{ weather.name }}
</article>
```

### 10. 이벤트 처리

`v-on`으로 DOM 이벤트를 처리하며, 일반적으로 `@` 축약형을 사용한다.

```vue
<button v-on:click="handleClick">클릭</button>
<button @click="handleClick">클릭</button>
```

#### Inline Handler

간단한 연산은 템플릿에 직접 작성할 수 있다.

```vue
<button @click="count++">증가</button>
```

#### Method Handler

여러 동작이나 의미 있는 기능은 함수로 분리한다.

```js
const handleClick = () => {
  window.alert('클릭되었습니다.')
}
```

```vue
<button @click="handleClick">클릭</button>
```

날씨 과제에서는 카드 선택과 상세보기를 각각 함수로 분리한다.

```js
const selectCity = (cityName) => {
  selectedMessage.value = `${cityName}이 선택되었습니다.`
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
```

### 11. Event Object

이벤트가 발생하면 브라우저는 이벤트 정보를 담은 객체를 전달한다.

```js
const handleInput = (event) => {
  console.log(event.target.value)
}
```

함수 이름만 전달하면 이벤트 객체가 첫 번째 인자로 자동 전달된다.

```vue
<input @input="handleInput" />
```

다른 값과 이벤트 객체를 함께 전달하려면 `$event`를 명시한다.

```vue
<button @click="handleClick('서울', $event)">선택</button>
```

### 12. 이벤트 버블링과 수식어

자식 요소에서 발생한 이벤트가 부모 요소로 전달되는 현상을 이벤트 버블링이라고 한다.

주요 이벤트 수식어:

| 수식어     | 기능                                           |
| ---------- | ---------------------------------------------- |
| `.prevent` | 태그의 기본 동작 방지                          |
| `.stop`    | 부모로 이벤트가 전달되는 버블링 차단           |
| `.once`    | 이벤트를 한 번만 실행                          |
| `.self`    | 이벤트가 현재 요소 자체에서 발생했을 때만 실행 |
| `.enter`   | Enter 키 이벤트 처리                           |
| `.esc`     | Escape 키 이벤트 처리                          |

날씨 카드에는 카드 클릭 이벤트가 있고 그 안에 상세보기 버튼이 있다.

```vue
<article @click="selectCity(weather.name)">
  <button @click.stop="showDetail(weather.name, weather.status)">
    상세보기
  </button>
</article>
```

`.stop`이 없으면 상세보기 버튼 클릭 시:

1. 상세보기 alert 실행
2. 이벤트가 카드로 버블링
3. 카드 선택 함수도 실행

`.stop`을 사용하면 상세보기 동작만 실행된다.

### 13. Form Data Binding과 `v-model`

`v-model`은 Form 입력값과 반응형 상태를 양방향으로 연결한다.

```vue
<input v-model="text" />
<p>{{ text }}</p>
```

실제로는 `v-bind`와 입력 이벤트를 조합한 형태로 동작한다.

```vue
<input :value="text" @input="(event) => (text = event.target.value)" />
```

날씨 과제는 한글 입력 처리를 연습하기 위해 축약 문법인 `v-model` 대신 `:value`와 `@input`을 직접 사용한다.

```js
const searchCity = ref('')

const handleSearchInput = (event) => {
  searchCity.value = event.target.value
}
```

```vue
<input :value="searchCity" @input="handleSearchInput" />
```

### 14. Form 요소별 초기값

| Form 요소     | 권장 `ref` 초기값 |
| ------------- | ----------------- |
| text input    | `ref('')`         |
| textarea      | `ref('')`         |
| 단일 checkbox | `ref(false)`      |
| 다중 checkbox | `ref([])`         |
| radio         | `ref('')`         |
| select        | `ref('')`         |

입력 요소의 성격과 초기값 타입이 맞지 않으면 의도하지 않은 결과가 발생할 수 있다.

### 15. `v-model` 수식어

| 수식어    | 기능                                   |
| --------- | -------------------------------------- |
| `.lazy`   | 매 입력이 아니라 change 시점에 값 반영 |
| `.number` | 가능한 경우 입력값을 Number로 변환     |
| `.trim`   | 문자열 양끝 공백 제거                  |

수식어는 연결해서 사용할 수 있다.

```vue
<input v-model.trim.number="price" />
```

### 16. Vue Style

일반 `<style>`은 다른 컴포넌트에도 영향을 줄 수 있다.

```vue
<style>
.title {
  color: red;
}
</style>
```

`scoped`를 사용하면 현재 컴포넌트 범위로 스타일 적용을 제한한다.

```vue
<style scoped>
.title {
  color: red;
}
</style>
```

외부 CSS도 불러올 수 있다.

```vue
<style>
@import '@/assets/challenge.css';
</style>
```

날씨 과제의 카드, 온도 라벨, 버튼 스타일은 `WeatherMockup.vue`의 `<style scoped>`에 작성한다.

## 날씨 Mockup 과제 요구사항과 학습 내용 연결

| 과제 요구사항             | 사용한 학습 내용                        |
| ------------------------- | --------------------------------------- |
| 날씨 데이터 배열 선언     | `ref`, 배열과 객체                      |
| 날씨 카드 반복 출력       | `v-for`, 보간법                         |
| 카드마다 고유 id 연결     | `v-bind` 축약형 `:key`                  |
| 25도 기준 라벨 분기       | `v-if`, `v-else`                        |
| 한글 도시명 입력          | `ref`, `:value`, `@input`, Event Object |
| 입력한 도시명 출력        | 반응성, 보간법                          |
| 카드 클릭으로 상태바 변경 | `@click`, Method Handler, `ref`         |
| 상세보기 alert            | 매개변수를 받는 Method Handler          |
| 상세보기 버블링 방지      | 이벤트 수식어 `.stop`                   |
| 컴포넌트 전용 디자인      | `<style scoped>`                        |

## 과제에서 의도적으로 사용하지 않은 내용

아래 내용은 98페이지 다음 Composition API 단원 또는 이후 단원에서 자세히 학습하므로 이번 과제의 핵심 구현에는 사용하지 않는다.

- `computed`
- `watch`, `watchEffect`
- `reactive`
- Lifecycle Hook
- props와 emit을 이용한 컴포넌트 통신
- Vue Router를 이용한 페이지 이동
- Pinia 상태 관리
- 실제 날씨 API 호출

## 나중에 리뷰할 핵심 질문

1. 일반 변수와 `ref`의 가장 중요한 차이는 무엇인가?
2. 스크립트에서 `ref` 값을 변경할 때 `.value`가 필요한 이유는 무엇인가?
3. 템플릿에서는 왜 `.value`를 생략할 수 있는가?
4. `v-bind`와 `v-on`의 축약형은 각각 무엇인가?
5. `v-if`와 `v-show`는 DOM을 어떻게 다르게 처리하는가?
6. `v-for`에서 `:key`가 필요한 이유는 무엇인가?
7. `v-model`을 `:value`와 `@input`으로 풀어 쓰면 어떻게 되는가?
8. 이벤트 객체의 `target.value`에는 어떤 값이 들어 있는가?
9. 이벤트 버블링은 무엇이며 `.stop`은 어떤 문제를 해결하는가?
10. `v-html`에 사용자 입력을 넣으면 왜 위험한가?
11. Inline Handler와 Method Handler는 언제 각각 사용하는가?
12. `<style scoped>`를 사용하는 이유는 무엇인가?

## 추후 퀴즈 구성안

리뷰 시 다음 네 단계로 퀴즈를 만들 수 있다.

1. 개념 확인: 용어와 동작 설명
2. 코드 결과 예측: 주어진 Vue 코드가 어떤 화면을 만드는지 설명
3. 오류 찾기: `.value`, `:key`, 이벤트 수식어 등의 실수 찾기
4. 직접 작성: 작은 요구사항을 Vue 코드로 구현

퀴즈는 이 문서와 `WeatherMockup.vue`를 기준으로 출제하고, 정답을 바로 공개하지 않은 채 답변 후 해설하는 방식으로 진행한다.
