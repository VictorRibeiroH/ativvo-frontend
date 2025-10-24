"use client"

import { Button } from '@/components/ui/button'
import { Calendar, Save } from 'lucide-react'

interface WorkoutsHeaderProps {
  weekStart: string | null
  saving: boolean
  onSave: () => void
}

export function WorkoutsHeader({ weekStart, saving, onSave }: WorkoutsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        {weekStart && (
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Período de {new Date(weekStart).toLocaleDateString('pt-BR')} - {new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
      <Button 
        onClick={onSave} 
        disabled={saving} 
        size="lg" 
        className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white shadow-lg"
      >
        <Save className="mr-2 h-4 w-4" />
        {saving ? 'Salvando...' : 'Salvar Treinos'}
      </Button>
    </div>
  )
}
