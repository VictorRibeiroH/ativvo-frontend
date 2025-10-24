"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"
import { Poppins } from "next/font/google"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500"],
})

interface WorkoutCardProps {
  dayOfWeek: number
  dayName: string
  gradientClass: string
  isToday: boolean
  workout: {
    id?: string
    day_of_week: number
    name: string
    exercises: string[]
    is_rest: boolean
    completed: boolean
  }
  onToggleComplete: (workoutId: string | undefined) => void
  onUpdateWorkout: (dayOfWeek: number, updates: any) => void
  onAddExercise: (dayOfWeek: number) => void
  onRemoveExercise: (dayOfWeek: number, index: number) => void
  onUpdateExercise: (dayOfWeek: number, index: number, value: string) => void
}

const ConfettiParticle = ({ delay }: { delay: number }) => {
  const randomX = Math.random() * 200 - 100
  const randomY = Math.random() * -150 - 50
  const randomRotate = Math.random() * 360
  const colors = ["#71DDB1", "#EE405F", "#6266EB", "#FFD700", "#FF6B9D"]
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const shapes = ["●", "★", "◆", "▲"]
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)]

  return (
    <motion.div
      initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: randomX,
        y: randomY,
        scale: [0, 1.5, 1, 0],
        rotate: randomRotate,
      }}
      transition={{
        duration: 1.2,
        delay,
        ease: "easeOut",
      }}
      className="absolute pointer-events-none text-2xl"
      style={{ color: randomColor }}
    >
      {randomShape}
    </motion.div>
  )
}

export function WorkoutCard({
  dayOfWeek,
  dayName,
  gradientClass,
  isToday,
  workout,
  onToggleComplete,
  onUpdateWorkout,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
}: WorkoutCardProps) {
  const [showCelebration, setShowCelebration] = useState(false)

  const handleToggle = () => {
    if (!workout.completed) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 1500)
    }
    onToggleComplete(workout.id)
  }

  return (
    <Card
      className="relative overflow-hidden transition-all hover:shadow-xl bg-black h-[600px] flex flex-col"
      style={{
        border: "1px solid transparent",
        backgroundImage:
          "linear-gradient(black, black), linear-gradient(135deg, #6266EB 0%, #8F5BC0 25%, #A356AE 50%, #D84778 75%, #EF405F 100%)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      {isToday && (
        <div
          className={`absolute top-4 right-4 bg-[#71DDB133] text-[#71DDB1] px-3 py-1 rounded-full text-xs font-semibold z-10 ${poppins.className}`}
        >
          Hoje
        </div>
      )}
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/star-icon.svg"
              alt=""
              width={28}
              height={28}
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
            <h3 className={`text-xl font-semibold text-white ${poppins.className}`}>{dayName}</h3>
          </div>
          {workout.id && !workout.is_rest && (
            <div className="flex items-center gap-2 min-w-[140px] justify-end">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div className="relative" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <AnimatePresence>
                    {showCelebration && (
                      <>
                        {[...Array(12)].map((_, i) => (
                          <ConfettiParticle key={i} delay={i * 0.05} />
                        ))}
                      </>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {workout.completed && (
                      <motion.div
                        className="absolute inset-0 rounded-md bg-green-500/30 blur-xl"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.4, 0.7, 0.4],
                        }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.button
                    onClick={handleToggle}
                    className={`relative w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                      workout.completed
                        ? "bg-green-500 border-green-500"
                        : "bg-transparent border-gray-600 hover:border-gray-400"
                    }`}
                    animate={
                      workout.completed
                        ? {
                            rotate: [0, -5, 5, -5, 0],
                            scale: [1, 1.15, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 0.6, ease: "easeOut", type: "tween" }}
                  >
                    <AnimatePresence mode="wait">
                      {workout.completed && (
                        <motion.svg
                          key="checkmark"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-2 flex-1 flex flex-col">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Switch
            id={`rest-${workout.day_of_week}`}
            checked={workout.is_rest}
            onCheckedChange={(checked) => {
              onUpdateWorkout(workout.day_of_week, {
                is_rest: checked,
                name: checked ? "Descanso" : "",
                exercises: checked ? [] : workout.exercises,
              })
            }}
            style={{
              backgroundColor: workout.is_rest ? "#000" : "#000",
              borderColor: "#828492",
            }}
          />
          <label
            htmlFor={`rest-${workout.day_of_week}`}
            className={`text-base text-[#828492] cursor-pointer ${poppins.className}`}
          >
            Dia de descanso
          </label>
        </div>

        {!workout.is_rest && (
          <>
            <div className="space-y-2 flex-shrink-0">
              <label className={`text-md font-semibold text-white mt-4 flex items-center gap-2 ${poppins.className}`}>
                <Image
                  src="/pencil-icon.svg"
                  alt=""
                  width={28}
                  height={28}
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
                Nome do seu treino
              </label>
              <Input
                placeholder="Ex.: Treino A - Peitoral e Tríceps"
                value={workout.name}
                onChange={(e) => onUpdateWorkout(workout.day_of_week, { name: e.target.value })}
                className={`border-none text-white placeholder:text-gray-400 ${poppins.className}`}
                style={{
                  background: "#3D4046",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "100%",
                  letterSpacing: "0px",
                }}
              />
            </div>

            <div className="space-y-3 flex-1 flex flex-col">
              <label
                className={`text-md font-semibold text-white flex items-center gap-2 flex-shrink-0 ${poppins.className}`}
              >
                <Image
                  src="/muscle-icon.svg"
                  alt=""
                  width={28}
                  height={28}
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
                Exercícios realizados
              </label>
              <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0">
                {(workout.exercises || []).map((exercise, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <span className={`text-xs font-bold text-gray-500 w-6 ${poppins.className}`}>{index + 1}.</span>
                    <Input
                      placeholder="Ex: Supino reto 4x12"
                      value={exercise}
                      onChange={(e) => onUpdateExercise(workout.day_of_week, index, e.target.value)}
                      className={`flex-1 text-white placeholder:text-gray-400 rounded-lg bg-[#3D4046] px-4 py-2 outline-none ring-0 border-0 focus:border-0 focus:outline-none focus:ring-0 ${poppins.className}`}
                      style={{
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "100%",
                        letterSpacing: "0px",
                        border: "none",
                        boxShadow: "none",
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={() => onRemoveExercise(workout.day_of_week, index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(workout.exercises || []).length === 0 && (
                  <div className={`text-center py-8 border-2 border-gray-700 rounded-lg ${poppins.className}`}>
                    <p className={`text-white font-semibold text-lg mb-1 ${poppins.className}`}>
                      Nenhum exercício adicionado
                    </p>
                    <p className={`text-lg text-gray-400 ${poppins.className}`}>
                      Clique abaixo no botão "Adicionar treino" para começar.
                    </p>
                  </div>
                )}
              </div>
              <Button
                onClick={() => onAddExercise(workout.day_of_week)}
                className={`w-full bg-[#EE405F] text-white font-semibold flex-shrink-0 ${poppins.className} hover:bg-[#EE405F] active:bg-[#EE405F] focus:bg-[#EE405F]`}
              >
                Adicionar treino +
              </Button>
            </div>
          </>
        )}

        {workout.is_rest && (
          <div
            className={`text-center py-12 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg ${poppins.className}`}
          >
            <div className="text-6xl mb-3">😴</div>
            <p className="text-lg font-semibold">Dia de Descanso</p>
            <p className="text-sm text-muted-foreground mt-1">Recupere suas energias!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
