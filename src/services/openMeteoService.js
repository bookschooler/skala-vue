import axios from 'axios'

// Open-Meteo는 16일 전체 예보와 상세 화면의 1시간 예보·UV를 담당한다.
// 도시 검색·현재 날씨·5일 예보는 openWeatherService.js에서 OpenWeatherMap으로 요청한다.
const forecastClient = axios.create({
  baseURL: 'https://api.open-meteo.com/v1',
  timeout: 10000,
})

const LONG_RANGE_CACHE_TTL = 30 * 60 * 1000
const longRangeForecastCache = new Map()

const weatherCodeText = Object.freeze({
  0: '맑음',
  1: '대체로 맑음',
  2: '구름 조금',
  3: '흐림',
  45: '안개',
  48: '서리 안개',
  51: '이슬비',
  53: '이슬비',
  55: '강한 이슬비',
  56: '어는 이슬비',
  57: '강한 어는 이슬비',
  61: '비',
  63: '비',
  65: '강한 비',
  66: '어는 비',
  67: '강한 어는 비',
  71: '눈',
  73: '눈',
  75: '강한 눈',
  77: '싸락눈',
  80: '소나기',
  81: '소나기',
  82: '강한 소나기',
  85: '눈 소나기',
  86: '강한 눈 소나기',
  95: '뇌우',
  96: '우박 뇌우',
  99: '강한 우박 뇌우',
})

const isFiniteNumber = (value) => value !== null && value !== '' && Number.isFinite(Number(value))

const assertCoordinates = (city) => {
  if (!city || !isFiniteNumber(city.lat) || !isFiniteNumber(city.lon)) {
    throw new Error('도시의 좌표 정보가 올바르지 않습니다.')
  }
}

const weatherLabel = (code) => weatherCodeText[code] ?? '날씨 정보 없음'

export const normalizeMeteoHourly = (hourly = {}) => {
  const time = Array.isArray(hourly.time) ? hourly.time : []
  return time.map((dateTime, index) => ({
    dateTime,
    temp: Number(hourly.temperature_2m?.[index]),
    feelsLike: Number(hourly.apparent_temperature?.[index]),
    precipitationProbability: Number(hourly.precipitation_probability?.[index] ?? 0),
    precipitation: Number(hourly.precipitation?.[index] ?? 0),
    wind: Number(hourly.wind_speed_10m?.[index]),
    uvIndex: Number(hourly.uv_index?.[index] ?? 0),
    weatherCode: Number(hourly.weather_code?.[index]),
    status: weatherLabel(Number(hourly.weather_code?.[index])),
  }))
}

// 도시의 현재 시각 이후 항목만 잘라 상세 화면의 24시간 가로 예보에 사용한다.
// Open-Meteo의 로컬 시간 문자열(YYYY-MM-DDTHH:mm)은 문자열 비교로도 시간순을 보장한다.
export const getUpcomingHourly = (hourly, startDateTime, count = 24) =>
  (Array.isArray(hourly) ? hourly : [])
    .filter((item) => item?.dateTime >= startDateTime)
    .slice(0, count)

const normalizeDaily = (daily = {}) => {
  const time = Array.isArray(daily.time) ? daily.time : []
  return time.flatMap((date, index) => {
    const minTemp = daily.temperature_2m_min?.[index]
    const maxTemp = daily.temperature_2m_max?.[index]
    const weatherCode = daily.weather_code?.[index]
    if (![minTemp, maxTemp, weatherCode].every(isFiniteNumber)) return []

    return [{
      date,
      minTemp: Number(minTemp),
      maxTemp: Number(maxTemp),
      precipitationProbability: isFiniteNumber(daily.precipitation_probability_max?.[index])
        ? Number(daily.precipitation_probability_max[index])
        : 0,
      weatherCode: Number(weatherCode),
      status: weatherLabel(Number(weatherCode)),
      sunrise: daily.sunrise?.[index] ?? null,
      sunset: daily.sunset?.[index] ?? null,
      uvIndexMax: isFiniteNumber(daily.uv_index_max?.[index]) ? Number(daily.uv_index_max[index]) : null,
    }]
  })
}

const fetchMeteoForecast = async (city, { signal, forecastDays, errorMessage } = {}) => {
  assertCoordinates(city)
  const { data } = await forecastClient.get('/forecast', {
    params: {
      latitude: city.lat,
      longitude: city.lon,
      timezone: 'auto',
      hourly:
        'temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index',
      daily:
        'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max',
      forecast_days: forecastDays,
    },
    signal,
  })
  const hourly = normalizeMeteoHourly(data?.hourly)
  const daily = normalizeDaily(data?.daily)
  if (!hourly.length || !daily.length) throw new Error(errorMessage)

  return {
    city: { ...city, timezone: data?.timezone ?? city.timezone },
    hourly,
    daily,
    fetchedAt: new Date().toISOString(),
  }
}

export const fetchLongRangeForecast = async (city, { signal } = {}) => {
  const cacheKey = `${Number(city?.lat).toFixed(3)},${Number(city?.lon).toFixed(3)}`
  const cached = longRangeForecastCache.get(cacheKey)
  if (cached && Date.now() - cached.savedAt < LONG_RANGE_CACHE_TTL) return cached.forecast

  const forecast = await fetchMeteoForecast(city, {
    signal,
    forecastDays: 16,
    errorMessage: 'Open-Meteo 장기 예보 응답 형식이 올바르지 않습니다.',
  })
  longRangeForecastCache.set(cacheKey, { forecast, savedAt: Date.now() })
  return forecast
}

export const fetchDetailHourlyForecast = (city, { signal } = {}) =>
  fetchMeteoForecast(city, {
    signal,
    forecastDays: 5,
    errorMessage: 'Open-Meteo 시간별 예보 응답 형식이 올바르지 않습니다.',
  })

export const isMeteoRequestCanceled = (error) => axios.isCancel(error) || error?.code === 'ERR_CANCELED'
