import {
  Cloudy,
  Drizzling,
  Lightning,
  Loading,
  MostlyCloudy,
  Pouring,
  Sunny,
} from '@element-plus/icons-vue'

const weatherVisuals = Object.freeze({
  clear: { icon: Sunny, tone: 'sunny', label: '맑음' },
  partlyCloudy: { icon: MostlyCloudy, tone: 'partly-cloudy', label: '구름 조금' },
  cloudy: { icon: Cloudy, tone: 'cloudy', label: '흐림 또는 안개' },
  drizzle: { icon: Drizzling, tone: 'rain', label: '이슬비' },
  rain: { icon: Pouring, tone: 'rain', label: '비' },
  snow: { icon: Cloudy, tone: 'snow', label: '눈' },
  storm: { icon: Lightning, tone: 'storm', label: '뇌우' },
  loading: { icon: Loading, tone: 'loading', label: '날씨 불러오는 중' },
})

// Open-Meteo WMO weather code를 화면에서 일관된 아이콘으로 표현한다.
export const getWeatherVisual = (weatherCode) => {
  const code = Number(weatherCode)
  if (!Number.isFinite(code)) return weatherVisuals.loading
  if (code === 0 || code === 1) return weatherVisuals.clear
  if (code === 2) return weatherVisuals.partlyCloudy
  if (code === 3 || code === 45 || code === 48) return weatherVisuals.cloudy
  if (code >= 51 && code <= 57) return weatherVisuals.drizzle
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return weatherVisuals.rain
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return weatherVisuals.snow
  if (code >= 95) return weatherVisuals.storm
  return weatherVisuals.cloudy
}
