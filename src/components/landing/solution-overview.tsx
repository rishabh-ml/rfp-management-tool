'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Workflow, BookOpen, Shield, Users, BarChart3, Lock } from 'lucide-react'

const solutions = [
  {
    icon: Workflow,
    title: 'Lifecycle Control',
    description: 'Complete visibility from RFP intake to submission',
    outcome: 'Reduce cycle time by 43%',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    icon: BookOpen,
    title: 'Smart Answer Library',
    description: 'Reuse and refine winning responses automatically',
    outcome: 'Eliminate 73% of content recreation',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    icon: Shield,
    title: 'Compliance Matrix',
    description: 'Automated requirement tracking and validation',
    outcome: 'Zero compliance gaps',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    icon: Users,
    title: 'Team Workflow',
    description: 'Coordinated reviews with real-time collaboration',
    outcome: 'Streamline approvals by 60%',
    gradient: 'from-purple-500 to-violet-600'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Win rate tracking and capacity forecasting',
    outcome: 'Improve win probability by 25%',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    icon: Lock,
    title: 'Secure Collaboration',
    description: 'Enterprise-grade security with role-based access',
    outcome: 'SOC 2 compliant workflows',
    gradient: 'from-slate-500 to-gray-600'
  }
]

export function SolutionOverview() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardIndex = parseInt(entry.target.getAttribute('data-index') || '0')
            setTimeout(() => {
              setVisibleCards(prev => {
                const newVisible = [...prev]
                newVisible[cardIndex] = true
                return newVisible
              })
            }, cardIndex * 150)
          }
        })
      },
      { threshold: 0.2 }
    )

    const cards = document.querySelectorAll('[data-solution-card]')
    cards.forEach(card => observer.observe(card))

    return () => {
      cards.forEach(card => observer.unobserve(card))
    }
  }, [])

  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Everything you need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
              win more RFPs
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Transform chaotic proposal processes into structured, repeatable workflows that scale with your growth.
          </p>
        </div>

        {/* Solution Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {solutions.map((solution, index) => {
            const IconComponent = solution.icon
            return (
              <div
                key={index}
                data-solution-card
                data-index={index}
                className={`group bg-card border border-border rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-500 cursor-pointer ${
                  visibleCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-r ${solution.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{solution.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {solution.description}
                  </p>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-600">
                      {solution.outcome}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Feature Chips */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            'Lifecycle Governance',
            'Compliance Matrix',
            'Answer Intelligence', 
            'Audit & Security',
            'Extensible API'
          ].map((chip, index) => (
            <div
              key={index}
              className={`bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
                visibleCards[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {chip}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            Explore All Features
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
