import axios from 'axios'
import {
  cityCatalog,
  countrySearchCities,
  defaultFavoriteCities,
  isDomesticCity,
  quickSearchCities,
} from '../data/cityCatalog.js'

const openWeatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org',
  timeout: 10000,
})

const CURRENT_WEATHER_CACHE_TTL = 90 * 1000
const CITY_SEARCH_CACHE_TTL = 10 * 60 * 1000
const ONE_CALL_HOURLY_CACHE_TTL = 10 * 60 * 1000
const currentWeatherCache = new Map()
const citySearchCache = new Map()
const oneCallHourlyCache = new Map()

export class WeatherConfigError extends Error {
  constructor() {
    super('OpenWeatherMap API 키가 설정되지 않았습니다.')
    this.name = 'WeatherConfigError'
  }
}

const isFiniteNumber = (value) => value !== null && value !== '' && Number.isFinite(Number(value))

const assertCoordinates = (city) => {
  if (!city || !isFiniteNumber(city.lat) || !isFiniteNumber(city.lon)) {
    throw new Error('도시의 좌표 정보가 올바르지 않습니다.')
  }
}

const getApiKey = () => {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim()
  if (!apiKey) throw new WeatherConfigError()
  return apiKey
}

const normalizeSearchText = (value) =>
  String(value ?? '')
    .normalize('NFC')
    .toLocaleLowerCase('ko-KR')
    .replace(/\s+/g, ' ')
    .trim()

const knownSearchCities = Array.from(
  new Map(
    [...cityCatalog, ...defaultFavoriteCities, ...quickSearchCities, ...countrySearchCities].map(
      (city) => [city.id, city],
    ),
  ).values(),
)

const citySearchScore = (city, query) => {
  const normalizedQuery = normalizeSearchText(query)
  const cityName = normalizeSearchText(city.name)
  const country = normalizeSearchText(city.country)
  const alternateNames = normalizeSearchText(city.query)

  if (cityName === normalizedQuery) return 0
  if (cityName.startsWith(normalizedQuery)) return 1
  if (country === normalizedQuery || alternateNames.includes(normalizedQuery)) return 2
  return 3
}

const sortCitiesByRelevance = (cities, query) =>
  [...cities].sort((first, second) => {
    const scoreDelta = citySearchScore(first, query) - citySearchScore(second, query)
    if (scoreDelta !== 0) return scoreDelta
    const countryRankDelta =
      Number(first.countrySearchRank ?? Number.MAX_SAFE_INTEGER) -
      Number(second.countrySearchRank ?? Number.MAX_SAFE_INTEGER)
    if (countryRankDelta !== 0) return countryRankDelta
    return normalizeSearchText(first.name).localeCompare(normalizeSearchText(second.name), 'ko-KR')
  })

export const searchKnownCities = (query, { scope = 'global' } = {}) => {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return []

  const matchedCities = knownSearchCities.filter((city) => {
    if (scope === 'domestic' && !isDomesticCity(city)) return false
    if (scope === 'global' && isDomesticCity(city)) return false
    return [city.name, city.country, city.countryCode, city.query]
      .filter(Boolean)
      .join(' ')
      .normalize('NFC')
      .toLocaleLowerCase('ko-KR')
      .includes(normalizedQuery)
  })

  return sortCitiesByRelevance(matchedCities, normalizedQuery)
}

const countryName = (countryCode) => {
  try {
    return new Intl.DisplayNames(['ko-KR'], { type: 'region' }).of(countryCode) ?? countryCode
  } catch {
    return countryCode
  }
}

const toOpenWeatherCity = (item) => {
  const countryCode = String(item?.country ?? '').toUpperCase()
  const lat = Number(item?.lat)
  const lon = Number(item?.lon)
  const name = item?.local_names?.ko ?? item?.name
  if (!name || !countryCode || !Number.isFinite(lat) || !Number.isFinite(lon)) return null

  return {
    id: `owm-${countryCode}-${lat.toFixed(4)}-${lon.toFixed(4)}`,
    name,
    country: countryName(countryCode),
    countryCode,
    lat,
    lon,
    timezone: 'auto',
    query: `${item.name},${countryCode}`,
  }
}

export const searchCities = async (query, { scope = 'global', signal } = {}) => {
  const name = query?.trim()
  if (!name) return []

  const knownResults = searchKnownCities(name, { scope })
  if (knownResults.length) return knownResults.slice(0, 5)

  const searchCacheKey = `${scope}:${normalizeSearchText(name)}`
  const cached = citySearchCache.get(searchCacheKey)
  if (cached && Date.now() - cached.savedAt < CITY_SEARCH_CACHE_TTL) return cached.cities

  const { data } = await openWeatherClient.get('/geo/1.0/direct', {
    params: { q: name, limit: 5, appid: getApiKey() },
    signal,
  })
  const cities = sortCitiesByRelevance(
    (Array.isArray(data) ? data : [])
      .map(toOpenWeatherCity)
      .filter(Boolean)
      .filter((city) => (scope === 'domestic' ? isDomesticCity(city) : !isDomesticCity(city))),
    name,
  )
  const exactDomesticCity =
    scope === 'domestic'
      ? cities.find((city) => normalizeSearchText(city.name) === normalizeSearchText(name))
      : null
  const resolvedCities = exactDomesticCity ? [exactDomesticCity] : cities
  citySearchCache.set(searchCacheKey, { cities: resolvedCities, savedAt: Date.now() })
  return resolvedCities
}

// OpenWeather condition id를 기존 화면에서 쓰는 WMO 계열 아이콘 코드로 맞춘다.
const toWeatherVisualCode = (weatherId, cloudiness = 0) => {
  const id = Number(weatherId)
  if (id >= 200 && id < 300) return 95
  if (id >= 300 && id < 400) return 51
  if (id >= 500 && id < 600) return 61
  if (id >= 600 && id < 700) return 71
  if (id >= 700 && id < 800) return 45
  if (id === 800) return 0
  if (id === 801 || Number(cloudiness) < 50) return 2
  return 3
}

const weatherStatus = (weather) =>
  weather?.description?.trim() || weather?.main?.trim() || '날씨 정보 없음'

const formatCityDateTime = (timestamp, timezoneOffset = 0) => {
  if (!isFiniteNumber(timestamp)) return null
  return new Date((Number(timestamp) + Number(timezoneOffset || 0)) * 1000)
    .toISOString()
    .slice(0, 16)
    .replace('T', ' ')
}

const localDateParts = (timestamp, timezoneOffset = 0) => {
  const value = new Date((Number(timestamp) + Number(timezoneOffset || 0)) * 1000).toISOString()
  return {
    date: value.slice(0, 10),
    hour: Number(value.slice(11, 13)),
    dateTime: value.slice(0, 16),
  }
}

const normalizeCurrent = (city, data) => {
  if (
    !isFiniteNumber(data?.main?.temp) ||
    !isFiniteNumber(data?.main?.humidity) ||
    !isFiniteNumber(data?.wind?.speed) ||
    !data?.weather?.[0]
  ) {
    throw new Error('OpenWeather 현재 날씨 응답 형식이 올바르지 않습니다.')
  }

  return {
    id: city.id,
    name: city.name,
    temp: Number(data.main.temp),
    feelsLike: Number(data.main.feels_like ?? data.main.temp),
    humidity: Number(data.main.humidity),
    precipitation: Number(data.rain?.['1h'] ?? data.snow?.['1h'] ?? 0),
    wind: Math.round(Number(data.wind.speed) * 3.6),
    weatherCode: toWeatherVisualCode(data.weather[0].id, data.clouds?.all),
    status: weatherStatus(data.weather[0]),
    observedAt: formatCityDateTime(data.dt, data.timezone),
  }
}

const normalizeAirQuality = (data) => {
  const current = Array.isArray(data?.list) ? data.list[0] : null
  return {
    pm10: isFiniteNumber(current?.components?.pm10) ? Number(current.components.pm10) : null,
    pm25: isFiniteNumber(current?.components?.pm2_5) ? Number(current.components.pm2_5) : null,
    usAqi: isFiniteNumber(current?.main?.aqi) ? Number(current.main.aqi) : null,
  }
}

// 5일 예보 API는 3시간 간격이며 UV를 제공하지 않는다. 상세 화면의 실제 1시간
// 예보와 현재 UV는 같은 OpenWeather의 One Call 응답이 제공될 때만 이 함수로 정규화한다.
export const normalizeOneCallHourly = (data) => {
  const timezoneOffset = Number(data?.timezone_offset ?? 0)
  const hourly = (Array.isArray(data?.hourly) ? data.hourly : [])
    .filter(
      (item) =>
        isFiniteNumber(item?.dt) && isFiniteNumber(item?.temp) && Array.isArray(item?.weather),
    )
    .map((item) => {
      const { dateTime } = localDateParts(item.dt, timezoneOffset)
      return {
        dateTime,
        temp: Number(item.temp),
        feelsLike: Number(item.feels_like ?? item.temp),
        precipitationProbability: Math.round(Number(item.pop ?? 0) * 100),
        precipitation: Number(item.rain?.['1h'] ?? item.snow?.['1h'] ?? 0),
        wind: Math.round(Number(item.wind_speed ?? 0) * 3.6),
        uvIndex: isFiniteNumber(item.uvi) ? Number(item.uvi) : null,
        weatherCode: toWeatherVisualCode(item.weather[0]?.id, item.clouds),
        status: weatherStatus(item.weather[0]),
      }
    })

  return {
    hourly,
    currentUvIndex: isFiniteNumber(data?.current?.uvi) ? Number(data.current.uvi) : null,
  }
}

const normalizeForecast = (data) => {
  const timezoneOffset = Number(data?.city?.timezone ?? 0)
  const items = Array.isArray(data?.list) ? data.list : []
  const hourly = items
    .filter(
      (item) => isFiniteNumber(item?.dt) && isFiniteNumber(item?.main?.temp) && item?.weather?.[0],
    )
    .map((item) => {
      const { dateTime } = localDateParts(item.dt, timezoneOffset)
      return {
        dateTime,
        temp: Number(item.main.temp),
        feelsLike: Number(item.main.feels_like ?? item.main.temp),
        precipitationProbability: Math.round(Number(item.pop ?? 0) * 100),
        precipitation: Number(item.rain?.['3h'] ?? item.snow?.['3h'] ?? 0),
        wind: Math.round(Number(item.wind?.speed ?? 0) * 3.6),
        uvIndex: null,
        weatherCode: toWeatherVisualCode(item.weather[0].id, item.clouds?.all),
        status: weatherStatus(item.weather[0]),
      }
    })

  const groupedDaily = new Map()
  for (const item of items) {
    if (!isFiniteNumber(item?.dt) || !isFiniteNumber(item?.main?.temp) || !item?.weather?.[0])
      continue
    const localTime = localDateParts(item.dt, timezoneOffset)
    const dayItems = groupedDaily.get(localTime.date) ?? []
    groupedDaily.set(localTime.date, [...dayItems, { ...item, localHour: localTime.hour }])
  }

  const daily = [...groupedDaily.entries()].slice(0, 5).map(([date, entries]) => {
    const representative =
      entries.find((item) => item.localHour === 12) ?? entries[Math.floor(entries.length / 2)]
    return {
      date,
      minTemp: Math.min(...entries.map((item) => Number(item.main.temp_min ?? item.main.temp))),
      maxTemp: Math.max(...entries.map((item) => Number(item.main.temp_max ?? item.main.temp))),
      precipitationProbability: Math.round(
        Math.max(...entries.map((item) => Number(item.pop ?? 0))) * 100,
      ),
      weatherCode: toWeatherVisualCode(representative.weather[0].id, representative.clouds?.all),
      status: weatherStatus(representative.weather[0]),
      sunrise: data?.city?.sunrise ? formatCityDateTime(data.city.sunrise, timezoneOffset) : null,
      sunset: data?.city?.sunset ? formatCityDateTime(data.city.sunset, timezoneOffset) : null,
      uvIndexMax: null,
    }
  })

  if (!hourly.length || !daily.length)
    throw new Error('OpenWeather 예보 응답 형식이 올바르지 않습니다.')
  return { hourly, daily }
}

const currentWeatherCacheKey = (city) =>
  `${Number(city.lat).toFixed(3)},${Number(city.lon).toFixed(3)}`

const fetchOneCallHourly = async (city, { apiKey, signal } = {}) => {
  const cacheKey = currentWeatherCacheKey(city)
  const cached = oneCallHourlyCache.get(cacheKey)
  if (cached && Date.now() - cached.savedAt < ONE_CALL_HOURLY_CACHE_TTL) return cached.forecast

  const { data } = await openWeatherClient.get('/data/3.0/onecall', {
    params: {
      lat: city.lat,
      lon: city.lon,
      appid: apiKey,
      exclude: 'minutely,daily,alerts',
      units: 'metric',
      lang: 'kr',
    },
    signal,
  })
  const forecast = normalizeOneCallHourly(data)
  if (!forecast.hourly.length) throw new Error('OpenWeather 1시간 예보 응답 형식이 올바르지 않습니다.')
  oneCallHourlyCache.set(cacheKey, { forecast, savedAt: Date.now() })
  return forecast
}

export const fetchCurrentWeather = async (city, { signal } = {}) => {
  assertCoordinates(city)
  const cacheKey = currentWeatherCacheKey(city)
  const cached = currentWeatherCache.get(cacheKey)
  if (cached && Date.now() - cached.savedAt < CURRENT_WEATHER_CACHE_TTL) {
    return { ...cached.weather, id: city.id, name: city.name }
  }

  const { data } = await openWeatherClient.get('/data/2.5/weather', {
    params: {
      lat: city.lat,
      lon: city.lon,
      appid: getApiKey(),
      units: 'metric',
      lang: 'kr',
    },
    signal,
  })
  const weather = normalizeCurrent(city, data)
  currentWeatherCache.set(cacheKey, { weather, savedAt: Date.now() })
  return weather
}

export const fetchWeatherBundle = async (city, { signal } = {}) => {
  assertCoordinates(city)
  const apiKey = getApiKey()
  const sharedParams = { lat: city.lat, lon: city.lon, appid: apiKey }
  const [currentResponse, forecastResponse, airQualityResponse, oneCallForecast] = await Promise.all([
    openWeatherClient.get('/data/2.5/weather', {
      params: { ...sharedParams, units: 'metric', lang: 'kr' },
      signal,
    }),
    openWeatherClient.get('/data/2.5/forecast', {
      params: { ...sharedParams, units: 'metric', lang: 'kr' },
      signal,
    }),
    openWeatherClient
      .get('/data/2.5/air_pollution', { params: sharedParams, signal })
      .catch(() => null),
    // One Call은 별도 구독 권한이 필요한 OpenWeather API다. 권한이 없더라도 기존
    // 현재 날씨·5일 예보가 실패하지 않도록 3시간 예보로 안전하게 대체한다.
    fetchOneCallHourly(city, { apiKey, signal }).catch((error) => {
      if (isWeatherRequestCanceled(error)) throw error
      return null
    }),
  ])
  const fallbackForecast = normalizeForecast(forecastResponse.data)
  const current = {
    ...normalizeCurrent(city, currentResponse.data),
    airQuality: normalizeAirQuality(airQualityResponse?.data),
    uvIndex: oneCallForecast?.currentUvIndex ?? null,
  }

  return {
    city,
    current,
    hourly: oneCallForecast?.hourly?.length ? oneCallForecast.hourly : fallbackForecast.hourly,
    hourlyIntervalHours: oneCallForecast?.hourly?.length ? 1 : 3,
    daily: fallbackForecast.daily,
    fetchedAt: new Date().toISOString(),
  }
}

export const isWeatherRequestCanceled = (error) =>
  axios.isCancel(error) || error?.code === 'ERR_CANCELED'
