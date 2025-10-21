"use client"

import { useState, useRef } from "react"
import { Bell, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import type { User } from "@/services/api"

interface DayEvent {
  id: string
  title: string
  time: string
  type: 'workout' | 'reminder'
}

interface RightSidebarProps {
  user: User | null
  isDark: boolean
  toggleTheme: () => void
  currentMonth: Date
  selectedDate: Date
  dayEvents: DayEvent[]
  monthSelectorOpen: boolean
  setMonthSelectorOpen: (open: boolean) => void
  setReminderDialogOpen: (open: boolean) => void
  selectMonth: (monthIndex: number) => void
  selectDay: (day: Date) => void
  getMonthName: (date: Date) => string
  getMonthDays: () => Date[]
  handleMouseDown: (e: any) => void
  handleMouseUp: () => void
  handleMouseMove: (e: any) => void
  handleMouseLeave: () => void
  handleWheel: (e: any) => void
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
}

export function RightSidebar({
  user,
  isDark,
  toggleTheme,
  currentMonth,
  selectedDate,
  dayEvents,
  monthSelectorOpen,
  setMonthSelectorOpen,
  setReminderDialogOpen,
  selectMonth,
  selectDay,
  getMonthName,
  getMonthDays,
  handleMouseDown,
  handleMouseUp,
  handleMouseMove,
  handleMouseLeave,
  handleWheel,
  scrollContainerRef
}: RightSidebarProps) {
  return (
    <aside style={{ backgroundColor: '#6266EB1A' }} className="hidden lg:flex w-80 flex-col border-l border-white/10 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="relative text-white hover:bg-white/10"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-white/60" />
            <Switch 
              checked={isDark} 
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-indigo-500"
            />
            <Moon className="h-4 w-4 text-indigo-300" />
          </div>
        </div>

        {/* Card do Usuário */}
        <Card style={{ backgroundColor: 'rgba(98, 102, 235, 0.1)' }} className="border-0 mb-6">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-20 w-20 ring-4 ring-white/20">
                <AvatarFallback className="text-3xl bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                  {user?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {user?.name}
                </h3>
                <p className="text-md text-white/70">
                  {user?.goal === 'cutting' ? '🔥 Cutting' : user?.goal === 'bulking' ? '💪 Bulking' : '⚡ Manutenção'}
                </p>
              </div>

              <div className="w-full flex items-center justify-center gap-8 pt-4">
                <div className="text-center">
                  <p className="text-xs text-white/50 mb-1">Altura</p>
                  <p className="text-xl font-bold text-indigo-300">{user?.height || '186'}cm</p>
                </div>
                <div className="h-12 w-px bg-white/20"></div>
                <div className="text-center">
                  <p className="text-xs text-white/50 mb-1">Peso</p>
                  <p className="text-xl font-bold text-indigo-300">{user?.weight || '90'}kg</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-full grid grid-cols-2 gap-2">
            <div className="relative month-selector-container">
              <Button 
                onClick={() => setMonthSelectorOpen(!monthSelectorOpen)}
                style={{ backgroundColor: 'rgba(238, 64, 95, 0.2)', color: '#EE405F' }}
                className="w-full hover:opacity-90 text-sm font-semibold"
              >
                {getMonthName(currentMonth)} ▼
              </Button>
              
              {monthSelectorOpen && (
                <div className="absolute top-full mt-2 w-48 bg-[#1a1b23] border border-white/10 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                  {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((month, index) => (
                    <button
                      key={month}
                      onClick={() => selectMonth(index)}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        index === currentMonth.getMonth()
                          ? 'bg-[#EE405F]/20 text-[#EE405F] font-semibold'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button 
              onClick={() => setReminderDialogOpen(true)}
              variant="ghost"
              style={{ color: '#6266EB' }}
              className="hover:bg-white/5 text-sm font-semibold"
            >
              Add lembrete +
            </Button>
          </div>

          <div className="w-full pt-4 space-y-2">
            <div 
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
              className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide cursor-grab active:cursor-grabbing select-none" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {getMonthDays().map((day, i) => {
                const isSelected = day.toDateString() === selectedDate.toDateString()
                const isToday = day.toDateString() === new Date().toDateString()
                const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
                
                return (
                  <button
                    key={i}
                    data-day={day.getDate()}
                    onClick={() => selectDay(day)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center gap-1 min-w-[64px] h-20 rounded-2xl transition-all ${
                      isToday
                        ? 'bg-green-500/20 text-green-400'
                        : isSelected
                        ? 'bg-gradient-to-r from-indigo-500 to-rose-500 text-white shadow-lg'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-medium uppercase">{dayNames[day.getDay()]}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold">{day.getDate()}</span>
                      {isToday && <span className="text-lg leading-none">°</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="w-full pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white mb-4 text-left">Eventos</h4>
            <div className="space-y-3">
              {dayEvents.map((event, index) => (
                <div key={event.id}>
                  <div className="flex items-start gap-3 text-left">
                    <div className="h-9 w-9 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Bell className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#71DDB1' }}>
                        {event.title}
                      </p>
                      <p className="text-xs font-medium mt-1" style={{ color: '#FFFFFF' }}>
                        {event.time}
                      </p>
                    </div>
                  </div>
                  {index < dayEvents.length - 1 && (
                    <div className="h-px bg-white/10 mt-3" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
