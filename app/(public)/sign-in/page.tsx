"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.3 + i * 0.15,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    }),
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Lógica de login aqui
    console.log("Login:", { email, password })
  }

  const handleSignUp = () => {
    const mainContent = document.querySelector("body")
    if (mainContent) {
      mainContent.style.overflow = "hidden"
    }

    const overlay = document.createElement("div")
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: #030303;
      z-index: 9999;
      transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    `
    document.body.appendChild(overlay)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.left = "0"
      })
    })

    setTimeout(() => {
      router.push("/sign-up")
      
      setTimeout(() => {
        overlay.style.left = "-100%"
        setTimeout(() => {
          overlay.remove()
          if (mainContent) {
            mainContent.style.overflow = ""
          }
        }, 600)
      }, 300)
    }, 600)
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-md mx-auto">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
              <Image src="/logo.png" alt="Ativvo Logo" width={20} height={20} />
              <span className="text-sm text-white/60 tracking-wide">Ativvo</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Bem-vindo de volta</h1>
            <p className="text-white/40 text-sm">Entre com suas credenciais para continuar</p>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80 text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80 text-sm font-medium">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all duration-300"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white border-0 py-6 text-base font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"
              >
                <span className="relative z-10">Entrar</span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </form>

            <div className="mt-6 text-center">
                {/* Feature - ToDo - Recuperar senha */}
              {/* <button className="text-sm text-white/40 hover:text-white/60 transition-colors duration-300">
                Esqueceu sua senha?
              </button> */}
            </div>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-center mt-6"
          >
            <p className="text-sm text-white/40">
              Não tem uma conta?{" "}
              <button 
                onClick={handleSignUp}
                className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300 font-medium"
              >
                Cadastre-se
              </button>
            </p>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  )
}