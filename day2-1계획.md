# Day 2 과제 계획 - 날씨 (Composition API)

## 1. 과제 해석

- 참고 자료: `2) Full-stack Engineering_3.Frontend-framework_Vue.js_강병호_0729.pdf` 126페이지
- 과제 주제: Day 1에 만든 날씨 화면을 Composition API의 `computed`, `watch`, `watchEffect`로 확장한다.
- 기준 구현: `src/components/practices/basic/weathermockup_day1.vue`
- 구현 원칙: Day 1 결과는 보존하고 Day 2용 컴포넌트를 별도로 만든다.

## 2. PDF 필수 요구사항

- **R1. 반응형 상태 관리**
  - `searchQuery`: 사용자가 입력한 도시 검색어
  - `selectedCityInfo`: 선택된 도시에 따라 변경되는 상태바 문구
  - `weatherList`: 지역별 날씨 데이터 배열
  - 위 세 가지를 Vue의 반응형 상태로 정의한다.

- **R2. `computed`를 이용한 도시 검색**
  - `filteredWeatherList`를 computed 배열로 정의한다.
  - 전체 `weatherList` 중 도시 이름에 `searchQuery`가 포함된 항목만 반환한다.

- **R3. `watch`, `watchEffect`를 이용한 변화 감시**
  - `watch(selectedCityInfo, ...)`: 카드 선택으로 상태바 문구가 바뀌 때마다 변경 내용을 콘솔에 기록한다.
  - `watchEffect(...)`: 콜백 내부에서 `searchQuery.value`를 참조하여 초기 1회 및 타이핑으로 검색어가 바뀌 때마다 현재 검색어를 콘솔에 기록한다.

- **R4. 검색 결과 표시**
  - 검색어가 비어 있으면 원본 날씨 데이터 전체를 표시한다.
  - 일치하는 도시가 있으면 해당 도시 카드만 표시한다.
  - 일치하는 도시가 없으면 `검색 결과와 일치하는 도시가 없습니다.` 안내를 표시한다.

## 3. 구현 방향

### 파일 구성

| 파일                                                               | 작업                                            |
| ------------------------------------------------------------------ | ----------------------------------------------- |
| `src/components/practices/basic/weathermockup_day1.vue`            | Day 1 결과물로 유지                             |
| `src/components/practices/composition/WeatherComposition_day2.vue` | Day 1 UI와 기능을 기반으로 Day 2 과제 신규 구현 |
| `src/App.vue`                                                      | `WeatherComposition` import 및 렌더링으로 전환  |

### 상태와 파생 데이터

1. `ref` 상태를 요구사항의 이름과 일치시킨다.
   - `weatherList = ref([...])`
   - `searchQuery = ref('')`
   - `selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')`
2. Day 1의 선택 카드 스타일을 유지하기 위해 `selectedCity` 상태는 보조 상태로 두어도 된다.
3. `filteredWeatherList` computed에서 검색어의 앞뒤 공백을 제거한 뒤 필터링한다.
4. 검색어가 빈 문자열이면 `weatherList.value`를 그대로 반환한다.
5. 검색어가 있으면 `item.name.includes(query)`로 도시 이름 포함 여부를 판별한다.

### 사용자 상호작용

1. 검색 입력창을 `searchQuery`와 연결한다.
2. 카드 목록의 `v-for` 대상을 `weatherList`에서 `filteredWeatherList`로 변경한다.
3. 카드를 클릭하면 `selectedCityInfo`를 `서울이 선택되었습니다.`와 같은 문구로 변경한다.
4. 상세보기 버튼의 `@click.stop`과 알림 기능은 Day 1처럼 유지한다.
5. `filteredWeatherList.length === 0`일 때 빈 결과 안내를 날씨 목록 영역에 보여 준다.

### 콘솔 감시

1. `watch` 로그에는 `selectedCityInfo`의 새 값을 포함해 상태바 변경을 확인할 수 있게 한다.
2. `watchEffect` 로그에는 현재 `searchQuery` 값을 포함해 초기 실행과 각 타이핑을 확인할 수 있게 한다.
3. 두 로그의 접두어를 다르게 해 어느 감시자가 실행됐는지 구분한다.

## 4. 작업 순서

1. Day 1 `weathermockup_day1.vue`를 Day 2 `WeatherComposition_day2.vue`의 기초로 복사한다.
2. 상태 이름을 PDF와 동일한 `searchQuery`, `selectedCityInfo`, `weatherList`로 정리한다.
3. `computed`, `watch`, `watchEffect`를 import하고 `filteredWeatherList` 및 감시 로직을 구현한다.
4. 템플릿의 검색 입력, 카드 목록, 빈 결과, 상태바를 새 상태와 연결한다.
5. `App.vue`가 Day 2 컴포넌트를 보여 주도록 변경한다.
6. 포맷, 빌드, 브라우저 행동 및 콘솔 로그를 검증한다.

## 5. 요구사항 충족 체크리스트

### 구현 전

- [x] Day 1 `weathermockup_day1.vue`가 보존되어 있다.
- [x] Day 2 작업 대상이 `WeatherComposition_day2.vue`로 분리되어 있다.

### R1 - 반응형 상태

- [x] `searchQuery`가 `ref` 반응형 상태로 정의되어 있다.
- [x] `selectedCityInfo`가 `ref` 반응형 상태로 정의되어 있다.
- [x] `weatherList`가 `ref` 반응형 배열로 정의되어 있다.
- [x] 검색 입력, 카드 선택, 상태바가 각 반응형 상태와 정상적으로 연결된다.

### R2 - computed 검색

- [x] `filteredWeatherList`가 `computed`로 정의되어 있다.
- [x] `filteredWeatherList`가 `weatherList`와 `searchQuery`를 참조한다.
- [x] 도시 이름에 검색어가 포함된 항목만 반환한다.
- [x] 카드의 `v-for`가 `filteredWeatherList`를 사용한다.

### R3 - watch / watchEffect

- [x] `watch`가 `selectedCityInfo`를 감시한다.
- [x] 카드 선택 후 상태바 문구와 콘솔 로그가 갱신된다.
- [x] `watchEffect`가 콜백 내부에서 `searchQuery.value`를 참조한다.
- [x] 초기 화면 진입 시 `watchEffect` 로그가 1회 출력된다.
- [x] 검색어를 한 글자씩 입력할 때마다 `watchEffect` 로그가 출력된다.
- [x] `watch` 로그와 `watchEffect` 로그를 쉽게 구분할 수 있다.

### R4 - 검색 결과 표시

- [x] 검색어가 비어 있을 때 서울, 성남, 부산, 천안 원본 4개 카드가 모두 표시된다.
- [x] `성남`을 입력하면 `성남` 카드만 표시된다.
- [x] `천안`을 입력하면 `천안` 카드만 표시된다.
- [x] `부산`을 입력하면 `부산` 카드만 표시된다.
- [x] 존재하지 않는 도시를 입력하면 일치하는 도시가 없다는 안내가 표시된다.
- [x] 검색어를 다시 지우면 전체 카드가 즉시 복원된다.
- [x] 앞뒤 공백만 입력한 경우는 빈 검색어로 처리되어 전체 카드가 표시된다.

### 기존 기능 및 품질 확인

- [x] 카드를 클릭하면 선택 스타일과 상태바 문구가 정상적으로 변경된다.
- [x] `상세보기` 버튼을 클릭하면 알림만 표시되고 카드 클릭 이벤트는 중복 실행되지 않는다.
- [x] 검색 결과가 바뀌어도 레이아웃이 깨지지 않는다.
- [x] 브라우저 콘솔에 Vue 렌더링 오류가 없다.
- [x] `npm run build`가 성공한다.

## 6. 완료 기준

- PDF 126페이지의 R1~R4 체크리스트가 모두 충족된다.
- Day 1 날씨 목업의 UI와 기존 상호작용이 유지된다.
- 빌드 및 브라우저 수동 테스트가 통과한다.
- 과제 완료 후 위 체크리스트에 실제 검증 결과를 반영한다.
