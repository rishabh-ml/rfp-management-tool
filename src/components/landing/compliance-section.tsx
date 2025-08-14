'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Globe, Lock, Eye, Key, FileCheck } from 'lucide-react'

const securityFeatures = [
  {
    icon: Globe,
    title: 'Data Residency',
    description: 'Choose where your data lives with multi-region deployment options',
  },
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'AES-256 encryption at rest and TLS 1.3 for data in transit',
  },
  {
    icon: Key,
    title: 'Role-Based Access',
    description: 'Granular permissions with principle of least privilege',
  },
  {
    icon: Eye,
    title: 'Audit Trails',
    description: 'Complete activity logs for compliance and security monitoring',
  },
  {
    icon: Shield,
    title: 'SSO & SCIM',
    description: 'Enterprise identity integration with automated provisioning',
  },
  {
    icon: FileCheck,
    title: 'Compliance Ready',
    description: 'SOC 2 Type II, GDPR, CCPA, and HIPAA compliance frameworks',
  }
]

export function ComplianceSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [visibleCards, setVisibleCards] = useState<boolean[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Animate cards with stagger effect
          securityFeatures.forEach((_, index) => {
            setTimeout(() => {
              setVisibleCards(prev => {
                const newVisible = [...prev]
                newVisible[index] = true
                return newVisible
              })
            }, index * 150)
          })
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('compliance-section')
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
    <section id="compliance-section" className="py-20 bg-gradient-to-br from-slate-50 to-background dark:from-slate-950/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 max-w-3xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full mb-6">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Enterprise Security
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Built with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              enterprise-grade security
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Your sensitive proposal data deserves the highest level of protection. We&apos;ve built security and compliance into every layer of our platform.
          </p>
          <div className="inline-flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">SOC 2 Type II in progress</span>
            </div>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">GDPR Compliant</span>
            </div>
          </div>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className={`bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-500 ${
                  visibleCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Compliance Badges */}
        <div className={`text-center transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
            {[
              { name: 'SOC 2', status: 'In Progress' },
              { name: 'GDPR', status: 'Compliant' },
              { name: 'CCPA', status: 'Compliant' },
              { name: 'HIPAA', status: 'Ready' },
            ].map((compliance, index) => (
              <div key={index} className="flex items-center space-x-3 bg-card border border-border rounded-lg px-4 py-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">{compliance.name}</div>
                  <div className="text-xs text-muted-foreground">{compliance.status}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button variant="outline" size="lg">
              <FileCheck className="mr-2 h-4 w-4" />
              Security Whitepaper
            </Button>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Schedule Security Review
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
