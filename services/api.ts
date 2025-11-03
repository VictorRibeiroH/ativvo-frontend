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

async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchFn()
    } catch (error) {
      lastError = error
      
      if (i < retries - 1) {
        console.warn(`🔄 Retry ${i + 1}/${retries - 1} after ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 1.5
      }
    }
  }
  
  throw lastError
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
    console.warn('⚠️ No token found, skipping stats fetch')
    return {
      completed: 0,
      goal: 0,
      emoji: '💪'
    }
  }

  return fetchWithRetry(async () => {
    const response = await fetch(`${API_BASE_URL}/workouts/weekly/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errMsg = await parseErrorResponse(response)
      console.error('❌ Failed to fetch stats:', response.status, errMsg)
      throw new Error(`Stats fetch failed: ${errMsg}`)
    }

    return response.json()
  }, 3, 500).catch(error => {
    console.error('❌ All retries failed for stats:', error)
    return {
      completed: 0,
      goal: 0,
      emoji: '💪'
    }
  })
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
    console.warn('⚠️ No token found, skipping events fetch')
    return []
  }

  return fetchWithRetry(async () => {
    const response = await fetch(`${API_BASE_URL}/events/by-date?date=${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errMsg = await parseErrorResponse(response)
      console.error('❌ Failed to fetch events:', response.status, errMsg)
      throw new Error(`Events fetch failed: ${errMsg}`)
    }

    return response.json()
  }, 3, 500).catch(error => {
    console.error('❌ All retries failed for events:', error)
    return []
  })
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

// ==================== DIET & FOOD TYPES ====================

export interface Food {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  serving_size: number
  created_by_id: string
  created_at: string
  updated_at: string
}

export interface CreateFoodInput {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  serving_size?: number
}

export interface DietPlan {
  id: string
  user_id: string
  age: number
  gender: string
  height: number
  weight: number
  activity_level: string
  tmb: number
  tdee: number
  goal: string
  target_calories: number
  protein_percent: number
  carbs_percent: number
  fat_percent: number
  protein_grams: number
  carbs_grams: number
  fat_grams: number
  is_active: boolean
  meals?: Meal[]
  created_at: string
  updated_at: string
}

export interface Meal {
  id: string
  diet_plan_id: string
  name: string
  time: string
  order: number
  meal_foods?: MealFood[]
  created_at: string
  updated_at: string
}

export interface MealFood {
  id: string
  meal_id: string
  food_id: string
  food?: Food
  quantity: number
  created_at: string
  updated_at: string
}

export interface CreateDietPlanInput {
  age: number
  gender: string
  height: number
  weight: number
  activity_level: string
  goal: string
  protein_percent: number
  carbs_percent: number
  fat_percent: number
}

export interface DietCalculation {
  tmb: number
  tdee: number
  target_calories: number
  protein_grams: number
  carbs_grams: number
  fat_grams: number
}

export interface CreateMealInput {
  name: string
  time?: string
  order: number
}

export interface AddFoodToMealInput {
  food_id: string
  quantity: number
}

// ==================== FOOD API ====================

export async function createFood(input: CreateFoodInput): Promise<Food> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/foods`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to create food')
  }

  return response.json()
}

export async function getFoods(search?: string, page = 1, limit = 50): Promise<{ foods: Food[], total: number, page: number, limit: number }> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  if (search) {
    params.append('search', search)
  }

  const response = await fetch(`${API_BASE_URL}/foods?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to fetch foods')
  }

  return response.json()
}

export async function getFood(id: string): Promise<Food> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/foods/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to fetch food')
  }

  return response.json()
}

// ==================== TACO API ====================

export interface TACOFood {
  id: number
  name: string
  category: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  serving_size: number
  taco_id: number
  source: string
}

export async function searchTACOFoods(query: string): Promise<{ foods: TACOFood[], total: number, source: string }> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  if (!query || query.trim() === '') {
    return { foods: [], total: 0, source: 'TACO' }
  }

  const params = new URLSearchParams({
    q: query.trim(),
  })

  const response = await fetch(`${API_BASE_URL}/foods/taco/search?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to search TACO foods')
  }

  return response.json()
}

export async function importTACOFood(tacoId: number): Promise<Food> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/foods/taco/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ taco_id: tacoId }),
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to import TACO food')
  }

  const data = await response.json()
  return data.food
}

// ==================== DIET API ====================

export async function calculateDietPlan(input: CreateDietPlanInput): Promise<DietCalculation> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/diet/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to calculate diet plan')
  }

  return response.json()
}

export async function createDietPlan(input: CreateDietPlanInput): Promise<DietPlan> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/diet/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to create diet plan')
  }

  return response.json()
}

export async function getActiveDietPlan(): Promise<DietPlan | null> {
  const token = getToken()
  
  if (!token) {
    return null
  }

  return fetchWithRetry(async () => {
    const response = await fetch(`${API_BASE_URL}/diet/plans/active`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const errMsg = await parseErrorResponse(response)
      throw new Error(errMsg || 'Failed to fetch active diet plan')
    }

    return response.json()
  }, 3, 500).catch(error => {
    console.error('❌ Failed to fetch active diet plan:', error)
    return null
  })
}

export async function getDietPlans(): Promise<DietPlan[]> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/diet/plans`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to fetch diet plans')
  }

  return response.json()
}

export async function createMeal(dietPlanId: string, input: CreateMealInput): Promise<Meal> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/diet/plans/${dietPlanId}/meals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to create meal')
  }

  return response.json()
}

export async function addFoodToMeal(mealId: string, input: AddFoodToMealInput): Promise<MealFood> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/diet/meals/${mealId}/foods`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to add food to meal')
  }

  return response.json()
}

export async function removeFoodFromMeal(mealFoodId: string): Promise<{ message: string }> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/diet/meal-foods/${mealFoodId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to remove food from meal')
  }

  return response.json()
}

export async function deleteMeal(mealId: string): Promise<{ message: string }> {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}/diet/meals/${mealId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errMsg = await parseErrorResponse(response)
    throw new Error(errMsg || 'Failed to delete meal')
  }

  return response.json()
}
