import { communityHttp } from './communityHttp.js'
import {
  createPost as createSeedPost,
  createPostComment as createSeedComment,
  listPosts as listSeedPosts,
  resetPosts as resetSeedPosts,
} from '../data/communitySeedPosts.js'

let isSeedReady = false

const ensureSeedPosts = () => {
  if (!isSeedReady) {
    resetSeedPosts()
    isSeedReady = true
  }
  return listSeedPosts()
}

const isStaticPages = () =>
  typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')

// GitHub Pages는 Node Mock API를 실행할 수 없으므로 즉시 브라우저 메모리의
// 초기 게시글을 쓰고, 로컬에서는 연결 불가·서버 오류일 때만 대체한다.
const canUseSeedFallback = (error) => !error?.cause?.response || error.cause.response.status >= 500

export const communityPostApi = {
  async getAll(params = {}) {
    if (isStaticPages()) return ensureSeedPosts()
    try {
      const response = await communityHttp.get('/posts', { params })
      return response.data
    } catch (error) {
      if (!canUseSeedFallback(error)) throw error
      return ensureSeedPosts()
    }
  },

  async create(post) {
    if (isStaticPages()) {
      ensureSeedPosts()
      return createSeedPost(post)
    }
    try {
      const response = await communityHttp.post('/posts', post)
      return response.data
    } catch (error) {
      if (!canUseSeedFallback(error)) throw error
      ensureSeedPosts()
      return createSeedPost(post)
    }
  },

  async createComment(postId, comment) {
    if (isStaticPages()) {
      ensureSeedPosts()
      const created = createSeedComment(postId, comment)
      if (!created) throw new Error('게시글을 찾을 수 없습니다.')
      return created
    }
    try {
      const response = await communityHttp.post(`/posts/${postId}/comments`, comment)
      return response.data
    } catch (error) {
      if (!canUseSeedFallback(error)) throw error
      ensureSeedPosts()
      const created = createSeedComment(postId, comment)
      if (!created) throw new Error('게시글을 찾을 수 없습니다.', { cause: error })
      return created
    }
  },
}
