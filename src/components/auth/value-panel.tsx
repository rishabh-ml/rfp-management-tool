'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, BarChart3, Shield, Users } from 'lucide-react'

const benefits = [
  {
    icon: CheckCircle,
    title: 'Respond faster',
    description: 'Cut proposal preparation time by 43% with intelligent answer reuse'
  },
  {
    icon: Shield,
    title: 'Ensure compliance',
    description: 'Never miss requirements with automated compliance tracking'
  },
  {
    icon: BarChart3,
    title: 'Improve win rate',
    description: 'Increase success probability by 25% with data-driven insights'
  }
]

export function ValuePanel() {
  const [currentBenefit, setCurrentBenefit] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    // Rotate benefits every 4 seconds
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
  <div className="relative flex flex-col justify-center p-10 lg:p-14 xl:p-16 bg-gradient-to-br from-indigo-600/5 to-emerald-600/5 dark:from-indigo-900/20 dark:to-emerald-900/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600 rounded-full blur-3xl" />
      </div>

      <div className={`relative z-10 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Main Headline */}
        <div className="mb-10">
          <h1 className="text-3xl lg:text-[2.5rem] font-bold mb-4 leading-tight tracking-tight">
            Accelerate every{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
              RFP response
            </span>
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground max-w-md">
            Transform your proposal process with intelligent automation and seamless collaboration.
          </p>
        </div>

        {/* Rotating Benefits */}
  <div className="space-y-4 mb-10">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon
            return (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-xl transition-colors duration-300 border ${
                  index === currentBenefit 
                    ? 'bg-card/60 border-border/60 shadow-sm ring-1 ring-indigo-500/30' 
                    : 'bg-card/30 border-transparent opacity-70 hover:opacity-90'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  index === currentBenefit 
                    ? 'bg-gradient-to-br from-indigo-600 to-emerald-600 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Dashboard Mockup */}
        <div className="relative">
          <div className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-xl p-4 shadow-lg">
            {/* Mock Browser Header */}
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-border/30">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="ml-4 bg-muted/50 px-3 py-1 rounded text-xs">
                rfp-platform.com/dashboard
              </div>
            </div>

            {/* Mock Content */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg"></div>
                  <div>
                    <div className="w-24 h-3 bg-muted rounded mb-1"></div>
                    <div className="w-16 h-2 bg-muted/60 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
              
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 opacity-60">
                  <div className="w-8 h-8 bg-muted rounded-lg"></div>
                  <div className="flex-1">
                    <div className="w-full h-2 bg-muted rounded mb-2"></div>
                    <div className="w-3/4 h-2 bg-muted/60 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Stats */}
          <div className="absolute -bottom-4 -right-4 bg-card/90 backdrop-blur border border-border/70 rounded-lg p-3 shadow-lg">
            <div className="text-xs font-medium text-emerald-600 mb-1">Win Rate</div>
            <div className="text-lg font-bold">73%</div>
          </div>
        </div>

        {/* Trust Indicators */}
  <div className="mt-8 flex items-center justify-center gap-6 opacity-70">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span className="text-xs">SOC 2</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span className="text-xs">500+ Teams</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">GDPR Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
