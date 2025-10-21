"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, logout, getWeeklyStats, createEvent, getEventsByDate, deleteEvent, type User, type WeeklyStats, type Event } from "@/services/api"
import { RightSidebar } from "@/components/dashboard/right-sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { EventsList } from "@/components/dashboard/events-list"
import { EventDetailDialog } from "@/components/dashboard/event-detail-dialog"
import { DeleteConfirmDialog } from "@/components/dashboard/delete-confirm-dialog"
import { AddEventDialog } from "@/components/dashboard/add-event-dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface DayEvent {
  id: string
  title: string
  time: string
  type: 'workout' | 'reminder'
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(true)
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [monthSelectorOpen, setMonthSelectorOpen] = useState(false)
  const [newReminder, setNewReminder] = useState({ title: '', description: '', time: '' })
  const [dayEvents, setDayEvents] = useState<DayEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [eventDetailOpen, setEventDetailOpen] = useState(false)
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState(false)
  const [deleteProgress, setDeleteProgress] = useState(0)
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/sign-in")
      return
    }
    setUser(currentUser)
    loadWeeklyStats()
    loadEventsForDate(selectedDate)
    setLoading(false)

    const savedTheme = localStorage.getItem('ativvo-theme')
    setIsDark(savedTheme !== 'light')
  }, [router])

  useEffect(() => {
    if (!loading) {
      loadEventsForDate(selectedDate)
      
      // Scroll para o dia selecionado após um pequeno delay para garantir que o DOM foi atualizado
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const dayElement = scrollContainerRef.current.querySelector(`[data-day="${selectedDate.getDate()}"]`)
          if (dayElement) {
            dayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
          }
        }
      }, 100)
    }
  }, [selectedDate])

  // Scroll inicial para o dia de hoje quando o componente carregar
  useEffect(() => {
    if (!loading && scrollContainerRef.current) {
      setTimeout(() => {
        const todayElement = scrollContainerRef.current?.querySelector(`[data-day="${new Date().getDate()}"]`)
        if (todayElement) {
          todayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
      }, 300)
    }
  }, [loading])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.month-selector-container')) {
        setMonthSelectorOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadWeeklyStats = async () => {
    try {
      const stats = await getWeeklyStats()
      setWeeklyStats(stats)
    } catch (error) {
      console.error('Failed to load weekly stats:', error)
    }
  }

  const loadEventsForDate = async (date: Date) => {
    setLoadingEvents(true)
    try {
      const dateStr = date.toISOString().split('T')[0]
      const events = await getEventsByDate(dateStr)
      
      const dayEvts: DayEvent[] = events.map((event: Event) => ({
        id: event.id,
        title: event.title,
        time: event.event_time,
        type: 'reminder' as const
      }))
      
      setDayEvents(dayEvts)
      setAllEvents(events)
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('ativvo-theme', newTheme ? 'dark' : 'light')
  }

  const handleLogout = () => {
    logout()
    router.push("/sign-in")
  }

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.time) return
    
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      
      const response = await createEvent({
        title: newReminder.title,
        description: newReminder.description,
        event_date: dateStr,
        event_time: newReminder.time,
      })
      
      const newEvent: DayEvent = {
        id: response.event.id,
        title: response.event.title,
        time: response.event.event_time,
        type: 'reminder'
      }
      
      setDayEvents([...dayEvents, newEvent])
      setAllEvents([...allEvents, response.event])
      setNewReminder({ title: '', description: '', time: '' })
      setReminderDialogOpen(false)
      
      toast({
        title: "Evento criado!",
        description: "O evento foi adicionado com sucesso.",
        variant: "success",
      })
    } catch (error) {
      console.error('Failed to create event:', error)
      toast({
        title: "Erro ao criar evento",
        description: "Não foi possível criar o evento. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    setDeletingEvent(true)
    setDeleteProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setDeleteProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      await deleteEvent(eventId)
      
      clearInterval(progressInterval)
      setDeleteProgress(100)
      await new Promise(resolve => setTimeout(resolve, 300))

      setDayEvents(dayEvents.filter(event => event.id !== eventId))
      setAllEvents(allEvents.filter(event => event.id !== eventId))
      
      toast({
        title: "Evento excluído!",
        description: "O evento foi removido com sucesso.",
        variant: "success",
      })
      
      setDeleteDialogOpen(false)
      setEventDetailOpen(false)
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o evento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setDeletingEvent(false)
      setDeleteProgress(0)
    }
  }

  const confirmDeleteEvent = () => {
    if (selectedEvent) {
      setDeleteDialogOpen(true)
    }
  }

  const confirmDeleteEventById = (eventId: string) => {
    const event = allEvents.find(e => e.id === eventId)
    if (event) {
      setSelectedEvent(event)
      setDeleteDialogOpen(true)
    }
  }

  const handleEventClick = (eventId: string) => {
    const event = allEvents.find(e => e.id === eventId)
    if (event) {
      setSelectedEvent(event)
      setEventDetailOpen(true)
    }
  }

  const selectDay = (day: Date) => {
    setSelectedDate(day)
    loadEventsForDate(day)
  }

  const selectMonth = (monthIndex: number) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(monthIndex)
    setCurrentMonth(newDate)
    setMonthSelectorOpen(false)
  }

  const getMonthName = (date: Date) => {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return monthNames[date.getMonth()]
  }

  const getMonthDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    for (let i = firstDay.getDate(); i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const handleMouseDown = (e: any) => {
    setIsDragging(true)
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: any) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 2
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk
    }
  }

  const handleWheel = (e: any) => {
    e.preventDefault()
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY
    }
  }

  const handleReminderChange = (field: 'title' | 'description' | 'time', value: string) => {
    setNewReminder(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-[#030303]">
      <p className="text-white">Carregando...</p>
    </div>
  }

  return (
    <div className={`flex h-screen transition-colors duration-300 ${isDark ? 'bg-[#030303]' : 'bg-gradient-to-br from-indigo-50 via-white to-rose-50'}`}>
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Bem-vindo de volta, {user?.name}! 👋
              </h2>
              <p className={isDark ? 'text-white/60' : 'text-gray-600'}>
                Aqui está seu resumo de hoje
              </p>
            </div>

            <StatsCards weeklyStats={weeklyStats} isDark={isDark} />
            
            <div className="grid grid-cols-1 gap-6">
              <EventsList
                isDark={isDark}
                dayEvents={dayEvents}
                loadingEvents={loadingEvents}
                setReminderDialogOpen={setReminderDialogOpen}
                handleEventClick={handleEventClick}
                confirmDeleteEventById={confirmDeleteEventById}
              />
            </div>
          </div>
        </main>
      </div>

      <RightSidebar
        user={user}
        isDark={isDark}
        toggleTheme={toggleTheme}
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        dayEvents={dayEvents}
        monthSelectorOpen={monthSelectorOpen}
        setMonthSelectorOpen={setMonthSelectorOpen}
        setReminderDialogOpen={setReminderDialogOpen}
        selectMonth={selectMonth}
        selectDay={selectDay}
        getMonthName={getMonthName}
        getMonthDays={getMonthDays}
        handleMouseDown={handleMouseDown}
        handleMouseUp={handleMouseUp}
        handleMouseMove={handleMouseMove}
        handleMouseLeave={handleMouseLeave}
        handleWheel={handleWheel}
        scrollContainerRef={scrollContainerRef}
      />

      <AddEventDialog
        open={reminderDialogOpen}
        onOpenChange={setReminderDialogOpen}
        isDark={isDark}
        newReminder={newReminder}
        onReminderChange={handleReminderChange}
        onAddReminder={handleAddReminder}
      />

      <EventDetailDialog
        open={eventDetailOpen}
        onOpenChange={setEventDetailOpen}
        event={selectedEvent}
        isDark={isDark}
        onDelete={confirmDeleteEvent}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        event={selectedEvent}
        isDark={isDark}
        isDeleting={deletingEvent}
        progress={deleteProgress}
        onConfirm={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
      />

      <Toaster />
    </div>
  )
}
