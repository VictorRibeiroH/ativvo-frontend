"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getActiveDietPlan, type DietPlan } from "@/services/api"
import { PageTopBase } from "@/components/layout/page-top-base"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ChevronLeft, ChevronRight, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DietStep1 } from "@/components/diet/diet-step-1"
import { DietStep2 } from "@/components/diet/diet-step-2"
import { DietStep3 } from "@/components/diet/diet-step-3"

export default function DietPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [activeDiet, setActiveDiet] = useState<DietPlan | null>(null)
  
  // Estado compartilhado entre os steps
  const [step1Data, setStep1Data] = useState<any>(null)
  const [step2Data, setStep2Data] = useState<any>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/sign-in")
      return
    }
    setUser(currentUser)

    loadActiveDiet()
  }, [router])

  const loadActiveDiet = async () => {
    try {
      const diet = await getActiveDietPlan()
      setActiveDiet(diet)
      
      // Se já tem dieta ativa, vai direto pro step 3
      if (diet) {
        setCurrentStep(3)
      }
    } catch (error: any) {
      console.error("Erro ao carregar dieta:", error)
      
      // Se for erro de autenticação, redireciona
      if (error.message?.includes('Unauthorized') || error.message?.includes('token')) {
        toast({
          title: "Sessão expirada",
          description: "Redirecionando para login...",
          variant: "destructive",
        })
        setTimeout(() => {
          router.push('/sign-in')
        }, 1500)
      }
      // Se for 404 (sem dieta ativa), é normal, não faz nada
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b14]">
        <div className="flex items-center justify-center py-20">
          <div className="text-white text-xl">Carregando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0b14]">
      <PageTopBase 
        userName={user?.name || "Usuário"} 
        subtitle="Configure seu plano alimentar personalizado"
        isDark={true}
      />
      <Toaster />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <UtensilsCrossed className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Montar Dieta</h1>
            <p className="text-sm text-white/50">Configure seu plano alimentar personalizado</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-[#1a1b23] rounded-xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                    currentStep >= step
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/50"
                      : "bg-[#0a0b14] border-2 border-white/10 text-white/30"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div className="flex-1 h-1 mx-3 bg-[#0a0b14] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        currentStep > step ? "bg-gradient-to-r from-indigo-500 to-purple-500 w-full" : "w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className={currentStep >= 1 ? "text-white font-medium" : "text-white/30"}>
              Dados Pessoais
            </span>
            <span className={currentStep >= 2 ? "text-white font-medium" : "text-white/30"}>
              Estratégia
            </span>
            <span className={currentStep >= 3 ? "text-white font-medium" : "text-white/30"}>
              Montar Refeições
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#1a1b23] rounded-xl p-8 border border-white/5">
          {currentStep === 1 && (
            <DietStep1
              onNext={(data) => {
                setStep1Data(data)
                nextStep()
              }}
            />
          )}

          {currentStep === 2 && step1Data && (
            <DietStep2
              step1Data={step1Data}
              onNext={(data) => {
                setStep2Data(data)
                nextStep()
              }}
              onBack={prevStep}
            />
          )}

          {currentStep === 3 && step2Data && (
            <DietStep3
              step1Data={step1Data}
              step2Data={step2Data}
              activeDiet={activeDiet}
              onBack={prevStep}
              onDietCreated={loadActiveDiet}
            />
          )}
        </div>
      </div>
    </div>
  )
}
