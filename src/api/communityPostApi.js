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

// GitHub Pages는 Node Mock API를 실행할 수 없으므로, 연결 자체가 불가능한 경우에만
// 2번에서 쓰던 초기 게시글을 브라우저 메모리로 대체한다. API 검증 오류는 그대로 표시한다.
const canUseSeedFallback = (error) => !error?.cause?.response || error.cause.response.status >= 500

export const communityPostApi = {
  async getAll(params = {}) {
    try {
      const response = await communityHttp.get('/posts', { params })
      return response.data
    } catch (error) {
      if (!canUseSeedFallback(error)) throw error
      return ensureSeedPosts()
    }
  },

  async create(post) {
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
