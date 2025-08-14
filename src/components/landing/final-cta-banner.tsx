'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Sparkles } from 'lucide-react'

export function FinalCTABanner() {
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

    const element = document.getElementById('final-cta-banner')
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
    <section 
      id="final-cta-banner" 
      className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-600 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Transform how you{' '}
            <span className="text-yellow-300">
              win RFPs
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Join 500+ teams who&apos;ve already revolutionized their proposal process.
            <br />
            Start your transformation today.
          </p>

          {/* Stats */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">43%</div>
              <div className="text-white/80">Faster Response Times</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">25%</div>
              <div className="text-white/80">Higher Win Rates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">98%</div>
              <div className="text-white/80">On-Time Submissions</div>
            </div>
          </div>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-white/90 font-semibold px-8 py-4 text-lg h-auto"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-4 text-lg h-auto"
            >
              <Play className="mr-2 h-5 w-5" />
              Book Live Demo
            </Button>
          </div>

          {/* Guarantee */}
          <div className={`inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <span className="text-yellow-300">✨</span>
            <span className="text-white/90 text-sm font-medium">
              14-day free trial • No credit card required • Setup in 5 minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
