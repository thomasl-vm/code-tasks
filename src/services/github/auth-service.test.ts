import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateToken, getAuthenticatedUser } from './auth-service'

// Mock the Octokit module
vi.mock('octokit', () => {
  return {
    Octokit: vi.fn().mockImplementation((opts: { auth: string }) => {
      const token = opts.auth
      return {
        rest: {
          users: {
            getAuthenticated: vi.fn().mockImplementation(async () => {
              if (token === 'valid-token') {
                return {
                  data: {
                    login: 'testuser',
                    avatar_url: 'https://avatars.githubusercontent.com/u/123',
                    name: 'Test User',
                  },
                }
              }
              throw new Error('Bad credentials')
            }),
          },
        },
      }
    }),
  }
})

describe('auth-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateToken', () => {
    it('returns user data for a valid token', async () => {
      const result = await validateToken('valid-token')
      expect(result).toEqual({
        valid: true,
        user: {
          login: 'testuser',
          avatarUrl: 'https://avatars.githubusercontent.com/u/123',
          name: 'Test User',
        },
      })
    })

    it('returns invalid for a bad token', async () => {
      const result = await validateToken('bad-token')
      expect(result).toEqual({
        valid: false,
        error: expect.any(String),
      })
    })

    it('returns invalid for an empty token', async () => {
      const result = await validateToken('')
      expect(result).toEqual({
        valid: false,
        error: expect.any(String),
      })
    })
  })

  describe('getAuthenticatedUser', () => {
    it('returns user data from an Octokit instance', async () => {
      const { Octokit } = await import('octokit')
      const octokit = new Octokit({ auth: 'valid-token' })
      const user = await getAuthenticatedUser(octokit)
      expect(user).toEqual({
        login: 'testuser',
        avatarUrl: 'https://avatars.githubusercontent.com/u/123',
        name: 'Test User',
      })
    })
  })
})
