const isValidIndex = (value) => value !== null && value !== '' && Number.isFinite(Number(value))

// 기상청 생활기상지수의 자외선지수 5단계 기준을 화면용 명칭으로 변환한다.
export const getUvIndexLevel = (value) => {
  if (!isValidIndex(value)) return null

  const index = Number(value)
  if (index < 3) return '낮음'
  if (index < 6) return '보통'
  if (index < 8) return '높음'
  if (index < 11) return '매우높음'
  return '위험'
}

// 환경부·에어코리아의 PM10 미세먼지 예보 등급 기준을 따른다.
export const getPm10Level = (value) => {
  if (!isValidIndex(value)) return null

  const concentration = Number(value)
  if (concentration <= 30) return '좋음'
  if (concentration <= 80) return '보통'
  if (concentration <= 150) return '나쁨'
  return '매우나쁨'
}

// 환경부가 안내하는 적정 실내 습도 40~60%를 중심으로 생활 체감 문구를 표시한다.
export const getHumidityComfortLevel = (value) => {
  if (!isValidIndex(value)) return null

  const humidity = Number(value)
  if (humidity < 40) return '건조'
  if (humidity <= 60) return '쾌적'
  if (humidity <= 70) return '다소 습함'
  return '불쾌'
}
