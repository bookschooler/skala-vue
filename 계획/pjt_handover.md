# 날씨요정(WEATHER FAIRY) 작업 인계서

> 최종 갱신: 2026-08-05
> 기준 경로: `/Users/yunsoyoung/skala-workspace/SKALA-FRONT/Vue`
> 상세 과제 추적: [pjt_계획.md](./pjt_계획.md) · 디자인 합의: [pjt_design_계획.md](./pjt_design_계획.md)

## 1. 프로젝트 상태 요약

여행자를 위한 국내·해외 날씨 앱 **날씨요정**의 최종 통합 Vue 화면을 구현 중이다. 현재는 과제 PDF의 핵심 기반 기능(검색, Router, Pinia 단위 전환, Axios, Element Plus, 장기 예보)을 최종 화면에 통합했고, 네온 세계 지도와 즐겨찾기 중심의 홈 화면을 완성했다.

현재 실행 API는 역할을 나눠 사용한다. **OpenWeather**가 국내·해외 도시 검색, 현재 날씨, 상세의 5일 예보와 대기질을 제공하며 `VITE_OPENWEATHER_API_KEY`가 필요하다. **Open-Meteo**는 전체 예보 화면의 16일 달력·시간별·UV 데이터만 제공한다.

## 2. 즉시 실행·검증 방법

```bash
npm install
npm run dev
```

- 로컬 개발 서버: Vite 기본 포트(`5173`)를 사용한다.
- Mock API는 최종 날씨 화면에 필수가 아니다. 필요할 때만 `npm run api` 또는 `npm run dev:all`을 쓴다.
- 최종 검사 명령:

```bash
npm run lint
npm run build:production
git diff --check
```

2026-08-05 기준 위 세 명령은 통과했다. Vite의 초기 JavaScript 번들 크기 경고(500KB 초과)는 남아 있으나 빌드 실패는 아니다.

## 3. 사용자에게 확정받은 제품·디자인 원칙

- 브랜드: `WEATHER FAIRY` (좌측 상단, `FAIRY`를 더 크게).
- 톤: 딥 네이비 배경, 시안 네온 세계 지도, 선택/즐겨찾기만 바이올렛 강조.
- 홈 상단: `국내 / 해외` 검색 범위 토글과 도시 검색창. 별도 큰 탭 내비게이션은 두지 않는다.
- 홈 우측 상단: 텍스트 없는 **별 아이콘 버튼**. 즐겨찾기 핀을 지도에 표시/숨기는 토글이다.
- 하단 카드: 추천 도시가 아니라 즐겨찾기 도시만 표시한다. 랜드마크 이미지, 도시명, 현재 기온, 날씨 아이콘을 보여 준다.
- 검색 결과를 누르면 지도는 해당 도시를 향해 이동하고, 핀 오른쪽의 작은 네온 날씨 카드가 항상 열린다.
- 상세 페이지에는 카드 안의 온도 단위 토글 하나만 둔다. 공통 상단 메뉴의 중복 단위 토글은 제거했다.
- 전체 예보 캘린더에는 프레임 우측 상단의 `℃ / ℉` 단일 아이콘 토글을 둔다.
- 디자인의 큰 방향, 새 주요 화면·컴포넌트는 구현 전에 사용자 확인을 받는다. 버그 수정·검증은 바로 진행한다.

## 4. 현재 기능과 주요 파일

| 영역 | 구현 상태 | 핵심 파일 |
| --- | --- | --- |
| 홈 검색 | 국내/해외 분리, 즉시 자동완성, AbortController, 정확 일치 우선 정렬 | `src/views/WeatherHomeView.vue`, `src/services/openWeatherService.js` |
| 국내 도시 | 독도·문경·태안·안산 등 주요 국내 검색어 로컬 제공 | `src/data/cityCatalog.js` |
| 해외 도시 | OpenWeather Geocoding, 해외 탭에서 `KR` 결과 제외 | `src/services/openWeatherService.js` |
| 현재 날씨 | OpenWeather 좌표 기반 현재 날씨, 90초 캐시, API 상태 코드를 WMO 아이콘으로 정규화 | `src/services/openWeatherService.js`, `src/utils/weatherVisual.js` |
| 지도·핀 | 선택 도시 확대 이동, 즐겨찾기 핀 ON/OFF, 핀 보정 | `src/components/weather/FavoriteMap.vue`, `src/utils/mapPosition.js` |
| 즐겨찾기 | Pinia + localStorage, 최대 12개, 추가/해제 | `src/stores/favoriteStore.js` |
| 상세 | 현재 날씨·체감온도·습도·풍속·강수량·미세먼지·5일 예보. OpenWeather 기본 API에 없는 UV는 `—`로 표시 | `src/views/WeatherDetailView.vue`, `src/services/openWeatherService.js` |
| 전체 예보 | Open-Meteo 기반 16일 달력, 날짜 선택 시 시간별 예보·UV, 단위 토글 | `src/views/WeatherForecastView.vue`, `src/services/openMeteoService.js` |
| Router | Hash Router, Lazy Loading, 동적 상세, 소개, 404 | `src/router/index.js`, `src/App.vue` |
| 전역 단위 | Pinia `celsius` / `fahrenheit`, localStorage 저장 | `src/stores/configStore.js` |

### 최근 검색·선택 보정

- `대전`: 한글 조합 입력 종료(`compositionend`) 뒤 다음 틱에 다시 검색해 바로 단일 최상단 후보가 된다.
- `안산`: 로컬 도시로 추가했다. 국내 정확 일치 결과는 한 개만 보여 준다.
- `오사카`: 해외 탭의 OpenWeather Geocoding 결과에서 `오사카 · 일본`을 선택할 수 있다. 해외 탭에서는 `KR` 결과를 제외한다.
- 검색 결과를 클릭한 뒤 자동완성 목록이 다시 뜨지 않도록, 선택 뒤 입력값을 강제로 바꾸지 않는다.

### 지도 좌표 보정 방식

`img/weather-fairy-cyber-world-map-seamless.png`는 디자인용 정적 이미지라 일반 지도 투영과 해안선 비율이 완전히 같지 않다. 따라서 `mapPosition.js`에서 서울·대전·안산·태안·부산·경주·도쿄·오사카·파리·뉴욕·런던·로마·방콕·고아·마다가스카르·시드니 등 17개 기준점을 이미지 윤곽에 맞춰 고정했다. 그 외 검색 도시는 가까운 기준점의 보정값을 거리 가중 평균으로 적용한다.

새 도시의 핀이 어긋난다고 보고되면 다음 순서로 처리한다.

1. 실제 도시 좌표(위도·경도)와 OpenWeather Geocoding 결과의 `countryCode`를 확인한다.
2. 지도 원본을 기준으로 핀의 **끝점**이 도시가 있는 해안/국가에 놓이는지 확인한다.
3. 자주 검색되는 도시면 `mapCalibrationAnchors`에 이름·국가 코드·좌표·`left/top`을 추가한다.
4. 검색 도시를 클릭한 실제 브라우저 화면에서 카드와 핀이 겹치지 않는지 확인한다.

## 5. 최근 검증 결과

- 홈 첫 진입에서 OpenWeather의 서울 현재 날씨와 즐겨찾기 도시 현재 날씨를 확인했다.
- 국내 `대전` 입력 후 약 0.12초 안에 `대전 · 대한민국` 단일 후보가 렌더링되는 것을 확인했다.
- 국내 `안산`도 단일 후보를 확인했다.
- 해외 `오사카` 검색·선택 후 OpenWeather 현재 날씨 카드, 상세의 대기질·5일 예보를 확인했다. 실제 값은 시점에 따라 달라진다.
- OpenWeather 기본 API에서 제공하지 않는 상세 UV는 `0`으로 오인하지 않도록 `—`로 표시되는 것을 확인했다.
- 상세 페이지의 `온도 단위를 화씨로 변경` 버튼은 한 개만 남아 있는 것을 확인했다.
- 오사카의 `16일 전체 예보` 화면에서 Open-Meteo 일별·시간별·UV 데이터를 확인했다.
- 예보 페이지에서 `℃` 버튼을 눌러 `℉` 및 모든 일·시간별 기온이 함께 변환되는 것을 확인한 뒤 섭씨로 복원했다.
- `npm run lint`, `npm run build:production`, `git diff --check` 통과.

## 6. 남은 작업 우선순위

### 제출 전 필수

1. GitHub Actions Secret `VITE_OPENWEATHER_API_KEY`를 저장소에 등록한다.
2. GitHub Pages Source를 `GitHub Actions`로 설정한다.
3. `main` push 또는 수동 실행 뒤 실제 Pages URL에서 홈·상세·예보를 재검증한다. 이는 [pjt_계획.md](./pjt_계획.md)의 유일한 외부 완료 항목(R9)이다.
4. GitHub Pages에서 OpenWeather 키 주입 뒤 국내 `대전`·`안산`, 해외 `오사카`, 상세 5일 예보, Open-Meteo 16일 예보를 재검증한다.

### 사용자 확인 후 진행할 개선 기능

- 평일/주말 여행 모드와 여행 날짜 선택.
- 시간대별 강수·기온을 이용한 도시/활동 적합도 비교.
- 비·강풍·UV에 따른 착장 캐릭터와 도시별 실내 대안.
- 즐겨찾기 카드의 현지 시각, 0개/1~4개/5개 이상 상태, 자동 이동·일시정지 접근성.
- 320px 모바일, 키보드 자동완성, 네트워크 실패·API 제한 안내의 전체 QA.

### 알려진 주의점

- 정적 네온 지도는 실제 GIS 지도 라이브러리가 아니다. 현재 보정으로 자주 검색되는 도시는 맞췄지만, 전 세계 모든 좌표를 수학적으로 완벽히 일치시키려면 Leaflet/MapLibre 등 실제 지리 투영 지도로 바꾸는 선택이 필요하다. 이 변경은 큰 디자인 변경이므로 사용자 확인 후 진행한다.
- API 응답 시간은 네트워크와 OpenWeather/Open-Meteo 상태에 따라 달라진다. 로컬 도시는 즉시 후보를 보여 주며, 외부 Geocoding은 비동기로 이어진다.
- `.env.local`에는 실제 키가 있을 수 있다. 어떤 문서·소스·로그·커밋에도 값을 기록하거나 출력하지 않는다.

## 7. 작업 트리 주의사항

- 현재 작업 트리는 기존 사용자 변경과 이번 프로젝트 변경이 함께 섞인 **dirty worktree**다.
- 특히 삭제로 표시된 이전 루트 파일과 `skala-vue-동참녀ver/` 하위 파일은 이 작업과 무관할 수 있으므로 `git reset --hard`, 광범위한 checkout, 일괄 삭제를 하지 않는다.
- `tmp/`의 PDF 추출본·캡처·지도 검사 이미지는 작업용 산출물이다. 제출물에 넣을 필요가 없으면 커밋에서 제외한다.
- 최종 코드 변경은 `apply_patch`로 하고, 변경 뒤 `npm run lint && npm run build:production && git diff --check`를 실행한다.

## 8. 재개 체크리스트

- [ ] 사용자가 새 디자인/기능을 요청했는지 먼저 확인한다.
- [ ] 해당 요청이 큰 화면·지도 교체인지 판단해 필요하면 디자인 확인을 받는다.
- [ ] 검색·현재 날씨·상세·예보 중 영향 범위를 소스와 브라우저에서 재현한다.
- [ ] 변경 후 국내 `대전`, `안산` / 해외 `오사카`를 회귀 확인한다.
- [ ] 지도 관련 변경이면 서울·도쿄·오사카·파리·뉴욕·런던·방콕·시드니를 최소 점검한다.
- [ ] 최종 검사 명령과 실제 브라우저 흐름을 다시 확인한다.
