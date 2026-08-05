import axios from 'axios'

// OpenWeather 기본 키는 3시간 예보까지만 제공한다. 상세 화면의 1시간 예보와
// UV는 전 세계 좌표 예보를 제공하는 MET Norway Locationforecast complete에서
// 가져온다. 16일 장기 예보는 기존 Open-Meteo 서비스를 그대로 사용한다.
const metNorwayClient = axios.create({
  baseURL: 'https://api.met.no/weatherapi/locationforecast/2.0',
  timeout: 10000,
})

const isFiniteNumber = (value) => value !== null && value !== '' && Number.isFinite(Number(value))

const formatCityDateTime = (dateTime, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(dateTime))
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}T${value.hour}:${value.minute}`
}

const weatherCodeFromSymbol = (symbolCode = '') => {
  const symbol = String(symbolCode).toLowerCase()
  if (symbol.includes('thunder')) return 95
  if (symbol.includes('snow')) return 71
  if (symbol.includes('sleet')) return 66
  if (symbol.includes('rain')) return 61
  if (symbol.includes('fog')) return 45
  if (symbol.includes('partlycloudy') || symbol.includes('fair')) return 2
  if (symbol.includes('cloudy')) return 3
  return 0
}

const weatherStatusFromCode = (weatherCode) => {
  if (weatherCode === 95) return '뇌우'
  if (weatherCode === 71) return '눈'
  if (weatherCode === 66) return '진눈깨비'
  if (weatherCode === 61) return '비'
  if (weatherCode === 45) return '안개'
  if (weatherCode === 3) return '흐림'
  if (weatherCode === 2) return '구름 조금'
  return '맑음'
}

export const normalizeMetNorwayHourly = (timeSeries, timeZone) =>
  (Array.isArray(timeSeries) ? timeSeries : []).flatMap((item) => {
    const details = item?.data?.instant?.details
    if (!item?.time || !isFiniteNumber(details?.air_temperature)) return []

    const nextHour = item.data?.next_1_hours
    const weatherCode = weatherCodeFromSymbol(nextHour?.summary?.symbol_code)
    return [{
      dateTime: formatCityDateTime(item.time, timeZone),
      temp: Number(details.air_temperature),
      feelsLike: Number(details.air_temperature),
      precipitationProbability: isFiniteNumber(nextHour?.details?.probability_of_precipitation)
        ? Number(nextHour.details.probability_of_precipitation)
        : 0,
      precipitation: Number(nextHour?.details?.precipitation_amount ?? 0),
      wind: Math.round(Number(details.wind_speed ?? 0) * 3.6),
      uvIndex: isFiniteNumber(details.ultraviolet_index_clear_sky)
        ? Number(details.ultraviolet_index_clear_sky)
        : null,
      weatherCode,
      status: weatherStatusFromCode(weatherCode),
    }]
  })

const dailyUvIndexMax = (hourly) => {
  const uvByDate = new Map()
  hourly.forEach((item) => {
    if (!isFiniteNumber(item.uvIndex)) return
    const date = item.dateTime.slice(0, 10)
    uvByDate.set(date, Math.max(uvByDate.get(date) ?? 0, item.uvIndex))
  })
  return [...uvByDate].map(([date, uvIndexMax]) => ({ date, uvIndexMax }))
}

export const fetchDetailHourlyForecast = async (city, { signal } = {}) => {
  if (!isFiniteNumber(city?.lat) || !isFiniteNumber(city?.lon)) {
    throw new Error('도시의 좌표 정보가 올바르지 않습니다.')
  }

  const { data } = await metNorwayClient.get('/complete', {
    params: {
      lat: Number(city.lat).toFixed(4),
      lon: Number(city.lon).toFixed(4),
    },
    signal,
  })
  const hourly = normalizeMetNorwayHourly(data?.properties?.timeseries, city.timezone)
  if (!hourly.length) throw new Error('MET Norway 시간별 예보 응답 형식이 올바르지 않습니다.')

  return {
    city,
    hourly,
    daily: dailyUvIndexMax(hourly),
    hourlyIntervalHours: 1,
    fetchedAt: new Date().toISOString(),
  }
}

export const isMetNorwayRequestCanceled = (error) => axios.isCancel(error) || error?.code === 'ERR_CANCELED'
