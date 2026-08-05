import { communityHttp } from './communityHttp.js'

export const communityPostApi = {
  async getAll(params = {}) {
    const response = await communityHttp.get('/posts', { params })
    return response.data
  },

  async create(post) {
    const response = await communityHttp.post('/posts', post)
    return response.data
  },
}
