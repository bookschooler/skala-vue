import assert from 'node:assert/strict'
import test from 'node:test'

import { defaultFavoriteCities } from '../src/data/cityCatalog.js'
import { getUpcomingHourly, normalizeMeteoHourly } from '../src/services/openMeteoService.js'
import { normalizeWeatherStatus, searchCities } from '../src/services/openWeatherService.js'
import { mapCountries, toMapPosition, toMapViewportPosition } from '../src/utils/mapPosition.js'
import { getPm10Level, getUvIndexLevel } from '../src/utils/weatherIndexLevel.js'

test('해외 국가명만 입력하면 대표 도시를 최대 다섯 개 반환한다', async () => {
  const cities = await searchCities('미국', { scope: 'global' })

  assert.deepEqual(
    cities.map((city) => city.name),
    ['뉴욕', '로스앤젤레스', '샌프란시스코', '시카고', '워싱턴 D.C.'],
  )
})

test('일본 국가명으로는 도쿄 외 대표 도시도 함께 반환한다', async () => {
  const cities = await searchCities('일본', { scope: 'global' })

  assert.deepEqual(
    cities.map((city) => city.name),
    ['도쿄', '오사카', '교토', '삿포로', '후쿠오카'],
  )
})

test('생소한 국가명도 대표 도시 목록으로 바로 검색된다', async () => {
  const brazilCities = await searchCities('브라질', { scope: 'global' })
  const madagascarCities = await searchCities('마다가스카르', { scope: 'global' })

  assert.deepEqual(
    brazilCities.map((city) => city.name),
    ['브라질리아', '상파울루', '리우데자네이루'],
  )
  assert.deepEqual(
    madagascarCities.map((city) => city.name),
    ['안타나나리보', '토아마시나', '안치라베'],
  )
})

test('Open-Meteo 시간별 응답은 1시간 예보와 UV를 정규화한다', () => {
  const forecast = normalizeMeteoHourly({
    time: ['2026-08-05T09:00'],
    temperature_2m: [21.4],
    apparent_temperature: [20.1],
    precipitation_probability: [25],
    precipitation: [0.4],
    wind_speed_10m: [14],
    uv_index: [3.2],
    weather_code: [0],
  })

  assert.deepEqual(forecast, [{
    dateTime: '2026-08-05T09:00',
    temp: 21.4,
    feelsLike: 20.1,
    precipitationProbability: 25,
    precipitation: 0.4,
    wind: 14,
    uvIndex: 3.2,
    weatherCode: 0,
    status: '맑음',
  }])
})

test('시간대별 예보는 현재 도시 시각부터 다음 24개만 반환한다', () => {
  const hourly = Array.from({ length: 39 }, (_, index) => ({
    dateTime: `2026-08-${index < 24 ? '05' : '06'}T${String(index % 24).padStart(2, '0')}:00`,
  }))

  const upcoming = getUpcomingHourly(hourly, '2026-08-05T15:00', 24)

  assert.equal(upcoming.length, 24)
  assert.equal(upcoming[0].dateTime, '2026-08-05T15:00')
  assert.equal(upcoming.at(-1).dateTime, '2026-08-06T14:00')
})

test('OpenWeather의 온흐림 표현은 기상청식 완전흐림으로 바꾼다', () => {
  assert.equal(normalizeWeatherStatus({ id: 804, description: '온흐림' }), '완전흐림')
  assert.equal(normalizeWeatherStatus({ id: 803, description: '튼구름' }), '흐림')
})

test('자외선 지수는 기상청 5단계 기준의 괄호 등급으로 변환한다', () => {
  assert.equal(getUvIndexLevel(2.8), '낮음')
  assert.equal(getUvIndexLevel(3), '보통')
  assert.equal(getUvIndexLevel(6), '높음')
  assert.equal(getUvIndexLevel(8), '매우높음')
  assert.equal(getUvIndexLevel(11), '위험')
  assert.equal(getUvIndexLevel(null), null)
})

test('PM10은 환경부·에어코리아 예보 등급으로 변환한다', () => {
  assert.equal(getPm10Level(30), '좋음')
  assert.equal(getPm10Level(56), '보통')
  assert.equal(getPm10Level(81), '나쁨')
  assert.equal(getPm10Level(151), '매우나쁨')
  assert.equal(getPm10Level(undefined), null)
})

test('시작 도시 전체 핀은 실제 SVG 세계지도와 같은 전역 투영·cover 좌표를 따른다', () => {
  const positions = Object.fromEntries(
    defaultFavoriteCities.map((city) => [
      city.name,
      toMapViewportPosition(toMapPosition(city), { width: 1920, height: 902 }),
    ]),
  )

  assert.deepEqual(positions, {
    서울: { left: '80.71%', top: '22.15%' },
    도쿄: { left: '84.15%', top: '23.44%' },
    파리: { left: '50.53%', top: '14.86%' },
    뉴욕: { left: '32.44%', top: '20.04%' },
    런던: { left: '49.97%', top: '13.26%' },
    방콕: { left: '76.65%', top: '39.45%' },
    시드니: { left: '87.32%', top: '75.30%' },
    로마: { left: '52.94%', top: '19.26%' },
  })
})

test('대륙별 15개 도시는 SVG 국가 윤곽과 같은 투영의 고정 좌표로 렌더링된다', () => {
  const cities = [
    ['서울', 37.5665, 126.978, '410'],
    ['부산', 35.1796, 129.0756, '410'],
    ['제주', 33.4996, 126.5312, '410'],
    ['뉴욕', 40.7128, -74.006, '840'],
    ['시카고', 41.8781, -87.6298, '840'],
    ['로스앤젤레스', 34.0522, -118.2437, '840'],
    ['파리', 48.8566, 2.3522, '250'],
    ['리옹', 45.764, 4.8357, '250'],
    ['니스', 43.7102, 7.262, '250'],
    ['상파울루', -23.5505, -46.6333, '076'],
    ['리우데자네이루', -22.9068, -43.1729, '076'],
    ['브라질리아', -15.7939, -47.8828, '076'],
    ['시드니', -33.8688, 151.2093, '036'],
    ['멜버른', -37.8136, 144.9631, '036'],
    ['브리즈번', -27.4698, 153.0251, '036'],
  ]

  const positions = Object.fromEntries(
    cities.map(([name, lat, lon]) => [name, toMapPosition({ lat, lon })]),
  )

  assert.deepEqual(positions, {
    서울: { left: '80.71%', top: '24.84%' },
    부산: { left: '81.64%', top: '26.32%' },
    제주: { left: '81.29%', top: '27.38%' },
    뉴욕: { left: '32.44%', top: '22.93%' },
    시카고: { left: '29.37%', top: '22.24%' },
    로스앤젤레스: { left: '20.84%', top: '27.03%' },
    파리: { left: '50.53%', top: '18.25%' },
    리옹: { left: '51.11%', top: '19.98%' },
    니스: { left: '51.69%', top: '21.16%' },
    상파울루: { left: '37.96%', top: '66.16%' },
    리우데자네이루: { left: '38.83%', top: '65.73%' },
    브라질리아: { left: '37.36%', top: '60.93%' },
    시드니: { left: '87.32%', top: '72.86%' },
    멜버른: { left: '85.01%', top: '75.31%' },
    브리즈번: { left: '88.91%', top: '68.75%' },
  })

  for (const [name, countryId] of [
    ['대한민국', '410'],
    ['미국', '840'],
    ['프랑스', '250'],
    ['브라질', '076'],
    ['오스트레일리아', '036'],
  ]) {
    const country = mapCountries.find((item) => item.id === countryId)
    assert.ok(country?.path.length > 100, `${name} 국가 윤곽 SVG 경로가 있어야 한다`)
  }
})

test('대한민국 윤곽은 SVG에 존재하고, 서울·경주는 한 투영 안에서 인접하게 계산된다', () => {
  const southKorea = mapCountries.find((country) => country.id === '410')
  assert.equal(southKorea?.name, 'South Korea')
  assert.ok(southKorea.path.length > 100)

  const seoul = toMapPosition({ lat: 37.5665, lon: 126.978 })
  const gyeongju = toMapPosition({ lat: 35.8562, lon: 129.2247 })
  assert.deepEqual(seoul, { left: '80.71%', top: '24.84%' })
  assert.deepEqual(gyeongju, { left: '81.56%', top: '25.90%' })
})

test('서울과 시드니도 화면 비율이 달라져도 SVG와 동일한 cover 좌표계를 사용한다', () => {
  const viewport = { width: 1280, height: 800 }
  const positions = Object.fromEntries(
    ['서울', '시드니'].map((name) => {
      const city = defaultFavoriteCities.find((item) => item.name === name)
      return [name, toMapViewportPosition(toMapPosition(city), viewport)]
    }),
  )

  assert.deepEqual(positions, {
    서울: { left: '86.91%', top: '24.84%' },
    시드니: { left: '94.86%', top: '72.86%' },
  })
})
