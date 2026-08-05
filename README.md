# WEATHER FAIRY · Sky Archive

> 여행을 떠나기 전, 도시의 날씨와 오늘의 하늘을 한 곳에서 기록하는 사이버 감성 날씨 서비스

[배포 페이지](https://bookschooler.github.io/skala-vue/#/) · [Today’s Sky](https://bookschooler.github.io/skala-vue/#/community)

`WEATHER FAIRY`는 단순히 기온을 보여 주는 데서 멈추지 않습니다. 네온 라인이 흐르는 세계 지도 위에서 여행 도시를 찾고, 즐겨찾기한 장소의 날씨를 빠르게 비교하며, 각자가 본 하늘 사진과 감정을 공유하는 경험을 만들었습니다.

## Theme & Design

- **Cyber Weather Map** — 어두운 우주 배경과 푸른 네온 지도, 중앙으로 이동하는 도시 핀으로 탐색 흐름을 명확하게 구성했습니다.
- **Weather Fairy** — 날씨 정보를 차갑고 복잡한 숫자 대신, 여행을 준비하는 사람에게 친절한 카드와 상태 문구로 전달합니다.
- **Today’s Sky Archive** — 오늘 본 하늘의 색, 구름, 감정을 사진과 함께 남기는 커뮤니티 공간입니다.
- **Responsive first** — 작은 화면에서도 지도·검색·날씨 카드·가로 시간별 예보를 자연스럽게 볼 수 있도록 반응형 레이아웃을 적용했습니다.

## What we built

### 1. 도시 검색과 지도 기반 날씨 탐색

- 국내/해외 탭으로 도시·지역을 검색하고, 국가명만 입력해도 대표 도시 후보를 확인할 수 있습니다.
- 검색한 도시는 SVG 세계지도 좌표계에 맞춰 **실제 위치에 핀으로 표시**됩니다.
- 선택한 도시는 지도 중앙으로 이동하고, 핀의 오른쪽에 현재 날씨 카드가 나타납니다.
- 검색 중, 결과 없음, API 오류, 재시도 등 각 상태를 별도 UI로 처리했습니다.

### 2. 즐겨찾는 여행 도시

- 첫 방문에는 서울, 뉴욕, 도쿄, 파리, 런던, 상하이, 홍콩을 즐겨찾기 도시로 제공합니다.
- 즐겨찾기 핀 토글을 켜면 지도에서 도시를 빠르게 훑을 수 있고, **호버는 미리보기 / 클릭은 선택 고정**으로 동작합니다.
- 별표를 해제하면 지도 핀과 카드가 즉시 사라지며, 상태는 Pinia와 `localStorage`로 유지됩니다.
- 섭씨/화씨 전환도 모든 날씨 카드와 예보 화면에 일관되게 반영됩니다.

### 3. 여행에 필요한 상세 예보

- 현재 날씨, 체감온도, 습도, 풍속, 강수량, 미세먼지(PM10), 자외선 지수를 제공합니다.
- 자외선·미세먼지·습도에는 `낮음`, `보통`, `쾌적` 같은 해석 가능한 등급을 함께 표시합니다.
- 현재 시점부터 **24시간을 1시간 간격**으로 한 줄 가로 스크롤 예보로 볼 수 있습니다.
- 5일 예보와 최대 16일 장기 예보를 분리해, 짧은 여행 준비와 장기 계획을 모두 지원합니다.

### 4. Today’s Sky 커뮤니티

- 하늘 사진, 장소, 제목, 생각과 감정, 촬영 시각, 해시태그를 기록해 게시할 수 있습니다.
- 하늘색 팔레트와 구름 양·형태를 골라 사진 속 하늘을 더 구체적으로 표현합니다.
- 날씨, 하늘색, 구름 양, 구름 형태, 해시태그로 게시물을 필터링할 수 있습니다.
- 10종 구름의 `i` 버튼에는 사진과 설명을 담은 도움말을 제공하며, 하단 항목에서도 이미지가 잘리지 않도록 고정 레이어로 표시합니다.
- 좋아요, 저장, 댓글 UI와 게시물 상세 보기를 제공합니다.

### 5. 간단하고 안전한 로그인 흐름

- 별도 회원가입 폼 대신 **Firebase Authentication + Google 로그인**을 적용했습니다.
- 방문자는 자신의 Google 계정으로 바로 시작할 수 있고, 로그인한 이름은 커뮤니티 기록과 댓글에 반영됩니다.

## Tech Stack

| 분야 | 사용 기술 |
| --- | --- |
| Frontend | Vue 3, Composition API, Vite |
| Routing | Vue Router (Hash History, Lazy Loading, 404) |
| State | Pinia, `localStorage` persistence |
| UI | Element Plus, scoped CSS, responsive layout |
| HTTP | Axios, request cancellation, response cache |
| Authentication | Firebase Authentication, Google Provider |
| Deployment | GitHub Actions, GitHub Pages static hosting |

## Weather Data

| 제공처 | 사용 목적 |
| --- | --- |
| OpenWeather | 도시 Geocoding, 현재 날씨, 5일 예보, PM10 대기질 |
| MET Norway Locationforecast | 상세 화면의 1시간 단위 예보와 UV |
| Open-Meteo | 최대 16일 일별 장기 예보, 요청 제한 시 앙상블 API 대체 |

API 요청은 Axios 서비스 레이어로 분리했고, 요청 취소·TTL 캐시·오류 안내로 빠른 도시 전환에도 이전 응답이 화면을 덮지 않도록 처리했습니다.

## Project Structure

```text
src/
├── api/          # Today’s Sky 게시물 API 클라이언트
├── components/   # 지도·온도 단위·빌드 정보 등 재사용 UI
├── data/         # 도시 목록과 커뮤니티 시드 데이터
├── router/       # Hash Router와 lazy-loaded routes
├── services/     # 날씨·인증 외부 API 연결
├── stores/       # 즐겨찾기·단위·인증·커뮤니티 상태
├── utils/        # 지도 좌표·날씨 등급·표현 로직
└── views/        # 홈·상세·장기예보·커뮤니티·로그인 화면
```
