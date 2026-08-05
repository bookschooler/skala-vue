import countriesTopology from 'world-atlas/countries-10m.json' with { type: 'json' }
import { geoEqualEarth, geoPath } from 'd3-geo'
import { feature, mesh } from 'topojson-client'

// 국가 윤곽과 도시 핀에 반드시 같은 투영을 적용한다. Natural Earth의 위·경도
// TopoJSON을 SVG 경로로 바꾸고, OpenWeather가 돌려주는 [경도, 위도]도 동일한
// Equal Earth 투영으로 변환하므로 배경 그림과 핀의 좌표계가 분리되지 않는다.
export const mapViewBox = Object.freeze({ width: 1000, height: 520 })
const mapPadding = 16
const worldFeatureCollection = feature(countriesTopology, countriesTopology.objects.countries)
const worldProjection = geoEqualEarth().fitExtent(
  [
    [mapPadding, mapPadding],
    [mapViewBox.width - mapPadding, mapViewBox.height - mapPadding],
  ],
  worldFeatureCollection,
)
const pathGenerator = geoPath(worldProjection)

// 국가 면을 각각 닫아 그리면 날짜변경선을 가로지르는 섬 국가가 화면 가장자리에
// 큰 호를 만들 수 있다. TopoJSON 경계 메쉬는 실제 국경선만 이어서 그리므로
// 평면 네온 지도에서 지구본 외곽선이 생기지 않는다.
export const mapCountryBorderPath = pathGenerator(
  mesh(countriesTopology, countriesTopology.objects.countries),
)

export const mapCountries = Object.freeze(
  worldFeatureCollection.features.map((country) =>
    Object.freeze({
      id: String(country.id),
      name: country.properties?.name ?? '',
      path: pathGenerator(country),
    }),
  ),
)

const isLatitude = (value) => Number.isFinite(Number(value)) && Number(value) >= -90 && Number(value) <= 90
const isLongitude = (value) => Number.isFinite(Number(value)) && Number(value) >= -180 && Number(value) <= 180

export const toMapPosition = (city) => {
  const latitude = Number(city?.lat)
  const longitude = Number(city?.lon)

  if (!isLatitude(latitude) || !isLongitude(longitude)) return { left: '50%', top: '50%' }

  const [x, y] = worldProjection([longitude, latitude])
  return {
    left: `${((x / mapViewBox.width) * 100).toFixed(2)}%`,
    top: `${((y / mapViewBox.height) * 100).toFixed(2)}%`,
  }
}

// SVG의 preserveAspectRatio="xMidYMid slice"와 동일한 중앙 crop 계산이다.
// HTML 버튼 핀과 SVG 국가 윤곽이 화면 비율이 바뀌어도 같은 위치를 사용한다.
export const toMapViewportPosition = (sourcePosition, viewport) => {
  const sourceLeft = Number.parseFloat(sourcePosition?.left)
  const sourceTop = Number.parseFloat(sourcePosition?.top)
  const width = Number(viewport?.width)
  const height = Number(viewport?.height)

  if (!Number.isFinite(sourceLeft) || !Number.isFinite(sourceTop) || width <= 0 || height <= 0) {
    return sourcePosition ?? { left: '50%', top: '50%' }
  }

  const scale = Math.max(width / mapViewBox.width, height / mapViewBox.height)
  const renderedWidth = mapViewBox.width * scale
  const renderedHeight = mapViewBox.height * scale
  const left = ((renderedWidth * (sourceLeft / 100) + (width - renderedWidth) / 2) / width) * 100
  const top = ((renderedHeight * (sourceTop / 100) + (height - renderedHeight) / 2) / height) * 100

  return {
    left: `${left.toFixed(2)}%`,
    top: `${top.toFixed(2)}%`,
  }
}
