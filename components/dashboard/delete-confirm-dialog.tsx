"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import type { Event } from "@/services/api"

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event | null
  isDark: boolean
  isDeleting: boolean
  progress: number
  onConfirm: () => void
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  event,
  isDark,
  isDeleting,
  progress,
  onConfirm
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={`
        ${isDark 
          ? 'bg-black/40 border-white/20 shadow-2xl shadow-red-500/10' 
          : 'bg-white/40 border-red-200/50 shadow-2xl shadow-red-500/20'
        } 
        backdrop-blur-3xl
      `}>
        <AlertDialogHeader>
          <AlertDialogTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Confirmar exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className={isDark ? 'text-white/70' : 'text-gray-600'}>
            Tem certeza que deseja excluir o evento "{event?.title}"? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {isDeleting && (
          <div className="space-y-2 py-4">
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Excluindo evento...</span>
              <span className={isDark ? 'text-white/80' : 'text-gray-700'}>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isDeleting}
            className={isDark ? 'border-white/20 hover:bg-white/10' : ''}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
