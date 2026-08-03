import { describe, expect, it } from 'vitest'
import { createAdvice } from './weatherAdvice'

describe('createAdvice', () => {
  it('비가 예상되면 우산 안내를 최우선으로 한다', () => {
    const result = createAdvice({ current: { temp: 31 }, hourly: [{ time: 17, rainProbability: 80, rainMm: 8 }], uv: 8 })
    expect(result.type).toBe('rain'); expect(result.items).toContain('우산')
  })
  it('더운 맑은 날은 자외선 준비물을 안내한다', () => {
    const result = createAdvice({ current: { temp: 31 }, hourly: [{ time: 17, rainProbability: 10, rainMm: 0 }], uv: 7 })
    expect(result.type).toBe('sunny'); expect(result.items).toEqual(['선크림', '양산', '물'])
  })
})
