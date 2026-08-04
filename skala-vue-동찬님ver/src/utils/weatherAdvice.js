export const createAdvice = ({ current, hourly, uv, airQuality }) => {
  const rain = hourly.find((item) => item.rainProbability >= 60 || item.rainMm > 0)
  if (rain) {
    return {
      type: 'rain',
      headline: `${rain.time}시 전에 우산을 챙겨요`,
      description: `오늘 최대 ${Math.max(...hourly.map((item) => item.rainMm))}mm의 비가 예상돼요.`,
      outfit: '방수 재킷 · 레인 부츠',
      items: ['우산', '방수 재킷'],
    }
  }
  if (current.temp >= 30) {
    return {
      type: 'sunny',
      headline: '햇빛을 단단히 막아요',
      description: uv >= 3 ? '선크림을 바르고 양산을 챙겨주세요.' : '물을 자주 마셔요.',
      outfit: '통풍이 잘되는 여름 옷 · 모자',
      items: uv >= 3 ? ['선크림', '양산', '물'] : ['물'],
    }
  }
  if (airQuality?.grade === '나쁨') {
    return { type: 'air', headline: '야외 활동을 줄여요', description: '공기가 탁해요.', outfit: '편안한 실내복', items: ['마스크'] }
  }
  return { type: 'mild', headline: '가볍게 외출하기 좋아요', description: '큰 날씨 걱정이 없어요.', outfit: '가벼운 일상복', items: [] }
}

