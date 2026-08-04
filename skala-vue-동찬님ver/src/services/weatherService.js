import { createAdvice } from '../utils/weatherAdvice'

export const CITY_CODES = {
  '서울': 'seoul', '수원': 'suwon', '부산': 'busan', '인천': 'incheon', '대전': 'daejeon', '대구': 'daegu',
  '광주': 'gwangju', '울산': 'ulsan', '제주': 'jeju', '강릉': 'gangneung', '전주': 'jeonju', '춘천': 'chuncheon',
  '청주': 'cheongju', '창원': 'changwon', '포항': 'pohang', '여수': 'yeosu', '목포': 'mokpo', '속초': 'sokcho',
}

export const CITY_COORDINATES = {
  '서울': [37.5665, 126.9780], '수원': [37.2636, 127.0286], '부산': [35.1796, 129.0756], '인천': [37.4563, 126.7052],
  '대전': [36.3504, 127.3845], '대구': [35.8714, 128.6014], '광주': [35.1595, 126.8526], '울산': [35.5384, 129.3114],
  '제주': [33.4996, 126.5312], '강릉': [37.7519, 128.8761], '전주': [35.8242, 127.1480], '춘천': [37.8813, 127.7298],
  '청주': [36.6424, 127.4890], '창원': [35.2285, 128.6811], '포항': [36.0190, 129.3435], '여수': [34.7604, 127.6622],
  '목포': [34.8118, 126.3922], '속초': [38.2070, 128.5918],
}

const weatherStatus = (code) => {
  if ([0, 1].includes(code)) return '맑음'
  if ([2].includes(code)) return '구름'
  if ([3, 45, 48].includes(code)) return '흐림'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return '비'
  return '흐림'
}

const formatKoreanTime = (iso) => new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date(iso))

const cityProfiles = {
  '서울': { uv: 7, pm10: 25, pm25: 12, sunrise: '05:37', sunset: '19:37' },
  '수원': { uv: 3, pm10: 34, pm25: 19, rainStart: 18, rainMm: 8.5 },
  '부산': { uv: 5, pm10: 22, pm25: 11, sunrise: '05:32', sunset: '19:25' },
  '인천': { uv: 3, pm10: 42, pm25: 24 },
  '대전': { uv: 6, pm10: 31, pm25: 17 }, '대구': { uv: 8, pm10: 28, pm25: 15 },
  '광주': { uv: 2, pm10: 58, pm25: 39 }, '울산': { uv: 5, pm10: 23, pm25: 12 },
  '제주': { uv: 2, pm10: 19, pm25: 9, rainStart: 17, rainMm: 12 },
  '강릉': { uv: 6, pm10: 20, pm25: 10 }, '전주': { uv: 3, pm10: 37, pm25: 21, rainStart: 19, rainMm: 6 },
  '춘천': { uv: 7, pm10: 24, pm25: 13 }, '청주': { uv: 3, pm10: 47, pm25: 28 },
  '창원': { uv: 5, pm10: 26, pm25: 14 }, '포항': { uv: 8, pm10: 21, pm25: 10 },
  '여수': { uv: 5, pm10: 18, pm25: 8 }, '목포': { uv: 2, pm10: 33, pm25: 18, rainStart: 18, rainMm: 9 },
  '속초': { uv: 3, pm10: 29, pm25: 16 },
}

const airGrade = (pm10, pm25) => (pm10 > 80 || pm25 > 35 ? '나쁨' : pm10 > 30 || pm25 > 15 ? '보통' : '좋음')

export const createCityFixture = ({ name, temp, status }) => {
  const profile = cityProfiles[name] ?? {}
  const nowHour = 17
  const hourly = Array.from({ length: 6 }, (_, index) => {
    const time = nowHour + index
    const isRain = status === '비' && time >= (profile.rainStart ?? 18) && time <= (profile.rainStart ?? 18) + 2
    return {
      time,
      temp: Math.max(temp - Math.ceil(index / 2), 0),
      rainProbability: isRain ? Math.min(90, 65 + index * 5) : status === '흐림' ? 30 : 10,
      rainMm: isRain ? Number(((profile.rainMm ?? 5) / 3).toFixed(1)) : 0,
    }
  })
  const pm10 = profile.pm10 ?? 30
  const pm25 = profile.pm25 ?? 15
  return {
    city: name,
    basis: `${name} 중심 기준`,
    updatedAt: '2026-08-03 16:40',
    source: '전국 도시 MVP 예시 데이터',
    current: { temp, status, humidity: status === '비' ? 86 : 62, wind: status === '비' ? 3.8 : 2.1 },
    hourly,
    uv: profile.uv ?? 4,
    airQuality: { pm10, pm25, grade: airGrade(pm10, pm25) },
    sunrise: profile.sunrise ?? '05:40',
    sunset: profile.sunset ?? '19:32',
    isDemo: true,
  }
}

const fetchJson = async (url, signal) => {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`날씨 API 응답 오류 (${response.status})`)
  return response.json()
}

const normalizeLiveDetail = (item, weather, air) => {
  const currentHourIndex = weather.hourly.time.findIndex((time) => time >= weather.current.time)
  const start = Math.max(currentHourIndex, 0)
  const hourly = weather.hourly.time.slice(start, start + 6).map((time, index) => ({
    time: Number(time.slice(11, 13)),
    temp: Math.round(weather.hourly.temperature_2m[start + index]),
    rainProbability: weather.hourly.precipitation_probability[start + index] ?? 0,
    rainMm: weather.hourly.precipitation[start + index] ?? 0,
  }))
  const pm10 = Math.round(air.current.pm10 ?? 0)
  const pm25 = Math.round(air.current.pm2_5 ?? 0)
  return {
    city: item.name,
    basis: `${item.name} 중심 좌표 기준`,
    updatedAt: formatKoreanTime(weather.current.time),
    source: 'Open-Meteo 실시간 예보 · CAMS 대기질',
    current: {
      temp: Math.round(weather.current.temperature_2m),
      status: weatherStatus(weather.current.weather_code),
      humidity: weather.current.relative_humidity_2m,
      wind: weather.current.wind_speed_10m,
    },
    hourly,
    uv: Math.round((air.current.uv_index ?? 0) * 10) / 10,
    airQuality: { pm10, pm25, grade: airGrade(pm10, pm25) },
    sunrise: weather.daily.sunrise[0].slice(11, 16),
    sunset: weather.daily.sunset[0].slice(11, 16),
    isDemo: false,
    isFallback: false,
  }
}

export const getAllCityCurrentWeather = async () => {
  const entries = Object.entries(CITY_COORDINATES)
  const params = new URLSearchParams({
    latitude: entries.map(([, value]) => value[0]).join(','),
    longitude: entries.map(([, value]) => value[1]).join(','),
    current: 'temperature_2m,weather_code',
    timezone: 'Asia/Seoul',
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!response.ok) throw new Error('전국 실시간 날씨를 불러오지 못했어요.')
  const result = await response.json()
  const rows = Array.isArray(result) ? result : [result]
  return Object.fromEntries(entries.map(([name], index) => [name, {
    temp: Math.round(rows[index].current.temperature_2m),
    status: weatherStatus(rows[index].current.weather_code),
  }]))
}

export const getWeatherDetail = async (cityItem) => {
  const item = typeof cityItem === 'string' ? { name: cityItem, temp: 25, status: '맑음' } : cityItem
  const code = CITY_CODES[item?.name]
  if (!code) throw new Error('지원하지 않는 도시입니다.')

  let data
  const endpoint = import.meta.env.VITE_WEATHER_API_URL?.replace(/\/$/, '')
  if (endpoint) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    try {
      const response = await fetch(`${endpoint}/api/weather/${code}`, { signal: controller.signal })
      if (!response.ok) throw new Error('날씨 API 응답 오류')
      data = await response.json()
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('날씨 정보 요청 시간이 초과됐어요.')
      throw error
    } finally {
      clearTimeout(timer)
    }
  } else {
    const [latitude, longitude] = CITY_COORDINATES[item.name]
    const weatherParams = new URLSearchParams({
      latitude, longitude,
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      hourly: 'temperature_2m,precipitation_probability,precipitation',
      daily: 'sunrise,sunset', timezone: 'Asia/Seoul', forecast_days: '2',
    })
    const airParams = new URLSearchParams({
      latitude, longitude, current: 'pm10,pm2_5,uv_index', timezone: 'Asia/Seoul',
    })
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 7000)
    try {
      const [weather, air] = await Promise.all([
        fetchJson(`https://api.open-meteo.com/v1/forecast?${weatherParams}`, controller.signal),
        fetchJson(`https://air-quality-api.open-meteo.com/v1/air-quality?${airParams}`, controller.signal),
      ])
      data = normalizeLiveDetail(item, weather, air)
    } catch (error) {
      data = {
        ...createCityFixture(item),
        source: `실시간 연결 실패 · 임시 데이터 (${error.name === 'AbortError' ? '시간 초과' : '네트워크 오류'})`,
        isFallback: true,
      }
    } finally {
      clearTimeout(timer)
    }
  }
  return { ...data, advice: createAdvice(data) }
}
