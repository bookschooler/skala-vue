# 날씨 대시보드 — 컴포넌트 실습 (p.156 기준)

강의 p.156(4장 Vue Component)까지의 누적 요구사항만으로 구성한 독립 실습 결과물입니다.
Router / Pinia / Axios / Element Plus는 이후 챕터 내용이므로 사용하지 않습니다.

## 실행

```bash
npm install
npm run dev   # http://localhost:5174 (메인 프로젝트 5173과 동시 실행 가능)
```

## 필수 요구사항 (단계 1~3 누적)

- `v-for` + `:key`(id) 카드 반복, `v-if` 더움/선선함(25℃ 기준) 라벨
- 한글 검색: IME 조합 이슈로 `v-model` 대신 `:value` + `@input`
- 카드 클릭 → 상태바 / [상세보기] `@click.stop`(버블링 차단) → alert
- `computed` 필터링, `watch`(선택 정보) / `watchEffect`(검색어) 콘솔 로그
- 컴포넌트 분리: **WeatherParent**(상태 단일 소유) / **BaseDashboardCard**(Slot) /
  **SearchBar**(props + `update-query` emit) / **WeatherCard**(props + `select-card`/`click-detail` emit)
- 컴포넌트별 `<style scoped>`

## 추가 구현 (요구사항 외 확장)

| 기능 | 학습 포인트 |
|---|---|
| ℃/℉ 단위 토글 (UnitToggle) | **provide/inject** — 부모가 provide한 단위 상태를 카드·통계·토글이 주입받음 |
| 요약 통계 카드 (WeatherStats) | props 파생 상태(computed), 도시 수·평균·최고·최저·더운 도시 수 |
| 정렬 + 날씨 필터 칩 | computed 파이프라인(검색 → 필터 → 정렬), **Named Slot**(`#extra`)로 카드 헤더에 배치 |
| 도시 추가/삭제 (CityForm) | `@submit.prevent`, `v-model.number/.trim` 수식어, 중복 검증, emit 통신 심화 |
| 파스텔 + 이모지 디자인 | 날씨 상태별 파스텔 카드 배경, 상태 이모지, hover 인터랙션 |

Mock 데이터는 전국 18개 도시로 확장했습니다.
