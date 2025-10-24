'use client'

import { useEffect, useState } from 'react'
import { getWeeklyWorkouts, saveWeeklyWorkouts, toggleWorkoutComplete, getCurrentUser, type WeeklyWorkout, type User } from '@/services/api'
import { PageTopBase } from '@/components/layout/page-top-base'
import { HeroBanner } from '@/components/layout/hero-banner'
import { WorkoutsHeader } from '@/components/workouts/workouts-header'
import { WorkoutCard } from '@/components/workouts/workout-card'
import { Dumbbell } from 'lucide-react'

const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0]

const DAY_COLORS = {
  1: 'from-blue-500 to-cyan-500',
  2: 'from-purple-500 to-pink-500',
  3: 'from-green-500 to-emerald-500',
  4: 'from-orange-500 to-amber-500',
  5: 'from-red-500 to-rose-500',
  6: 'from-indigo-500 to-purple-500',
  0: 'from-gray-500 to-slate-500',
}

interface WorkoutForm extends Omit<WeeklyWorkout, 'id' | 'week_start'> {
  id?: string
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutForm[]>([])
  const [weekStart, setWeekStart] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    const savedTheme = localStorage.getItem('ativvo-theme')
    setIsDark(savedTheme !== 'light')
    loadWorkouts()
  }, [])

  const loadWorkouts = async () => {
    try {
      const data = await getWeeklyWorkouts()
      
      const workoutMap = new Map(data.workouts.map(w => {
        const exercises = Array.isArray(w.exercises) 
          ? w.exercises 
          : typeof w.exercises === 'string' 
            ? JSON.parse(w.exercises) 
            : []
        return [w.day_of_week, { ...w, exercises }]
      }))
      
      const fullWeek: WorkoutForm[] = Array.from({ length: 7 }, (_, i) => {
        const existing = workoutMap.get(i)
        return existing || {
          day_of_week: i,
          name: '',
          exercises: [],
          is_rest: false,
          completed: false,
        }
      })
      
      setWorkouts(fullWeek)
      setWeekStart(data.week_start)
    } catch (error) {
      console.error('Failed to load workouts:', error)
      const emptyWeek: WorkoutForm[] = Array.from({ length: 7 }, (_, i) => ({
        day_of_week: i,
        name: '',
        exercises: [],
        is_rest: false,
        completed: false,
      }))
      setWorkouts(emptyWeek)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const workoutsToSave = workouts
        .filter(w => w.is_rest || (w.name.trim() && w.exercises.length > 0))
        .map(({ id, completed, ...rest }) => rest)
      
      await saveWeeklyWorkouts(workoutsToSave)
      await loadWorkouts()
    } catch (error) {
      console.error('Failed to save workouts:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleComplete = async (workoutId: string | undefined) => {
    if (!workoutId) return
    
    try {
      await toggleWorkoutComplete(workoutId)
      await loadWorkouts()
    } catch (error) {
      console.error('Failed to toggle workout:', error)
    }
  }

  const updateWorkout = (dayOfWeek: number, updates: Partial<WorkoutForm>) => {
    setWorkouts(prev => prev.map(w => 
      w.day_of_week === dayOfWeek ? { ...w, ...updates } : w
    ))
  }

  const addExercise = (dayOfWeek: number) => {
    const currentExercises = workouts[dayOfWeek]?.exercises || []
    updateWorkout(dayOfWeek, {
      exercises: [...currentExercises, '']
    })
  }

  const removeExercise = (dayOfWeek: number, index: number) => {
    const currentExercises = workouts[dayOfWeek]?.exercises || []
    const exercises = [...currentExercises]
    exercises.splice(index, 1)
    updateWorkout(dayOfWeek, { exercises })
  }

  const updateExercise = (dayOfWeek: number, index: number, value: string) => {
    const currentExercises = workouts[dayOfWeek]?.exercises || []
    const exercises = [...currentExercises]
    exercises[index] = value
    updateWorkout(dayOfWeek, { exercises })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Dumbbell className="h-12 w-12 animate-bounce mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando treinos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageTopBase 
          userName={user?.name || 'Usuário'} 
          subtitle="Gerencie seus treinos semanais"
          isDark={isDark}
        />

        <HeroBanner 
          userName={user?.name || 'Usuário'}
        />

        <WorkoutsHeader 
          weekStart={weekStart}
          saving={saving}
          onSave={handleSave}
        />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DAYS_ORDER.map((dayOfWeek) => {
          const workout = workouts.find(w => w.day_of_week === dayOfWeek) || {
            day_of_week: dayOfWeek,
            name: '',
            exercises: [],
            is_rest: false,
            completed: false,
          }
          const isToday = dayOfWeek === new Date().getDay()
          const gradientClass = DAY_COLORS[dayOfWeek as keyof typeof DAY_COLORS]
          
          return (
            <WorkoutCard
              key={dayOfWeek}
              dayOfWeek={dayOfWeek}
              dayName={DAYS_OF_WEEK[workout.day_of_week]}
              gradientClass={gradientClass}
              isToday={isToday}
              workout={workout}
              onToggleComplete={handleToggleComplete}
              onUpdateWorkout={updateWorkout}
              onAddExercise={addExercise}
              onRemoveExercise={removeExercise}
              onUpdateExercise={updateExercise}
            />
          )
        })}
      </div>
      </div>
    </div>
  )
}
