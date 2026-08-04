export const cityCatalog = Object.freeze([
  { id: 'city_01', name: '서울', query: 'Seoul,KR' },
  { id: 'city_02', name: '성남', query: 'Seongnam,KR' },
  { id: 'city_03', name: '부산', query: 'Busan,KR' },
  { id: 'city_04', name: '천안', query: 'Cheonan,KR' },
])

export const findCityById = (cityId) => cityCatalog.find((city) => city.id === cityId)
