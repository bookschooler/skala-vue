// 폼 선택지 / 필터 칩에서 공용으로 쓰는 날씨 상태 목록
export const STATUS_OPTIONS = ['맑음', '구름', '흐림', '비']

export const statusEmoji = (status) => {
  const map = { 맑음: '☀️', 구름: '⛅', 흐림: '☁️', 비: '🌧️', 눈: '🌨️' }
  return map[status] ?? '🌡️'
}
