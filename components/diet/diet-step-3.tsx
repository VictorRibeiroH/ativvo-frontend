"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  createDietPlan,
  createMeal,
  addFoodToMeal,
  removeFoodFromMeal,
  deleteMeal,
  getFoods,
  getActiveDietPlan,
  type DietPlan,
  type Meal,
  type Food,
} from "@/services/api"
import { type Step2Data } from "./diet-step-2"
import { type Step1Data } from "./diet-step-1"
import { Plus, X, Search, Trash2, UtensilsCrossed } from "lucide-react"
import { FoodModal } from "./food-modal"

interface DietStep3Props {
  step2Data: Step2Data
  step1Data?: Step1Data
  activeDiet: DietPlan | null
  onBack: () => void
  onDietCreated: () => void
}

export function DietStep3({ step2Data, step1Data, activeDiet: initialActiveDiet, onBack, onDietCreated }: DietStep3Props) {
  const { toast } = useToast()
  const [activeDiet, setActiveDiet] = useState<DietPlan | null>(initialActiveDiet)
  const [loading, setLoading] = useState(false)
  const [foods, setFoods] = useState<Food[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [foodModalOpen, setFoodModalOpen] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null)
  
  // Estado local para refeições (antes de salvar no backend)
  const [localMeals, setLocalMeals] = useState<any[]>([])
  const [newMealName, setNewMealName] = useState("")
  const [newMealTime, setNewMealTime] = useState("")
  
  // Estados para diálogo de confirmação
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mealToDelete, setMealToDelete] = useState<number | null>(null)
  
  // Estados para adicionar quantidade
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false)
  const [selectedFood, setSelectedFood] = useState<{ food: Food; mealIndex: number } | null>(null)
  const [quantity, setQuantity] = useState("100")

  useEffect(() => {
    loadFoods()
  }, [searchTerm])

  // Carrega a dieta ativa se existir
  useEffect(() => {
    if (initialActiveDiet) {
      setActiveDiet(initialActiveDiet)
    }
  }, [initialActiveDiet])

  const loadFoods = async () => {
    try {
      const result = await getFoods(searchTerm || undefined)
      setFoods(result.foods || [])
    } catch (error: any) {
      console.error("Erro ao carregar alimentos:", error)
      setFoods([])
    }
  }

  // Adiciona refeição localmente (sem salvar no backend)
  const handleAddMeal = () => {
    if (!newMealName) return

    const newMeal = {
      id: Date.now().toString(), // ID temporário
      name: newMealName,
      time: newMealTime,
      order: localMeals.length + 1,
      meal_foods: []
    }

    setLocalMeals([...localMeals, newMeal])
    setNewMealName("")
    setNewMealTime("")
    
    toast({
      title: "Refeição adicionada!",
      description: `${newMealName} foi adicionada.`,
    })
  }

  // Adiciona alimento à refeição localmente
  const handleAddFoodToMeal = (mealIndex: number, food: Food, quantity: number) => {
    const updatedMeals = [...localMeals]
    const meal = updatedMeals[mealIndex]
    
    const newMealFood = {
      id: Date.now().toString(),
      food: food,
      quantity: quantity
    }
    
    meal.meal_foods.push(newMealFood)
    setLocalMeals(updatedMeals)
    setQuantityDialogOpen(false)
    setQuantity("100")
    
    toast({
      title: "Alimento adicionado!",
      description: "O alimento foi adicionado à refeição.",
    })
  }

  // Remove alimento da refeição localmente
  const handleRemoveFoodFromMeal = (mealIndex: number, foodIndex: number) => {
    const updatedMeals = [...localMeals]
    updatedMeals[mealIndex].meal_foods.splice(foodIndex, 1)
    setLocalMeals(updatedMeals)
    
    toast({
      title: "Alimento removido",
      description: "O alimento foi removido da refeição.",
    })
  }

  // Remove refeição localmente
  const handleDeleteMeal = (mealIndex: number) => {
    setMealToDelete(mealIndex)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteMeal = () => {
    if (mealToDelete === null) return

    const updatedMeals = localMeals.filter((_, index) => index !== mealToDelete)
    setLocalMeals(updatedMeals)
    setDeleteDialogOpen(false)
    setMealToDelete(null)
    
    toast({
      title: "Refeição excluída",
      description: "A refeição foi removida.",
    })
  }

  // Salva a dieta completa no backend
  const handleSaveDiet = async () => {
    if (!step1Data || !step2Data) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, complete os passos anteriores.",
        variant: "destructive",
      })
      return
    }

    if (localMeals.length === 0) {
      toast({
        title: "Adicione refeições",
        description: "Você precisa adicionar pelo menos uma refeição.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // 1. Cria o plano de dieta
      const dietData = {
        age: step1Data.age,
        gender: step1Data.gender,
        height: step1Data.height,
        weight: step1Data.weight,
        activity_level: step1Data.activity_level,
        goal: step2Data.goal,
        protein_percent: step2Data.protein_percent,
        carbs_percent: step2Data.carbs_percent,
        fat_percent: step2Data.fat_percent,
      }

      const dietPlan = await createDietPlan(dietData)

      // 2. Adiciona cada refeição
      for (const meal of localMeals) {
        const createdMeal = await createMeal(dietPlan.id, {
          name: meal.name,
          time: meal.time,
          order: meal.order
        })

        // 3. Adiciona alimentos à refeição
        for (const mealFood of meal.meal_foods) {
          await addFoodToMeal(createdMeal.id, {
            food_id: mealFood.food.id,
            quantity: mealFood.quantity
          })
        }
      }

      setActiveDiet(dietPlan)
      onDietCreated()
      
      toast({
        title: "Dieta salva com sucesso!",
        description: "Sua dieta foi criada e salva.",
      })
    } catch (error: any) {
      console.error("Erro ao salvar dieta:", error)
      
      if (error.message?.includes('Unauthorized') || error.message?.includes('token')) {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
          variant: "destructive",
        })
        setTimeout(() => {
          window.location.href = '/sign-in'
        }, 2000)
      } else {
        toast({
          title: "Erro ao salvar dieta",
          description: error.message || "Não foi possível salvar sua dieta. Tente novamente.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateLocalMealTotals = (meal: any) => {
    if (!meal.meal_foods || meal.meal_foods.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }

    return meal.meal_foods.reduce(
      (acc: any, mf: any) => {
        const multiplier = mf.quantity / mf.food.serving_size
        return {
          calories: acc.calories + mf.food.calories * multiplier,
          protein: acc.protein + mf.food.protein * multiplier,
          carbs: acc.carbs + mf.food.carbs * multiplier,
          fat: acc.fat + mf.food.fat * multiplier,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const calculateLocalDayTotals = () => {
    if (localMeals.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }

    return localMeals.reduce(
      (acc, meal) => {
        const mealTotals = calculateLocalMealTotals(meal)
        return {
          calories: acc.calories + mealTotals.calories,
          protein: acc.protein + mealTotals.protein,
          carbs: acc.carbs + mealTotals.carbs,
          fat: acc.fat + mealTotals.fat,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const dayTotals = calculateLocalDayTotals()

  // Usa os valores do step2Data para mostrar as metas
  const targetCalories = step2Data.calculations.target_calories
  const targetProtein = step2Data.calculations.protein_grams
  const targetCarbs = step2Data.calculations.carbs_grams
  const targetFat = step2Data.calculations.fat_grams

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Monte suas Refeições</h2>
        <p className="text-white/50 text-sm">Configure suas refeições diárias adicionando alimentos</p>
      </div>

      {/* Estratégia Adotada */}
      <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
        <h3 className="text-base font-semibold text-white mb-4">Meta Diária</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-white/50 mb-1">Calorias</div>
            <div className="text-2xl font-bold text-white">{Math.round(targetCalories)}</div>
            <div className="text-xs text-white/40">kcal</div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">Proteína</div>
            <div className="text-2xl font-bold text-blue-400">{Math.round(targetProtein)}</div>
            <div className="text-xs text-white/40">gramas</div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">Carboidratos</div>
            <div className="text-2xl font-bold text-orange-400">{Math.round(targetCarbs)}</div>
            <div className="text-xs text-white/40">gramas</div>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1">Gorduras</div>
            <div className="text-2xl font-bold text-yellow-400">{Math.round(targetFat)}</div>
            <div className="text-xs text-white/40">gramas</div>
          </div>
        </div>
      </div>

      {/* Soma do Dia */}
      <div className="p-6 bg-[#0a0b14] rounded-xl border border-white/10">
        <h3 className="text-base font-semibold text-white mb-4">Totais Consumidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={dayTotals.calories > targetCalories * 1.1 ? "text-red-400" : "text-white"}>
            <div className="text-xs text-white/50 mb-1">Calorias</div>
            <div className="text-2xl font-bold">{Math.round(dayTotals.calories)}</div>
            <div className="text-xs opacity-70">kcal</div>
          </div>
          <div className={dayTotals.protein > targetProtein * 1.1 ? "text-red-400" : "text-blue-400"}>
            <div className="text-xs text-white/50 mb-1">Proteína</div>
            <div className="text-2xl font-bold">{Math.round(dayTotals.protein)}</div>
            <div className="text-xs opacity-70">gramas</div>
          </div>
          <div className={dayTotals.carbs > targetCarbs * 1.1 ? "text-red-400" : "text-orange-400"}>
            <div className="text-xs text-white/50 mb-1">Carboidratos</div>
            <div className="text-2xl font-bold">{Math.round(dayTotals.carbs)}</div>
            <div className="text-xs opacity-70">gramas</div>
          </div>
          <div className={dayTotals.fat > targetFat * 1.1 ? "text-red-400" : "text-yellow-400"}>
            <div className="text-xs text-white/50 mb-1">Gorduras</div>
            <div className="text-2xl font-bold">{Math.round(dayTotals.fat)}</div>
            <div className="text-xs opacity-70">gramas</div>
          </div>
        </div>
        <div className="text-xs text-white/40 mt-4 p-3 bg-white/5 rounded-lg">
          💡 Valores em vermelho indicam que ultrapassaram 10% da meta
        </div>
      </div>

      {/* Refeições */}
      <div>
        <h3 className="text-base font-semibold text-white mb-4">Suas Refeições</h3>
        <div className="space-y-3">
          {localMeals.map((meal, mealIndex) => {
            const mealTotals = calculateLocalMealTotals(meal)
            return (
              <div key={meal.id} className="p-5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/20">
                      <UtensilsCrossed className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{meal.name}</h4>
                      {meal.time && <div className="text-xs text-white/40">{meal.time}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedMeal(selectedMeal === meal.id ? null : meal.id)}
                      className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Alimento
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteMeal(mealIndex)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Alimentos da refeição */}
                {meal.meal_foods && meal.meal_foods.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {meal.meal_foods.map((mf: any, foodIndex: number) => (
                      <div
                        key={mf.id}
                        className="flex items-center justify-between p-3 bg-[#0a0b14] rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{mf.food.name}</div>
                          <div className="text-xs text-white/40">{mf.quantity}g</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-white font-medium text-sm">
                              {Math.round((mf.food.calories * mf.quantity) / mf.food.serving_size)} kcal
                            </div>
                            <div className="text-xs text-white/40">
                              P:{Math.round((mf.food.protein * mf.quantity) / mf.food.serving_size)}g
                              {" "}C:{Math.round((mf.food.carbs * mf.quantity) / mf.food.serving_size)}g
                              {" "}G:{Math.round((mf.food.fat * mf.quantity) / mf.food.serving_size)}g
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveFoodFromMeal(mealIndex, foodIndex)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totais da refeição */}
                {meal.meal_foods && meal.meal_foods.length > 0 && (
                  <div className="flex gap-6 text-sm border-t border-white/10 pt-3">
                    <div className="text-white font-medium">
                      Total: {Math.round(mealTotals.calories)} kcal
                    </div>
                    <div className="text-blue-400">
                      P: {Math.round(mealTotals.protein)}g
                    </div>
                    <div className="text-orange-400">
                      C: {Math.round(mealTotals.carbs)}g
                    </div>
                    <div className="text-yellow-400">
                      G: {Math.round(mealTotals.fat)}g
                    </div>
                  </div>
                )}

                {/* Adicionar alimento */}
                {selectedMeal === meal.id && (
                  <div className="mt-4 p-4 bg-[#0a0b14] rounded-xl border border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input
                          placeholder="Buscar alimento..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-white/5 border-white/10 text-white pl-10 focus:border-indigo-500"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setFoodModalOpen(true)}
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Novo Alimento
                      </Button>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                      {foods.map((food) => (
                        <div
                          key={food.id}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div>
                            <div className="text-white font-medium text-sm">{food.name}</div>
                            <div className="text-xs text-white/40">
                              {food.calories}kcal • P:{food.protein}g C:{food.carbs}g G:{food.fat}g (por {food.serving_size}g)
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedFood({ food, mealIndex })
                              setQuantityDialogOpen(true)
                            }}
                            className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                          >
                            Adicionar
                          </Button>
                        </div>
                      ))}
                      {foods.length === 0 && (
                        <div className="text-center py-8 text-white/40 text-sm">
                          Nenhum alimento encontrado. Cadastre um novo alimento.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Adicionar nova refeição */}
      <div className="p-5 bg-white/5 rounded-xl border-2 border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-white/[0.07] transition-colors">
        <h4 className="font-semibold text-white mb-4">Adicionar Nova Refeição</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Nome da refeição (ex: Café da Manhã)"
            value={newMealName}
            onChange={(e) => setNewMealName(e.target.value)}
            className="flex-1 bg-[#0a0b14] border-white/10 text-white focus:border-indigo-500"
          />
          <Input
            type="time"
            value={newMealTime}
            onChange={(e) => setNewMealTime(e.target.value)}
            className="w-full sm:w-40 bg-[#0a0b14] border-white/10 text-white focus:border-indigo-500"
          />
          <Button
            onClick={handleAddMeal}
            disabled={!newMealName || loading}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Botão para salvar dieta */}
      {localMeals.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleSaveDiet}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-8 py-6 text-lg"
          >
            {loading ? "Salvando..." : "Salvar Dieta Completa"}
          </Button>
        </div>
      )}

      <FoodModal
        open={foodModalOpen}
        onOpenChange={setFoodModalOpen}
        onFoodCreated={loadFoods}
      />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1a1b23] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir Refeição</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Tem certeza que deseja excluir esta refeição? Todos os alimentos serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMeal}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de quantidade */}
      <AlertDialog open={quantityDialogOpen} onOpenChange={setQuantityDialogOpen}>
        <AlertDialogContent className="bg-[#1a1b23] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Adicionar {selectedFood?.food.name}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Informe a quantidade em gramas
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-[#0a0b14] border-white/10 text-white"
              placeholder="100"
              min="1"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedFood) {
                  handleAddFoodToMeal(selectedFood.mealIndex, selectedFood.food, parseFloat(quantity))
                }
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              Adicionar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
