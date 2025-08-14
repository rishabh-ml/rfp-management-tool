'use client'

import { useEffect, useState } from 'react'

const metrics = [
  {
    value: '43%',
    label: 'Faster Drafting',
    description: 'Reduce proposal preparation time with intelligent answer reuse',
    color: 'from-blue-600 to-indigo-600',
    delay: 0
  },
  {
    value: '25%',
    label: 'Higher Win Probability',
    description: 'Improve success rates through better qualification and responses',
    color: 'from-emerald-600 to-teal-600',
    delay: 200
  },
  {
    value: '98%',
    label: 'On-Time Submission Rate',
    description: 'Never miss another deadline with automated workflow management',
    color: 'from-amber-600 to-orange-600',
    delay: 400
  },
  {
    value: '60%',
    label: 'Compliance Efficiency',
    description: 'Streamline requirement tracking and validation processes',
    color: 'from-purple-600 to-violet-600',
    delay: 600
  }
]

export function MetricsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedValues, setAnimatedValues] = useState<string[]>(['0%', '0%', '0%', '0%'])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          
          // Animate numbers
          metrics.forEach((metric, index) => {
            setTimeout(() => {
              const targetValue = parseInt(metric.value)
              let currentValue = 0
              const increment = targetValue / 30 // 30 steps for smooth animation
              
              const timer = setInterval(() => {
                currentValue += increment
                if (currentValue >= targetValue) {
                  currentValue = targetValue
                  clearInterval(timer)
                }
                
                setAnimatedValues(prev => {
                  const newValues = [...prev]
                  newValues[index] = `${Math.round(currentValue)}%`
                  return newValues
                })
              }, 50)
            }, metric.delay)
          })
        }
      },
      { threshold: 0.3 }
    )

    const element = document.getElementById('metrics-section')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  return (
    <section id="metrics-section" className="py-20 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 max-w-3xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Measurable{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
              business impact
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            See the real results our customers achieve when they transform their RFP processes with intelligent automation.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`relative bg-card border border-border rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${metric.delay}ms` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 rounded-2xl`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Animated Number */}
                <div className={`text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                  {animatedValues[index]}
                </div>
                
                {/* Label */}
                <h3 className="text-xl font-semibold mb-3">{metric.label}</h3>
                
                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {metric.description}
                </p>
              </div>

              {/* Decorative Elements */}
              <div className={`absolute top-4 right-4 w-8 h-8 bg-gradient-to-br ${metric.color} rounded-lg opacity-20`}></div>
              <div className={`absolute bottom-4 left-4 w-4 h-4 bg-gradient-to-br ${metric.color} rounded-full opacity-30`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-800 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-emerald-100 dark:from-indigo-900/30 dark:to-emerald-900/30 px-6 py-3 rounded-full">
            <span className="text-sm font-medium">💡</span>
            <span className="text-sm font-medium text-muted-foreground">
              Results based on customer data from 500+ active teams
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
