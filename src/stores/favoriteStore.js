import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { defaultFavoriteCities } from '../data/cityCatalog.js'
import { migrateLegacyDefaultFavorites } from '../utils/favoriteMigration.js'

const STORAGE_KEY = 'weather-fairy.favorite-cities.v1'
const DEFAULTS_MIGRATION_KEY = 'weather-fairy.favorite-defaults.v2'
const MAX_FAVORITES = 12

const cloneCity = (city) => ({
  id: city.id,
  name: city.name,
  country: city.country,
  countryCode: city.countryCode,
  lat: Number(city.lat),
  lon: Number(city.lon),
  timezone: city.timezone,
  query: city.query,
})

const isValidCity = (city) =>
  Boolean(city?.id && city?.name && Number.isFinite(Number(city.lat)) && Number.isFinite(Number(city.lon)))

const loadFavorites = () => {
  if (typeof localStorage === 'undefined') return defaultFavoriteCities.map(cloneCity)
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === null) return defaultFavoriteCities.map(cloneCity)
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return defaultFavoriteCities.map(cloneCity)
    const sanitized = parsed.filter(isValidCity).map(cloneCity).slice(0, MAX_FAVORITES)

    if (localStorage.getItem(DEFAULTS_MIGRATION_KEY) === 'complete') return sanitized

    const migrated = migrateLegacyDefaultFavorites(sanitized).slice(0, MAX_FAVORITES)
    localStorage.setItem(DEFAULTS_MIGRATION_KEY, 'complete')
    if (migrated.some((city, index) => city.id !== sanitized[index]?.id) || migrated.length !== sanitized.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    }
    return migrated
  } catch {
    return defaultFavoriteCities.map(cloneCity)
  }
}

export const useFavoriteStore = defineStore('favorites', () => {
  const cities = ref(loadFavorites())

  const save = () => {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cities.value))
    } catch {
      // 저장 공간이 막힌 환경에서도 앱의 현재 세션은 그대로 동작한다.
    }
  }

  watch(cities, save, { deep: true })

  const isFavorite = (cityId) => cities.value.some((city) => city.id === cityId)

  const addFavorite = (city) => {
    if (!isValidCity(city)) return { ok: false, reason: 'invalid' }
    if (isFavorite(city.id)) return { ok: true, reason: 'exists' }
    if (cities.value.length >= MAX_FAVORITES) return { ok: false, reason: 'limit' }
    cities.value = [...cities.value, cloneCity(city)]
    return { ok: true, reason: 'added' }
  }

  const removeFavorite = (cityId) => {
    if (!isFavorite(cityId)) return false
    cities.value = cities.value.filter((city) => city.id !== cityId)
    return true
  }

  const toggleFavorite = (city) => {
    if (isFavorite(city.id)) return { ok: removeFavorite(city.id), reason: 'removed' }
    return addFavorite(city)
  }

  const findFavorite = (cityId) => cities.value.find((city) => city.id === cityId)

  return {
    cities,
    maxFavorites: MAX_FAVORITES,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    findFavorite,
  }
})
