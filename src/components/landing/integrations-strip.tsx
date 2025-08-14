'use client'

import { useEffect, useState } from 'react'

const integrations = [
  { name: 'Salesforce CRM', category: 'CRM', logo: '🔵' },
  { name: 'HubSpot', category: 'CRM', logo: '🟠' },
  { name: 'Microsoft Dynamics', category: 'CRM', logo: '🔷' },
  { name: 'DocuSign', category: 'eSign', logo: '📝' },
  { name: 'Adobe Sign', category: 'eSign', logo: '🔴' },
  { name: 'Google Drive', category: 'Storage', logo: '💾' },
  { name: 'SharePoint', category: 'Storage', logo: '📂' },
  { name: 'Dropbox', category: 'Storage', logo: '📦' },
  { name: 'Slack', category: 'Communication', logo: '💬' },
  { name: 'Microsoft Teams', category: 'Communication', logo: '👥' },
  { name: 'Zoom', category: 'Communication', logo: '🎥' },
  { name: 'Jira', category: 'Project Management', logo: '📋' },
]

export function IntegrationsStrip() {
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

    const element = document.getElementById('integrations-strip')
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
    <section id="integrations-strip" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Seamlessly{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
              integrate with your stack
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Connect with the tools your team already uses. Build custom workflows with our comprehensive API.
          </p>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className={`bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg hover:scale-105 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-3xl mb-3">{integration.logo}</div>
              <h3 className="font-medium text-sm mb-1">{integration.name}</h3>
              <p className="text-xs text-muted-foreground">{integration.category}</p>
            </div>
          ))}
        </div>

        {/* API Section */}
        <div className={`text-center transition-all duration-1000 delay-800 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="text-2xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-3">Need a custom integration?</h3>
            <p className="text-muted-foreground mb-6">
              Use our REST API and webhooks to build custom workflows and connect with any tool in your ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-muted/50 px-4 py-2 rounded-lg text-sm font-mono">
                GET /api/v1/projects
              </div>
              <div className="bg-muted/50 px-4 py-2 rounded-lg text-sm font-mono">
                POST /api/v1/webhooks
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
