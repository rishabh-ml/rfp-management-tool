'use client'

import { useEffect, useState } from 'react'
import { FileX, Clock, AlertTriangle, Target } from 'lucide-react'

const painPoints = [
  {
    icon: FileX,
    title: 'Fragmented Files',
    description: 'Spreadsheets, documents, and emails scattered across teams create version chaos and missed requirements.',
    impact: '67% of teams lose track of critical requirements'
  },
  {
    icon: Clock,
    title: 'Manual Compliance Tracking',
    description: 'Hours spent cross-referencing requirements against responses, with no automated validation or audit trails.',
    impact: '40% increase in proposal preparation time'
  },
  {
    icon: AlertTriangle,
    title: 'Repetitive Answer Recreation',
    description: 'Teams recreate the same answers repeatedly instead of leveraging proven responses from past wins.',
    impact: '73% of content is recreated from scratch'
  },
  {
    icon: Target,
    title: 'Missed Deadlines',
    description: 'Poor visibility into progress and bottlenecks leads to rushed submissions and lost opportunities.',
    impact: '31% of RFPs submitted late or incomplete'
  }
]

export function PainPointsSection() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleCards(prev => {
                const newVisible = [...prev]
                const cardIndex = parseInt(entry.target.getAttribute('data-index') || '0')
                newVisible[cardIndex] = true
                return newVisible
              })
            }, index * 200)
          }
        })
      },
      { threshold: 0.2 }
    )

    const cards = document.querySelectorAll('[data-pain-card]')
    cards.forEach(card => observer.observe(card))

    return () => {
      cards.forEach(card => observer.unobserve(card))
    }
  }, [])

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Legacy spreadsheets and copy‑paste{' '}
            <span className="text-red-600">are costing you deals</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Manual RFP processes create bottlenecks, increase risk, and drain your team&apos;s expertise into administrative work.
          </p>
        </div>

        {/* Pain Point Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {painPoints.map((point, index) => {
            const IconComponent = point.icon
            return (
              <div
                key={index}
                data-pain-card
                data-index={index}
                className={`bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-500 ${
                  visibleCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3">{point.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {point.description}
                    </p>
                    <div className="inline-flex items-center space-x-2 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-full">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        {point.impact}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-muted px-6 py-3 rounded-full">
            <span className="text-muted-foreground">There&apos;s a better way</span>
            <span className="text-2xl">👇</span>
          </div>
        </div>
      </div>
    </section>
  )
}
