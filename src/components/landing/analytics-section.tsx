'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BarChart3, TrendingUp, Clock, Target } from 'lucide-react'

export function AnalyticsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeMetric, setActiveMetric] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('analytics-section')
    if (element) {
      observer.observe(element)
    }

    // Auto-cycle through metrics
    const interval = setInterval(() => {
      setActiveMetric(prev => (prev + 1) % 4)
    }, 3000)

    return () => {
      clearInterval(interval)
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const analyticsFeatures = [
    {
      icon: BarChart3,
      title: 'Pipeline Analytics',
      description: 'Track RFP volume, win rates, and revenue forecasts',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      icon: Clock,
      title: 'Cycle Time Analysis',
      description: 'Identify bottlenecks and optimize your process',
      color: 'from-emerald-600 to-teal-600'
    },
    {
      icon: Target,
      title: 'Win/Loss Insights',
      description: 'Understand what drives successful proposals',
      color: 'from-amber-600 to-orange-600'
    },
    {
      icon: TrendingUp,
      title: 'Capacity Forecasting',
      description: 'Plan resources based on proposal pipeline',
      color: 'from-purple-600 to-violet-600'
    }
  ]

  const mockData = {
    metrics: [
      { label: 'Total Pipeline Value', value: '$4.2M', change: '+28%', trend: 'up' },
      { label: 'Active RFPs', value: '23', change: '+12%', trend: 'up' },
      { label: 'Avg Response Time', value: '5.2 days', change: '-18%', trend: 'down' },
      { label: 'Win Rate', value: '73%', change: '+15%', trend: 'up' },
    ],
    chartData: [
      { month: 'Jan', value: 65 },
      { month: 'Feb', value: 72 },
      { month: 'Mar', value: 68 },
      { month: 'Apr', value: 78 },
      { month: 'May', value: 85 },
      { month: 'Jun', value: 73 },
    ]
  }

  return (
    <section id="analytics-section" className="py-20 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 max-w-3xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-6">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Performance Analytics
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Data-driven{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              proposal intelligence
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Turn your proposal process into a competitive advantage with comprehensive analytics and insights.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Features List */}
          <div className={`space-y-6 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            {analyticsFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={index}
                  className={`flex items-start space-x-4 p-6 rounded-2xl transition-all cursor-pointer ${
                    activeMetric === index 
                      ? 'bg-card border border-blue-200 dark:border-blue-800 shadow-lg' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveMetric(index)}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}

            <div className="pt-6">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                View Demo Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-muted px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Performance Dashboard</h4>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    Live Data
                  </Badge>
                </div>
              </div>

              {/* Metrics Cards */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {mockData.metrics.map((metric, index) => (
                    <div key={index} className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
                      <div className="text-2xl font-bold mb-1">{metric.value}</div>
                      <div className={`text-xs flex items-center space-x-1 ${
                        metric.trend === 'up' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        <TrendingUp className="w-3 h-3" />
                        <span>{metric.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart Mockup */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Win Rate Trend</span>
                    <span className="text-xs text-muted-foreground">Last 6 months</span>
                  </div>
                  <div className="flex items-end space-x-2 h-24">
                    {mockData.chartData.map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm mb-2"
                          style={{ height: `${data.value}%` }}
                        ></div>
                        <span className="text-xs text-muted-foreground">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Insights */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">💡</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Optimization Insight
                      </h5>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your technical review stage averages 2.3 days longer than similar teams. 
                        Consider parallel reviews to accelerate cycle time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
