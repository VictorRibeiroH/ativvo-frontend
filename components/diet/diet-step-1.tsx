"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/services/api"
import { User, Scale, Ruler, Calendar } from "lucide-react"

export interface Step1Data {
  age: number
  gender: string
  height: number
  weight: number
  activity_level: string
}

interface DietStep1Props {
  onNext: (data: Step1Data) => void
}

export function DietStep1({ onNext }: DietStep1Props) {
  const [formData, setFormData] = useState<Step1Data>({
    age: 25,
    gender: "male",
    height: 175,
    weight: 70,
    activity_level: "moderately_active",
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setFormData({
        age: calculateAge(user.created_at) || 25,
        gender: user.gender || "male",
        height: user.height || 175,
        weight: user.weight || 70,
        activity_level: "moderately_active",
      })
    }
  }, [])

  const calculateAge = (createdAt: string) => {
    // Por enquanto, retorna idade padrão. Você pode adicionar campo de data de nascimento no cadastro
    return 25
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Preencha seus dados</h2>
        <p className="text-white/50 text-sm">
          Esses dados serão usados para calcular sua Taxa Metabólica Basal (TMB) e Gasto Energético Total (TDEE)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age" className="text-white/90 flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-indigo-400" />
            Idade
          </Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
            required
            min="10"
            max="120"
            className="bg-[#0a0b14] border-white/10 text-white focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="text-white/90 flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4 text-indigo-400" />
            Sexo
          </Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger className="bg-[#0a0b14] border-white/10 text-white focus:border-indigo-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-white/10">
              <SelectItem value="male" className="text-white hover:bg-white/10">Masculino</SelectItem>
              <SelectItem value="female" className="text-white hover:bg-white/10">Feminino</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="height" className="text-white/90 flex items-center gap-2 text-sm font-medium">
            <Ruler className="h-4 w-4 text-indigo-400" />
            Altura (cm)
          </Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
            required
            min="50"
            max="300"
            step="0.1"
            className="bg-[#0a0b14] border-white/10 text-white focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight" className="text-white/90 flex items-center gap-2 text-sm font-medium">
            <Scale className="h-4 w-4 text-indigo-400" />
            Peso (kg)
          </Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
            required
            min="20"
            max="500"
            step="0.1"
            className="bg-[#0a0b14] border-white/10 text-white focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activity_level" className="text-white/90 text-sm font-medium">
          Nível de Atividade Física
        </Label>
        <Select
          value={formData.activity_level}
          onValueChange={(value) => setFormData({ ...formData, activity_level: value })}
        >
          <SelectTrigger className="bg-[#0a0b14] border-white/10 text-white focus:border-indigo-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1b23] border-white/10">
            <SelectItem value="sedentary" className="text-white hover:bg-white/10">
              Sedentário (pouco ou nenhum exercício)
            </SelectItem>
            <SelectItem value="lightly_active" className="text-white hover:bg-white/10">
              Levemente ativo (exercício leve 1-3 dias/semana)
            </SelectItem>
            <SelectItem value="moderately_active" className="text-white hover:bg-white/10">
              Moderadamente ativo (exercício moderado 3-5 dias/semana)
            </SelectItem>
            <SelectItem value="very_active" className="text-white hover:bg-white/10">
              Muito ativo (exercício intenso 6-7 dias/semana)
            </SelectItem>
            <SelectItem value="extremely_active" className="text-white hover:bg-white/10">
              Extremamente ativo (exercício muito intenso + trabalho físico)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-6"
      >
        Próxima Etapa
      </Button>
    </form>
  )
}
