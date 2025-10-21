"use client"

import { Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { Event } from "@/services/api"

interface EventDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event | null
  isDark: boolean
  onDelete: () => void
}

export function EventDetailDialog({
  open,
  onOpenChange,
  event,
  isDark,
  onDelete
}: EventDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`
        ${isDark 
          ? 'bg-black/40 border-white/20 shadow-2xl shadow-indigo-500/10' 
          : 'bg-white/40 border-indigo-200/50 shadow-2xl shadow-indigo-500/20'
        } 
        backdrop-blur-3xl overflow-hidden
        data-[state=open]:animate-in data-[state=closed]:animate-out 
        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
        data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 
        data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]
        duration-300
      `}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-rose-500/5" />
        
        {/* Decorative gradient orbs with animation */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-rose-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />
        
        <DialogHeader className="relative z-10">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/50">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {event?.title}
              </DialogTitle>
              <DialogDescription className={`mt-1 flex items-center gap-2 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                <Clock className="h-4 w-4" />
                {event?.event_date && new Date(event.event_date).toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                {event?.event_time && ` • ${event.event_time}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="relative z-10 space-y-6 py-6">
          {event?.description ? (
            <div className={`p-4 rounded-lg backdrop-blur-xl ${
              isDark 
                ? 'bg-white/10 border border-white/20 shadow-lg' 
                : 'bg-white/70 border border-indigo-100 shadow-lg'
            }`}>
              <Label className={`text-xs uppercase tracking-wider font-semibold ${
                isDark ? 'text-white/80' : 'text-gray-700'
              }`}>
                Descrição
              </Label>
              <p className={`mt-3 leading-relaxed ${
                isDark ? 'text-white/80' : 'text-gray-700'
              } whitespace-pre-wrap`}>
                {event.description}
              </p>
            </div>
          ) : (
            <div className={`p-8 rounded-lg border-2 border-dashed text-center ${
              isDark 
                ? 'border-white/20 bg-white/5' 
                : 'border-gray-300 bg-white/30'
            }`}>
              <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-400'} italic`}>
                Nenhuma descrição adicionada
              </p>
            </div>
          )}
        </div>
        
        <div className={`relative z-10 flex justify-between items-center gap-3 pt-4 border-t ${
          isDark ? 'border-white/20' : 'border-gray-200/50'
        }`}>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className={`
              ${isDark 
                ? 'text-white/70 hover:text-white hover:bg-white/10' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
              transition-all duration-200 hover:scale-105
            `}
          >
            Fechar
          </Button>
          <Button
            onClick={onDelete}
            className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 hover:scale-105"
          >
            Excluir Evento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
