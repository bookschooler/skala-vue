import {
  createPost,
  deletePost,
  findPostById,
  listPosts,
  updatePost,
} from '../data/postStore.js'
import { readJsonBody, sendJson } from '../utils/httpUtils.js'

const allowedFields = [
  'type',
  'destination',
  'title',
  'content',
  'author',
  'imageUrl',
  'capturedAt',
  'tags',
  'weather',
  'skyColor',
  'cloudAmount',
  'cloudType',
]
const validTypes = new Set(['tip', 'review'])
const validCloudTypes = new Set(['Ci', 'Cc', 'Cs', 'Ac', 'As', 'Ns', 'Cb', 'Cu', 'St', 'Sc'])

function validatePost(input, partial = false) {
  const errors = []

  for (const field of ['destination', 'title', 'content', 'imageUrl', 'weather', 'skyColor', 'cloudAmount', 'cloudType']) {
    if ((!partial || Object.hasOwn(input, field)) && (typeof input[field] !== 'string' || !input[field].trim())) {
      const label = {
        destination: '장소',
        title: '제목',
        content: '내용',
        imageUrl: '사진',
        weather: '오늘의 날씨',
        skyColor: '하늘색',
        cloudAmount: '구름 양',
        cloudType: '구름 형태',
      }[field]
      errors.push(`게시글 ${label}은(는) 필수입니다.`)
    }
  }

  if (Object.hasOwn(input, 'author') && typeof input.author !== 'string') {
    errors.push('작성자는 문자열이어야 합니다.')
  }

  if ((!partial || Object.hasOwn(input, 'type')) && !validTypes.has(input.type)) {
    errors.push('게시글 종류는 tip 또는 review여야 합니다.')
  }

  if ((!partial || Object.hasOwn(input, 'cloudType')) && !validCloudTypes.has(input.cloudType)) {
    errors.push('구름 형태는 10종 기본 운형 기호로 선택해 주세요.')
  }

  if (Object.hasOwn(input, 'capturedAt') && input.capturedAt && (typeof input.capturedAt !== 'string' || Number.isNaN(new Date(input.capturedAt).getTime()))) {
    errors.push('사진을 찍은 시간 형식이 올바르지 않습니다.')
  }

  if (Object.hasOwn(input, 'tags') && (!Array.isArray(input.tags) || input.tags.length > 5 || input.tags.some((tag) => typeof tag !== 'string' || !/^#[\p{L}\p{N}_-]{1,20}$/u.test(tag)))) {
    errors.push('해시태그는 #으로 시작하는 1~20자 텍스트를 최대 5개까지 입력해 주세요.')
  }

  return errors
}

function normalizePost(input, partial = false) {
  const normalized = {}

  for (const field of allowedFields) {
    if (!Object.hasOwn(input, field)) continue
    normalized[field] = field === 'tags'
      ? [...new Set(input[field].map((tag) => tag.trim()))]
      : input[field].trim()
  }

  if (!partial) {
    normalized.type = normalized.type ?? 'tip'
    normalized.author = normalized.author || '익명 여행자'
  }

  return normalized
}

export async function handlePostRoutes(request, response, url) {
  const postMatch = url.pathname.match(/^\/api\/posts\/(\d+)$/)

  if (request.method === 'GET' && url.pathname === '/api/posts') {
    const query = (url.searchParams.get('q') ?? '').trim().toLowerCase()
    const result = listPosts()
      .filter((post) =>
        !query ||
        [...[post.destination, post.title, post.content, post.author, post.weather, post.skyColor, post.cloudAmount], ...(post.tags ?? [])]
          .some((value) => value.toLowerCase().includes(query)),
      )
      .toSorted((first, second) => second.id - first.id)

    sendJson(response, 200, result)
    return true
  }

  if (request.method === 'GET' && postMatch) {
    const post = findPostById(Number(postMatch[1]))
    if (!post) {
      sendJson(response, 404, { message: '게시글을 찾을 수 없습니다.' })
      return true
    }
    sendJson(response, 200, post)
    return true
  }

  if (request.method === 'POST' && url.pathname === '/api/posts') {
    const body = await readJsonBody(request)
    const errors = validatePost(body)
    if (errors.length) {
      sendJson(response, 400, { message: errors.join(' ') })
      return true
    }

    sendJson(response, 201, createPost(normalizePost(body)))
    return true
  }

  if (request.method === 'PATCH' && postMatch) {
    const postId = Number(postMatch[1])
    if (!findPostById(postId)) {
      sendJson(response, 404, { message: '수정할 게시글을 찾을 수 없습니다.' })
      return true
    }

    const body = await readJsonBody(request)
    const errors = validatePost(body, true)
    if (errors.length) {
      sendJson(response, 400, { message: errors.join(' ') })
      return true
    }

    sendJson(response, 200, updatePost(postId, normalizePost(body, true)))
    return true
  }

  if (request.method === 'DELETE' && postMatch) {
    const deletedPost = deletePost(Number(postMatch[1]))
    if (!deletedPost) {
      sendJson(response, 404, { message: '삭제할 게시글을 찾을 수 없습니다.' })
      return true
    }
    sendJson(response, 200, deletedPost)
    return true
  }

  return false
}
