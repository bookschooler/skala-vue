import { ref } from 'vue'
import { defineStore } from 'pinia'
import { communityPostApi } from '../api/communityPostApi.js'

export const useCommunityPostStore = defineStore('communityPosts', () => {
  const posts = ref([])
  const isLoading = ref(false)
  const isCreating = ref(false)
  const isCommenting = ref(false)
  const errorMessage = ref('')
  const lastQuery = ref('')
  let activeRequestId = 0

  async function fetchPosts(query = '') {
    const requestId = ++activeRequestId
    const normalizedQuery = query.trim()
    isLoading.value = true
    errorMessage.value = ''
    lastQuery.value = normalizedQuery

    try {
      const result = await communityPostApi.getAll(normalizedQuery ? { q: normalizedQuery } : {})
      if (requestId === activeRequestId) posts.value = result
      return result
    } catch (error) {
      if (requestId === activeRequestId) errorMessage.value = error.message
      return []
    } finally {
      if (requestId === activeRequestId) isLoading.value = false
    }
  }

  async function createPost(draft) {
    isCreating.value = true
    errorMessage.value = ''

    try {
      const createdPost = await communityPostApi.create(draft)
      posts.value = [createdPost, ...posts.value]
      return createdPost
    } catch (error) {
      errorMessage.value = error.message
      throw error
    } finally {
      isCreating.value = false
    }
  }

  async function createComment(postId, comment) {
    isCommenting.value = true
    errorMessage.value = ''
    try {
      const createdComment = await communityPostApi.createComment(postId, comment)
      posts.value = posts.value.map((post) => (
        post.id === postId
          ? { ...post, comments: [...(Array.isArray(post.comments) ? post.comments : []), createdComment] }
          : post
      ))
      return createdComment
    } catch (error) {
      errorMessage.value = error.message
      throw error
    } finally {
      isCommenting.value = false
    }
  }

  function clearError() {
    errorMessage.value = ''
  }

  return { posts, isLoading, isCreating, isCommenting, errorMessage, lastQuery, fetchPosts, createPost, createComment, clearError }
})
