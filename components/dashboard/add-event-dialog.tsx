"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isDark: boolean
  newReminder: {
    title: string
    description: string
    time: string
  }
  onReminderChange: (field: 'title' | 'description' | 'time', value: string) => void
  onAddReminder: () => void
}

export function AddEventDialog({
  open,
  onOpenChange,
  isDark,
  newReminder,
  onReminderChange,
  onAddReminder
}: AddEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isDark ? 'bg-black/95 backdrop-blur-xl border-white/10' : 'bg-white'}>
        <DialogHeader>
          <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>
            Adicionar Evento
          </DialogTitle>
          <DialogDescription className={isDark ? 'text-white/60' : 'text-gray-600'}>
            Crie um novo lembrete ou evento para sua agenda
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className={isDark ? 'text-white' : 'text-gray-900'}>
              Título
            </Label>
            <Input
              id="title"
              value={newReminder.title}
              onChange={(e) => onReminderChange('title', e.target.value)}
              placeholder="Ex: Treino de pernas"
              className={isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className={isDark ? 'text-white' : 'text-gray-900'}>
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              value={newReminder.description}
              onChange={(e) => onReminderChange('description', e.target.value)}
              placeholder="Detalhes sobre o evento..."
              className={isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40' : ''}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className={isDark ? 'text-white' : 'text-gray-900'}>
              Horário
            </Label>
            <Input
              id="time"
              type="time"
              value={newReminder.time}
              onChange={(e) => onReminderChange('time', e.target.value)}
              className={isDark ? 'bg-white/5 border-white/10 text-white' : ''}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={isDark ? 'border-white/10 hover:bg-white/5' : ''}
          >
            Cancelar
          </Button>
          <Button
            onClick={onAddReminder}
            className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white"
          >
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
