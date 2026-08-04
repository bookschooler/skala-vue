import axios from 'axios'

const openWeatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 10000,
})

export class WeatherConfigError extends Error {
  constructor() {
    super('OpenWeatherMap API 키가 설정되지 않았습니다.')
    this.name = 'WeatherConfigError'
  }
}

const assertValidResponse = (data) => {
  const temperature = data?.main?.temp
  const humidity = data?.main?.humidity
  const wind = data?.wind?.speed
  const status = data?.weather?.[0]?.description

  if (
    !Number.isFinite(temperature) ||
    !Number.isFinite(humidity) ||
    !Number.isFinite(wind) ||
    typeof status !== 'string' ||
    status.trim() === ''
  ) {
    throw new Error('날씨 API 응답 형식이 올바르지 않습니다.')
  }

  return { temperature, humidity, wind, status }
}

export const fetchCurrentWeather = async (city, { signal } = {}) => {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim()
  if (!apiKey) throw new WeatherConfigError()

  const response = await openWeatherClient.get('/weather', {
    params: {
      q: city.query,
      appid: apiKey,
      units: 'metric',
      lang: 'kr',
    },
    signal,
  })
  const { temperature, humidity, wind, status } = assertValidResponse(response.data)

  return {
    id: city.id,
    name: city.name,
    temp: temperature,
    status,
    humidity,
    wind,
    description: `${city.name}의 현재 날씨는 ${status}이며, 기온은 ${temperature}℃입니다.`,
  }
}

export const isWeatherRequestCanceled = (error) => axios.isCancel(error)
