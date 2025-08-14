'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles, Zap, Target, FileText, Mail, CheckCircle } from 'lucide-react'

const aiFeatures = [
  {
    icon: Sparkles,
    title: 'Semantic Answer Suggestions',
    description: 'AI analyzes requirements and suggests relevant responses from your knowledge base',
  },
  {
    icon: Zap,
    title: 'Gap Analysis',
    description: 'Automatically identify missing information and compliance requirements',
  },
  {
    icon: Target,
    title: 'Predictive Win Probability',
    description: 'Machine learning models estimate your chances based on historical data',
  },
  {
    icon: FileText,
    title: 'Auto Summaries',
    description: 'Generate executive summaries and key takeaways from complex RFPs',
  }
]

export function AITeaserSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('ai-teaser-section')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      // Here you would typically send the email to your backend
      console.log('Waitlist signup:', email)
    }
  }

  return (
    <section id="ai-teaser-section" className="py-20 bg-gradient-to-br from-indigo-50 via-background to-purple-50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 max-w-4xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
              AI-Powered Intelligence
            </span>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 ml-2">
              Coming Soon
            </Badge>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            AI that{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600">
              amplifies—not replaces—
            </span>
            <br />
            your expertise
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8">
            Contextual suggestions trained on your approved knowledge—never public data. 
            Maintain control while leveraging AI to accelerate your proposal process.
          </p>

          <div className="inline-flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Private AI training on your data only
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* AI Features */}
          <div className={`space-y-8 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            {aiFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:bg-card transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      {feature.title}
                      <Badge variant="outline" className="ml-2 text-xs border-indigo-200 text-indigo-600">
                        AI
                      </Badge>
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Waitlist Signup */}
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                {!isSubmitted ? (
                  <>
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Get Early Access</h3>
                      <p className="text-muted-foreground">
                        Be among the first to experience AI-powered proposal intelligence. 
                        Join our exclusive beta program.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-11 h-12 rounded-xl"
                          required
                        />
                      </div>
                      <Button 
                        type="submit"
                        size="lg" 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12 rounded-xl"
                      >
                        Join AI Waitlist
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Early access to AI features</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Beta pricing discounts</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Direct feedback channel</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-emerald-600">You&apos;re on the list!</h3>
                    <p className="text-muted-foreground">
                      We&apos;ll notify you as soon as AI features are available. 
                      Thanks for your interest in the future of RFP management.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
