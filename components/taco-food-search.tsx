'use client'

import { useState } from 'react'
import { Search, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { searchTACOFoods, importTACOFood, type TACOFood } from '@/services/api'
import { toast } from 'sonner'

interface TACOFoodSearchProps {
  onFoodImported?: (food: any) => void
}

export function TACOFoodSearch({ onFoodImported }: TACOFoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [foods, setFoods] = useState<TACOFood[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [importingIds, setImportingIds] = useState<Set<number>>(new Set())

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Digite algo para buscar')
      return
    }

    setIsSearching(true)
    try {
      const result = await searchTACOFoods(searchQuery)
      setFoods(result.foods)
      
      if (result.foods.length === 0) {
        toast.info('Nenhum alimento encontrado na Tabela TACO')
      } else {
        toast.success(`${result.foods.length} alimento(s) encontrado(s)`)
      }
    } catch (error: any) {
      console.error('Erro ao buscar alimentos TACO:', error)
      toast.error(error.message || 'Erro ao buscar alimentos')
    } finally {
      setIsSearching(false)
    }
  }

  const handleImport = async (tacoId: number) => {
    setImportingIds(prev => new Set(prev).add(tacoId))
    
    try {
      const importedFood = await importTACOFood(tacoId)
      toast.success('Alimento importado com sucesso!')
      
      if (onFoodImported) {
        onFoodImported(importedFood)
      }
      
      // Remover da lista após importar
      setFoods(prev => prev.filter(f => f.taco_id !== tacoId))
    } catch (error: any) {
      console.error('Erro ao importar alimento:', error)
      toast.error(error.message || 'Erro ao importar alimento')
    } finally {
      setImportingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(tacoId)
        return newSet
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a1b23] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Buscar na Tabela TACO</CardTitle>
          <CardDescription className="text-gray-400">
            Pesquise alimentos brasileiros na Tabela Brasileira de Composição de Alimentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: arroz, feijão, frango..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSearching}
              className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-gray-500"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              size="icon"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {foods.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">
            Resultados ({foods.length})
          </h3>
          {foods.map((food) => (
            <Card key={food.taco_id} className="bg-[#1a1b23] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{food.name}</h4>
                      <Badge variant="secondary" className="text-xs bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                        {food.category}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Calorias:</span>{' '}
                        <span className="font-medium text-white">{food.calories.toFixed(1)} kcal</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Proteína:</span>{' '}
                        <span className="font-medium text-white">{food.protein.toFixed(1)}g</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Carboidratos:</span>{' '}
                        <span className="font-medium text-white">{food.carbs.toFixed(1)}g</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Gordura:</span>{' '}
                        <span className="font-medium text-white">{food.fat.toFixed(1)}g</span>
                      </div>
                    </div>
                    
                    {food.fiber > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-400">Fibra:</span>{' '}
                        <span className="font-medium text-white">{food.fiber.toFixed(1)}g</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Porção: {food.serving_size}g
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => handleImport(food.taco_id)}
                    disabled={importingIds.has(food.taco_id)}
                    size="sm"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  >
                    {importingIds.has(food.taco_id) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Importar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
