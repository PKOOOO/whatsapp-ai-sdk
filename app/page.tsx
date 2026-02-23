"use client"

import { useRouter } from "next/navigation"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { MessageSquare, ArrowRight, Bot, Shield, BarChart3 } from "lucide-react"
import { useEffect } from "react"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* Logo */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-8">
          <MessageSquare className="h-8 w-8 text-emerald-400" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-4">
          WhatsApp AI Bot
        </h1>
        <p className="text-lg text-zinc-400 max-w-md mb-8">
          Intelligent WhatsApp chatbot powered by Claude AI with a full admin
          dashboard for managing conversations and analytics.
        </p>

        <div className="flex gap-3">
          {/* Signed In — go straight to dashboard */}
          <SignedIn>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </SignedIn>

          {/* Signed Out — show modal sign-in */}
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6">
                Sign In
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl">
          {[
            {
              icon: Bot,
              title: "AI-Powered",
              desc: "Claude AI for intelligent text & image responses",
            },
            {
              icon: Shield,
              title: "Admin Dashboard",
              desc: "Full control over bot settings and conversations",
            },
            {
              icon: BarChart3,
              title: "Analytics",
              desc: "Real-time insights into message volume and trends",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm"
            >
              <feature.icon className="h-6 w-6 text-emerald-400 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-zinc-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
