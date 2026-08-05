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

test('시작 도시 전체 핀은 1920×902 화면에서 cover로 크롭된 배경 이미지의 좌표를 따라간다', () => {
  const positions = Object.fromEntries(
    defaultFavoriteCities.map((city) => [
      city.name,
      toMapViewportPosition(toMapPosition(city), { width: 1920, height: 902 }),
    ]),
  )

  assert.deepEqual(positions, {
    서울: { left: '85.30%', top: '42.10%' },
    도쿄: { left: '87.44%', top: '44.50%' },
    파리: { left: '47.52%', top: '33.20%' },
    뉴욕: { left: '27.45%', top: '42.70%' },
    런던: { left: '45.26%', top: '30.00%' },
    방콕: { left: '71.09%', top: '51.40%' },
    시드니: { left: '84.73%', top: '78.50%' },
    로마: { left: '50.11%', top: '40.00%' },
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
    서울: { left: '96.96%', top: '42.10%' },
    시드니: { left: '96.21%', top: '78.50%' },
  })
})
