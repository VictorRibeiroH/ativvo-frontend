const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_BASE_URL) {
	throw new Error('NEXT_PUBLIC_API_URL não está definida no .env.local')
}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data = await response.json()
    if (data && typeof data === 'object' && 'error' in data) {
      return data.error || JSON.stringify(data)
    }
    return JSON.stringify(data)
  } catch (e) {
    try {
      const text = await response.text()
      return text || response.statusText || 'Unknown error'
    } catch (_err) {
      return response.statusText || 'Unknown error'
    }
  }
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

  const response = await fetch(`${API_BASE_URL}/me`, {
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

  const response = await fetch(`${API_BASE_URL}/profile`, {
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

export interface WeeklyWorkout {
  id: string
  day_of_week: number
  name: string
  exercises: string[]
  is_rest: boolean
  completed: boolean
  week_start: string
}

export interface WeeklyStats {
  completed: number
  goal: number
  emoji: string
}

export async function getWeeklyWorkouts(): Promise<{ workouts: WeeklyWorkout[]; week_start: string }> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/workouts/weekly`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to fetch workouts')
  }

  return response.json()
}

export async function saveWeeklyWorkouts(workouts: Array<{
  day_of_week: number
  name: string
  exercises: string[]
  is_rest: boolean
}>): Promise<void> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/workouts/weekly`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(workouts),
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to save workouts')
  }
}

export async function toggleWorkoutComplete(workoutId: string): Promise<{ completed: boolean }> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/workouts/weekly/${workoutId}/toggle`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to toggle workout')
  }

  return response.json()
}

export async function getWeeklyStats(): Promise<WeeklyStats> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/workouts/weekly/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to fetch stats')
  }

  return response.json()
}

// Events API
export interface Event {
  id: string
  user_id: string
  title: string
  description: string
  event_date: string
  event_time: string
  created_at: string
  updated_at: string
}

export async function createEvent(data: {
  title: string
  description: string
  event_date: string // YYYY-MM-DD
  event_time: string // HH:mm
}): Promise<{ message: string; event: Event }> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to create event')
  }

  return response.json()
}

export async function getEvents(): Promise<Event[]> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to fetch events')
  }

  return response.json()
}

export async function getEventsByDate(date: string): Promise<Event[]> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/events/by-date?date=${date}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to fetch events')
  }

  return response.json()
}

export async function deleteEvent(eventId: string): Promise<{ message: string }> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to delete event')
  }

  return response.json()
}
