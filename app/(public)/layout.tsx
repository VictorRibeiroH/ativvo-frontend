"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser, logout, getEventsByDate, type User, type Event } from "@/services/api"
import { LeftSidebar } from "@/components/layout/left-sidebar"
import { LayoutHeader } from "@/components/layout/layout-header"
import { RightSidebar } from "@/components/dashboard/right-sidebar"

interface DayEvent {
  id: string
  title: string
  time: string
  type: 'workout' | 'reminder'
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(true)
  
  // Calendar and events state
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dayEvents, setDayEvents] = useState<DayEvent[]>([])
  const [monthSelectorOpen, setMonthSelectorOpen] = useState(false)
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(false)
  
  // Drag scroll state
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const publicPages = ['/sign-in', '/sign-up', '/home']
  const isPublicPage = publicPages.includes(pathname || '')

  useEffect(() => {
    if (!isPublicPage) {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        router.push("/sign-in")
        return
      }
      setUser(currentUser)
      loadEventsForDate(selectedDate)
    }
    setLoading(false)

    const savedTheme = localStorage.getItem('ativvo-theme')
    setIsDark(savedTheme !== 'light')
  }, [router, isPublicPage])

  useEffect(() => {
    if (!loading && !isPublicPage) {
      loadEventsForDate(selectedDate)
      
      // Scroll para o dia selecionado
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

  // Scroll inicial para o dia de hoje
  useEffect(() => {
    if (!loading && scrollContainerRef.current && !isPublicPage) {
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

  const handleNavigate = (path: string) => {
    router.push(path)
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
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return months[date.getMonth()]
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

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: any) => {
    e.preventDefault()
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY
    }
  }

  if (isPublicPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#030303]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto" />
          <p className="mt-4 text-white/60">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen transition-colors duration-300 ${isDark ? 'bg-[#030303]' : 'bg-gradient-to-br from-indigo-50 via-white to-rose-50'}`}>
      <LeftSidebar
        isDark={isDark}
        pathname={pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <LayoutHeader
          user={user}
          isDark={isDark}
          pathname={pathname}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 overflow-y-auto">
          {children}
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
    </div>
  )
}
