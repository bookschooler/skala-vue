<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useCommunityPostStore } from '../stores/communityPostStore.js'

const communityPostStore = useCommunityPostStore()

const postTypes = [
  { id: 'all', label: '전체 기록' },
  { id: 'tip', label: '여행 팁' },
  { id: 'review', label: '여행 후기' },
]

const createEmptyDraft = () => ({
  type: 'tip',
  destination: '',
  title: '',
  content: '',
  author: '',
})

const activeType = ref('all')
const searchQuery = ref('')
const selectedPost = ref(null)
const isComposerOpen = ref(false)
const draft = ref(createEmptyDraft())
const formError = ref('')

const visiblePosts = computed(() =>
  activeType.value === 'all'
    ? communityPostStore.posts
    : communityPostStore.posts.filter((post) => post.type === activeType.value),
)

const postTypeLabel = (type) => (type === 'review' ? '여행 후기' : '여행 팁')

const formatDate = (value) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const submitSearch = () => communityPostStore.fetchPosts(searchQuery.value)

const clearSearch = () => {
  searchQuery.value = ''
  void communityPostStore.fetchPosts()
}

const selectPost = (post) => {
  selectedPost.value = post
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openComposer = () => {
  formError.value = ''
  communityPostStore.clearError()
  isComposerOpen.value = true
}

const closeComposer = () => {
  isComposerOpen.value = false
  formError.value = ''
  draft.value = createEmptyDraft()
}

const submitPost = async () => {
  if (!draft.value.destination || !draft.value.title || !draft.value.content) {
    formError.value = '여행지, 제목, 기록 내용을 모두 작성해 주세요.'
    return
  }

  formError.value = ''
  try {
    const createdPost = await communityPostStore.createPost(draft.value)
    selectedPost.value = createdPost
    closeComposer()
  } catch {
    // 사용자에게는 store의 errorMessage를 그대로 보여 준다.
  }
}

onMounted(() => {
  void communityPostStore.fetchPosts()
})
</script>

<template>
  <main class="community-page">
    <RouterLink class="back-link" to="/">← 날씨 지도로 돌아가기</RouterLink>

    <section class="community-hero" aria-labelledby="community-title">
      <div>
        <p class="eyebrow">WEATHER FAIRY · TRAVEL CIRCLE</p>
        <h1 id="community-title">날씨가 남긴 여행의 기록</h1>
        <p>
          누군가의 우산 팁부터 해 질 무렵의 풍경까지. 다음 여행의 동선을 함께 채워 보세요.
        </p>
      </div>
      <button class="write-button" type="button" @click="openComposer">+ 기록 남기기</button>
    </section>

    <section class="community-board" aria-label="여행 기록 게시판">
      <div class="board-toolbar">
        <div class="type-tabs" role="tablist" aria-label="게시글 종류">
          <button
            v-for="type in postTypes"
            :id="`post-type-${type.id}`"
            :key="type.id"
            :class="{ active: activeType === type.id }"
            type="button"
            role="tab"
            :aria-selected="activeType === type.id"
            @click="activeType = type.id"
          >
            {{ type.label }}
          </button>
        </div>

        <form class="post-search" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="community-search">여행 기록 검색</label>
          <input
            id="community-search"
            v-model.trim="searchQuery"
            type="search"
            placeholder="여행지, 제목, 작성자 검색"
            autocomplete="off"
          />
          <button type="submit">검색</button>
          <button v-if="searchQuery" class="clear-search" type="button" aria-label="검색어 지우기" @click="clearSearch">×</button>
        </form>
      </div>

      <p class="board-caption">
        <span class="status-dot" :class="{ 'status-dot--offline': communityPostStore.errorMessage }"></span>
        <template v-if="communityPostStore.isLoading">여행 기록을 불러오는 중이에요.</template>
        <template v-else-if="communityPostStore.errorMessage">{{ communityPostStore.errorMessage }}</template>
        <template v-else-if="communityPostStore.lastQuery">‘{{ communityPostStore.lastQuery }}’ 검색 결과 {{ visiblePosts.length }}개</template>
        <template v-else>여행자 {{ visiblePosts.length }}명의 최신 기록</template>
      </p>

      <div class="board-content">
        <section class="post-list" aria-live="polite">
          <div v-if="communityPostStore.isLoading && !communityPostStore.posts.length" class="state-card">
            기록을 찾고 있어요…
          </div>
          <button
            v-for="post in visiblePosts"
            :key="post.id"
            class="post-card"
            :class="{ 'post-card--selected': selectedPost?.id === post.id }"
            type="button"
            :aria-pressed="selectedPost?.id === post.id"
            @click="selectPost(post)"
          >
            <span class="post-card__topline">
              <span :class="['post-kind', `post-kind--${post.type}`]">{{ postTypeLabel(post.type) }}</span>
              <time :datetime="post.createdAt">{{ formatDate(post.createdAt) }}</time>
            </span>
            <strong>{{ post.title }}</strong>
            <span class="post-card__summary">{{ post.content }}</span>
            <span class="post-card__meta"><b>{{ post.destination }}</b> · {{ post.author }}</span>
          </button>

          <div v-if="!communityPostStore.isLoading && !visiblePosts.length" class="state-card">
            <strong>아직 일치하는 여행 기록이 없어요.</strong>
            <span>검색어를 바꾸거나 첫 번째 기록을 남겨 보세요.</span>
          </div>
        </section>

        <Transition name="detail-fade" mode="out-in">
          <aside v-if="selectedPost" :key="selectedPost.id" class="post-detail" aria-label="선택한 여행 기록">
            <div class="post-detail__topline">
              <span :class="['post-kind', `post-kind--${selectedPost.type}`]">{{ postTypeLabel(selectedPost.type) }}</span>
              <button type="button" aria-label="상세 기록 닫기" @click="selectedPost = null">×</button>
            </div>
            <p class="post-detail__destination">✦ {{ selectedPost.destination }}</p>
            <h2>{{ selectedPost.title }}</h2>
            <p class="post-detail__content">{{ selectedPost.content }}</p>
            <footer>
              <span>{{ selectedPost.author }}</span>
              <time :datetime="selectedPost.createdAt">{{ formatDate(selectedPost.createdAt) }} 작성</time>
            </footer>
          </aside>
          <aside v-else class="board-guide">
            <span class="board-guide__spark">✦</span>
            <h2>마음에 닿는 기록을 선택해 보세요</h2>
            <p>상세 내용은 같은 화면에서 바뀌므로 목록의 맥락을 잃지 않습니다.</p>
            <button type="button" @click="openComposer">나의 여행 기록 쓰기</button>
          </aside>
        </Transition>
      </div>
    </section>

    <Transition name="composer-fade">
      <section v-if="isComposerOpen" class="composer-backdrop" aria-label="여행 기록 작성">
        <form class="composer" @submit.prevent="submitPost">
          <header>
            <div>
              <p class="eyebrow">NEW TRAVEL NOTE</p>
              <h2>어떤 장면을 나누고 싶나요?</h2>
            </div>
            <button type="button" aria-label="작성창 닫기" @click="closeComposer">×</button>
          </header>

          <fieldset class="composer-type">
            <legend>기록 종류</legend>
            <label :class="{ active: draft.type === 'tip' }">
              <input v-model="draft.type" type="radio" value="tip" /> 여행 팁
            </label>
            <label :class="{ active: draft.type === 'review' }">
              <input v-model="draft.type" type="radio" value="review" /> 여행 후기
            </label>
          </fieldset>

          <div class="composer-grid">
            <label>여행지<input v-model.trim="draft.destination" type="text" placeholder="예: 오사카" maxlength="40" required /></label>
            <label>작성자<input v-model.trim="draft.author" type="text" placeholder="비워 두면 익명 여행자" maxlength="30" /></label>
          </div>
          <label>제목<input v-model.trim="draft.title" type="text" placeholder="나만의 여행 팁이나 후기를 적어 주세요" maxlength="100" required /></label>
          <label>기록 내용<textarea v-model.trim="draft.content" rows="6" placeholder="날씨, 이동 경로, 좋았던 순간을 자유롭게 남겨 주세요." maxlength="1000" required></textarea></label>
          <p v-if="formError || communityPostStore.errorMessage" class="form-error" role="alert">{{ formError || communityPostStore.errorMessage }}</p>
          <footer>
            <span>Mock API에 저장되며 서버를 재시작하면 초기화됩니다.</span>
            <div>
              <button class="cancel-button" type="button" @click="closeComposer">취소</button>
              <button class="submit-button" type="submit" :disabled="communityPostStore.isCreating">
                {{ communityPostStore.isCreating ? '남기는 중…' : '여행 기록 남기기' }}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </Transition>
  </main>
</template>

<style scoped>
.community-page { width: min(1180px, calc(100% - 32px)); min-height: 100vh; padding: 42px 0 84px; margin: 0 auto; color: #eaf7ff; }
.back-link { display: inline-flex; color: #9fd2ec; font-size: 14px; font-weight: 700; text-decoration: none; }
.back-link:hover, .back-link:focus-visible { color: #ecfbff; outline: none; text-decoration: underline; }
.community-hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 28px; padding: 31px 0 30px; }
.eyebrow { margin: 0; color: #82d7ff; font-size: 11px; font-weight: 900; letter-spacing: .14em; }
.community-hero h1 { max-width: 760px; margin: 8px 0 10px; font-size: clamp(31px, 5vw, 53px); letter-spacing: -.05em; }
.community-hero > div > p:last-child { max-width: 680px; margin: 0; color: #9eb8c8; line-height: 1.6; }
.write-button, .board-guide button, .submit-button { min-height: 46px; padding: 0 17px; color: #effbff; background: linear-gradient(135deg, #137cb5, #6453dd); border: 1px solid #64d8ff; border-radius: 11px; box-shadow: 0 0 23px rgba(53, 186, 255, .24); cursor: pointer; font: inherit; font-size: 14px; font-weight: 900; white-space: nowrap; }
.write-button:hover, .board-guide button:hover, .submit-button:hover:not(:disabled) { filter: brightness(1.13); transform: translateY(-1px); }
.community-board { overflow: hidden; background: rgba(4, 15, 29, .84); border: 1px solid #1c4b6c; border-radius: 19px; box-shadow: 0 0 40px rgba(0, 129, 211, .1), inset 0 1px rgba(190, 240, 255, .04); }
.board-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 15px; border-bottom: 1px solid rgba(39, 88, 120, .64); }
.type-tabs { display: flex; gap: 5px; }
.type-tabs button { min-height: 36px; padding: 0 11px; color: #92afc0; background: transparent; border: 1px solid transparent; border-radius: 8px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 800; }
.type-tabs button:hover, .type-tabs button:focus-visible, .type-tabs button.active { color: #e8f9ff; background: #09243d; border-color: #278bc1; box-shadow: inset 0 0 16px rgba(32, 148, 221, .1); outline: none; }
.post-search { display: flex; align-items: center; min-width: min(360px, 100%); overflow: hidden; background: #020b16; border: 1px solid #275671; border-radius: 9px; }
.post-search input { flex: 1; min-width: 0; min-height: 37px; padding: 0 10px; color: #e7f8ff; background: transparent; border: 0; outline: 0; font: inherit; font-size: 13px; }
.post-search input::placeholder { color: #6f899b; }
.post-search button { min-height: 37px; padding: 0 12px; color: #b9eaff; background: #0b3858; border: 0; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; }
.post-search .clear-search { padding: 0 9px; color: #9db4c4; background: transparent; font-size: 19px; }
.board-caption { display: flex; align-items: center; gap: 7px; min-height: 39px; padding: 0 17px; margin: 0; color: #87a5b7; border-bottom: 1px solid rgba(35, 79, 107, .4); font-size: 12px; }
.status-dot { width: 7px; height: 7px; background: #72e4c0; border-radius: 50%; box-shadow: 0 0 9px #4be1ad; }
.status-dot--offline { background: #ff8f9d; box-shadow: 0 0 9px #ef627b; }
.board-content { display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(310px, .88fr); min-height: 510px; }
.post-list { display: grid; align-content: start; gap: 8px; padding: 13px; border-right: 1px solid rgba(35, 79, 107, .55); }
.post-card { display: grid; gap: 7px; width: 100%; padding: 15px; color: inherit; background: #040f1d; border: 1px solid #173e5b; border-radius: 12px; cursor: pointer; text-align: left; }
.post-card:hover, .post-card:focus-visible, .post-card--selected { background: linear-gradient(110deg, rgba(12, 51, 79, .88), rgba(15, 28, 67, .86)); border-color: #4ab9ea; box-shadow: 0 0 20px rgba(39, 169, 237, .16); outline: none; }
.post-card__topline, .post-detail__topline, .post-detail footer, .composer header, .composer footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.post-kind { display: inline-flex; align-items: center; width: fit-content; padding: 4px 7px; border-radius: 5px; font-size: 10px; font-weight: 900; letter-spacing: .04em; }
.post-kind--tip { color: #a1f2dd; background: rgba(24, 143, 114, .17); border: 1px solid rgba(75, 229, 183, .36); }
.post-kind--review { color: #d5bdff; background: rgba(111, 60, 220, .15); border: 1px solid rgba(181, 134, 255, .35); }
.post-card time { color: #718ea1; font-size: 11px; }
.post-card > strong { overflow: hidden; color: #e5f8ff; font-size: 16px; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
.post-card__summary { display: -webkit-box; overflow: hidden; color: #9bb4c3; font-size: 13px; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.post-card__meta { color: #78cbed; font-size: 12px; }
.post-card__meta b { color: #bcf0ff; }
.state-card { display: grid; gap: 7px; min-height: 130px; padding: 22px; color: #a8c3d2; background: #040f1d; border: 1px dashed #2a5877; border-radius: 12px; place-content: center; text-align: center; }
.state-card strong { color: #ddf7ff; }
.post-detail, .board-guide { display: grid; align-content: center; min-height: 100%; padding: 34px; }
.post-detail { background: radial-gradient(circle at 100% 0, rgba(48, 110, 211, .22), transparent 47%), #071524; }
.post-detail__topline button, .composer header > button { display: grid; width: 31px; height: 31px; padding: 0; color: #a7c4d2; background: transparent; border: 1px solid #2b5d7b; border-radius: 50%; cursor: pointer; font: inherit; font-size: 21px; line-height: 1; place-items: center; }
.post-detail__destination { margin: 29px 0 7px; color: #85dfff; font-size: 13px; font-weight: 800; }
.post-detail h2 { margin: 0; color: #f0fbff; font-size: clamp(21px, 2.5vw, 31px); line-height: 1.28; letter-spacing: -.03em; }
.post-detail__content { margin: 22px 0 30px; color: #b8d0dc; font-size: 15px; line-height: 1.8; white-space: pre-wrap; }
.post-detail footer { padding-top: 15px; color: #89b8cc; border-top: 1px solid rgba(61, 121, 152, .45); font-size: 12px; }
.post-detail footer span { color: #d5eff8; font-weight: 800; }
.board-guide { justify-items: center; background: radial-gradient(circle at 50% 45%, rgba(31, 115, 191, .17), transparent 45%); text-align: center; }
.board-guide__spark { color: #a7eeff; font-size: 30px; text-shadow: 0 0 20px #27b9ff; }
.board-guide h2 { max-width: 250px; margin: 16px 0 9px; color: #e8f8ff; font-size: 20px; line-height: 1.4; }
.board-guide p { max-width: 260px; margin: 0 0 22px; color: #88a8b9; font-size: 13px; line-height: 1.6; }
.board-guide button { min-height: 40px; font-size: 12px; }
.detail-fade-enter-active, .detail-fade-leave-active, .composer-fade-enter-active, .composer-fade-leave-active { transition: opacity .18s ease, transform .18s ease; }
.detail-fade-enter-from, .detail-fade-leave-to { opacity: 0; transform: translateY(7px); }
.composer-backdrop { position: fixed; z-index: 20; inset: 0; display: grid; padding: 20px; background: rgba(0, 6, 15, .74); backdrop-filter: blur(8px); overflow-y: auto; place-items: center; }
.composer { display: grid; gap: 16px; width: min(640px, 100%); padding: 27px; color: #dbf4ff; background: #071625; border: 1px solid #2d82ae; border-radius: 18px; box-shadow: 0 26px 70px rgba(0, 0, 0, .52), 0 0 30px rgba(20, 168, 243, .13); }
.composer h2 { margin: 5px 0 0; color: #effbff; font-size: 23px; }
.composer-type { display: flex; gap: 8px; padding: 0; margin: 0; border: 0; }
.composer-type legend { width: 100%; margin-bottom: 6px; color: #8faebe; font-size: 12px; font-weight: 700; }
.composer-type label { padding: 8px 10px; color: #89a8ba; background: #04101c; border: 1px solid #244d69; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 800; }
.composer-type label.active { color: #e9fbff; background: #092a45; border-color: #3bc0f6; }
.composer-type input { accent-color: #58d3ff; }
.composer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.composer > label, .composer-grid label { display: grid; gap: 7px; color: #a5c1cf; font-size: 12px; font-weight: 800; }
.composer input[type='text'], .composer textarea { width: 100%; padding: 11px; color: #eaf9ff; background: #030d18; border: 1px solid #28546e; border-radius: 8px; outline: none; font: inherit; font-size: 14px; line-height: 1.5; resize: vertical; }
.composer input[type='text']:focus, .composer textarea:focus { border-color: #5bd4ff; box-shadow: 0 0 0 3px rgba(53, 186, 255, .13); }
.form-error { margin: -4px 0 0; color: #ffadb8; font-size: 12px; }
.composer footer { color: #7290a2; font-size: 11px; }
.composer footer > div { display: flex; gap: 8px; }
.cancel-button { min-height: 39px; padding: 0 12px; color: #9ab4c3; background: transparent; border: 1px solid #2e5a73; border-radius: 8px; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; }
.submit-button { min-height: 39px; border-radius: 8px; font-size: 12px; }
.submit-button:disabled { opacity: .65; cursor: wait; }
.composer-fade-enter-from, .composer-fade-leave-to { opacity: 0; }
.composer-fade-enter-from .composer, .composer-fade-leave-to .composer { transform: translateY(12px) scale(.98); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
@media (max-width: 780px) { .community-page { width: calc(100% - 24px); padding-top: 25px; } .community-hero { align-items: flex-start; flex-direction: column; } .board-toolbar { align-items: stretch; flex-direction: column; } .post-search { width: 100%; } .board-content { grid-template-columns: 1fr; } .post-list { border-right: 0; border-bottom: 1px solid rgba(35, 79, 107, .55); } .post-detail, .board-guide { min-height: 330px; } }
@media (max-width: 500px) { .community-hero h1 { font-size: 34px; } .type-tabs { overflow-x: auto; } .type-tabs button { white-space: nowrap; } .composer-backdrop { padding: 10px; align-items: start; } .composer { padding: 20px 16px; } .composer-grid { grid-template-columns: 1fr; } .composer footer { align-items: flex-start; flex-direction: column; } }
</style>
