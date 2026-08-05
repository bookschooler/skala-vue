import { defaultFavoriteCities } from '../data/cityCatalog.js'

// v1 기본 즐겨찾기에는 아래 세 도시가 포함돼 있었다. 새 기본 도시는
// 뉴욕·도쿄·파리·런던·서울·상하이·홍콩으로 바뀌었으므로, 이 패턴이 남아 있는
// 기존 브라우저 저장값만 한 번 정리한다.
const legacyDefaultIds = new Set([
  'city_01',
  'meteo-1850147',
  'meteo-2988507',
  'meteo-5128581',
  'meteo-2643743',
  'meteo-1609350',
  'meteo-2147714',
  'meteo-3169070',
])
const replacedLegacyIds = new Set(['meteo-1609350', 'meteo-2147714', 'meteo-3169070'])

// 옛 기본 도시 여럿이 동시에 있는 경우에만 자동 변환한다. 따라서 사용자가
// 나중에 직접 방콕 하나를 즐겨찾기한 경우까지 제거하지 않는다.
export const migrateLegacyDefaultFavorites = (cities) => {
  const savedCities = Array.isArray(cities) ? cities : []
  const savedIds = new Set(savedCities.map((city) => city?.id))
  const legacyCityCount = [...savedIds].filter((id) => legacyDefaultIds.has(id)).length
  const replacedCityCount = [...savedIds].filter((id) => replacedLegacyIds.has(id)).length

  if (legacyCityCount < 4 || replacedCityCount < 2) return savedCities

  const retainedCities = savedCities.filter((city) => !replacedLegacyIds.has(city.id))
  const retainedIds = new Set(retainedCities.map((city) => city.id))
  const missingDefaults = defaultFavoriteCities.filter((city) => !retainedIds.has(city.id))

  return [...retainedCities, ...missingDefaults]
}
