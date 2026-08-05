// Today’s Sky 게시글은 Mock API 서버가 살아 있는 동안 메모리에 보관합니다.
// 서버를 다시 실행하면 initialPosts 상태로 돌아가므로, 실제 DB를 연결하기 전 CRUD를 연습하기 좋습니다.
const initialPosts = [
  {
    id: 1,
    type: 'tip',
    destination: '서울 송파구',
    title: '바람이 살짝 분 오후, 구름이 천천히 흐르던 하늘',
    content: '선명한 파란 하늘 위로 얇은 구름이 조용히 흘러가던 순간이에요.',
    author: '하늘을걷는사람',
    imageUrl: '/img/community-sky-day.png',
    weather: '맑음',
    skyColor: '#5EBAE8',
    cloudAmount: '조금',
    cloudType: 'Ci',
    capturedAt: '2026-08-05T09:20:00',
    tags: ['#아침하늘', '#새털구름'],
    likes: 124,
    comments: 18,
    createdAt: '2026-08-05T01:40:00.000Z',
    updatedAt: '2026-08-05T01:40:00.000Z',
  },
  {
    id: 2,
    type: 'review',
    destination: '제주 서귀포시',
    title: '초록 들판 위로 고적운이 천천히 흘러가요',
    content: '작은 구름 덩어리가 무리 지어 나타난 날. 햇살과 구름 그림자가 번갈아 머물렀어요.',
    author: '바람따라',
    imageUrl: '/img/community-sky-altocumulus.png',
    weather: '구름많음',
    skyColor: '#A8DCF3',
    cloudAmount: '많음',
    cloudType: 'Ac',
    capturedAt: '2026-08-04T15:40:00',
    tags: ['#제주하늘', '#양떼구름'],
    likes: 96,
    comments: 11,
    createdAt: '2026-08-04T09:15:00.000Z',
    updatedAt: '2026-08-04T09:15:00.000Z',
  },
  {
    id: 3,
    type: 'tip',
    destination: '경기 수원시',
    title: '구름 사이로 햇살이 반짝였던 오후',
    content: '해가 잠깐 모습을 보일 때마다 도시가 조금 더 밝아졌어요.',
    author: '햇살좋아',
    imageUrl: '/img/community-sky-sun-cloud.png',
    weather: '구름많음',
    skyColor: '#A8DCF3',
    cloudAmount: '보통',
    cloudType: 'Sc',
    capturedAt: '2026-08-03T14:10:00',
    tags: ['#햇살', '#구름사이'],
    likes: 88,
    comments: 9,
    createdAt: '2026-08-03T03:25:00.000Z',
    updatedAt: '2026-08-03T03:25:00.000Z',
  },
  {
    id: 4,
    type: 'review',
    destination: '부산 해운대구',
    title: '카페 창가에 빗방울이 조용히 내려앉아요',
    content: '창문 너머의 푸른 저녁을 보며 잠깐 비가 멈추기를 기다렸어요.',
    author: '비오는오후',
    imageUrl: '/img/community-sky-rain-window.png',
    weather: '비',
    skyColor: '#92A6B0',
    cloudAmount: '가득',
    cloudType: 'Ns',
    capturedAt: '2026-08-02T17:55:00',
    tags: ['#비오는날', '#창가하늘'],
    likes: 72,
    comments: 7,
    createdAt: '2026-08-02T08:48:00.000Z',
    updatedAt: '2026-08-02T08:48:00.000Z',
  },
  {
    id: 5,
    type: 'tip',
    destination: '서울 광진구',
    title: '노을이 강물 위에 길게 내려앉았어요',
    content: '구름 가장자리가 주황빛으로 바뀌는 순간을 오래 바라봤어요.',
    author: '강변산책',
    imageUrl: '/img/community-sky-sunset.png',
    weather: '맑음',
    skyColor: '#6F9EBA',
    cloudAmount: '조금',
    cloudType: 'Cs',
    capturedAt: '2026-08-01T19:12:00',
    tags: ['#노을', '#햇무리구름'],
    likes: 142,
    comments: 20,
    createdAt: '2026-08-01T10:32:00.000Z',
    updatedAt: '2026-08-01T10:32:00.000Z',
  },
  {
    id: 6,
    type: 'review',
    destination: '대전 유성구',
    title: '해가 지고 남은 보랏빛 하늘',
    content: '도시의 불빛이 켜지기 직전, 하늘에 남은 색이 유난히 깊었어요.',
    author: '노을기록가',
    imageUrl: '/img/community-sky-dusk.png',
    weather: '구름조금',
    skyColor: '#155C9F',
    cloudAmount: '조금',
    cloudType: 'As',
    capturedAt: '2026-07-31T20:05:00',
    tags: ['#저녁하늘', '#보랏빛'],
    likes: 105,
    comments: 14,
    createdAt: '2026-07-31T11:05:00.000Z',
    updatedAt: '2026-07-31T11:05:00.000Z',
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
    likes: 0,
    comments: 0,
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
