'use client'

import { useEffect, useState } from 'react'

const companies = [
  { name: 'TechCorp', logo: '/api/placeholder/120/40' },
  { name: 'DataFlow', logo: '/api/placeholder/120/40' },
  { name: 'CloudVision', logo: '/api/placeholder/120/40' },
  { name: 'SecureBase', logo: '/api/placeholder/120/40' },
  { name: 'InnovateLab', logo: '/api/placeholder/120/40' },
  { name: 'ScaleUp', logo: '/api/placeholder/120/40' },
]

export function SocialProofBar() {
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

    const element = document.getElementById('social-proof')
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
      id="social-proof"
      className="py-16 bg-muted/30 border-t border-border"
    >
      <div className="container mx-auto px-4">
        <div className={`text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Stat */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-2">Trusted by proposal teams worldwide</p>
            <div className="inline-flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-900 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Teams cut response cycles by 43%
              </span>
            </div>
          </div>

          {/* Company Logos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
            {companies.map((company, index) => (
              <div
                key={company.name}
                className={`transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-center h-12 w-32 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
                  {/* Placeholder logo - replace with actual logos */}
                  <div className="w-24 h-8 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {company.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional social proof */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Active Teams</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">15K+</div>
              <div className="text-sm text-muted-foreground">RFPs Managed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-1">98%</div>
              <div className="text-sm text-muted-foreground">On-time Submissions</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
