'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { AtSign, Eye, MessageCircle, Clock, CheckCircle2, Users2 } from 'lucide-react'

export function CollaborationSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeDemo, setActiveDemo] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('collaboration-section')
    if (element) {
      observer.observe(element)
    }

    // Auto-cycle through demo states
    const interval = setInterval(() => {
      setActiveDemo(prev => (prev + 1) % 3)
    }, 3000)

    return () => {
      clearInterval(interval)
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const collaborationFeatures = [
    {
      icon: AtSign,
      title: '@Mentions & Notifications',
      description: 'Tag team members directly in context for faster resolution'
    },
    {
      icon: Eye,
      title: 'Real-time Presence',
      description: 'See who\'s online and working on which sections'
    },
    {
      icon: MessageCircle,
      title: 'Contextual Comments',
      description: 'Comment directly on requirements, answers, and sections'
    },
    {
      icon: Clock,
      title: 'Review Rounds',
      description: 'Structured approval cycles with automated reminders'
    },
    {
      icon: CheckCircle2,
      title: 'Color Team Reviews',
      description: 'Organized feedback sessions with role-based perspectives'
    },
    {
      icon: Users2,
      title: 'Team Workspaces',
      description: 'Dedicated spaces for different proposal teams and projects'
    }
  ]

  const demoStates = [
    {
      title: 'Active Collaboration',
      comments: [
        { user: 'Sarah Chen', role: 'Technical Lead', comment: '@mike can you review the architecture section?', time: '2m ago', status: 'active' },
        { user: 'Mike Rodriguez', role: 'Solution Architect', comment: 'Updated based on client requirements', time: '5m ago', status: 'resolved' },
        { user: 'Lisa Park', role: 'Compliance Officer', comment: 'Security section looks good ✓', time: '12m ago', status: 'approved' }
      ]
    },
    {
      title: 'Review Status',
      comments: [
        { user: 'David Kim', role: 'Sales Director', comment: 'Pricing approved for submission', time: '1h ago', status: 'approved' },
        { user: 'Emma Wilson', role: 'Legal Counsel', comment: 'Contract terms need minor adjustment', time: '2h ago', status: 'active' },
        { user: 'Alex Johnson', role: 'Project Manager', comment: 'Timeline section completed', time: '3h ago', status: 'resolved' }
      ]
    },
    {
      title: 'Final Preparation',
      comments: [
        { user: 'Jennifer Davis', role: 'Proposal Manager', comment: 'Final review complete - ready for submission', time: '30m ago', status: 'approved' },
        { user: 'Tom Anderson', role: 'Quality Assurance', comment: 'All compliance checks passed', time: '45m ago', status: 'approved' },
        { user: 'Rachel Martinez', role: 'Content Lead', comment: 'Executive summary finalized', time: '1h ago', status: 'approved' }
      ]
    }
  ]

  return (
    <section id="collaboration-section" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 max-w-3xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-6">
            <Users2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Team Collaboration
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Transform{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              team collaboration
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Break down silos with real-time collaboration tools designed specifically for proposal teams. Keep everyone aligned from kick-off to submission.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Features List */}
          <div className={`space-y-8 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            {collaborationFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
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
          </div>

          {/* Interactive Demo */}
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-muted px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{demoStates[activeDemo].title}</h4>
                  <div className="flex space-x-1">
                    {demoStates.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === activeDemo ? 'bg-blue-600' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="p-6 space-y-4 min-h-[300px]">
                {demoStates[activeDemo].comments.map((comment, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">
                        {comment.user.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{comment.user}</span>
                        <Badge variant="secondary" className="text-xs">
                          {comment.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {comment.comment}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          comment.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                          comment.status === 'active' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {comment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
