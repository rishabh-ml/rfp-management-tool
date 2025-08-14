'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Play, Shield, CheckCircle, Globe } from 'lucide-react'

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-blue-50/20 dark:to-blue-950/20">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                <Shield className="w-3 h-3 mr-1" />
                SOC 2 in progress
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                GDPR-ready
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Globe className="w-3 h-3 mr-1" />
                SSO Enabled
              </Badge>
            </div>

            {/* Headlines */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                RFP execution{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
                  without the chaos
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Centralize collaboration, reuse winning answers, and submit compliant proposals faster.
              </p>
              <p className="text-lg text-muted-foreground">
                Unified lifecycle: intake, qualification, drafting, compliance, reviews, submission, analytics—in one secure workspace.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="font-semibold">
                <Play className="mr-2 h-4 w-4" />
                Book Live Demo
              </Button>
            </div>

            {/* Sub-CTA */}
            <p className="text-sm text-muted-foreground">
              ✨ No credit card required • 14-day free trial • Setup in 5 minutes
            </p>
          </div>

          {/* Right Column - Dashboard Mockup */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative">
              {/* Main Dashboard Frame */}
              <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Browser Header */}
                <div className="bg-muted px-4 py-3 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="ml-4 bg-background px-3 py-1 rounded text-xs text-muted-foreground">
                      rfp-platform.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/30">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-lg">Project Pipeline</h3>
                      <p className="text-sm text-muted-foreground">12 active RFPs</p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg"></div>
                      <div className="w-8 h-8 bg-amber-500 rounded-lg"></div>
                      <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                    </div>
                  </div>

                  {/* Pipeline Cards */}
                  <div className="space-y-3">
                    {[
                      { title: 'Enterprise CRM Implementation', status: 'In Review', progress: 85, color: 'emerald' },
                      { title: 'Cloud Migration Services', status: 'Drafting', progress: 60, color: 'amber' },
                      { title: 'Security Audit Platform', status: 'Qualification', progress: 25, color: 'blue' },
                    ].map((project, index) => (
                      <div key={index} className="bg-card p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{project.title}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              project.color === 'emerald' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                              project.color === 'amber' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              project.color === 'emerald' ? 'bg-emerald-500' :
                              project.color === 'amber' ? 'bg-amber-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{project.progress}% complete</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-emerald-500 text-white p-3 rounded-xl shadow-lg">
                <div className="text-xs font-medium">Win Rate</div>
                <div className="text-2xl font-bold">73%</div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-indigo-600 text-white p-3 rounded-xl shadow-lg">
                <div className="text-xs font-medium">Avg. Response</div>
                <div className="text-2xl font-bold">5.2 days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
