import assert from 'node:assert/strict'
import test from 'node:test'

import { defaultFavoriteCities } from '../src/data/cityCatalog.js'
import { searchCities } from '../src/services/openWeatherService.js'
import { toMapPosition, toMapViewportPosition } from '../src/utils/mapPosition.js'

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

test('시작 도시 전체 핀은 Equal Earth 배경과 같은 전역 투영·cover 좌표를 따른다', () => {
  const positions = Object.fromEntries(
    defaultFavoriteCities.map((city) => [
      city.name,
      toMapViewportPosition(toMapPosition(city), { width: 1920, height: 902 }),
    ]),
  )

  assert.deepEqual(positions, {
    서울: { left: '77.79%', top: '36.95%' },
    도쿄: { left: '81.52%', top: '37.95%' },
    파리: { left: '44.97%', top: '31.24%' },
    뉴욕: { left: '25.30%', top: '35.29%' },
    런던: { left: '44.36%', top: '30.00%' },
    방콕: { left: '73.38%', top: '50.46%' },
    시드니: { left: '84.97%', top: '78.48%' },
    로마: { left: '47.60%', top: '34.68%' },
  })
})

test('대한민국·미국·프랑스·브라질·호주의 도시 15개가 동일한 전역 투영으로 렌더링된다', () => {
  const cities = [
    ['서울', 37.5665, 126.978],
    ['부산', 35.1796, 129.0756],
    ['제주', 33.4996, 126.5312],
    ['뉴욕', 40.7128, -74.006],
    ['시카고', 41.8781, -87.6298],
    ['로스앤젤레스', 34.0522, -118.2437],
    ['파리', 48.8566, 2.3522],
    ['리옹', 45.764, 4.8357],
    ['니스', 43.7102, 7.262],
    ['상파울루', -23.5505, -46.6333],
    ['리우데자네이루', -22.9068, -43.1729],
    ['브라질리아', -15.7939, -47.8828],
    ['시드니', -33.8688, 151.2093],
    ['멜버른', -37.8136, 144.9631],
    ['브리즈번', -27.4698, 153.0251],
  ]

  const positions = Object.fromEntries(
    cities.map(([name, lat, lon]) => [name, toMapPosition({ lat, lon })]),
  )

  assert.deepEqual(positions, {
    서울: { left: '74.64%', top: '36.95%' },
    부산: { left: '75.53%', top: '38.22%' },
    제주: { left: '75.20%', top: '39.14%' },
    뉴욕: { left: '28.10%', top: '35.29%' },
    시카고: { left: '25.14%', top: '34.69%' },
    로스앤젤레스: { left: '16.92%', top: '38.84%' },
    파리: { left: '45.54%', top: '31.24%' },
    리옹: { left: '46.10%', top: '32.74%' },
    니스: { left: '46.66%', top: '33.76%' },
    상파울루: { left: '33.42%', top: '72.69%' },
    리우데자네이루: { left: '34.26%', top: '72.32%' },
    브라질리아: { left: '32.84%', top: '68.17%' },
    시드니: { left: '81.01%', top: '78.48%' },
    멜버른: { left: '78.78%', top: '80.61%' },
    브리즈번: { left: '82.55%', top: '74.93%' },
  })
})

test('서울과 시드니도 화면 비율이 달라져도 이미지와 동일한 cover 좌표계를 사용한다', () => {
  const viewport = { width: 1280, height: 800 }
  const positions = Object.fromEntries(
    ['서울', '시드니'].map((name) => {
      const city = defaultFavoriteCities.find((item) => item.name === name)
      return [name, toMapViewportPosition(toMapPosition(city), viewport)]
    }),
  )

  assert.deepEqual(positions, {
    서울: { left: '86.97%', top: '36.95%' },
    시드니: { left: '96.52%', top: '78.48%' },
  })
})
