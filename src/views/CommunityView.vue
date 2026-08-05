<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ChatDotRound, InfoFilled, Location, Picture, Plus, RefreshRight } from '@element-plus/icons-vue'
import { useCommunityPostStore } from '../stores/communityPostStore.js'

const communityPostStore = useCommunityPostStore()

const weatherOptions = ['맑음', '구름조금', '구름많음', '흐림', '비', '눈']
const skyColorOptions = [
  { label: '여린 하늘색', value: '#A8DCF3' },
  { label: '맑은 파랑', value: '#5EBAE8' },
  { label: '청명한 파랑', value: '#2488CD' },
  { label: '깊은 파랑', value: '#155C9F' },
  { label: '푸른 회색', value: '#6F9EBA' },
  { label: '흐린 하늘', value: '#92A6B0' },
]
const cloudAmountOptions = ['없음', '조금', '보통', '많음', '가득']
const hourOptions = Array.from({ length: 12 }, (_, index) => String(index + 1))
const minuteOptions = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'))

const cloudGroups = [
  {
    id: 'high',
    label: '상층운',
    altitude: '약 6–13km',
    types: [
      { id: 'Ci', code: 'Ci', label: '권운', alias: '새털구름', imageUrl: '/img/community-sky-day.png', description: '높은 하늘에 실이나 새털처럼 가늘게 흩어져 보여요.' },
      { id: 'Cc', code: 'Cc', label: '권적운', alias: '조개구름', imageUrl: '/img/community-sky-cirrocumulus.png', description: '아주 작은 구름 조각이 비늘이나 조개무늬처럼 촘촘히 펼쳐져요.' },
      { id: 'Cs', code: 'Cs', label: '권층운', alias: '햇무리구름', imageUrl: '/img/community-cloud-cirrostratus-day-v1.png', description: '얇은 막처럼 넓게 퍼져 햇빛이나 달 주위에 무리를 만들기도 해요.' },
    ],
  },
  {
    id: 'middle',
    label: '중층운',
    altitude: '약 2–7km',
    types: [
      { id: 'Ac', code: 'Ac', label: '고적운', alias: '양떼구름', imageUrl: '/img/community-sky-altocumulus.png', description: '작은 둥근 구름 덩어리가 양떼처럼 무리 지어 나타나요.' },
      { id: 'As', code: 'As', label: '고층운', alias: '회색차일구름', imageUrl: '/img/community-cloud-altostratus-day-v1.png', description: '회색 차일을 친 듯 하늘을 넓고 고르게 덮어, 햇빛이 은은하게 비쳐요.' },
    ],
  },
  {
    id: 'low',
    label: '하층운',
    altitude: '지상–2km',
    types: [
      { id: 'Ns', code: 'Ns', label: '난층운', alias: '비구름', imageUrl: '/img/community-sky-rain-window.png', description: '넓게 퍼진 짙은 구름으로, 오랜 시간 비나 눈을 내리게 할 수 있어요.' },
      { id: 'St', code: 'St', label: '층운', alias: '산안개구름', imageUrl: '/img/community-cloud-stratus-day-v1.png', description: '낮고 균일한 회색 막처럼 하늘을 덮어 산안개처럼 보이기도 해요.' },
      { id: 'Sc', code: 'Sc', label: '층적운', alias: '두루마리구름', imageUrl: '/img/community-cloud-stratocumulus-day-v1.png', description: '낮은 하늘에서 넓고 둥근 덩어리가 두루마리처럼 이어져 보여요.' },
    ],
  },
  {
    id: 'vertical',
    label: '수직 발달운',
    altitude: '낮은 곳에서 위로 발달',
    types: [
      { id: 'Cu', code: 'Cu', label: '적운', alias: '뭉게구름', imageUrl: '/img/community-cloud-cumulus-day-v1.png', description: '아래는 평평하고 위로 몽글몽글 솟아오르는 친숙한 구름이에요.' },
      { id: 'Cb', code: 'Cb', label: '적란운', alias: '소나기구름', imageUrl: '/img/community-cloud-cumulonimbus-day-v1.png', description: '높이 크게 발달해 소나기·천둥·번개·우박을 동반할 수 있어요.' },
    ],
  },
]

const cloudTypes = cloudGroups.flatMap((group) => group.types.map((type) => ({ ...type, group })))
const filterState = reactive({ weather: '', skyColor: '', cloudAmount: '', cloudType: '' })
const openFilter = ref('')
const selectedPost = ref(null)
const likedPostIds = ref([])
const savedPostIds = ref([])
const isComposerOpen = ref(false)
const activeCloudHelp = ref('')
const formError = ref('')
const photoInput = ref(null)
const tagQuery = ref('')

const createEmptyDraft = () => ({
  type: 'tip',
  destination: '',
  title: '',
  content: '',
  author: '',
  imageUrl: '',
  capturedAt: '',
  capturedDate: '',
  capturedPeriod: '',
  capturedHour: '',
  capturedMinute: '',
  hashtagText: '',
  weather: '',
  skyColor: '',
  cloudAmount: '',
  cloudType: '',
})

const draft = ref(createEmptyDraft())

const visiblePosts = computed(() =>
  communityPostStore.posts.filter((post) =>
    (!filterState.weather || post.weather === filterState.weather)
    && (!filterState.skyColor || post.skyColor === filterState.skyColor)
    && (!filterState.cloudAmount || post.cloudAmount === filterState.cloudAmount)
    && (!filterState.cloudType || post.cloudType === filterState.cloudType)
    && (!tagQuery.value || (post.tags ?? []).some((tag) => tag.toLowerCase().includes(tagQuery.value.trim().toLowerCase()))),
  ),
)

const activeFilterCount = computed(() => Object.values(filterState).filter(Boolean).length)

const draftTags = computed(() => parseHashtags(draft.value.hashtagText))

const filterSummary = computed(() => {
  const labels = [
    filterState.weather,
    filterState.skyColor ? getSkyColorLabel(filterState.skyColor) : '',
    filterState.cloudAmount,
    filterState.cloudType ? getCloudLabel(filterState.cloudType) : '',
    tagQuery.value.trim(),
  ].filter(Boolean)
  return labels.length ? labels.join(' · ') : '모든 하늘'
})

function getCloudType(id) {
  return cloudTypes.find((type) => type.id === id)
}

function getCloudLabel(id) {
  const type = getCloudType(id)
  return type ? `${type.label} (${type.alias}) · ${type.code}` : '구름 형태'
}

function getSkyColorLabel(value) {
  return skyColorOptions.find((option) => option.value === value)?.label ?? value
}

function toggleFilter(name) {
  openFilter.value = openFilter.value === name ? '' : name
  activeCloudHelp.value = ''
}

function selectFilter(name, value) {
  filterState[name] = filterState[name] === value ? '' : value
  openFilter.value = ''
  activeCloudHelp.value = ''
}

function resetFilters() {
  Object.keys(filterState).forEach((key) => {
    filterState[key] = ''
  })
  tagQuery.value = ''
  openFilter.value = ''
}

function parseHashtags(value) {
  return [...new Set(
    value
      .split(/[\s,]+/)
      .map((tag) => tag.replace(/^#/, '').replace(/[^\p{L}\p{N}_-]/gu, '').trim().slice(0, 20))
      .filter(Boolean)
      .slice(0, 5)
      .map((tag) => `#${tag}`),
  )]
}

function filterByTag(tag) {
  tagQuery.value = tag
  selectedPost.value = null
}

function isLiked(post) {
  return likedPostIds.value.includes(post.id)
}

function isSaved(post) {
  return savedPostIds.value.includes(post.id)
}

function toggleListItem(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

function toggleLike(post) {
  likedPostIds.value = toggleListItem(likedPostIds.value, post.id)
}

function toggleSave(post) {
  savedPostIds.value = toggleListItem(savedPostIds.value, post.id)
}

function likeCount(post) {
  return post.likes + (isLiked(post) ? 1 : 0)
}

function openComposer() {
  formError.value = ''
  communityPostStore.clearError()
  isComposerOpen.value = true
}

function closeComposer() {
  isComposerOpen.value = false
  formError.value = ''
  activeCloudHelp.value = ''
  draft.value = createEmptyDraft()
  if (photoInput.value) photoInput.value.value = ''
}

function handlePhotoSelection(event) {
  const [file] = event.target.files ?? []
  if (!file) return

  if (!file.type.startsWith('image/')) {
    formError.value = '하늘 사진 파일만 선택해 주세요.'
    event.target.value = ''
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    formError.value = '사진은 2MB 이하로 선택해 주세요.'
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.addEventListener('load', () => {
    draft.value.imageUrl = String(reader.result)
    formError.value = ''
  })
  reader.readAsDataURL(file)
}

function removeDraftImage() {
  draft.value.imageUrl = ''
  if (photoInput.value) photoInput.value.value = ''
}

function syncCapturedAt() {
  const { capturedDate, capturedPeriod, capturedHour, capturedMinute } = draft.value

  if (!capturedDate || !capturedPeriod || !capturedHour || !capturedMinute) {
    draft.value.capturedAt = ''
    return
  }

  const hour = Number(capturedHour) % 12 + (capturedPeriod === 'PM' ? 12 : 0)
  draft.value.capturedAt = `${capturedDate}T${String(hour).padStart(2, '0')}:${capturedMinute}`
}

function validateDraft() {
  const requiredFields = [
    ['imageUrl', '하늘 사진'],
    ['destination', '장소'],
    ['title', '제목'],
    ['content', '기록'],
    ['weather', '오늘의 날씨'],
    ['skyColor', '하늘색'],
    ['cloudAmount', '구름 양'],
    ['cloudType', '구름 형태'],
  ]
  const missing = requiredFields.find(([field]) => !draft.value[field])
  if (missing) return `${missing[1]}을(를) 선택하거나 작성해 주세요.`

  const hasCapturedAtPart = draft.value.capturedDate || draft.value.capturedPeriod || draft.value.capturedHour || draft.value.capturedMinute
  if (hasCapturedAtPart && !draft.value.capturedAt) {
    return '촬영 시간을 남기려면 날짜와 오전/오후, 시, 분을 모두 선택해 주세요.'
  }

  return ''
}

function makePostPayload() {
  const post = { ...draft.value, tags: parseHashtags(draft.value.hashtagText) }
  delete post.capturedDate
  delete post.capturedPeriod
  delete post.capturedHour
  delete post.capturedMinute
  delete post.hashtagText
  return post
}

async function submitPost() {
  formError.value = validateDraft()
  if (formError.value) return

  try {
    const createdPost = await communityPostStore.createPost(makePostPayload())
    closeComposer()
    selectedPost.value = createdPost
  } catch {
    // 사용자에게는 store의 오류 메시지를 그대로 보여 준다.
  }
}

function formatRelativeDate(value) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60_000))
  if (minutes < 60) return `${minutes}분 전`
  if (minutes < 1_440) return `${Math.round(minutes / 60)}시간 전`
  return `${Math.round(minutes / 1_440)}일 전`
}

function formatCapturedAt(value) {
  if (!value) return ''

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

onMounted(() => {
  void communityPostStore.fetchPosts()
})
</script>

<template>
  <main class="sky-page">
    <section class="sky-hero" aria-labelledby="sky-title">
      <div>
        <p class="eyebrow">WEATHER FAIRY · SKY ARCHIVE</p>
        <h1 id="sky-title">오늘, 당신의 하늘은 어떤가요?</h1>
        <p>오늘 당신이 본 하늘을 함께 보고 싶어요.</p>
      </div>
      <button class="compose-fab" type="button" aria-label="하늘 사진 기록하기" @click="openComposer">
        <el-icon><Plus /></el-icon>
      </button>
    </section>

    <section class="sky-filter-bar" aria-label="하늘 기록 필터">
      <div class="filter-control">
        <span>날씨</span>
        <button class="filter-trigger" :class="{ active: filterState.weather }" type="button" :aria-expanded="openFilter === 'weather'" @click="toggleFilter('weather')">
          {{ filterState.weather || '전체' }}
        </button>
        <div v-if="openFilter === 'weather'" class="filter-menu" role="menu">
          <button v-for="option in weatherOptions" :key="option" type="button" :class="{ selected: filterState.weather === option }" @click="selectFilter('weather', option)">{{ option }}</button>
        </div>
      </div>

      <div class="filter-control">
        <span>하늘색</span>
        <button class="filter-trigger" :class="{ active: filterState.skyColor }" type="button" :aria-expanded="openFilter === 'skyColor'" @click="toggleFilter('skyColor')">
          {{ filterState.skyColor ? getSkyColorLabel(filterState.skyColor) : '전체' }}
        </button>
        <div v-if="openFilter === 'skyColor'" class="filter-menu" role="menu">
          <button v-for="option in skyColorOptions" :key="option.value" type="button" :class="{ selected: filterState.skyColor === option.value }" @click="selectFilter('skyColor', option.value)"><i class="color-dot" :style="{ backgroundColor: option.value }"></i>{{ option.label }}</button>
        </div>
      </div>

      <div class="filter-control">
        <span>구름 양</span>
        <button class="filter-trigger" :class="{ active: filterState.cloudAmount }" type="button" :aria-expanded="openFilter === 'cloudAmount'" @click="toggleFilter('cloudAmount')">
          {{ filterState.cloudAmount || '전체' }}
        </button>
        <div v-if="openFilter === 'cloudAmount'" class="filter-menu" role="menu">
          <button v-for="option in cloudAmountOptions" :key="option" type="button" :class="{ selected: filterState.cloudAmount === option }" @click="selectFilter('cloudAmount', option)">{{ option }}</button>
        </div>
      </div>

      <div class="filter-control filter-control--cloud">
        <span>구름 형태</span>
        <button class="filter-trigger" :class="{ active: filterState.cloudType }" type="button" :aria-expanded="openFilter === 'cloudType'" @click="toggleFilter('cloudType')">
          {{ filterState.cloudType ? getCloudLabel(filterState.cloudType) : '전체' }}
        </button>
        <div v-if="openFilter === 'cloudType'" class="filter-menu filter-menu--taxonomy" role="menu">
          <section v-for="group in cloudGroups" :key="group.id" class="cloud-group">
            <p><b>{{ group.label }}</b><span>{{ group.altitude }}</span></p>
            <div>
              <div v-for="cloud in group.types" :key="cloud.id" class="cloud-type-option">
                <button type="button" :class="{ selected: filterState.cloudType === cloud.id }" @click="selectFilter('cloudType', cloud.id)">
                  {{ cloud.label }} <small>({{ cloud.alias }}) · {{ cloud.code }}</small>
                </button>
                <button class="cloud-info-button" type="button" :aria-label="`${cloud.label} 설명 보기`" @mouseenter="activeCloudHelp = cloud.id" @mouseleave="activeCloudHelp = ''" @focus="activeCloudHelp = cloud.id" @blur="activeCloudHelp = ''" @click="activeCloudHelp = cloud.id">
                  <el-icon><InfoFilled /></el-icon>
                </button>
                <aside v-if="activeCloudHelp === cloud.id" class="cloud-tooltip" role="tooltip">
                  <img :src="cloud.imageUrl" :alt="`${cloud.label} 대표 모습`" />
                  <strong>{{ cloud.label }} <small>({{ cloud.alias }}) · {{ cloud.code }}</small></strong>
                  <span>{{ group.label }} · {{ group.altitude }}</span>
                  <p>{{ cloud.description }}</p>
                </aside>
              </div>
            </div>
          </section>
        </div>
      </div>

      <button v-if="activeFilterCount" class="reset-filter" type="button" @click="resetFilters"><el-icon><RefreshRight /></el-icon> 초기화</button>
    </section>

    <div class="feed-heading">
      <p><span class="status-dot" :class="{ offline: communityPostStore.errorMessage }"></span>{{ filterSummary }} · {{ visiblePosts.length }}장의 하늘</p>
      <div class="feed-heading-actions">
        <label class="tag-search"><span>#</span><input v-model.trim="tagQuery" type="search" placeholder="해시태그로 하늘 찾기" /></label>
      </div>
    </div>

    <section class="sky-feed" aria-live="polite" aria-label="오늘의 하늘 사진 피드">
      <div v-if="communityPostStore.isLoading && !communityPostStore.posts.length" class="feed-state">하늘 사진을 불러오는 중이에요…</div>
      <div v-else-if="communityPostStore.errorMessage" class="feed-state feed-state--error">{{ communityPostStore.errorMessage }}</div>
      <div v-else-if="!visiblePosts.length" class="feed-state">
        <strong>아직 이 조건의 하늘은 없어요.</strong>
        <span>필터를 하나 지우거나 첫 사진을 기록해 보세요.</span>
        <button type="button" @click="resetFilters">필터 초기화</button>
      </div>

      <article v-for="post in visiblePosts" :key="post.id" class="sky-card" :class="`sky-card--${post.id % 3}`">
        <button class="sky-card__media" type="button" :aria-label="`${post.title} 상세 보기`" @click="selectedPost = post">
          <img :src="post.imageUrl" :alt="post.title" />
          <span class="photo-shade"></span>
          <span class="sky-card__author"><b>{{ post.author }}</b><small><el-icon><Location /></el-icon>{{ post.destination }}</small></span>
          <span class="sky-card__weather">{{ post.weather }}<small>{{ formatRelativeDate(post.createdAt) }}</small></span>
          <span class="sky-card__caption">{{ post.content }}</span>
        </button>
        <footer>
          <div class="post-tags"><span class="sky-color-tag"><i :style="{ backgroundColor: post.skyColor }"></i>{{ getSkyColorLabel(post.skyColor) }}</span><span>{{ getCloudLabel(post.cloudType) }}</span></div>
          <div class="post-actions">
            <button type="button" :class="{ active: isLiked(post) }" :aria-pressed="isLiked(post)" @click="toggleLike(post)">♡ <span>{{ likeCount(post) }}</span></button>
            <button type="button" aria-label="댓글 수"> <el-icon><ChatDotRound /></el-icon><span>{{ post.comments }}</span></button>
            <button type="button" :class="{ active: isSaved(post) }" :aria-pressed="isSaved(post)" :aria-label="isSaved(post) ? '저장 취소' : '저장'" @click="toggleSave(post)">⌑</button>
          </div>
        </footer>
        <div v-if="post.tags?.length" class="card-hashtags" aria-label="게시글 해시태그">
          <button v-for="tag in post.tags" :key="tag" type="button" @click="filterByTag(tag)">{{ tag }}</button>
        </div>
      </article>
    </section>

    <Transition name="detail-fade">
      <section v-if="selectedPost" class="post-backdrop" aria-label="하늘 사진 상세 보기" @click.self="selectedPost = null">
        <article class="post-detail">
          <button class="detail-close" type="button" aria-label="상세 보기 닫기" @click="selectedPost = null">×</button>
          <img :src="selectedPost.imageUrl" :alt="selectedPost.title" />
          <div>
            <p class="eyebrow">TODAY’S SKY</p>
            <p class="detail-author"><b>{{ selectedPost.author }}</b> · {{ selectedPost.destination }} · {{ formatRelativeDate(selectedPost.createdAt) }}</p>
            <p v-if="selectedPost.capturedAt" class="detail-captured-at">이 하늘을 찍은 시간 · {{ formatCapturedAt(selectedPost.capturedAt) }}</p>
            <h2>{{ selectedPost.title }}</h2>
            <p>{{ selectedPost.content }}</p>
            <div class="detail-tags"><span>{{ selectedPost.weather }}</span><span class="sky-color-tag"><i :style="{ backgroundColor: selectedPost.skyColor }"></i>{{ getSkyColorLabel(selectedPost.skyColor) }}</span><span>구름 {{ selectedPost.cloudAmount }}</span><span>{{ getCloudLabel(selectedPost.cloudType) }}</span></div>
            <div v-if="selectedPost.tags?.length" class="detail-hashtags" aria-label="게시글 해시태그"><button v-for="tag in selectedPost.tags" :key="tag" type="button" @click="filterByTag(tag)">{{ tag }}</button></div>
          </div>
        </article>
      </section>
    </Transition>

    <Transition name="composer-fade">
      <section v-if="isComposerOpen" class="composer-backdrop" aria-label="하늘 사진 기록하기" @click.self="closeComposer">
        <form class="composer" @submit.prevent="submitPost">
          <header>
            <div>
              <p class="eyebrow">NEW SKY NOTE</p>
              <h2>오늘의 하늘을 남겨 보세요.</h2>
            </div>
            <button type="button" aria-label="작성창 닫기" @click="closeComposer">×</button>
          </header>

          <label class="photo-field" for="sky-photo">
            <input id="sky-photo" ref="photoInput" class="sr-only" type="file" accept="image/*" @change="handlePhotoSelection" />
            <img v-if="draft.imageUrl" :src="draft.imageUrl" alt="선택한 하늘 사진 미리보기" />
            <span v-else><el-icon><Picture /></el-icon><b>하늘 사진 선택</b><small>JPG, PNG · 2MB 이하</small></span>
            <button v-if="draft.imageUrl" type="button" aria-label="선택한 사진 제거" @click.prevent="removeDraftImage">×</button>
          </label>

          <div class="composer-grid">
            <label>장소<input v-model.trim="draft.destination" type="text" placeholder="예: 서울 마포구" maxlength="40" /></label>
            <label>작성자<input v-model.trim="draft.author" type="text" placeholder="비워 두면 익명 하늘지기" maxlength="30" /></label>
          </div>
          <label>한 줄 제목<input v-model.trim="draft.title" type="text" placeholder="이 하늘을 한마디로 남겨보세요" maxlength="100" /></label>
          <label>기록<textarea v-model.trim="draft.content" rows="3" placeholder="오늘 하늘에서 발견한 순간을 적어보세요." maxlength="600"></textarea></label>
          <label class="hashtag-field">해시태그 <small>선택 · 띄어쓰기나 쉼표로 최대 5개까지 적어 주세요.</small><input v-model="draft.hashtagText" type="text" placeholder="#아침하늘 #구름산책" maxlength="80" /></label>
          <div v-if="draftTags.length" class="hashtag-preview" aria-label="입력한 해시태그 미리보기"><span v-for="tag in draftTags" :key="tag">{{ tag }}</span></div>
          <section class="captured-at-field" aria-labelledby="captured-at-label">
            <div class="captured-at-copy">
              <b id="captured-at-label">사진을 찍은 시간</b>
              <small>선택 · 달력에서 날짜와 시간을 5분 단위로 남겨요.</small>
            </div>
            <div class="captured-at-inputs">
              <label>날짜<input v-model="draft.capturedDate" type="date" @change="syncCapturedAt" /></label>
              <label>오전/오후<select v-model="draft.capturedPeriod" @change="syncCapturedAt"><option value="">선택</option><option value="AM">AM</option><option value="PM">PM</option></select></label>
              <label>시<select v-model="draft.capturedHour" @change="syncCapturedAt"><option value="">시</option><option v-for="hour in hourOptions" :key="hour" :value="hour">{{ hour }}시</option></select></label>
              <label>분<select v-model="draft.capturedMinute" @change="syncCapturedAt"><option value="">분</option><option v-for="minute in minuteOptions" :key="minute" :value="minute">{{ minute }}분</option></select></label>
            </div>
          </section>

          <fieldset class="chip-fieldset">
            <legend>오늘의 날씨</legend>
            <label v-for="option in weatherOptions" :key="option" :class="{ active: draft.weather === option }"><input v-model="draft.weather" type="radio" :value="option" />{{ option }}</label>
          </fieldset>
          <section class="sky-color-field" aria-labelledby="sky-color-label">
            <div><b id="sky-color-label">하늘색</b><small>색상표에서 고르거나 원하는 색을 직접 선택해요.</small></div>
            <div class="sky-color-options">
              <button v-for="option in skyColorOptions" :key="option.value" type="button" :class="{ active: draft.skyColor === option.value }" :aria-label="option.label" :title="option.label" :style="{ backgroundColor: option.value }" @click="draft.skyColor = option.value"></button>
              <label class="custom-color-picker" title="직접 하늘색 선택"><input :value="draft.skyColor || '#5EBAE8'" type="color" aria-label="직접 하늘색 선택" @input="draft.skyColor = $event.target.value" /><span>+</span></label>
            </div>
            <p v-if="draft.skyColor" class="selected-color"><i :style="{ backgroundColor: draft.skyColor }"></i>{{ getSkyColorLabel(draft.skyColor) }} <small>{{ draft.skyColor.toUpperCase() }}</small></p>
          </section>
          <fieldset class="chip-fieldset">
            <legend>구름 양</legend>
            <label v-for="option in cloudAmountOptions" :key="option" :class="{ active: draft.cloudAmount === option }"><input v-model="draft.cloudAmount" type="radio" :value="option" />{{ option }}</label>
          </fieldset>

          <fieldset class="taxonomy-fieldset">
            <legend>구름 형태 <small>고도를 기준으로 나눴어요. 이름을 몰라도 <b>i</b>에 마우스를 올려 보고 골라요.</small></legend>
            <section v-for="group in cloudGroups" :key="group.id">
              <p><b>{{ group.label }}</b><span>{{ group.altitude }}</span></p>
              <div>
                <div v-for="cloud in group.types" :key="cloud.id" class="taxonomy-choice">
                  <label :class="{ active: draft.cloudType === cloud.id }"><input v-model="draft.cloudType" type="radio" :value="cloud.id" /><b>{{ cloud.label }}</b><small>({{ cloud.alias }}) · {{ cloud.code }}</small></label>
                  <button class="cloud-info-button" type="button" :aria-label="`${cloud.label} 설명 보기`" @mouseenter="activeCloudHelp = cloud.id" @mouseleave="activeCloudHelp = ''" @focus="activeCloudHelp = cloud.id" @blur="activeCloudHelp = ''" @click="activeCloudHelp = cloud.id"><el-icon><InfoFilled /></el-icon></button>
                  <aside v-if="activeCloudHelp === cloud.id" class="cloud-tooltip cloud-tooltip--composer" role="tooltip">
                    <img :src="cloud.imageUrl" :alt="`${cloud.label} 대표 모습`" />
                    <strong>{{ cloud.label }} <small>({{ cloud.alias }}) · {{ cloud.code }}</small></strong>
                    <p>{{ cloud.description }}</p>
                  </aside>
                </div>
              </div>
            </section>
          </fieldset>

          <p v-if="formError || communityPostStore.errorMessage" class="form-error" role="alert">{{ formError || communityPostStore.errorMessage }}</p>
          <footer>
            <span>사진과 분류는 Mock API에 저장되며 서버를 다시 시작하면 초기화됩니다.</span>
            <div>
              <button class="cancel-button" type="button" @click="closeComposer">취소</button>
              <button class="submit-button" type="submit" :disabled="communityPostStore.isCreating">{{ communityPostStore.isCreating ? '공유 중…' : '오늘의 하늘 공유' }}</button>
            </div>
          </footer>
        </form>
      </section>
    </Transition>
  </main>
</template>

<style scoped>
.sky-page { width: min(1320px, calc(100% - 40px)); min-height: 100vh; padding: 48px 0 90px; margin: 0 auto; color: #edf7ff; }
.sky-hero { display: flex; align-items: end; justify-content: space-between; gap: 32px; padding: 27px 0 28px; }
.eyebrow { margin: 0; color: #88d5ff; font-size: 11px; font-weight: 900; letter-spacing: .14em; }
.sky-hero h1 { margin: 8px 0 10px; font-size: clamp(34px, 4.8vw, 55px); letter-spacing: -.055em; }
.sky-hero p:last-child { margin: 0; color: #9db7c9; font-size: 15px; }
.compose-fab { display: grid; width: 58px; height: 58px; flex: 0 0 auto; color: #f4fbff; background: linear-gradient(135deg, #18a0d9, #6656e5); border: 1px solid #8ae7ff; border-radius: 50%; box-shadow: 0 0 26px rgba(79, 170, 255, .5); cursor: pointer; font-size: 25px; place-items: center; }
.compose-fab:hover, .compose-fab:focus-visible { filter: brightness(1.15); outline: none; transform: translateY(-2px); }
.sky-filter-bar { position: relative; z-index: 4; display: flex; flex-wrap: wrap; align-items: end; gap: 11px; padding: 15px; background: rgba(5, 16, 31, .86); border: 1px solid #1d405c; border-radius: 14px; box-shadow: inset 0 1px rgba(197, 241, 255, .04); }
.filter-control { position: relative; display: grid; gap: 6px; min-width: 130px; }
.filter-control > span { color: #9db9cb; font-size: 11px; font-weight: 800; }
.filter-trigger { min-height: 39px; padding: 0 12px; color: #d2e4ef; background: #07111f; border: 1px solid #284a65; border-radius: 8px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 800; text-align: left; }
.filter-trigger::after { float: right; margin-left: 18px; color: #7bb8da; content: '⌄'; }
.filter-trigger:hover, .filter-trigger:focus-visible, .filter-trigger.active { color: #edfaff; border-color: #48bcf5; box-shadow: 0 0 0 3px rgba(45, 171, 234, .1); outline: none; }
.filter-menu { position: absolute; z-index: 8; top: calc(100% + 7px); left: 0; display: grid; min-width: 190px; padding: 7px; background: #071321; border: 1px solid #34739a; border-radius: 10px; box-shadow: 0 18px 36px rgba(0, 0, 0, .44); }
.filter-menu > button, .cloud-type-option > button:first-child { padding: 9px 10px; color: #b8d0de; background: transparent; border: 0; border-radius: 7px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 700; text-align: left; }
.filter-menu > button { display: flex; align-items: center; gap: 8px; }
.color-dot { width: 12px; height: 12px; flex: 0 0 auto; border: 1px solid rgba(232, 251, 255, .65); border-radius: 50%; }
.filter-menu > button:hover, .filter-menu > button.selected, .cloud-type-option > button:first-child:hover, .cloud-type-option > button.selected { color: #edfbff; background: #103855; }
.filter-menu--taxonomy { width: min(720px, calc(100vw - 64px)); grid-template-columns: repeat(2, minmax(190px, 1fr)); gap: 10px; padding: 13px; }
.cloud-group { padding: 0 5px; }
.cloud-group > p, .taxonomy-fieldset section > p { display: flex; align-items: baseline; justify-content: space-between; gap: 9px; margin: 3px 0 7px; color: #e7f8ff; font-size: 12px; }
.cloud-group > p span, .taxonomy-fieldset section > p span { color: #7896aa; font-size: 10px; }
.cloud-type-option { position: relative; display: flex; align-items: center; }
.cloud-type-option > button:first-child { flex: 1; }
.cloud-type-option small { color: #7aa9c3; }
.cloud-info-button { display: grid; width: 27px; height: 27px; padding: 0; color: #96c9e7; background: transparent; border: 0; border-radius: 50%; cursor: help; font-size: 15px; place-items: center; }
.cloud-info-button:hover, .cloud-info-button:focus-visible { color: #effcff; background: #174763; outline: none; }
.cloud-tooltip { position: absolute; z-index: 12; top: 28px; left: calc(100% + 7px); width: 245px; overflow: hidden; color: #c6dce8; background: #0b1725; border: 1px solid #4a91b8; border-radius: 11px; box-shadow: 0 17px 36px rgba(0, 0, 0, .54); }
.cloud-group:nth-child(even) .cloud-tooltip { right: calc(100% + 7px); left: auto; }
.cloud-tooltip img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
.cloud-tooltip strong, .cloud-tooltip > span, .cloud-tooltip p { display: block; padding: 0 12px; }
.cloud-tooltip strong { padding-top: 10px; color: #ecfbff; font-size: 13px; }
.cloud-tooltip strong small { color: #80c7ec; }
.cloud-tooltip > span { padding-top: 3px; color: #779aaf; font-size: 10px; }
.cloud-tooltip p { margin: 7px 0 12px; color: #b1c9d7; font-size: 11px; line-height: 1.5; }
.reset-filter { display: inline-flex; align-items: center; gap: 4px; min-height: 35px; padding: 0 7px; color: #86a9be; background: transparent; border: 0; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; }
.reset-filter:hover { color: #dff5ff; }
.feed-heading { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 18px 2px 12px; }
.feed-heading p { display: flex; align-items: center; gap: 7px; margin: 0; color: #91afc0; font-size: 13px; }
.feed-heading-actions { display: flex; align-items: center; gap: 12px; }
.tag-search { display: flex; align-items: center; width: 190px; overflow: hidden; color: #70c9ef; background: #061421; border: 1px solid #254f6a; border-radius: 8px; }
.tag-search:focus-within { border-color: #52c9fa; box-shadow: 0 0 0 3px rgba(53, 186, 255, .11); }
.tag-search span { padding-left: 10px; font-size: 14px; font-weight: 900; }
.tag-search input { width: 100%; min-width: 0; padding: 8px 9px 8px 4px; color: #dff5ff; background: transparent; border: 0; outline: 0; font: inherit; font-size: 12px; }
.tag-search input::placeholder { color: #7796a8; }
.status-dot { width: 7px; height: 7px; background: #72e4c0; border-radius: 50%; box-shadow: 0 0 9px #4be1ad; }
.status-dot.offline { background: #ff8f9d; box-shadow: 0 0 9px #ef627b; }
.text-compose { color: #94d9fa; background: transparent; border: 0; cursor: pointer; font: inherit; font-size: 13px; font-weight: 900; }
.text-compose:hover, .text-compose:focus-visible { color: #e9faff; outline: none; text-decoration: underline; }
.sky-feed { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-auto-flow: row dense; gap: 14px; }
.sky-card { overflow: hidden; background: #07111f; border: 1px solid #193a53; border-radius: 12px; box-shadow: 0 10px 28px rgba(0, 0, 0, .16); }
.sky-card--1 { grid-row: span 2; }
.sky-card__media { position: relative; display: block; width: 100%; min-height: 275px; padding: 0; overflow: hidden; color: #effaff; background: #07111f; border: 0; cursor: pointer; text-align: left; }
.sky-card--1 .sky-card__media { min-height: 474px; }
.sky-card--2 .sky-card__media { min-height: 316px; }
.sky-card__media img { display: block; width: 100%; height: 100%; min-height: inherit; object-fit: cover; transition: transform .35s ease; }
.sky-card__media:hover img, .sky-card__media:focus-visible img { transform: scale(1.035); }
.sky-card__media:focus-visible { outline: 2px solid #73d9ff; outline-offset: -2px; }
.photo-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(1, 7, 17, .14), transparent 42%, rgba(1, 7, 17, .89)); pointer-events: none; }
.sky-card__author, .sky-card__weather, .sky-card__caption { position: absolute; z-index: 1; display: grid; }
.sky-card__author { top: 13px; left: 13px; gap: 2px; text-shadow: 0 1px 5px #07111f; }
.sky-card__author b { font-size: 13px; }
.sky-card__author small { display: inline-flex; align-items: center; gap: 3px; color: #d5eaf5; font-size: 10px; }
.sky-card__weather { top: 14px; right: 13px; gap: 2px; color: #f2fbff; font-size: 12px; font-weight: 900; text-align: right; text-shadow: 0 1px 5px #07111f; }
.sky-card__weather small { color: #d4e9f6; font-size: 10px; font-weight: 700; }
.sky-card__caption { right: 13px; bottom: 13px; left: 13px; color: #edf9ff; font-size: 13px; font-weight: 700; line-height: 1.45; text-shadow: 0 1px 4px #07111f; }
.sky-card footer { display: flex; align-items: center; justify-content: space-between; gap: 9px; min-height: 48px; padding: 8px 10px; }
.post-tags { display: flex; min-width: 0; gap: 5px; overflow: hidden; }
.post-tags span, .detail-tags span { overflow: hidden; max-width: 120px; padding: 4px 6px; color: #9bd8f4; background: #0c2940; border: 1px solid #205778; border-radius: 5px; font-size: 10px; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.sky-color-tag { display: inline-flex; align-items: center; gap: 4px; }
.sky-color-tag i, .selected-color i { width: 9px; height: 9px; flex: 0 0 auto; border: 1px solid rgba(235, 250, 255, .8); border-radius: 50%; }
.card-hashtags { display: flex; flex-wrap: wrap; gap: 5px; padding: 0 10px 10px; }
.card-hashtags button, .detail-hashtags button, .hashtag-preview span { padding: 4px 6px; color: #91d5f5; background: rgba(25, 91, 126, .22); border: 1px solid #245c7e; border-radius: 5px; font: inherit; font-size: 10px; font-weight: 800; }
.card-hashtags button, .detail-hashtags button { cursor: pointer; }
.card-hashtags button:hover, .card-hashtags button:focus-visible, .detail-hashtags button:hover, .detail-hashtags button:focus-visible { color: #e9fbff; background: #164b6a; border-color: #5fcffb; outline: none; }
.post-actions { display: flex; align-items: center; gap: 3px; }
.post-actions button { display: inline-flex; align-items: center; gap: 3px; min-height: 29px; padding: 0 4px; color: #8eaebe; background: transparent; border: 0; cursor: pointer; font: inherit; font-size: 12px; }
.post-actions button:hover, .post-actions button.active { color: #9ee5ff; }
.feed-state { display: grid; grid-column: 1 / -1; min-height: 320px; gap: 8px; padding: 24px; color: #a8c3d2; background: #07111f; border: 1px dashed #2a5877; border-radius: 12px; place-content: center; text-align: center; }
.feed-state strong { color: #eaf9ff; }
.feed-state button { width: fit-content; justify-self: center; padding: 9px 11px; color: #a3e1fb; background: #0c2d46; border: 1px solid #28739a; border-radius: 7px; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; }
.feed-state--error { color: #ffbdc6; }
.post-backdrop, .composer-backdrop { position: fixed; z-index: 20; inset: 0; display: grid; padding: 20px; background: rgba(0, 5, 15, .78); backdrop-filter: blur(8px); overflow-y: auto; place-items: center; }
.post-detail { position: relative; display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(280px, .85fr); width: min(940px, 100%); overflow: hidden; background: #091727; border: 1px solid #4389b0; border-radius: 16px; box-shadow: 0 28px 75px rgba(0, 0, 0, .6); }
.post-detail > img { width: 100%; min-height: 470px; height: 100%; object-fit: cover; }
.post-detail > div { align-self: center; padding: 38px; }
.detail-close, .composer header > button, .photo-field > button { display: grid; width: 31px; height: 31px; padding: 0; color: #d0e7f2; background: rgba(2, 12, 23, .78); border: 1px solid #4b89ac; border-radius: 50%; cursor: pointer; font: inherit; font-size: 20px; place-items: center; }
.detail-close { position: absolute; z-index: 2; top: 13px; right: 13px; }
.detail-author { margin: 13px 0 7px; color: #9dc7da; font-size: 12px; }
.detail-author b { color: #effbff; }
.detail-captured-at { margin: 0 0 14px; color: #75bce1 !important; font-size: 11px; font-weight: 800; }
.post-detail h2 { margin: 0; color: #eefaff; font-size: clamp(23px, 3vw, 34px); line-height: 1.25; letter-spacing: -.04em; }
.post-detail > div > p:not(.eyebrow):not(.detail-author):not(.detail-captured-at) { color: #bad1dc; line-height: 1.75; }
.detail-tags { display: flex; flex-wrap: wrap; gap: 6px; padding-top: 15px; border-top: 1px solid #254961; }
.detail-hashtags { display: flex; flex-wrap: wrap; gap: 6px; padding-top: 10px; }
.composer { display: grid; gap: 16px; width: min(720px, 100%); padding: 27px; color: #dbf4ff; background: #081727; border: 1px solid #2d82ae; border-radius: 18px; box-shadow: 0 26px 70px rgba(0, 0, 0, .52), 0 0 30px rgba(20, 168, 243, .13); }
.composer header, .composer footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.composer h2 { margin: 5px 0 0; color: #effbff; font-size: 23px; }
.photo-field { position: relative; display: grid; min-height: 190px; overflow: hidden; color: #a7c7d7; background: #040f1d; border: 1px dashed #367697; border-radius: 11px; cursor: pointer; place-items: center; }
.photo-field:hover { border-color: #76ddff; background: #06192a; }
.photo-field > span { display: grid; gap: 6px; justify-items: center; font-size: 13px; }
.photo-field > span .el-icon { color: #7bdcfe; font-size: 29px; }
.photo-field > span small { color: #7899aa; font-size: 11px; }
.photo-field > img { width: 100%; height: 250px; object-fit: cover; }
.photo-field > button { position: absolute; top: 10px; right: 10px; }
.composer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.composer > label:not(.photo-field), .composer-grid label { display: grid; gap: 7px; color: #a5c1cf; font-size: 12px; font-weight: 800; }
.composer input[type='text'], .composer input[type='date'], .composer select, .composer textarea { width: 100%; padding: 11px; color: #eaf9ff; background: #030d18; border: 1px solid #28546e; border-radius: 8px; outline: none; font: inherit; font-size: 14px; line-height: 1.5; resize: vertical; }
.composer input[type='text']:focus, .composer input[type='date']:focus, .composer select:focus, .composer textarea:focus { border-color: #5bd4ff; box-shadow: 0 0 0 3px rgba(53, 186, 255, .13); }
.hashtag-field { display: grid; gap: 7px; color: #a5c1cf; font-size: 12px; font-weight: 800; }
.hashtag-field small { color: #7897aa; font-weight: 600; }
.hashtag-preview { display: flex; flex-wrap: wrap; gap: 6px; margin-top: -8px; }
.captured-at-field { display: grid; grid-template-columns: minmax(150px, .8fr) minmax(0, 1.2fr); align-items: center; gap: 20px; padding: 15px 16px; background: linear-gradient(110deg, rgba(12, 47, 71, .8), rgba(5, 21, 35, .82)); border: 1px solid #285d7d; border-radius: 11px; }
.captured-at-copy { display: grid; gap: 5px; }
.captured-at-copy b { color: #d9f3ff; font-size: 13px; }
.captured-at-copy small { color: #7eabc2; font-size: 11px; font-weight: 600; line-height: 1.45; }
.captured-at-inputs { display: grid; grid-template-columns: minmax(122px, 1.25fr) repeat(3, minmax(64px, .7fr)); gap: 9px; }
.captured-at-inputs label { display: grid; gap: 6px; color: #97b9ca; font-size: 11px; font-weight: 800; }
.captured-at-inputs input, .captured-at-inputs select { min-height: 44px; color-scheme: dark; }
.sky-color-field { display: grid; grid-template-columns: minmax(160px, .9fr) minmax(0, 1.1fr); align-items: center; gap: 16px; padding: 14px 16px; background: #061726; border: 1px solid #28546e; border-radius: 11px; }
.sky-color-field > div:first-child { display: grid; gap: 4px; }
.sky-color-field b { color: #d9f3ff; font-size: 13px; }
.sky-color-field small { color: #7897aa; font-size: 11px; font-weight: 600; }
.sky-color-options { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.sky-color-options button, .custom-color-picker { position: relative; width: 29px; height: 29px; padding: 0; border: 2px solid rgba(223, 247, 255, .35); border-radius: 50%; cursor: pointer; }
.sky-color-options button:hover, .sky-color-options button.active, .custom-color-picker:focus-within { border-color: #effdff; box-shadow: 0 0 0 3px rgba(85, 203, 247, .25); outline: none; transform: scale(1.08); }
.custom-color-picker { display: grid; overflow: hidden; color: #c8eeff; background: conic-gradient(#ef7272, #f4d85a, #77dba5, #5fc8f5, #8062e7, #ef7272); font-size: 17px; font-weight: 900; place-items: center; }
.custom-color-picker input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.custom-color-picker span { pointer-events: none; text-shadow: 0 1px 4px #00111e; }
.selected-color { grid-column: 2; display: inline-flex; align-items: center; gap: 6px; margin: -8px 0 0; color: #b9dcea; font-size: 11px; font-weight: 800; }
.selected-color small { color: #749bb0; }
.chip-fieldset, .taxonomy-fieldset { display: flex; flex-wrap: wrap; gap: 7px; padding: 0; margin: 0; border: 0; }
.chip-fieldset legend, .taxonomy-fieldset legend { width: 100%; margin-bottom: 2px; color: #a5c1cf; font-size: 12px; font-weight: 800; }
.chip-fieldset label { padding: 7px 9px; color: #92adbd; background: #04101c; border: 1px solid #244d69; border-radius: 7px; cursor: pointer; font-size: 12px; font-weight: 800; }
.chip-fieldset label.active { color: #e9fbff; background: #092a45; border-color: #3bc0f6; }
.chip-fieldset input, .taxonomy-choice input { position: absolute; opacity: 0; pointer-events: none; }
.taxonomy-fieldset { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px; padding-top: 3px; }
.taxonomy-fieldset legend { grid-column: 1 / -1; }
.taxonomy-fieldset legend small { color: #7897aa; font-weight: 600; }
.taxonomy-fieldset section { padding: 9px; background: #061321; border: 1px solid #1d4560; border-radius: 9px; }
.taxonomy-fieldset section > div { display: grid; gap: 5px; }
.taxonomy-choice { position: relative; display: flex; align-items: center; gap: 2px; }
.taxonomy-choice label { display: flex; align-items: baseline; flex: 1; gap: 5px; padding: 6px 7px; color: #acccdc; border: 1px solid transparent; border-radius: 6px; cursor: pointer; font-size: 12px; }
.taxonomy-choice label small { color: #749bae; font-size: 10px; }
.taxonomy-choice label.active { color: #effcff; background: #0d3551; border-color: #3ca9dd; }
.cloud-tooltip--composer { top: calc(100% + 4px); left: 0; }
.form-error { margin: -4px 0 0; color: #ffadb8; font-size: 12px; }
.composer footer { color: #7290a2; font-size: 11px; }
.composer footer > div { display: flex; gap: 8px; }
.cancel-button, .submit-button { min-height: 39px; padding: 0 12px; border-radius: 8px; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; }
.cancel-button { color: #9ab4c3; background: transparent; border: 1px solid #2e5a73; }
.submit-button { color: #effbff; background: linear-gradient(135deg, #137cb5, #6453dd); border: 1px solid #64d8ff; box-shadow: 0 0 19px rgba(53, 186, 255, .18); }
.submit-button:disabled { opacity: .65; cursor: wait; }
.detail-fade-enter-active, .detail-fade-leave-active, .composer-fade-enter-active, .composer-fade-leave-active { transition: opacity .18s ease; }
.detail-fade-enter-from, .detail-fade-leave-to, .composer-fade-enter-from, .composer-fade-leave-to { opacity: 0; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
@media (max-width: 860px) { .sky-page { width: calc(100% - 28px); padding-top: 27px; } .sky-feed { grid-template-columns: repeat(2, minmax(0, 1fr)); } .sky-card--1 { grid-row: auto; } .sky-card--1 .sky-card__media { min-height: 380px; } .filter-menu--taxonomy { left: auto; right: 0; } }
@media (max-width: 640px) { .sky-hero { align-items: flex-start; } .sky-hero h1 { font-size: 34px; } .filter-control { min-width: calc(50% - 6px); } .filter-control--cloud { min-width: 100%; } .filter-menu--taxonomy { width: min(520px, calc(100vw - 38px)); grid-template-columns: 1fr; } .sky-feed { grid-template-columns: 1fr; } .sky-card--1 .sky-card__media, .sky-card--2 .sky-card__media, .sky-card__media { min-height: 340px; } .post-detail { grid-template-columns: 1fr; } .post-detail > img { min-height: 260px; max-height: 340px; } .post-detail > div { padding: 27px 22px; } .composer-backdrop, .post-backdrop { align-items: start; padding: 10px; } .composer { padding: 21px 16px; } .composer-grid, .taxonomy-fieldset, .captured-at-field, .captured-at-inputs, .sky-color-field { grid-template-columns: 1fr; } .captured-at-field { gap: 12px; padding: 14px; } .selected-color { grid-column: auto; margin-top: -5px; } .composer footer { align-items: flex-start; flex-direction: column; } .cloud-tooltip { position: fixed; top: auto; right: 18px; bottom: 18px; left: 18px; width: auto; } }
</style>
