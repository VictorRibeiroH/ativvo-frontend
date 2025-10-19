const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_BASE_URL) {
	throw new Error('NEXT_PUBLIC_API_URL não está definida no .env.local')
}

export interface User {
  id: string
  email: string
  name: string
  gender?: string
  height?: number
  weight?: number
  body_fat?: number
  weekly_workouts?: number
  cardio_time?: number
  goal?: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface ErrorResponse {
  error: string
}

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  })

  if (!response.ok) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to register')
  }

  const data: AuthResponse = await response.json()
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('ativvo_token', data.token)
    localStorage.setItem('ativvo_user', JSON.stringify(data.user))
  }

  return data
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.error || 'Invalid credentials')
  }

  const data: AuthResponse = await response.json()
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('ativvo_token', data.token)
    localStorage.setItem('ativvo_user', JSON.stringify(data.user))
  }

  return data
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ativvo_token')
    localStorage.removeItem('ativvo_user')
  }
}

export function getCurrentUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('ativvo_user')
    if (userStr) {
      return JSON.parse(userStr)
    }
  }
  return null
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ativvo_token')
  }
  return null
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}

export async function getMyProfile(): Promise<User> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      logout()
    }
    const error: ErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to get profile')
  }

  const data = await response.json()
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('ativvo_user', JSON.stringify(data.user))
  }

  return data.user
}

export async function updateProfile(updates: Partial<User>): Promise<User> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    if (response.status === 401) {
      logout()
    }
    const error: ErrorResponse = await response.json()
    throw new Error(error.error || 'Failed to update profile')
  }

  const data = await response.json()
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('ativvo_user', JSON.stringify(data.user))
  }

  return data.user
}
