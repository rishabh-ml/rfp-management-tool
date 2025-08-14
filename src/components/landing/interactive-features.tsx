'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Clock, Users, BarChart3, FileText, Settings, ArrowRight } from 'lucide-react'

const featureTabs = [
  {
    id: 'intake',
    label: 'Intake & Qualification',
    icon: FileText,
    title: 'Smart RFP Qualification',
    narrative: 'Automatically parse RFP documents, extract requirements, and assess fit against your capabilities. Never waste time on unwinnable opportunities.',
    mockup: {
      title: 'RFP Analysis Dashboard',
      content: [
        { label: 'Document Parsed', status: 'complete', time: '2 min ago' },
        { label: 'Requirements Extracted', status: 'complete', time: '1 min ago' },
        { label: 'Fit Assessment', status: 'in-progress', time: 'Now' },
        { label: 'Go/No-Go Recommendation', status: 'pending', time: 'Pending' },
      ]
    },
    outcomes: [
      'Reduce qualification time by 60%',
      'Improve win rate through better targeting',
      'Automated requirement extraction'
    ]
  },
  {
    id: 'draft',
    label: 'Draft & Reuse',
    icon: Settings,
    title: 'Intelligent Answer Library',
    narrative: 'Access your repository of proven responses. AI suggests relevant answers based on requirements, while you maintain full control over customization.',
    mockup: {
      title: 'Answer Library',
      content: [
        { label: 'Security Protocols', match: '98%', usage: '23 times' },
        { label: 'Implementation Timeline', match: '87%', usage: '45 times' },
        { label: 'Data Privacy Measures', match: '94%', usage: '12 times' },
        { label: 'Support Structure', match: '76%', usage: '34 times' },
      ]
    },
    outcomes: [
      '73% reduction in content recreation',
      'Maintain consistency across proposals', 
      'Leverage winning responses automatically'
    ]
  },
  {
    id: 'review',
    label: 'Review & Approvals',
    icon: Users,
    title: 'Collaborative Review Workflow',
    narrative: 'Structured review cycles with role-based permissions. Track feedback, manage approvals, and ensure nothing falls through the cracks.',
    mockup: {
      title: 'Review Status',
      content: [
        { reviewer: 'Legal Team', status: 'approved', section: 'Contract Terms' },
        { reviewer: 'Technical Lead', status: 'in-review', section: 'Architecture' },
        { reviewer: 'Sales Director', status: 'pending', section: 'Pricing' },
        { reviewer: 'Compliance', status: 'approved', section: 'Security' },
      ]
    },
    outcomes: [
      'Streamline approval cycles by 50%',
      'Complete visibility into review status',
      'Prevent last-minute surprises'
    ]
  },
  {
    id: 'analytics',
    label: 'Submission & Analytics',
    icon: BarChart3,
    title: 'Performance Insights',
    narrative: 'Track win rates, analyze proposal performance, and forecast capacity. Turn your RFP process into a competitive advantage.',
    mockup: {
      title: 'Performance Dashboard',
      content: [
        { metric: 'Win Rate', value: '73%', trend: '+12%' },
        { metric: 'Avg Response Time', value: '5.2 days', trend: '-18%' },
        { metric: 'Pipeline Value', value: '$2.4M', trend: '+25%' },
        { metric: 'Success Score', value: '8.7/10', trend: '+0.8' },
      ]
    },
    outcomes: [
      'Identify winning patterns and strategies',
      'Optimize resource allocation',
      'Predict capacity and growth needs'
    ]
  }
]

export function InteractiveFeatures() {
  const [activeTab, setActiveTab] = useState('intake')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('interactive-features')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const activeFeature = featureTabs.find(tab => tab.id === activeTab)

  return (
    <section id="interactive-features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 max-w-3xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Deep dive into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
              powerful features
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            See how each stage of your RFP process transforms with intelligent automation and collaboration tools.
          </p>
        </div>

        {/* Interactive Tabs */}
        <div className={`transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-12 bg-muted p-2 rounded-2xl">
              {featureTabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-xl py-3"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {featureTabs.map((feature) => {
              const IconComponent = feature.icon
              return (
                <TabsContent key={feature.id} value={feature.id} className="mt-0">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-xl flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold">{feature.title}</h3>
                      </div>
                      
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {feature.narrative}
                      </p>

                      {/* Outcomes */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">Key Outcomes:</h4>
                        {feature.outcomes.map((outcome, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            <span className="text-muted-foreground">{outcome}</span>
                          </div>
                        ))}
                      </div>

                      <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    {/* Mockup */}
                    <div className="relative">
                      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-muted px-6 py-4 border-b border-border">
                          <h4 className="font-semibold">{feature.mockup.title}</h4>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                          {feature.id === 'intake' && feature.mockup.content.map((item: any, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  item.status === 'complete' ? 'bg-emerald-500' :
                                  item.status === 'in-progress' ? 'bg-amber-500' :
                                  'bg-muted-foreground'
                                }`} />
                                <span className="font-medium">{item.label}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">{item.time}</span>
                            </div>
                          ))}

                          {feature.id === 'draft' && feature.mockup.content.map((item: any, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{item.label}</span>
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                  {item.match} match
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Used {item.usage} in winning proposals
                              </div>
                            </div>
                          ))}

                          {feature.id === 'review' && feature.mockup.content.map((item: any, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <div className="font-medium">{item.reviewer}</div>
                                <div className="text-sm text-muted-foreground">{item.section}</div>
                              </div>
                              <Badge 
                                variant="secondary"
                                className={
                                  item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                  item.status === 'in-review' ? 'bg-amber-100 text-amber-800' :
                                  'bg-muted'
                                }
                              >
                                {item.status}
                              </Badge>
                            </div>
                          ))}

                          {feature.id === 'analytics' && feature.mockup.content.map((item: any, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-muted-foreground">{item.metric}</span>
                                <span className="text-xs text-emerald-600">{item.trend}</span>
                              </div>
                              <div className="text-2xl font-bold">{item.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      </div>
    </section>
  )
}
