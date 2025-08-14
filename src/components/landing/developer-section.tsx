'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Code, Webhook, Zap, Settings } from 'lucide-react'

export function DeveloperSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('rest')

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('developer-section')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const codeExamples = {
    rest: {
      title: 'REST API',
      language: 'javascript',
      code: `// Create a new RFP project
const response = await fetch('/api/v1/projects', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-api-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Enterprise CRM Implementation',
    deadline: '2024-03-15T18:00:00Z',
    requirements: ['security', 'scalability', 'integration']
  })
});

const project = await response.json();
console.log('Created project:', project.id);`
    },
    webhooks: {
      title: 'Webhooks',
      language: 'javascript', 
      code: `// Handle RFP status updates
app.post('/webhooks/rfp-status', (req, res) => {
  const { event, project_id, status, timestamp } = req.body;
  
  if (event === 'project.status_changed') {
    // Update your CRM
    await updateCRMStatus(project_id, status);
    
    // Send team notifications
    if (status === 'submitted') {
      await notifyTeam(\`RFP \${project_id} submitted!\`);
    }
  }
  
  res.status(200).send('OK');
});`
    }
  }

  const features = [
    {
      icon: Code,
      title: 'REST API',
      description: 'Full CRUD operations for projects, answers, and team management'
    },
    {
      icon: Webhook,
      title: 'Real-time Webhooks', 
      description: 'Get notified of status changes, submissions, and team activities'
    },
    {
      icon: Zap,
      title: 'Custom Automations',
      description: 'Build workflows that trigger based on RFP lifecycle events'
    },
    {
      icon: Settings,
      title: 'Flexible Integrations',
      description: 'Connect with CRM, project management, and communication tools'
    }
  ]

  return (
    <section id="developer-section" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 max-w-3xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-6">
            <Code className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Developer Platform
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Build extensions &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              automate workflows
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Extend RFP Platform with our comprehensive API. Build custom integrations, automate processes, and create tailored solutions for your team.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Features */}
          <div className={`space-y-8 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
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

            <div className="pt-6 space-y-4">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  OpenAPI 3.0
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Rate Limited
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Webhooks
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  View API Docs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  <Code className="mr-2 h-4 w-4" />
                  Get API Key
                </Button>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              {/* Tabs */}
              <div className="bg-muted border-b border-border">
                <div className="flex">
                  {Object.entries(codeExamples).map(([key, example]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === key
                          ? 'border-purple-600 text-purple-600 bg-card'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {example.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code */}
              <div className="p-0">
                <div className="bg-slate-950 text-slate-200 p-6 overflow-x-auto">
                  <pre className="text-sm leading-relaxed">
                    <code>{codeExamples[activeTab as keyof typeof codeExamples].code}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">99.9%</div>
                <div className="text-sm text-muted-foreground">API Uptime</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">&lt;100ms</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
