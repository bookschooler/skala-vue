# 최종 프로젝트 계획 - 날씨요정 (WEATHER FAIRY)

> 화면 디자인·인터랙션의 확정 사항은 [pjt*design*계획.md](./pjt_design_계획.md)에서 별도로 관리한다.

## 1. 과제 해석

- 원본: `2) Full-stack Engineering_3.Frontend-framework_Vue.js_강병호_0729.pdf`
- 확인한 모든 `[실습] 과제` 페이지: **98, 126, 158, 176, 191, 209, 228, 250, 274페이지**
- 목표: PDF의 모든 일차별 요구를 **단계적으로 적용하고 최종 화면에 통합**한 뒤, 그 기반 위에 평일/주말 의사결정 UI, 관심 도시, 날씨별 착장처럼 더 아름답고 기능적이며 참신한 개선을 포함한 하나의 완성 프로젝트로 만든다.
- 기준 프로젝트: 루트 Vue 앱 (`src/`). 하위 독립 프로젝트와 초기 실습 파일은 참고·보존 대상으로 두며, 최종 화면의 기능을 위해 무조건 삭제하거나 덮어쓰지 않는다.
- 상태 표기 원칙
  - `[x]` 코드 또는 명령 결과로 반영 사실을 확인함
  - `[ ]` 아직 구현하지 않았거나, 실제 브라우저·배포 환경에서 확인이 남음
  - `주의`는 과제 원문 간 충돌 또는 최종 제출 전에 반드시 확인할 사항

### 과제 추적표

| ID  | PDF 페이지 | 직접 요구                                                                   | 현재 판정                                                                                 |
| --- | ---------: | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| R1  |         98 | 날씨 Mockup - 렌더링, 조건부 표시, 검색, 카드/상세 이벤트                   | 코드 보존 완료                                                                            |
| R2  |        126 | Composition API - `ref`, `computed`, `watch`, `watchEffect`, 검색 결과 상태 | 코드 보존 완료                                                                            |
| R3  |        158 | 4개 컴포넌트 분리, Props/Emits/Slot/Scoped CSS                              | 코드 보존 완료                                                                            |
| R4  |        176 | Router, 지연 로딩, 동적 상세, 404, 소개 화면                                | 공통 메뉴·상세·404까지 브라우저 재검증 완료                                               |
| R5  |        191 | Pinia 단위 Store와 전역 단위 전환                                           | 홈 상단 제어 영역의 `UnitToggler`와 모든 온도 표기 연동 확인                              |
| R6  |        209 | Axios·OpenWeather 준비                                                      | Axios·키 환경 변수 준비 완료. 세부 요구 문구는 R5를 중복함                                |
| R7  |        228 | 3일차 과제에 Element Plus 적용                                              | 코드 반영 완료                                                                            |
| R8  |        250 | 메뉴와 활용 API를 추가해 과제 확장                                          | OpenWeather 검색·현재·5일 예보와 `/forecast`의 Open-Meteo 장기 예보를 브라우저에서 확인함 |
| R9  |        274 | ESLint, 환경 변수·Git 제외, `dist` GitHub Pages 배포                        | GitHub Actions 성공 및 실제 Pages 동작 확인 완료                                          |

## 2. PDF 필수 요구사항

### R1. 날씨 Mockup - 98페이지

- `weatherList` 배열을 `v-for`로 반복 출력하고, 각 항목의 `id`를 `:key`에 바인딩한다.
- `temp >= 25`에는 `🔥 더움 (25도 이상)`, 그 외에는 `❄️ 선선함 (25도 미만)`을 조건부로 표시한다.
- 한글 도시 검색 입력을 `:value`, `@input`으로 연결하고 현재 입력값을 보여 준다.
- 카드 클릭 시 상태바에 `"{도시}이 선택되었습니다."`를 표시한다.
- 상세보기 클릭은 이벤트 버블링 없이 해당 도시 정보를 보여 준다. 초기 과제에서는 `window.alert`를 사용한다.

### R2. Composition API - 126페이지

- `searchQuery`, `selectedCityInfo`, `weatherList`를 반응형 상태로 둔다.
- `filteredWeatherList`를 `computed`로 만들고, 도시 이름 포함 검색을 구현한다.
- `watch(selectedCityInfo)`와 `watchEffect(searchQuery)`로 변화 로그를 남긴다.
- 검색어가 비었을 때, 결과가 있을 때, 결과가 없을 때를 각각 화면에 표시한다.

### R3. 컴포넌트 분리 - 158페이지

- 기능을 바꾸지 않고 `WeatherParent.vue`, `BaseDashboardCard.vue`, `SearchBar.vue`, `WeatherCard.vue` 4개로 분리한다.
- 부모는 반응형 데이터를 보유하고, `BaseDashboardCard`는 `<slot>`으로 검색·목록 영역의 공통 디자인을 제공한다.
- `SearchBar`는 Props로 검색어를 받고 `update-query` Emits로 부모에 전달한다.
- `WeatherCard`는 도시 객체와 선택 상태를 Props로 받고, `select-card`·`click-detail` Emits로 부모와 통신한다.
- 각 컴포넌트의 디자인은 `<style scoped>`로 분리한다.

### R4. Vue Router - 176페이지

- `main.js`에서 Router를 전역 등록하고, `App.vue`에는 `RouterLink` 기반 내비게이션과 `RouterView`를 둔다.
- 라우트는 Lazy Loading과 Catch-all Route를 사용한다.
- 홈에서 상세 버튼 클릭 시 `window.alert` 대신 `router.push('/weather/' + id)`로 이동한다.
- `WeatherDetailView`는 `:cityId` 동적 경로로 도시별 상세 정보를 보여 준다.
- `WeatherAboutView`에는 서비스 소개와 홈 복귀 경로를 둔다.

### R5. Pinia Store - 191페이지

- `stores/configStore.js`에 기본값 `celsius`인 `unit` 상태를 둔다.
- `unitSymbol` Getter는 `℃` 또는 `℉`를 반환한다.
- `toggleUnit` Action은 `celsius`와 `fahrenheit`를 토글한다.
- `UnitToggler.vue`를 내비게이션 바 옆에 배치하고, 홈과 상세의 온도 표시를 함께 바꾼다.

### R6. Axios 날씨 데이터 연동 - 209페이지

- Axios를 설치하고 OpenWeatherMap API 가입·키 발급을 준비한다.
- **주의:** 페이지 제목과 준비 항목은 Axios·OpenWeather인데, 세부 요구 1~3은 191페이지의 `UnitToggler` 문구가 그대로 반복되어 있다.
- 따라서 원문의 직접 충족 기준은 **Axios 설치와 키 환경 변수 준비**이며, 실제 무료 날씨 API 화면 연동은 R8의 확장 구현으로 분리해 추적한다.

### R7. Element Plus - 228페이지

- 3일차 누적 과제에 Element Plus를 자유롭게 적용한다.
- 단순 설치가 아니라 사용자가 조작하는 메뉴, 입력, 카드, 버튼, 로딩·오류·빈 상태 중 여러 곳에 실제 컴포넌트를 적용한다.

### R8. 과제 확장 - 250페이지

- 기존 메뉴에 새 메뉴를 추가한다.
- 기존 API 외에 활용 API를 하나 추가해 기능을 확장한다.
- 메뉴·API 이름은 명시되지 않았으므로, 날씨 도메인을 유지하는 **장기 예보 메뉴 + Open-Meteo Forecast API**로 정한다. OpenWeather Axios Service는 키 환경 변수 예시가 아니라 홈·상세의 실제 검색·현재·단기 예보에 사용한다.

### R9. 완성·배포 - 274페이지

- ESLint로 제출 코드의 Error를 없앤다.
- API Key를 환경 변수로 관리하고 Git에 업로드하지 않는다.
- Build 후 생성된 정적 파일 `dist`를 GitHub Pages에 올려 Node.js 없이 호스팅한다.

## 3. 현재 구현과 파일 구성

| 파일                                                               | 현재 책임                                                                      | 연결 요구사항          |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------- |
| `src/components/practices/basic/weathermockup_day1.vue`            | Day 1 Mockup 원본 구현 보존                                                    | R1                     |
| `src/components/practices/composition/WeatherComposition_day2.vue` | `computed`·`watch`·`watchEffect` 실습 보존                                     | R2                     |
| `src/components/practices/components_day2_1/`                      | 부모·Slot·검색·카드의 4개 컴포넌트 실습 보존                                   | R3                     |
| `src/main.js`                                                      | Pinia, Router, Element Plus 전역 등록                                          | R4, R5, R7             |
| `src/App.vue`                                                      | 상세·예보·소개 화면의 공통 RouterLink 메뉴, `RouterView`                       | R4, R8                 |
| `src/router/index.js`                                              | Hash Router, Lazy Loading, 동적 상세, 404, 예보 경로                           | R4, R8, R9             |
| `src/views/WeatherHomeView.vue`                                    | 국내/해외 검색, 현재 날씨, 지도 이동·핀, 즐겨찾기, 상단 단위 전환, 재시도 상태 | R1, R2, R4, R5, R6, R7 |
| `src/views/WeatherDetailView.vue`                                  | 좌표/도시 ID 기반 상세 날씨, 5일 예보, 단위·즐겨찾기 전환                      | R4, R5, R6, R7         |
| `src/views/WeatherForecastView.vue`                                | 즐겨찾기 도시 선택, 최대 16일 예보, 요청 취소·오류·빈 상태                     | R5, R7, R8             |
| `src/services/openMeteoService.js`                                 | Axios 16일 일별·시간별·UV 응답 정규화                                          | R8                     |
| `src/services/openWeatherService.js`                               | Axios Geocoding·현재·5일/3시간 예보·대기질 응답 정규화                         | R6, R8                 |
| `src/stores/favoriteStore.js`                                      | 즐겨찾기 최대 12개·중복 방지·localStorage 영속화                               | 개선 기능              |
| `src/stores/configStore.js`                                        | 전역 온도 단위 상태·Getter·Action                                              | R5                     |
| `src/components/practices/store_day3_2/UnitToggler.vue`            | 공통 단위 전환 UI                                                              | R5, R7                 |
| `.env.example`, `.env.staging`, `.env.production`                  | 환경별 공개 설정 예시                                                          | R9                     |
| `.github/workflows/deploy-pages.yml`                               | lint → production build → Pages artifact 배포                                  | R9                     |
| `eslint.config.js`, `package.json`                                 | ESLint 설정과 검사·빌드 명령                                                   | R9                     |

### 보존·확장 원칙

1. `basic`, `composition`, `components_day2_1` 폴더는 각 일차 요구를 증명하는 실습 결과다. 최종 화면 기능과 중복되어도 삭제하지 않는다.
2. R4의 초기 상세 화면은 Mock Data를 쓰도록 되어 있지만, R6에서 실제 날씨 API가 도입되므로 최종 `WeatherDetailView`는 동일한 `cityId` 흐름을 유지한 채 API 데이터로 확장한다.
3. API 원본 온도는 섭씨로 유지하고, 화면 표시에만 Pinia의 단위 값을 적용한다.
4. `.env.local`과 `dist/`는 추적하지 않는다. 실제 API 키 값은 이 문서, 소스 코드, README 예시, 커밋에 절대 기록하지 않는다.

## 4. 최종 서비스 콘셉트 - 실습 누적형 완성 프로젝트

### 서비스 한 줄 정의

**날씨요정(WEATHER FAIRY) - 여행 전 국내·해외 도시의 현재 날씨와 예보를 탐색·저장·비교하는 여행 날씨 앱**

### 필수 과제와 개선 기능의 결합 원칙

| 단계          | 기능                                                                  | 최종 프로젝트에서의 역할                              |
| ------------- | --------------------------------------------------------------------- | ----------------------------------------------------- |
| 1단계: 기반   | 도시 검색, 현재 날씨, 상세, 단위 전환, 예보 메뉴/API, 오류 처리, 배포 | PDF 실습 요구를 최종 서비스의 뼈대로 통합             |
| 2단계: 개인화 | 관심 도시 즐겨찾기와 현지 시각                                        | 해외 친구·여행 도시를 모아 보는 사용자 요구           |
| 3단계: 차별화 | 평일/주말 모드 분리                                                   | 같은 예보 데이터를 서로 다른 의사결정 UI로 가공       |
| 4단계: 표현   | 날씨별 착장 캐릭터, 실내 대안                                         | 데이터 해석 결과를 아름답고 기억에 남는 방식으로 전달 |

- 1단계부터 4단계는 서로 별도 과제가 아니다. **최종 제출 화면에는 모든 단계가 함께 존재**해야 한다.
- 다만 구현과 검증은 기반 기능부터 진행한다. 하위 단계가 완성되지 않은 상태에서 디자인 기능이 기존 검색·라우팅·배포 동작을 깨뜨리지 않도록 하기 위함이다.

### 평일/주말 UI 설계

| 모드 | 사용자가 답을 얻는 질문                              | 입력·반응형 데이터                                     | 결과 UI                                          |
| ---- | ---------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| 평일 | 우산을 챙길까? 출퇴근 때 얼마나 덥거나 추울까?       | 선택 도시, 출퇴근 시간대, 3시간 예보의 강수·기온       | 한 줄 행동 알림, 시간대 카드, 날씨별 착장 캐릭터 |
| 주말 | 어느 도시가 나들이에 가장 좋을까? 비가 오면 뭘 할까? | 관심 도시 목록, 선택 날짜, 활동, 예보의 기온·강수·바람 | 도시 비교 점수, 시간대 타임라인, 실내 대안       |

- 모드는 단순히 오늘 요일만 보고 고정하지 않는다. 평일에도 다음 주말을 계획할 수 있도록 `계획 날짜` 또는 `평일/주말` 선택 상태를 둔다.
- 다음 단계에서는 Open-Meteo 장기 예보의 시간별 원본을 날짜·도시·시간대로 파생하고, 원본 배열을 직접 수정하지 않은 `computed` 필터·그룹·점수화를 적용한다.
- 추천 장소는 초기에는 `src/data/indoorRecommendations.js`의 도시별 정적 데이터로 시작한다. 별도의 장소 API는 필수 요구가 안정된 뒤에만 검토한다.

### 확정한 외부 API와 제출 방식

1. **시연 범위:** Day 1~3의 원본 실습 파일은 보존만 하고, 제출·발표에서는 최종 통합 화면만 직접 시연한다.
2. **도시 검색·현재·상세 단기 예보:** [OpenWeather Geocoding API](https://openweathermap.org/api/geocoding-api)의 `GET /geo/1.0/direct`로 좌표를 찾고, Current Weather·[5 day / 3 hour Forecast](https://openweathermap.org/forecast5)·Air Pollution API를 좌표로 요청한다. 해외 탭은 `KR` 결과를 제외한다.
3. **16일 예보와 실제 UV:** [Open-Meteo Forecast API](https://open-meteo.com/en/docs)의 16일 일별·시간별·`uv_index`를 좌표와 `timezone=auto`로 요청한다. OpenWeather 기본 현재/5일 API는 UV를 제공하지 않으므로 상세의 결측 UV는 `—`로 표시하고, 16일 예보에서만 실제 UV를 제공한다.
4. **비용·조건:** OpenWeather 요청에는 환경 변수 키가 필요하며, Open-Meteo는 16일 예보·UV 용도로만 쓴다. 상업 공개·운영으로 바뀌면 두 API의 최신 라이선스와 요청 제한을 다시 확인한다.
5. **실제 실행 API:** 홈의 국내·해외 검색과 현재 날씨, 상세의 현재·5일·대기질은 Axios를 통해 OpenWeather로 요청한다. `/forecast`의 전체 16일 예보·시간별·UV만 Open-Meteo로 요청한다.

## 5. 이후 구현 설계

### 상태와 데이터 흐름

```text
OpenWeather Geocoding + Current + 5일/3시간 + Air Pollution
        ↓
openWeatherService.js → 홈 / 상세 View의 ref 상태
        ↓
Open-Meteo Forecast (16일·시간별·UV)
        ↓
openMeteoService.js → /forecast View의 ref 상태
        ↓
computed: 선택 도시 · 날짜 · 활동 · 시간대별 필터 · 적합도 점수
        ↓
평일 행동 카드 / 주말 도시 비교 / 캐릭터·실내 대안 UI
```

- 국내 고정 도시는 기존 `cityCatalog`을 유지한다. 해외 검색은 OpenWeather Geocoding 결과를 `{ id, name, country, countryCode, lat, lon, timezone }`로 정규화한다. 이후 현재 날씨·예보 요청은 도시명 대신 좌표를 우선 사용한다.
- `favoriteCities`: 국내 고정 도시는 ID만, 해외 도시는 최소 도시 메타데이터까지 Pinia Store와 `localStorage`에 저장한다.
- `selectedPlanDate`, `selectedActivity`, `selectedMode`: 주말 계획 화면의 반응형 입력 상태다.
- `hourlyForecasts`: 16일 전체 예보 화면은 Open-Meteo의 시간별 원본을, 상세 화면은 OpenWeather 5일/3시간 원본을 각각 화면에 필요한 형태로 정규화해 보관한다.
- `activityScore`: 강수확률, 강수량, 기온 범위, 풍속을 기준으로 0~100점으로 계산한다. 점수 기준과 문구는 코드 상수로 공개해 발표 때 설명 가능하게 한다.
- API 요청은 현재처럼 `AbortController`와 요청 ID를 유지해 도시를 빨리 바꿔도 이전 응답이 최신 화면을 덮지 않게 한다.
- 즐겨찾기는 최대 개수를 정하고, 중복 ID·손상된 `localStorage` 값·저장 실패를 안전하게 처리한다. 동일 도시의 요청은 짧은 캐시 TTL을 두어 API 호출을 불필요하게 반복하지 않는다.
- 예보에 없는 날짜, 도시별 시간대, 결측 데이터, 동점 점수는 별도 빈 상태·동점 안내·점수 제외 규칙으로 처리한다.

### 예정 파일

| 파일                                                                 | 예정 작업                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------- |
| `src/stores/favoriteStore.js`                                        | 즐겨찾기 ID 추가·삭제·영속화                            |
| `src/services/openMeteoService.js`                                   | 좌표 기반 16일·시간별 `uv_index` 요청·정규화            |
| `src/services/openWeatherService.js`                                 | Geocoding·현재·5일/3시간 예보·대기질의 강수·시간 정규화 |
| `src/composables/useWeatherPlanner.js`                               | 날짜·활동별 예보 필터와 적합도 계산                     |
| `src/data/indoorRecommendations.js`                                  | 비 오는 날 도시별 실내 대안 정적 데이터                 |
| `src/views/WeatherForecastView.vue` 또는 새 `WeatherPlannerView.vue` | 평일/주말 모드 UI와 도시 비교                           |
| `src/components/weather/OutfitCharacter.vue`                         | 날씨 조건에 따른 착장 캐릭터·소품 렌더링                |
| `src/components/weather/FavoriteCityList.vue`                        | 관심 도시의 현재 날씨·현지 시간·빠른 이동               |

## 6. 구현 순서

1. 이 문서의 R1~R9 체크리스트에서 미완료인 **필수 요구 검증**을 먼저 끝낸다.
2. 실제 API 키를 넣은 상태에서 홈·상세·예보의 성공, 오류, 빈 결과, 빠른 도시 전환을 브라우저에서 확인한다.
3. OpenWeather Geocoding·현재·5일·대기질과 Open-Meteo 16일/UV의 역할 및 요청 제한을 문서화한다.
4. 즐겨찾기 Store와 `localStorage` 복원 기능을 추가한다. 해외 도시에는 Geocoding의 좌표·시간대 모델을 사용한다.
5. `/forecast`의 3시간 데이터를 활용해 평일 행동 카드와 주말 활동별 도시 비교를 만든다.
6. 비·강풍·실제 UV 조건에 따른 착장 캐릭터와 실내 대안을 붙인다.
7. 도시 전환 UI를 요청 중에도 조작 가능하게 유지한 뒤 Abort·요청 ID 동작을 시연하거나, 지연된 mock 응답을 쓰는 컴포넌트 테스트로 검증한다.
8. 모바일 320px, 키보드 조작, API 실패 상태를 다시 점검하고 `npm run lint`, `npm run build:production`을 통과시킨다.
9. GitHub Actions Secret과 Pages 설정 후 실제 배포 URL을 확인한다.

## 7. 요구사항 충족 체크리스트

### R1. Mockup - 98페이지

- [x] `weathermockup_day1.vue`에 `weatherList`의 `v-for`와 `:key="weather.id"`가 있다.
- [x] 25℃ 기준의 더움·선선함 조건부 라벨이 있다.
- [x] 한글 검색 입력의 `:value`·`@input`과 현재 입력값 표시가 있다.
- [x] 최종 홈 검색창도 `searchQuery`를 즉시 보여 주며, 예를 들어 `뉴욕` 입력 시 검색 결과와 별개로 `검색 중인 도시: 뉴욕`을 표시한다. 해외 탭은 `미국`·`일본`처럼 국가명만 입력해도 대표 도시 후보를 최대 5개 표시한다.
- [x] 카드 선택 상태바와 상세 버튼의 `@click.stop`이 있다.
- [x] 초기 실습 파일에서는 `window.alert`로 상세 안내를 보여 준다.
- [x] 이후 Router 단계의 최종 홈에서는 같은 선택 흐름을 API 도시 선택·상세 라우팅으로 확장했고, 상세 화면 이동을 브라우저에서 확인했다.

### R2. Composition API - 126페이지

- [x] `WeatherComposition_day2.vue`에 `searchQuery`, `selectedCityInfo`, `weatherList` 반응형 상태가 있다.
- [x] `filteredWeatherList`의 `computed` 검색과 빈 검색·일치·불일치 화면 상태가 있다.
- [x] `watch(selectedCityInfo)`와 `watchEffect(searchQuery)` 로그가 있다.
- [x] 실습 컴포넌트의 반응형 상태·감시 함수·템플릿 연결을 소스 기준으로 재점검했다.

### R3. 컴포넌트 - 158페이지

- [x] `components_day2_1`에 `WeatherParent`, `BaseDashboardCard`, `SearchBar`, `WeatherCard`가 분리되어 있다.
- [x] `BaseDashboardCard`가 `<slot>`으로 공통 박스를 제공한다.
- [x] `SearchBar`의 `currentQuery` Props와 `update-query` Emits가 있다.
- [x] `WeatherCard`의 도시·선택 Props와 `select-card`·`click-detail` Emits가 있다.
- [x] 각 실습 컴포넌트에 `<style scoped>`가 있다.
- [x] 부모 템플릿에서 검색·선택·상세 Emits를 모두 수신하는 연결을 소스 기준으로 재점검했다.

### R4. Router - 176페이지

- [x] `main.js`에 `app.use(router)`가 있고 `App.vue`에 메뉴와 `RouterView`가 있다.
- [x] `router/index.js`의 모든 View가 Lazy Loading이며 Catch-all Route가 마지막에 있다.
- [x] 홈 상세 버튼은 `router.push('/weather/' + cityId)` 흐름으로 이동한다.
- [x] `/weather/:cityId`, `/about`, NotFound 화면이 있다.
- [x] 초기 Mock 상세 요구는 R6의 실제 API 상세로 확장하되, `cityId` 기반 상세 흐름을 유지한다.
- [x] `/#/`, `/#/about`, `/#/weather/city_01`, `/#/없는경로` 직접 접근을 브라우저에서 재검증했다.

### R5. Pinia - 191페이지

- [x] `configStore`가 `unit`, `unitSymbol`, `toggleUnit`을 제공한다.
- [x] `UnitToggler`가 향후 내비게이션이 확장될 홈 상단 제어 영역에 있고, 즐겨찾기 핀 토글과 나란히 배치된다.
- [x] 홈 카드와 상세 화면이 동일한 Store 값에 따라 ℃/℉로 전환된다.
- [x] 홈에서 화씨로 바꾼 뒤 예보로 이동해 16일 카드가 ℉로 유지되는 것을 확인했고, 상세 화면에서도 ℃/℉ 전환과 5일 예보를 확인했다.

### R6. Axios - 209페이지

- [x] `axios` 패키지와 OpenWeatherMap Axios 클라이언트를 설치·구성했다.
- [x] OpenWeather 키는 `VITE_OPENWEATHER_API_KEY` 환경 변수에서만 읽도록 구성했다.
- [x] 세부 요구 문구가 R5의 `UnitToggler`를 중복한 것을 확인하고, 해당 UI 요구는 R5에서 충족했다.
- [x] OpenWeather 실제 요청·로딩·오류·재시도·요청 취소는 홈·상세에, Open-Meteo 장기 예보 요청은 `/forecast`에 제공한다.

### R7. Element Plus - 228페이지

- [x] `main.js`에서 Element Plus와 CSS를 전역 등록했다.
- [x] Element Plus를 검색·카드·버튼·아이콘·로딩·오류·빈 상태에 실제 적용했다.
- [x] 검색·카드·버튼·태그에 `el-input`, `el-card`, `el-button`, `el-tag`를 적용했다.
- [x] 로딩·오류·빈 결과에 `el-skeleton`, `el-alert`, `el-empty`를 적용했다.
- [x] 데스크톱 브라우저에서 검색, 카드, 버튼, 메뉴가 겹치지 않고 동작하는 것을 확인했다.

### R8. 메뉴/API 확장 - 250페이지

- [x] 공통 메뉴에 `장기 예보` 항목과 `/forecast` 라우트가 있다.
- [x] 홈·상세의 `fetchWeatherBundle`은 OpenWeather 현재·5일/3시간·대기질을 가져오고, `/forecast`는 `fetchLongRangeForecast` Open-Meteo API로 16일 데이터를 가져온다.
- [x] 일별 응답을 최대 16일 예보 카드로 표시하고 강수 확률·최고 UV를 함께 제공한다.
- [x] 예보 화면에 도시 선택, 로딩, 오류, 빈 데이터, 단위 변환이 있다.
- [x] 즐겨찾기 도시로 예보를 요청해, API가 온전하게 반환한 15일 카드가 브라우저에 렌더링되는 것을 확인했다. 값이 `null`인 16일째 행은 0℃로 잘못 표시하지 않고 제외한다.
- [x] 요청 취소와 요청 ID로 오래된 응답을 차단하는 구현을 소스 기준으로 확인했다. 지연 mock을 이용한 별도 회귀 시험은 개선 기능 검증으로 분리한다.

### R9. 린트·환경 변수·배포 - 274페이지

- [x] `npm run lint`가 Oxlint와 ESLint를 함께 실행하도록 구성되어 있으며 최근 통과했다.
- [x] `npm run build`, `npm run build:staging`, `npm run build:production`이 최근 통과했다.
- [x] API 키는 `import.meta.env.VITE_OPENWEATHER_API_KEY`로 읽고, `.env.local`은 `*.local` 규칙으로 Git 제외된다.
- [x] 앱은 Vite 공개 환경 변수 `VITE_OPENWEATHER_API_KEY`만 읽는다. Actions는 비공개 Secret `OPENWEATHER_API_KEY`를 이 변수로 주입해, Secret 값과 번들 변수의 역할을 분리한다.
- [x] `.env.staging`·`.env.production`의 환경 표시값을 실제 용도에 맞게 `VITE_APP_ENV`로 정정했다.
- [x] `deploy-pages.yml`에 `npm ci` → lint → production build → artifact → deploy 순서가 있다.
- [x] GitHub 저장소 Actions Secret `OPENWEATHER_API_KEY`를 등록하고, 빌드 환경의 `VITE_OPENWEATHER_API_KEY`로 주입한다.
- [x] GitHub Pages Source를 `GitHub Actions`로 설정했다.
- [x] `main` push 후 Actions 성공 로그와 실제 Pages URL에서 홈·상세·예보·404를 확인했다. 배포 주소: `https://bookschooler.github.io/skala-vue/`

### 최종 프로젝트 개선 체크리스트 - R1~R9과 함께 최종 제출 전 완료

- [x] 관심 도시 추가·삭제와 `localStorage` 복원을 담당하는 Pinia Store를 만들었다.
- [x] OpenWeather Geocoding 결과의 도시명·국가·국가 코드·좌표·시간대를 저장하고, 동일 도시 중복을 막는다.
- [ ] 해외 도시를 포함한 관심 도시 카드에 현지 시각·현재 날씨를 표시한다.
- [ ] 손상된 `localStorage`, 저장 실패, 최대 개수 초과, 중복 즐겨찾기에 대한 안전한 안내를 표시한다.
- [x] 동일 좌표의 현재 날씨는 90초 TTL, 원격 도시 검색은 10분 TTL 캐시를 사용해 반복 선택·검색의 API 재요청을 줄인다.
- [x] 홈의 현재 날씨·지도 핀 툴팁·즐겨찾기 미니 카드에 OpenWeather 상태 코드를 WMO 호환 아이콘으로 정규화해 표시하고, 미니 카드의 정적인 별표는 제거한다.
- [ ] 검색·예보 API의 전체 요청 수 제한과 초과 시 안내 정책을 사용자 흐름까지 포함해 확정한다.
- [ ] 평일 모드에서 출퇴근 시간대 강수·기온을 요약한다.
- [ ] 주말 모드에서 활동·날짜·도시별 적합도를 3시간 예보 데이터로 계산한다.
- [ ] 예보 범위 밖 날짜, 시간대가 다른 도시, 결측 예보, 동점 점수에서 일관된 결과·빈 상태를 표시한다.
- [ ] 비가 오는 도시에는 도시별 실내 대안을 표시한다.
- [ ] 시간별 실제 `uv_index`에 따라 선글라스·모자 등 자외선 차단 착장이 바뀌는 캐릭터를 표시한다.
- [ ] 키보드만으로 즐겨찾기 추가·삭제, 모드 변경, 도시 상세 이동을 완료할 수 있다.
- [ ] 카드 전체 클릭과 카드 내부 상세 버튼처럼 중첩된 상호작용이 키보드·스크린리더에서 혼동되지 않도록 점검한다.
- [ ] 점수 계산 기준, 사용 API, 반응형 데이터 흐름을 발표 자료에 설명한다.

### 홈 핵심 흐름 회귀 확인 - 2026-08-05

- [x] 국내 주요 여행·광역 도시와 시작 도시(예: `부산`, `제주`)는 한 글자부터 로컬 반응형 목록에서 즉시 검색 결과로 표시한다. 같은 도시의 중복 Geocoding 결과는 표시하지 않는다.
- [x] 등록되지 않은 도시·지역은 두 글자부터 OpenWeather Geocoding을 요청하고, 이전 검색 요청은 취소해 오래된 결과가 최신 입력을 덮지 않게 한다.
- [x] 검색 결과를 선택하면 선택 도시 핀이 740ms 전환으로 지도 뷰포트 중앙에 오도록 하고, 핀과 지도 중앙 좌표를 브라우저에서 확인했다.
- [x] 선택 직후 지도 위에 도시·로딩 상태·즐겨찾기·상세보기 카드가 즉시 보이고, 실제 현재 날씨 응답이 오면 온도·체감·습도·풍속으로 갱신된다.
- [x] 로딩 중 `null` 온도가 `0℃`로 잘못 표시되지 않도록 `—`와 `날씨 불러오는 중` 상태로 분리했다.
- [x] 국내 `독도`·`문경`·`대전`과 해외 `마다가스카르`·`고아(인도)`를 국내/해외 토글에서 각각 즉시 검색·선택하고 실제 현재 날씨 카드까지 브라우저로 확인했다. 마다가스카르와 고아는 넓은 지역이므로 국가 중심·파나지 기준을 결과에 명시한다.

## 검토 반영 기록

- 초기 일차 실습 파일과 현재 최종 화면을 구분해, 초기 과제를 보존하면서 이후 API·Router·Element Plus 확장을 허용하는 추적 구조로 정리했다.
- 209페이지의 Axios/Pinia 중복 문구는 누락하지 않고 원문 주의 사항과 최종 프로젝트 해석을 함께 기록했다.
- 코드 존재만으로 실제 API·GitHub Pages가 완료되었다고 판단하지 않고, 사용자 키·저장소 설정이 필요한 검증 항목은 미체크로 남겼다.
- 독립 프론트엔드 검토를 반영해 해외 검색의 Geocoding·좌표 모델, UV 데이터 한계, 도시 전환 검증 방법, 환경 변수의 실제 용도, 확장 기능의 데이터·접근성 예외를 추가했다.
- 사용자 결정에 따라 초기 실습 화면은 보존만 하고 최종 통합 화면만 시연한다. 검색·현재·상세 5일 예보는 OpenWeather로, 16일 전체 예보와 UV는 Open-Meteo로 구현하도록 확정했다.
- 2026-08-05 원문 재대조에서 `App.vue`의 공통 메뉴·`UnitToggler` 마운트 누락과 `el-menu` 사용이라는 잘못된 기록을 바로잡았다. 홈의 확정된 지도 레이아웃은 보존하고, 상세·예보·소개에 공통 메뉴를 배치했다.
- 같은 재대조에서 209페이지의 실제 요구가 Axios·OpenWeather 준비이며 세부 문구가 R5를 중복함을 명시했다. 장기 예보 API는 250페이지 확장 항목으로 분리했고, 값이 비어 있는 마지막 예보 행은 0℃로 표시하지 않도록 수정했다.
- 2026-08-05 실제 홈 시나리오에서 검색 결과가 원격 응답까지 지연되고, 선택 날씨 카드가 지도 아래에 있어 보이지 않는 문제를 재현했다. 시작 도시 즉시 검색, 90초 현재 날씨 캐시, 선택 도시 요청 우선 처리, 지도 안 카드 배치로 수정한 뒤 `부산` 검색·선택·중앙 이동·실제 날씨 갱신을 다시 확인했다.
- 2026-08-05 네온 지도 원본은 일반 직사각형 지도보다 경도가 중앙으로 압축되어 있어 도쿄 핀이 바다 쪽으로 밀렸다. 좌표 투영을 원본 대륙 윤곽에 맞춰 보정하고, 시드니는 남반구 앵커 좌표를 별도로 적용했다. 국내 즉시 검색 목록도 주요 여행·지역 도시까지 확장했다.

## 8. 완료 기준

다음 조건이 모두 충족되면 최종 제출 가능 상태다.

1. R1~R9의 체크리스트가 실제 실행 증거에 따라 모두 `[x]`다.
2. `.env.local`과 API 키는 Git 기록·소스·배포 로그에 노출되지 않는다.
3. 유효 키, 키 누락, API 실패, 빈 검색, 알 수 없는 경로, 단위 전환, 모바일 화면을 확인했다.
4. GitHub Pages의 실제 URL에서 Hash Router의 홈·상세·예보 화면이 동작한다.
5. 평일/주말·즐겨찾기·실제 UV 캐릭터 같은 개선 기능까지 통합하고, OpenWeather/Open-Meteo 출처 표기·요청 제한을 지킨 뒤 다시 lint·build·배포 검증을 통과한다.
