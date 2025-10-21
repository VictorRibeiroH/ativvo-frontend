"use client"

import { Calendar, Clock, Dumbbell, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DayEvent {
  id: string
  title: string
  time: string
  type: 'workout' | 'reminder'
}

interface EventsListProps {
  isDark: boolean
  dayEvents: DayEvent[]
  loadingEvents: boolean
  setReminderDialogOpen: (open: boolean) => void
  handleEventClick: (eventId: string) => void
  confirmDeleteEventById: (eventId: string) => void
}

export function EventsList({
  isDark,
  dayEvents,
  loadingEvents,
  setReminderDialogOpen,
  handleEventClick,
  confirmDeleteEventById
}: EventsListProps) {
  return (
    <Card style={{ backgroundColor: 'rgba(98, 102, 235, 0.1)' }} className="border-0 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Próximos Eventos</CardTitle>
            <CardDescription className="text-white/60">
              Seus treinos e lembretes agendados
            </CardDescription>
          </div>
          <Button
            onClick={() => setReminderDialogOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loadingEvents ? (
            <div className="text-center py-8">
              <p className={isDark ? 'text-white/60' : 'text-gray-600'}>Carregando eventos...</p>
            </div>
          ) : dayEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
              <p className={isDark ? 'text-white/60' : 'text-gray-600'}>
                Nenhum evento agendado para hoje
              </p>
            </div>
          ) : (
            dayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all group cursor-pointer ${
                  isDark 
                    ? 'border-white/10 bg-white/5 hover:bg-white/10' 
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  event.type === 'workout'
                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
                    : 'bg-gradient-to-r from-orange-500/20 to-amber-500/20'
                }`}>
                  {event.type === 'workout' ? (
                    <Dumbbell className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-orange-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {event.title}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    {event.time}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    confirmDeleteEventById(event.id)
                  }}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg ${
                    isDark 
                      ? 'hover:bg-red-500/20 text-red-400' 
                      : 'hover:bg-red-100 text-red-600'
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
