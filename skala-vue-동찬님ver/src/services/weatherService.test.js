import { describe, expect, it } from 'vitest'
import { CITY_CODES, CITY_COORDINATES, createCityFixture } from './weatherService'

const citySnapshots = {
  '서울': [28, '맑음'], '수원': [24, '비'], '부산': [26, '구름'], '인천': [23, '흐림'], '대전': [27, '맑음'], '대구': [31, '맑음'],
  '광주': [22, '흐림'], '울산': [29, '구름'], '제주': [20, '비'], '강릉': [25, '맑음'], '전주': [24, '비'], '춘천': [30, '맑음'],
  '청주': [26, '흐림'], '창원': [28, '구름'], '포항': [32, '맑음'], '여수': [25, '구름'], '목포': [21, '비'], '속초': [22, '흐림'],
}

describe('전국 도시 날씨 상세', () => {
  it('18개 도시의 API 코드가 모두 정의되어 있다', () => {
    expect(Object.keys(CITY_CODES)).toEqual(Object.keys(citySnapshots))
    expect(Object.keys(CITY_COORDINATES)).toEqual(Object.keys(citySnapshots))
  })

  it.each(Object.entries(citySnapshots))('%s 상세 데이터를 생성한다', (name, [temp, status]) => {
    const detail = createCityFixture({ name, temp, status })
    expect(detail.city).toBe(name)
    expect(detail.hourly).toHaveLength(6)
    expect(detail.airQuality.grade).toMatch(/좋음|보통|나쁨/)
  })

  it('비 도시는 강수량 데이터를 생성한다', () => {
    const detail = createCityFixture({ name: '제주', temp: 20, status: '비' })
    expect(detail.hourly.some((hour) => hour.rainMm > 0)).toBe(true)
  })
})
