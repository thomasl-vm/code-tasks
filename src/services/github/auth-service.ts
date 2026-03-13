import { Octokit } from 'octokit'

export interface GitHubUser {
  login: string
  avatarUrl: string
  name: string | null
}

export type TokenValidationResult =
  | { valid: true; user: GitHubUser }
  | { valid: false; error: string }

export async function getAuthenticatedUser(
  octokit: Octokit,
): Promise<GitHubUser> {
  const { data } = await octokit.rest.users.getAuthenticated()
  return {
    login: data.login,
    avatarUrl: data.avatar_url,
    name: data.name ?? null,
  }
}

export async function validateToken(
  token: string,
): Promise<TokenValidationResult> {
  if (!token.trim()) {
    return { valid: false, error: 'Token cannot be empty' }
  }

  try {
    const octokit = new Octokit({ auth: token })
    const user = await getAuthenticatedUser(octokit)
    return { valid: true, user }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Token validation failed'
    return { valid: false, error: message }
  }
}
