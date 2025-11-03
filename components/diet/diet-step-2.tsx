"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { calculateDietPlan, type DietCalculation } from "@/services/api"
import { type Step1Data } from "./diet-step-1"
import { Flame, TrendingUp, Activity, ChevronLeft } from "lucide-react"

export interface Step2Data {
  goal: string
  protein_percent: number
  carbs_percent: number
  fat_percent: number
  calculations: DietCalculation
}

interface DietStep2Props {
  step1Data: Step1Data
  onNext: (data: Step2Data) => void
  onBack: () => void
}

export function DietStep2({ step1Data, onNext, onBack }: DietStep2Props) {
  const [goal, setGoal] = useState("maintenance")
  const [useCustomMacros, setUseCustomMacros] = useState(false)
  const [calculations, setCalculations] = useState<DietCalculation | null>(null)
  const [loading, setLoading] = useState(false)

  // Macros padrão baseados no objetivo
  const defaultMacros = {
    cutting: { protein: 40, carbs: 30, fat: 30 },
    bulking: { protein: 30, carbs: 50, fat: 20 },
    maintenance: { protein: 30, carbs: 40, fat: 30 },
  }

  const [customMacros, setCustomMacros] = useState(defaultMacros.maintenance)

  useEffect(() => {
    loadCalculations()
  }, [goal, customMacros])

  const loadCalculations = async () => {
    setLoading(true)
    try {
      const macros = useCustomMacros ? customMacros : defaultMacros[goal as keyof typeof defaultMacros]
      
      const result = await calculateDietPlan({
        ...step1Data,
        goal,
        protein_percent: macros.protein,
        carbs_percent: macros.carbs,
        fat_percent: macros.fat,
      })

      setCalculations(result)
    } catch (error) {
      console.error("Erro ao calcular dieta:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomMacrosChange = (key: string, value: number) => {
    const newMacros = { ...customMacros, [key]: value }
    
    // Garantir que a soma seja 100%
    const total = newMacros.protein + newMacros.carbs + newMacros.fat
    if (total > 100) {
      return // Não permite valores que somem mais de 100%
    }
    
    setCustomMacros(newMacros)
  }

  const handleNext = () => {
    if (!calculations) return

    const macros = useCustomMacros ? customMacros : defaultMacros[goal as keyof typeof defaultMacros]

    onNext({
      goal,
      protein_percent: macros.protein,
      carbs_percent: macros.carbs,
      fat_percent: macros.fat,
      calculations,
    })
  }

  const macrosTotal = customMacros.protein + customMacros.carbs + customMacros.fat

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Escolha sua estratégia</h2>
        <p className="text-white/50 text-sm">
          Defina seu objetivo e personalize seus macronutrientes
        </p>
      </div>

      {/* Cálculos */}
      {calculations && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
          <div className="text-center">
            <div className="text-sm text-white/50 mb-1 font-medium">TMB</div>
            <div className="text-3xl font-bold text-white">{Math.round(calculations.tmb)}</div>
            <div className="text-xs text-white/40 mt-1">kcal/dia</div>
          </div>
          <div className="text-center border-l border-r border-white/10">
            <div className="text-sm text-white/50 mb-1 font-medium">TDEE (GET)</div>
            <div className="text-3xl font-bold text-white">{Math.round(calculations.tdee)}</div>
            <div className="text-xs text-white/40 mt-1">kcal/dia</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white/50 mb-1 font-medium">Meta de Calorias</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{Math.round(calculations.target_calories)}</div>
            <div className="text-xs text-white/40 mt-1">kcal/dia</div>
          </div>
        </div>
      )}

      {/* Objetivos */}
      <div className="space-y-3">
        <Label className="text-white text-base font-semibold">Objetivo</Label>
        <RadioGroup value={goal} onValueChange={setGoal} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`relative flex items-center space-x-2 p-5 rounded-xl border-2 cursor-pointer transition-all ${
              goal === "cutting"
                ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20"
                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
            }`}
            onClick={() => setGoal("cutting")}
          >
            <RadioGroupItem value="cutting" id="cutting" className="sr-only" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-5 w-5 text-red-400" />
                <Label htmlFor="cutting" className="text-white font-bold cursor-pointer">
                  Cutting
                </Label>
              </div>
              <p className="text-xs text-white/60">Perda de peso (-500 kcal)</p>
            </div>
          </div>

          <div
            className={`relative flex items-center space-x-2 p-5 rounded-xl border-2 cursor-pointer transition-all ${
              goal === "maintenance"
                ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
            }`}
            onClick={() => setGoal("maintenance")}
          >
            <RadioGroupItem value="maintenance" id="maintenance" className="sr-only" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-5 w-5 text-blue-400" />
                <Label htmlFor="maintenance" className="text-white font-bold cursor-pointer">
                  Manutenção
                </Label>
              </div>
              <p className="text-xs text-white/60">Manter peso atual</p>
            </div>
          </div>

          <div
            className={`relative flex items-center space-x-2 p-5 rounded-xl border-2 cursor-pointer transition-all ${
              goal === "bulking"
                ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20"
                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
            }`}
            onClick={() => setGoal("bulking")}
          >
            <RadioGroupItem value="bulking" id="bulking" className="sr-only" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <Label htmlFor="bulking" className="text-white font-bold cursor-pointer">
                  Bulking
                </Label>
              </div>
              <p className="text-xs text-white/60">Ganho de massa (+500 kcal)</p>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Macros */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-white text-base font-semibold">Distribuição de Macros</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setUseCustomMacros(!useCustomMacros)
              if (useCustomMacros) {
                setCustomMacros(defaultMacros[goal as keyof typeof defaultMacros])
              }
            }}
            className="border-white/10 hover:bg-white/5 text-white/70 hover:text-white"
          >
            {useCustomMacros ? "Usar Padrão" : "Customizar"}
          </Button>
        </div>

        {calculations && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-blue-500/10 border-2 border-blue-500/20 rounded-xl hover:bg-blue-500/15 transition-colors">
              <div className="text-sm text-blue-400 mb-2 font-medium">Proteína</div>
              {useCustomMacros ? (
                <Input
                  type="number"
                  value={customMacros.protein}
                  onChange={(e) => handleCustomMacrosChange("protein", parseInt(e.target.value) || 0)}
                  min="10"
                  max="60"
                  className="mb-2 bg-[#0a0b14] border-blue-500/30 text-white focus:border-blue-500"
                />
              ) : (
                <div className="text-3xl font-bold text-white mb-2">
                  {defaultMacros[goal as keyof typeof defaultMacros].protein}%
                </div>
              )}
              <div className="text-xl font-semibold text-blue-400">{Math.round(calculations.protein_grams)}g</div>
            </div>

            <div className="p-5 bg-orange-500/10 border-2 border-orange-500/20 rounded-xl hover:bg-orange-500/15 transition-colors">
              <div className="text-sm text-orange-400 mb-2 font-medium">Carboidratos</div>
              {useCustomMacros ? (
                <Input
                  type="number"
                  value={customMacros.carbs}
                  onChange={(e) => handleCustomMacrosChange("carbs", parseInt(e.target.value) || 0)}
                  min="10"
                  max="70"
                  className="mb-2 bg-[#0a0b14] border-orange-500/30 text-white focus:border-orange-500"
                />
              ) : (
                <div className="text-3xl font-bold text-white mb-2">
                  {defaultMacros[goal as keyof typeof defaultMacros].carbs}%
                </div>
              )}
              <div className="text-xl font-semibold text-orange-400">{Math.round(calculations.carbs_grams)}g</div>
            </div>

            <div className="p-5 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-xl hover:bg-yellow-500/15 transition-colors">
              <div className="text-sm text-yellow-400 mb-2 font-medium">Gorduras</div>
              {useCustomMacros ? (
                <Input
                  type="number"
                  value={customMacros.fat}
                  onChange={(e) => handleCustomMacrosChange("fat", parseInt(e.target.value) || 0)}
                  min="10"
                  max="50"
                  className="mb-2 bg-[#0a0b14] border-yellow-500/30 text-white focus:border-yellow-500"
                />
              ) : (
                <div className="text-3xl font-bold text-white mb-2">
                  {defaultMacros[goal as keyof typeof defaultMacros].fat}%
                </div>
              )}
              <div className="text-xl font-semibold text-yellow-400">{Math.round(calculations.fat_grams)}g</div>
            </div>
          </div>
        )}

        {useCustomMacros && (
          <div className={`text-sm p-4 rounded-xl font-medium ${macrosTotal === 100 ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
            Total: {macrosTotal}% {macrosTotal !== 100 && "(deve somar 100%)"}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-white/10 hover:bg-white/5 text-white/70 hover:text-white px-8"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={handleNext}
          disabled={loading || !calculations || (useCustomMacros && macrosTotal !== 100)}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-6"
        >
          Próxima Etapa
        </Button>
      </div>
    </div>
  )
}
