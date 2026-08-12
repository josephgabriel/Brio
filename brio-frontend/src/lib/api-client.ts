const API_URL = import.meta.env.VITE_API_URL as string

const CHAVE_TOKEN = "brio_token"

export function getToken(): string | null {
  return localStorage.getItem(CHAVE_TOKEN)
}

export function setToken(token: string): void {
  localStorage.setItem(CHAVE_TOKEN, token)
}

export function clearToken(): void {
  localStorage.removeItem(CHAVE_TOKEN)
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers = new Headers(options.headers)

  const corpoEhFormData = options.body instanceof FormData
  if (!corpoEhFormData) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  return fetch(`${API_URL}${path}`, { ...options, headers })
}