# 2-1 실습 계획 - 날씨 컴포넌트 분리

## 1. 과제 해석

- 참고 자료: `2) Full-stack Engineering_3.Frontend-framework_Vue.js_강병호_0729.pdf` 158페이지
- 과제 주제: 기존 Day 2 날씨 화면을 **기능 변경 없이 4개의 Vue 컴포넌트로 분리**한다.
- 기준 구현: `src/components/practices/composition/WeatherComposition_day2.vue`
- 구현 원칙:
  - Day 2 파일은 이전 실습 결과물로 보존한다.
  - 상태와 비즈니스 로직은 부모가 소유한다.
  - 자식은 `props`로 데이터를 받고 `emits`로 사용자 동작을 부모에게 알린다.
  - 공통 박스는 슬롯을 사용해 내부 콘텐츠를 부모가 주입할 수 있게 한다.
- PDF에 적힌 `WeatheCard.vue`는 문맥상 오탈자로 판단하여 일반적인 PascalCase 이름인 `WeatherCard.vue`로 작성한다.

## 2. PDF 필수 요구사항

### R1. 4개 컴포넌트로 분리

1. `WeatherParent.vue`
   - 모든 반응형 데이터를 유지한다.
   - 검색 필터링, 상태 감시, 카드 선택 결과 반영, 상세보기 로직을 관리한다.
2. `BaseDashboardCard.vue`
   - 검색 박스와 날씨 목록 박스에 공통으로 쓰이는 디자인을 담당한다.
   - `<slot>`을 배치해 부모가 검색 영역과 날씨 현황 영역을 주입할 수 있게 한다.
3. `SearchBar.vue`
   - 부모의 검색어를 `props`로 전달받아 입력창과 현재 검색어에 표시한다.
   - 입력 시 `update-query` 이벤트로 변경된 검색어를 부모에게 전달한다.
4. `WeatherCard.vue`
   - 표시할 도시 날씨 객체를 `props`로 전달받는다.
   - 카드 선택 시 `select-card` 이벤트를 부모에게 전달한다.
   - 상세보기 클릭 시 `click-detail` 이벤트를 부모에게 전달한다.

### R2. 기능 변경 없이 유지

- 빈 검색어일 때 서울, 성남, 부산, 천안 전체 목록을 표시한다.
- 도시 이름 일부 또는 전체를 입력하면 일치하는 카드만 표시한다.
- 일치하는 도시가 없으면 빈 결과 안내를 표시한다.
- 카드를 선택하면 선택 스타일과 하단 상태바 문구가 변경된다.
- 상세보기 버튼을 누르면 해당 도시의 현재 날씨를 알림으로 표시한다.
- 상세보기 클릭이 카드 선택 이벤트까지 중복 발생시키지 않도록 한다.
- 기존 `computed`, `watch`, `watchEffect` 동작과 콘솔 로그를 유지한다.

### R3. 컴포넌트별 스타일 분리

- 각 컴포넌트가 담당하는 디자인을 해당 파일의 `<style scoped>`로 옮긴다.
- 부모는 페이지 전체 배치, 헤더, 상태바를 담당한다.
- `BaseDashboardCard`는 공통 패널 외곽 디자인을 담당한다.
- `SearchBar`는 검색 제목, 입력창, 검색어 표시 디자인을 담당한다.
- `WeatherCard`는 카드, 선택 상태, 온도 배지, 상세보기 버튼 디자인을 담당한다.

### R4. 슬롯의 스코프 이해 및 적용

- `SearchBar`와 `WeatherCard`는 화면상 `BaseDashboardCard` 안에 배치한다.
- 두 컴포넌트는 `WeatherParent`의 템플릿에서 슬롯 콘텐츠로 작성한다.
- 따라서 `WeatherParent`가 각 자식의 props와 이벤트를 직접 바인딩한다.
- `BaseDashboardCard`는 주입된 콘텐츠의 데이터나 이벤트를 중계하지 않고 공통 레이아웃만 제공한다.

## 3. 파일 구성

새 실습은 이전 결과물과 섞이지 않도록 별도 폴더에 구성한다.

| 파일 | 역할 |
| --- | --- |
| `src/components/practices/components_day2_1/WeatherParent.vue` | 상태·계산·감시·이벤트 처리 및 전체 조립 |
| `src/components/practices/components_day2_1/BaseDashboardCard.vue` | 슬롯을 제공하는 공통 패널 |
| `src/components/practices/components_day2_1/SearchBar.vue` | 검색어 표시 및 입력 이벤트 전달 |
| `src/components/practices/components_day2_1/WeatherCard.vue` | 도시 날씨 표시 및 선택·상세 이벤트 전달 |
| `src/App.vue` | `WeatherParent`를 import하여 실습 화면 표시 |

보존할 이전 결과물:

- `src/components/practices/basic/weathermockup_day1.vue`
- `src/components/practices/composition/WeatherComposition_day2.vue`

## 4. 컴포넌트 통신 설계

| 흐름 | 전달 방식 | 데이터 또는 이벤트 |
| --- | --- | --- |
| `WeatherParent` → `SearchBar` | props | `currentQuery` 문자열 |
| `SearchBar` → `WeatherParent` | emits | `update-query`와 새 검색어 문자열 |
| `WeatherParent` → `WeatherCard` | props | `cityItem` 날씨 객체, 선택 상태 판별값 |
| `WeatherCard` → `WeatherParent` | emits | `select-card`와 선택된 도시 정보 |
| `WeatherCard` → `WeatherParent` | emits | `click-detail`과 도시명·날씨 상태 |
| `WeatherParent` → `BaseDashboardCard` | slot | 검색 영역 또는 날씨 목록 영역 |

### 부모가 유지할 상태와 로직

- 반응형 상태: `weatherList`, `searchQuery`, `selectedCity`, `selectedCityInfo`
- 계산된 목록: `filteredWeatherList`
- 감시 로직: `watch(selectedCityInfo)`, `watchEffect(searchQuery)`
- 이벤트 처리:
  - 검색어 갱신
  - 도시 선택 및 상태바 갱신
  - 상세보기 알림 표시

### 자식 컴포넌트 작성 원칙

- props는 직접 수정하지 않는다.
- 자식의 사용자 동작은 등록된 커스텀 이벤트로만 부모에게 전달한다.
- props의 자료형과 필수 여부를 명시한다.
- 이벤트 이름은 PDF의 `update-query`, `select-card`, `click-detail`을 그대로 사용한다.
- `WeatherCard`의 상세보기 버튼에는 이벤트 버블링 방지 처리를 유지한다.

## 5. 작업 순서

1. `components_day2_1` 폴더와 4개의 컴포넌트 파일을 만든다.
2. 기존 Day 2의 상태, `computed`, `watch`, `watchEffect`, 처리 함수를 `WeatherParent.vue`로 옮긴다.
3. 공통 패널 마크업과 스타일을 `BaseDashboardCard.vue`로 옮기고 `<slot>`을 배치한다.
4. 검색 UI를 `SearchBar.vue`로 옮긴 뒤 `currentQuery` prop과 `update-query` emit을 연결한다.
5. 날씨 카드 UI를 `WeatherCard.vue`로 옮긴 뒤 날씨 객체 prop, 선택 상태 prop, 두 이벤트를 연결한다.
6. `WeatherParent.vue`에서 두 개의 `BaseDashboardCard`에 검색 영역과 목록 영역을 각각 슬롯으로 주입한다.
7. 빈 검색 결과 안내와 상태바는 부모의 계산 결과 및 상태에 연결한다.
8. 기존 CSS를 각 컴포넌트의 책임에 맞게 `<style scoped>`로 분리한다.
9. `App.vue`가 새 `WeatherParent.vue`를 표시하도록 변경한다.
10. 빌드, 화면 동작, 이벤트, 콘솔을 검증한 뒤 아래 체크리스트에 결과를 반영한다.

## 6. 요구사항 충족 체크리스트

> 계획 단계에서는 모두 미체크 상태로 두고, 실제 구현 및 검증이 끝난 항목만 `[x]`로 변경한다.

### 사전 보존 및 파일 구성

- [x] Day 1 파일이 수정 없이 보존되어 있다.
- [x] Day 2 `WeatherComposition_day2.vue`가 수정 없이 보존되어 있다.
- [x] 새 실습이 별도 `components_day2_1` 폴더에 작성되어 있다.
- [x] `WeatherParent.vue`, `BaseDashboardCard.vue`, `SearchBar.vue`, `WeatherCard.vue` 4개 파일이 존재한다.
- [x] 파일명과 import 이름이 PascalCase로 일치한다.

### R1 - WeatherParent.vue

- [x] `weatherList`, `searchQuery`, `selectedCity`, `selectedCityInfo`가 부모에 있다.
- [x] `filteredWeatherList` computed가 부모에 있다.
- [x] `watch`와 `watchEffect`가 부모에서 기존 동작을 유지한다.
- [x] 검색어 변경, 카드 선택, 상세보기 이벤트를 부모가 처리한다.
- [x] 부모가 3개의 자식 컴포넌트를 import하고 정상적으로 조립한다.

### R1 - BaseDashboardCard.vue 및 slot

- [x] 공통 패널 컴포넌트에 `<slot>`이 배치되어 있다.
- [x] 검색 영역과 날씨 목록 영역에 같은 공통 패널을 재사용한다.
- [x] 검색 UI가 첫 번째 패널 슬롯에 정상 주입된다.
- [x] 날씨 제목·카드 목록·빈 결과가 두 번째 패널 슬롯에 정상 주입된다.
- [x] 공통 패널이 자식들의 props나 emits를 불필요하게 중계하지 않는다.

### R1 - SearchBar.vue의 props / emits

- [x] 부모의 현재 검색어를 문자열 prop으로 받는다.
- [x] prop 값을 입력창과 `검색 중인 도시` 문구에 표시한다.
- [x] 사용자가 입력하면 `update-query` 이벤트가 발생한다.
- [x] `update-query` 이벤트에 최신 입력 문자열이 담긴다.
- [x] 부모가 이벤트를 받아 `searchQuery`를 갱신한다.
- [x] 자식이 prop을 직접 수정하지 않는다.

### R1 - WeatherCard.vue의 props / emits

- [x] 각 도시 날씨 객체를 필수 object prop으로 받는다.
- [x] 도시명, 날씨 상태, 기온, 온도 배지를 prop 값으로 표시한다.
- [x] 현재 선택 여부를 전달받아 선택 스타일을 유지한다.
- [x] 카드 클릭 시 `select-card` 이벤트가 발생한다.
- [x] 부모가 `select-card`를 받아 선택 도시와 상태바를 갱신한다.
- [x] 상세보기 클릭 시 `click-detail` 이벤트가 발생한다.
- [x] `click-detail`에 도시명과 날씨 상태가 전달된다.
- [x] 상세보기 버튼 클릭 시 `select-card`가 중복 발생하지 않는다.

### R2 - 기존 기능 회귀 테스트

- [x] 최초 화면에 서울, 성남, 부산, 천안 카드가 모두 표시된다.
- [x] 빈 검색어 또는 공백만 입력하면 전체 카드가 표시된다.
- [x] `성`처럼 일부 글자를 검색해도 성남 카드가 표시된다.
- [x] `천안`을 검색하면 천안 카드만 표시된다.
- [x] 존재하지 않는 도시를 검색하면 빈 결과 안내가 표시된다.
- [x] 검색어를 지우면 전체 카드가 즉시 복원된다.
- [x] 카드를 선택하면 선택 스타일과 상태바 문구가 변경된다.
- [x] 상세보기 버튼에 해당 도시와 날씨 상태가 표시된다.
- [x] `watch`가 상태바 변경을 콘솔에 기록한다.
- [x] `watchEffect`가 초기 실행 및 검색어 변경을 콘솔에 기록한다.

### R3 - 스타일 및 품질

- [x] 네 컴포넌트의 담당 스타일이 각 파일의 `<style scoped>`로 분리되어 있다.
- [x] 기존 화면의 레이아웃과 시각적 상태가 컴포넌트 분리 전과 동일하게 유지된다.
- [x] 검색 결과가 0개 또는 1개여도 레이아웃이 깨지지 않는다.
- [x] 브라우저 콘솔에 Vue 경고나 렌더링 오류가 없다.
- [x] `npm run build`가 성공한다.

## 7. 완료 기준

- PDF 158페이지에서 요구한 4개 컴포넌트 분리, props, emits, slot, scoped style을 모두 적용한다.
- 분리 전 Day 2의 검색·선택·상세보기·감시 기능에 회귀가 없다.
- 빌드와 브라우저 수동 테스트를 통과한다.
- 구현 완료 후 체크리스트의 각 항목을 실제 검증 결과에 따라 갱신한다.
