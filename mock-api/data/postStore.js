// 여행 커뮤니티 게시글은 Mock API 서버가 살아 있는 동안 메모리에 보관합니다.
// 서버를 다시 실행하면 initialPosts 상태로 돌아가므로, 실제 DB를 연결하기 전 CRUD를 연습하기 좋습니다.
const initialPosts = [
  {
    id: 1,
    type: 'tip',
    destination: '도쿄',
    title: '비 오는 날, 아사쿠사에서 우산 없이 움직이는 작은 팁',
    content: '센소지 주변은 아케이드가 길게 이어져 있어요. 오전엔 실내 상점가부터 둘러보고 비가 잦아들 때 강가로 걸으면 동선이 한결 편합니다.',
    author: '구름여행자',
    createdAt: '2026-08-05T01:40:00.000Z',
    updatedAt: '2026-08-05T01:40:00.000Z',
  },
  {
    id: 2,
    type: 'review',
    destination: '리스본',
    title: '노을 시간대 28번 트램, 창가 쪽이 좋았어요',
    content: '언덕을 오르내리는 시간이 길어도 테주강 쪽 풍경이 계속 보여서 좋았습니다. 사람 많은 오후보다는 해 지기 한 시간 전을 추천해요.',
    author: '주말의지도',
    createdAt: '2026-08-04T09:15:00.000Z',
    updatedAt: '2026-08-04T09:15:00.000Z',
  },
  {
    id: 3,
    type: 'tip',
    destination: '제주',
    title: '협재 해변은 바람이 강한 날에도 이렇게 즐겼어요',
    content: '해변 산책은 짧게 하고, 근처 카페에서 바다 색이 바뀌는 모습을 보는 편이 더 좋았어요. 얇은 바람막이는 꼭 챙기세요.',
    author: '파란온도',
    createdAt: '2026-08-03T03:25:00.000Z',
    updatedAt: '2026-08-03T03:25:00.000Z',
  },
]

let posts = []
let nextPostId = 1

export function resetPosts() {
  posts = structuredClone(initialPosts)
  nextPostId = Math.max(...posts.map((post) => post.id)) + 1
  return posts
}

export function listPosts() {
  return posts
}

export function getPostCount() {
  return posts.length
}

export function findPostById(postId) {
  return posts.find((post) => post.id === postId)
}

export function createPost(postInput) {
  const now = new Date().toISOString()
  const post = {
    id: nextPostId++,
    ...postInput,
    createdAt: now,
    updatedAt: now,
  }
  posts.push(post)
  return post
}

export function updatePost(postId, patch) {
  const post = findPostById(postId)
  if (!post) return undefined

  Object.assign(post, patch, { updatedAt: new Date().toISOString() })
  return post
}

export function deletePost(postId) {
  const index = posts.findIndex((post) => post.id === postId)
  if (index === -1) return undefined

  const [deletedPost] = posts.splice(index, 1)
  return deletedPost
}

resetPosts()
