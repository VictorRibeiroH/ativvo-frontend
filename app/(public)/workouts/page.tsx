'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { getWeeklyWorkouts, saveWeeklyWorkouts, toggleWorkoutComplete, type WeeklyWorkout } from '@/services/api'
import { Dumbbell, Plus, X, Save, Calendar } from 'lucide-react'
import { Pacifico } from 'next/font/google'

const pacifico = Pacifico({
  subsets: ['latin'],
  weight: ['400'],
})

const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0] // Segunda a Domingo

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

  useEffect(() => {
    loadWorkouts()
  }, [])

  const loadWorkouts = async () => {
    try {
      const data = await getWeeklyWorkouts()
      
      // Initialize with fetched workouts or create empty ones for each day
      const workoutMap = new Map(data.workouts.map(w => {
        // Garantir que exercises sempre seja um array
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
      // Even if API fails, initialize empty week
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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 dark:text-white text-white">
              <Dumbbell className="h-8 w-8" />
              Meus Treinos
            </h1>
            {weekStart && (
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Semana de {new Date(weekStart).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          <Button onClick={handleSave} disabled={saving} size="lg" className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white shadow-lg">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Treinos'}
          </Button>
        </div>

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
          <Card key={workout.day_of_week} className="relative overflow-hidden transition-all hover:shadow-xl">
            <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />
            {isToday && (
              <div className="absolute -right-12 top-8 w-48 py-1 bg-gradient-to-r from-indigo-500 to-rose-500 rotate-45 shadow-lg z-10">
                <p className={`text-white text-center font-bold text-sm tracking-wider ${pacifico.className}`}>
                  Hoje
                </p>
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {DAYS_OF_WEEK[workout.day_of_week].slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {DAYS_OF_WEEK[workout.day_of_week]}
                    </CardTitle>
                  </div>
                </div>
                {workout.id && !workout.is_rest && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={workout.completed}
                      onCheckedChange={() => handleToggleComplete(workout.id)}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <Checkbox
                  id={`rest-${workout.day_of_week}`}
                  checked={workout.is_rest}
                  onCheckedChange={(checked) => {
                    updateWorkout(workout.day_of_week, {
                      is_rest: !!checked,
                      name: checked ? 'Descanso' : '',
                      exercises: checked ? [] : workout.exercises,
                    })
                  }}
                  className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <label htmlFor={`rest-${workout.day_of_week}`} className="text-sm font-medium cursor-pointer">
                  💤 Dia de descanso
                </label>
              </div>

              {!workout.is_rest && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Nome do Treino
                    </label>
                    <Input
                      placeholder="Ex: Treino A - Peito e Tríceps"
                      value={workout.name}
                      onChange={(e) => updateWorkout(workout.day_of_week, { name: e.target.value })}
                      className="border-2 focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      💪 Exercícios ({(workout.exercises || []).length})
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {(workout.exercises || []).map((exercise, index) => (
                        <div key={index} className="flex items-center gap-2 group">
                          <span className="text-xs font-bold text-muted-foreground w-6">
                            {index + 1}.
                          </span>
                          <Input
                            placeholder={`Ex: Supino reto 4x12`}
                            value={exercise}
                            onChange={(e) => updateExercise(workout.day_of_week, index, e.target.value)}
                            className="flex-1 border-2 focus:border-indigo-500"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeExercise(workout.day_of_week, index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {(workout.exercises || []).length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
                          <Dumbbell className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                          <p className="text-sm text-muted-foreground">
                            Nenhum exercício adicionado
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Clique em "Adicionar" para começar
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addExercise(workout.day_of_week)}
                      className="w-full border-2 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-rose-500 hover:text-white hover:border-transparent transition-all"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Exercício
                    </Button>
                  </div>
                </>
              )}

              {workout.is_rest && (
                <div className="text-center py-12 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg">
                  <div className="text-6xl mb-3">😴</div>
                  <p className="text-lg font-semibold">Dia de Descanso</p>
                  <p className="text-sm text-muted-foreground mt-1">Recupere suas energias!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )})}
        </div>
      </div>
    </div>
  )
}
