"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getCurrentUser, logout, getWeeklyStats, type User, type WeeklyStats } from "@/services/api"
import { Activity, Dumbbell, Flame, TrendingUp, LogOut, Menu, Moon, Sun, Plus, Calendar, Clock, ChevronLeft, ChevronRight, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pacifico } from "next/font/google"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
})

interface Reminder {
  id: string
  title: string
  description: string
  date: string
  time: string
}

interface DayEvent {
  id: string
  title: string
  time: string
  type: 'workout' | 'reminder'
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(true)
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [monthSelectorOpen, setMonthSelectorOpen] = useState(false)
  const [newReminder, setNewReminder] = useState({ title: '', description: '', time: '' })
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [dayEvents, setDayEvents] = useState<DayEvent[]>([
    { id: '1', title: 'Treino de Peito', time: '14:00', type: 'workout' },
    { id: '2', title: 'Tirar medidas em jejum', time: '08:00', type: 'reminder' },
  ])

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/sign-in")
      return
    }
    setUser(currentUser)
    loadWeeklyStats()
    setLoading(false)

    const savedTheme = localStorage.getItem('ativvo-theme')
    setIsDark(savedTheme !== 'light')
    
    // Scroll automático para o dia de hoje
    setTimeout(() => {
      const today = new Date().getDate()
      const todayElement = document.querySelector(`button:has(span:nth-child(2) > span:first-child:contains("${today}"))`)
      todayElement?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }, 100)
  }, [router])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (monthSelectorOpen && !target.closest('.month-selector-container')) {
        setMonthSelectorOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [monthSelectorOpen])

  const loadWeeklyStats = async () => {
    try {
      const stats = await getWeeklyStats()
      setWeeklyStats(stats)
    } catch (error) {
      console.error('Failed to load weekly stats:', error)
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

  const handleAddReminder = () => {
    if (!newReminder.title || !newReminder.time) return
    
    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      description: newReminder.description,
      date: selectedDate.toISOString(),
      time: newReminder.time,
    }
    
    setReminders([...reminders, reminder])
    setDayEvents([...dayEvents, {
      id: reminder.id,
      title: reminder.title,
      time: reminder.time,
      type: 'reminder'
    }])
    
    setNewReminder({ title: '', description: '', time: '' })
    setReminderDialogOpen(false)
  }

  const getWeekDays = () => {
    const start = new Date(selectedDate)
    start.setDate(start.getDate() - start.getDay() + 1) // Segunda
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      return day
    })
  }

  const getMonthDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      return new Date(year, month, i + 1)
    })
  }

  const getMonthName = (date: Date) => {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return monthNames[date.getMonth()]
  }

  const selectMonth = (monthIndex: number) => {
    const newDate = new Date(currentMonth.getFullYear(), monthIndex, 1)
    setCurrentMonth(newDate)
    setSelectedDate(newDate)
    setMonthSelectorOpen(false)
  }

  const nextWeek = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 7)
    setSelectedDate(newDate)
    if (newDate.getMonth() !== currentMonth.getMonth()) {
      setCurrentMonth(newDate)
    }
  }

  const prevWeek = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 7)
    setSelectedDate(newDate)
    if (newDate.getMonth() !== currentMonth.getMonth()) {
      setCurrentMonth(newDate)
    }
  }

  const selectDay = (day: Date) => {
    setSelectedDate(day)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: "Treinos esta semana",
      value: weeklyStats ? `${weeklyStats.completed}/${weeklyStats.goal}` : "0/0",
      emoji: weeklyStats?.emoji || "💪",
      icon: Dumbbell,
      color: "text-blue-500",
      progress: weeklyStats ? Math.min((weeklyStats.completed / weeklyStats.goal) * 100, 100) : 0,
    },
    {
      title: "Calorias queimadas",
      value: "2,450",
      goal: "3000",
      icon: Flame,
      color: "text-orange-500",
      progress: 81,
    },
    {
      title: "Tempo de cardio",
      value: `${user?.cardio_time || 0}min`,
      goal: "150min",
      icon: Activity,
      color: "text-green-500",
      progress: user?.cardio_time ? Math.min((user.cardio_time / 150) * 100, 100) : 0,
    },
    {
      title: "Progresso do objetivo",
      value: "75%",
      goal: "100%",
      icon: TrendingUp,
      color: "text-purple-500",
      progress: 75,
    },
  ]

  const recentWorkouts = [
    { name: "Treino de Peito", date: "Hoje", duration: "45min", calories: 320 },
    { name: "Cardio HIIT", date: "Ontem", duration: "30min", calories: 280 },
    { name: "Treino de Costas", date: "2 dias atrás", duration: "50min", calories: 350 },
  ]

  const firstName = user?.name.split(" ")[0] || user?.name || "Usuário"

  return (
    <div className={`flex h-screen transition-colors duration-300 ${isDark ? 'bg-[#030303]' : 'bg-gradient-to-br from-indigo-50 via-white to-rose-50'}`}>
      {/* Sidebar Esquerda - Navegação */}
      <aside className={`hidden lg:flex w-64 flex-col border-r transition-colors duration-300 ${
        isDark 
          ? 'border-white/10 bg-black/40 backdrop-blur-xl' 
          : 'border-gray-200 bg-white/80 backdrop-blur-xl shadow-xl'
      }`}>
        <div className={`p-6 border-b transition-colors ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Ativvo" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent ${pacifico.className}`}>
                Ativvo
              </h1>
              <p className={`text-xs transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                Transforme-se diariamente
              </p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="default" className="w-full justify-start bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white">
            <Activity className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start transition-colors ${
              isDark 
                ? 'text-white/80 hover:text-white hover:bg-white/10' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => router.push('/workouts')}
          >
            <Dumbbell className="mr-2 h-4 w-4" />
            Treinos
          </Button>
        </nav>

        <div className={`p-4 border-t transition-colors ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <Button 
            variant="ghost" 
            className={`w-full justify-start transition-colors ${
              isDark 
                ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10' 
                : 'text-rose-600 hover:text-rose-700 hover:bg-rose-100'
            }`}
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Container Central + Sidebar Direita */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`border-b transition-colors duration-300 ${
          isDark 
            ? 'border-white/10 bg-black/40 backdrop-blur-xl' 
            : 'border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm'
        }`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className={`lg:hidden transition-colors ${
                    isDark ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'
                  }`}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className={`w-64 p-0 transition-colors ${
                  isDark 
                    ? 'bg-[#030303] border-white/10' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className={`p-6 border-b transition-colors ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <Image 
                        src="/logo.png" 
                        alt="Ativvo" 
                        width={40} 
                        height={40}
                        className="rounded-lg"
                      />
                      <div>
                        <h1 className={`text-2xl font-bold bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent ${pacifico.className}`}>
                          Ativvo
                        </h1>
                        <p className={`text-xs transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                          Transforme-se diariamente
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="p-4 space-y-2">
                    <Button variant="default" className="w-full justify-start bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white">
                      <Activity className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start transition-colors ${
                        isDark 
                          ? 'text-white/80 hover:text-white hover:bg-white/10' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => router.push('/workouts')}
                    >
                      <Dumbbell className="mr-2 h-4 w-4" />
                      Treinos
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start transition-colors ${
                        isDark 
                          ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10' 
                          : 'text-rose-600 hover:text-rose-700 hover:bg-rose-100'
                      }`}
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>

              <div>
                <h2 className={`text-xl font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Bem-vindo de volta, {firstName}!
                </h2>
                <p className={`text-sm transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  Veja seu progresso
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-rose-500/[0.03]' 
            : 'bg-gradient-to-br from-indigo-100/30 via-transparent to-rose-100/30'
        }`}>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              
              return (
                <Card key={index} className={`transition-colors duration-300 ${
                  isDark 
                    ? 'bg-black/40 backdrop-blur-xl border-white/10' 
                    : 'bg-white/90 backdrop-blur-xl border-gray-200 shadow-lg'
                }`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold transition-colors flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                      {'emoji' in stat && <span className="text-2xl">{stat.emoji}</span>}
                    </div>
                    <Progress value={stat.progress} className="mt-2" />
                    {'goal' in stat && (
                      <p className={`text-xs mt-1 transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                        Meta: {stat.goal}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-1">
            {/* Events */}
            <div className="space-y-6">
              {/* Events of the Day */}
              <Card className={`transition-colors duration-300 ${
                isDark 
                  ? 'bg-black/40 backdrop-blur-xl border-white/10' 
                  : 'bg-white/90 backdrop-blur-xl border-gray-200 shadow-lg'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={`transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Eventos
                      </CardTitle>
                      <CardDescription className={`transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                        {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </CardDescription>
                    </div>
                    <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white">
                          <Plus className="h-4 w-4 mr-1" />
                          Lembrete
                        </Button>
                      </DialogTrigger>
                      <DialogContent className={isDark ? 'bg-black/95 backdrop-blur-xl border-white/10' : 'bg-white'}>
                        <DialogHeader>
                          <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                            Adicione seu lembrete
                          </DialogTitle>
                          <DialogDescription className={isDark ? 'text-white/60' : 'text-gray-600'}>
                            Crie um lembrete para não esquecer suas atividades
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="title" className={isDark ? 'text-white' : 'text-gray-900'}>
                              Título
                            </Label>
                            <Input
                              id="title"
                              placeholder="Ex: Tirar medidas"
                              value={newReminder.title}
                              onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                              className={isDark ? 'bg-white/10 border-white/20 text-white' : ''}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description" className={isDark ? 'text-white' : 'text-gray-900'}>
                              Descrição
                            </Label>
                            <Textarea
                              id="description"
                              placeholder="Detalhes sobre o lembrete..."
                              value={newReminder.description}
                              onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                              className={isDark ? 'bg-white/10 border-white/20 text-white' : ''}
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
                              onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                              className={isDark ? 'bg-white/10 border-white/20 text-white' : ''}
                            />
                          </div>
                          <Button 
                            onClick={handleAddReminder} 
                            className="w-full bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white"
                          >
                            Adicionar Lembrete
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dayEvents.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className={`h-12 w-12 mx-auto mb-2 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
                        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                          Nenhum evento para este dia
                        </p>
                      </div>
                    ) : (
                      dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
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
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        </div>

        {/* Sidebar Direita - Perfil */}
        <aside style={{ backgroundColor: '#6266EB1A' }} className="hidden lg:flex w-80 flex-col border-l border-white/10 overflow-y-auto">
          <div className="p-6">
            {/* Topo - Controles */}
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
                    <p className="text-sm text-white/70">
                      24 anos • Curitiba - PR
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
                  variant="ghost"
                  style={{ color: '#6266EB' }}
                  className="hover:bg-white/5 text-sm font-semibold"
                >
                  Add lembrete +
                </Button>
              </div>

              <div className="w-full pt-4 space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {getMonthDays().map((day, i) => {
                    const isSelected = day.toDateString() === selectedDate.toDateString()
                    const isToday = day.toDateString() === new Date().toDateString()
                    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
                    
                    return (
                      <button
                        key={i}
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
                          <p className="text-xs mt-0.5" style={{ color: '#828492' }}>
                            Dr. consulta
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
      </div>
    </div>
  )
}