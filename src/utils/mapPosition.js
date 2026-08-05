// 배경 PNG의 국가 윤곽은 직사각형 위경도 좌표가 아니라 Equal Earth 계열의 전역 투영을 따른다.
// 도시별 좌표를 따로 보정하면 신규 검색 도시마다 오차가 재발하므로, 모든 도시를 하나의
// 지리 투영식으로 변환한 뒤 이미지 안의 투영 영역으로만 맞춘다.
const equalEarthProjection = (latitude, longitude) => {
  const a1 = 1.340264
  const a2 = -0.081106
  const a3 = 0.000893
  const a4 = 0.003796
  const latitudeRadians = (latitude * Math.PI) / 180
  const longitudeRadians = (longitude * Math.PI) / 180
  const theta = Math.asin((Math.sqrt(3) / 2) * Math.sin(latitudeRadians))
  const thetaSquared = theta ** 2
  const thetaSixth = thetaSquared ** 3
  const denominator =
    3 * (a1 + 3 * a2 * thetaSquared + 7 * a3 * thetaSixth + 9 * a4 * thetaSixth * thetaSquared)

  return {
    x: (2 * Math.sqrt(3) * longitudeRadians * Math.cos(theta)) / denominator,
    y: a1 * theta + a2 * theta ** 3 + a3 * theta ** 7 + a4 * theta ** 9,
  }
}

// 배경 이미지 안에서 Equal Earth 도형이 차지하는 실제 영역을 한 번만 보정한 값이다.
// 이 값은 도시 이름과 무관하므로 API로 들어오는 임의의 좌표에도 같은 규칙이 적용된다.
const mapProjectionBounds = Object.freeze({
  centerLeft: 45.03,
  centerTop: 58.71,
  horizontalScale: 17.24,
  verticalScale: 29.75,
})

const mapImageSize = Object.freeze({ width: 1942, height: 809 })
const isCoordinate = (value) => Number.isFinite(Number(value))
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum)

export const toMapPosition = (city) => {
  const latitude = Number(city?.lat)
  const longitude = Number(city?.lon)
  if (!isCoordinate(latitude) || !isCoordinate(longitude)) return { left: '50%', top: '50%' }

  const { x, y } = equalEarthProjection(latitude, longitude)
  const left = clamp(
    mapProjectionBounds.centerLeft + x * mapProjectionBounds.horizontalScale,
    4,
    96,
  )
  const top = clamp(mapProjectionBounds.centerTop - y * mapProjectionBounds.verticalScale, 6, 94)

  return {
    left: `${left.toFixed(2)}%`,
    top: `${top.toFixed(2)}%`,
  }
}

// CSS `object-fit: cover`가 중앙을 기준으로 확대·크롭한 뒤의 부모 요소 좌표를 구한다.
// 이미지와 핀이 항상 같은 변환을 거치므로 화면 비율이 바뀌어도 서로 어긋나지 않는다.
export const toMapViewportPosition = (sourcePosition, viewport) => {
  const sourceLeft = Number.parseFloat(sourcePosition?.left)
  const sourceTop = Number.parseFloat(sourcePosition?.top)
  const width = Number(viewport?.width)
  const height = Number(viewport?.height)

  if (!Number.isFinite(sourceLeft) || !Number.isFinite(sourceTop) || width <= 0 || height <= 0) {
    return sourcePosition ?? { left: '50%', top: '50%' }
  }

  const scale = Math.max(width / mapImageSize.width, height / mapImageSize.height)
  const renderedWidth = mapImageSize.width * scale
  const renderedHeight = mapImageSize.height * scale
  const left = ((renderedWidth * (sourceLeft / 100) + (width - renderedWidth) / 2) / width) * 100
  const top = ((renderedHeight * (sourceTop / 100) + (height - renderedHeight) / 2) / height) * 100

  return {
    left: `${left.toFixed(2)}%`,
    top: `${top.toFixed(2)}%`,
  }
}
