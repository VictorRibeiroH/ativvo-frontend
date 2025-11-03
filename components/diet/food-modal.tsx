"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createFood, type CreateFoodInput } from "@/services/api"
import { TACOFoodSearch } from "@/components/taco-food-search"
import { Loader2 } from "lucide-react"

interface FoodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFoodCreated?: () => void
}

export function FoodModal({ open, onOpenChange, onFoodCreated }: FoodModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateFoodInput>({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    serving_size: 100,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createFood(formData)
      
      // Reset form
      setFormData({
        name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        serving_size: 100,
      })
      
      onFoodCreated?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao cadastrar alimento:", error)
      alert("Erro ao cadastrar alimento. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#0a0a0f] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Adicionar Alimento
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="taco" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a1b23]">
            <TabsTrigger value="taco" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500">
              Buscar na TACO
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500">
              Criar Manualmente
            </TabsTrigger>
          </TabsList>

          <TabsContent value="taco" className="mt-4">
            <TACOFoodSearch 
              onFoodImported={() => {
                onFoodCreated?.()
                onOpenChange(false)
              }}
            />
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Nome do Alimento
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Peito de frango grelhado"
              required
              className="bg-[#1a1b23] border-white/10 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-white">
                Calorias (kcal)
              </Label>
              <Input
                id="calories"
                type="number"
                step="0.1"
                value={formData.calories || ""}
                onChange={(e) => setFormData({ ...formData, calories: parseFloat(e.target.value) || 0 })}
                placeholder="165"
                required
                className="bg-[#1a1b23] border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serving_size" className="text-white">
                Porção (g)
              </Label>
              <Input
                id="serving_size"
                type="number"
                step="1"
                value={formData.serving_size || ""}
                onChange={(e) => setFormData({ ...formData, serving_size: parseFloat(e.target.value) || 100 })}
                placeholder="100"
                required
                className="bg-[#1a1b23] border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-white">
                Proteína (g)
              </Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                value={formData.protein || ""}
                onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) || 0 })}
                placeholder="31"
                required
                className="bg-[#1a1b23] border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-white">
                Carboidratos (g)
              </Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                value={formData.carbs || ""}
                onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                required
                className="bg-[#1a1b23] border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat" className="text-white">
                Gorduras (g)
              </Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                value={formData.fat || ""}
                onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) || 0 })}
                placeholder="3.6"
                required
                className="bg-[#1a1b23] border-white/10 text-white"
              />
            </div>
          </div>

          <div className="text-xs text-gray-400 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <strong>Observação:</strong> Os valores devem ser considerando a porção de{" "}
            {formData.serving_size || 100}g para maior exatidão dos cálculos.
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 border-white/10 hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
