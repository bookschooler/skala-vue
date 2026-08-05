import axios from 'axios'

const communityHttp = axios.create({
  baseURL: import.meta.env.VITE_MOCK_API_BASE_URL ?? 'http://localhost:3001/api',
  timeout: 8_000,
  headers: {
    'X-Lab-Client': 'weather-fairy-community',
  },
})

communityHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ?? '여행 기록을 불러오지 못했습니다. Mock API가 실행 중인지 확인해 주세요.'
    return Promise.reject(new Error(message, { cause: error }))
  },
)

export { communityHttp }
