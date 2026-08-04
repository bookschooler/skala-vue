// 배경 이미지는 AI 스타일의 네온 지도라 일반적인 직사각형 위경도 투영과 해안선이 완전히 일치하지 않는다.
// 자주 검색되는 기준 도시를 이미지 위에서 좌표 보정하고, 다른 도시는 가까운 기준점의 보정값을 이어 받아
// 같은 대륙 안에서 실제 위도·경도 순서를 유지하도록 만든다.
const mapCalibrationAnchors = Object.freeze([
  { name: '서울', countryCode: 'KR', lat: 37.5665, lon: 126.978, left: 81.3, top: 42.1 },
  { name: '안산', countryCode: 'KR', lat: 37.3219, lon: 126.8309, left: 80.9, top: 42.0 },
  { name: '대전', countryCode: 'KR', lat: 36.3504, lon: 127.3845, left: 81.35, top: 42.7 },
  { name: '태안', countryCode: 'KR', lat: 36.7456, lon: 126.2979, left: 80.8, top: 42.2 },
  { name: '부산', countryCode: 'KR', lat: 35.1796, lon: 129.0756, left: 81.65, top: 44.1 },
  { name: '경주', countryCode: 'KR', lat: 35.8562, lon: 129.2247, left: 81.6, top: 43.7 },
  { name: '도쿄', countryCode: 'JP', lat: 35.6895, lon: 139.6917, left: 83.2, top: 44.5 },
  { name: '오사카 시', countryCode: 'JP', lat: 34.6938, lon: 135.5011, left: 81.9, top: 45.0 },
  { name: '오사카 국제공항', countryCode: 'JP', lat: 34.7855, lon: 135.4382, left: 81.85, top: 44.95 },
  { name: '파리', countryCode: 'FR', lat: 48.8566, lon: 2.3522, left: 47.8, top: 33.2 },
  { name: '뉴욕', countryCode: 'US', lat: 40.7128, lon: -74.006, left: 30.0, top: 42.7 },
  { name: '런던', countryCode: 'GB', lat: 51.5072, lon: -0.1276, left: 45.8, top: 30.0 },
  { name: '로마', countryCode: 'IT', lat: 41.9028, lon: 12.4964, left: 50.1, top: 40.0 },
  { name: '방콕', countryCode: 'TH', lat: 13.7563, lon: 100.5018, left: 68.7, top: 51.4 },
  { name: '고아', countryCode: 'IN', lat: 15.4909, lon: 73.8278, left: 63.0, top: 47.5 },
  { name: '마다가스카르', countryCode: 'MG', lat: -20, lon: 47, left: 58.7, top: 67.0 },
  { name: '시드니', countryCode: 'AU', lat: -33.8688, lon: 151.2093, left: 80.8, top: 78.5 },
])

const positionKey = (city) => `${city?.name ?? ''}|${city?.countryCode ?? ''}`
const isCoordinate = (value) => Number.isFinite(Number(value))
const directAnchorByKey = new Map(mapCalibrationAnchors.map((anchor) => [positionKey(anchor), anchor]))

const rawMapPosition = (latitude, longitude) => ({
  left: 10 + ((longitude + 180) / 360) * 75,
  top: 13 + ((90 - latitude) / 180) * 90,
})

const haversineDistanceKm = (fromLat, fromLon, toLat, toLon) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180
  const latDelta = toRadians(toLat - fromLat)
  const lonDelta = toRadians(toLon - fromLon)
  const startLat = toRadians(fromLat)
  const endLat = toRadians(toLat)
  const arc =
    Math.sin(latDelta / 2) ** 2 + Math.cos(startLat) * Math.cos(endLat) * Math.sin(lonDelta / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc))
}

const nearestMapCorrection = (latitude, longitude) => {
  // 가까운 기준 도시일수록 영향이 크게 적용되는 가중 평균 보정이다.
  // 0km인 기준 도시는 위에서 직접 반환되지만, 여기서도 1로 안전하게 처리한다.
  const weightedCorrection = mapCalibrationAnchors.reduce(
    (result, anchor) => {
      const distance = haversineDistanceKm(latitude, longitude, anchor.lat, anchor.lon)
      const weight = 1 / Math.max(distance / 1000, 0.08) ** 2
      const rawAnchorPosition = rawMapPosition(anchor.lat, anchor.lon)
      return {
        left: result.left + (anchor.left - rawAnchorPosition.left) * weight,
        top: result.top + (anchor.top - rawAnchorPosition.top) * weight,
        weight: result.weight + weight,
      }
    },
    { left: 0, top: 0, weight: 0 },
  )

  return {
    left: weightedCorrection.left / weightedCorrection.weight,
    top: weightedCorrection.top / weightedCorrection.weight,
  }
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export const mapPositionAuditCities = Object.freeze(mapCalibrationAnchors.map((anchor) => positionKey(anchor)))

export const toMapPosition = (city) => {
  const directAnchor = directAnchorByKey.get(positionKey(city))
  if (directAnchor) return { left: `${directAnchor.left}%`, top: `${directAnchor.top}%` }

  const latitude = Number(city?.lat)
  const longitude = Number(city?.lon)
  if (!isCoordinate(latitude) || !isCoordinate(longitude)) return { left: '50%', top: '50%' }

  const rawPosition = rawMapPosition(latitude, longitude)
  const correction = nearestMapCorrection(latitude, longitude)
  return {
    left: `${clamp(rawPosition.left + correction.left, 5, 95).toFixed(2)}%`,
    top: `${clamp(rawPosition.top + correction.top, 8, 92).toFixed(2)}%`,
  }
}
