import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Leaf,
  Users,
  ClipboardList,
  BarChart3,
  Sprout,
  Shield,
  ArrowRight,
  Menu,
  X,
  CheckCircle2
} from 'lucide-react'

const features = [
  {
    icon: Leaf,
    title: 'Farm Management',
    description: 'Manage multiple farms, track locations, and monitor crop cycles from a single dashboard.'
  },
  {
    icon: Users,
    title: 'Workforce Planning',
    description: 'Organize workers, assign roles, and manage labor schedules efficiently across operations.'
  },
  {
    icon: ClipboardList,
    title: 'Task Tracking',
    description: 'Create, assign, and track tasks with priorities, due dates, and real-time status updates.'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Gain insights with comprehensive reporting on farm performance, productivity, and costs.'
  },
  {
    icon: Sprout,
    title: 'Crop Monitoring',
    description: 'Track crop health, growth stages, and harvest schedules to maximize yields.'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with role-based access control and data encryption.'
  }
]

const stats = [
  { value: '500+', label: 'Farms Managed' },
  { value: '12K+', label: 'Active Workers' },
  { value: '45K+', label: 'Tasks Completed' },
  { value: '98%', label: 'Uptime SLA' }
]

const benefits = [
  'Real-time operational visibility',
  'Automated task scheduling',
  'Resource optimization',
  'Mobile-friendly interface',
  'Audit trail & compliance',
  '24/7 customer support'
]

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Farm ERP</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Benefits</a>
            <a href="#stats" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Stats</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate('/')} variant="default">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button onClick={() => navigate('/login')} variant="ghost">
                  Sign In
                </Button>
                <Button onClick={() => navigate('/login')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm font-medium text-muted-foreground hover:text-foreground">Features</a>
            <a href="#benefits" className="block text-sm font-medium text-muted-foreground hover:text-foreground">Benefits</a>
            <a href="#stats" className="block text-sm font-medium text-muted-foreground hover:text-foreground">Stats</a>
            <div className="pt-3 border-t flex flex-col gap-2">
              {user ? (
                <Button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="w-full">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} variant="ghost" className="w-full">
                    Sign In
                  </Button>
                  <Button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="w-full">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        </div>
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <Sprout className="h-4 w-4" />
              Farm ERP Management Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Streamline Your{' '}
              <span className="text-primary">Farm Operations</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              A comprehensive ERP platform designed specifically for modern agriculture. Manage farms, workers, tasks, and analytics from one powerful system.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              {user ? (
                <Button size="lg" onClick={() => navigate('/')} className="gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                    Learn More
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Run Your Farm
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features built specifically for agricultural operations management.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Choose Farm ERP?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built with farmers in mind, our platform delivers real value from day one.
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to Transform Your Farm Operations?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Join hundreds of farms already using Farm ERP to streamline their operations and boost productivity.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                {user ? (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => navigate('/')}
                    className="gap-2"
                  >
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => navigate('/login')}
                    className="gap-2"
                  >
                    Get Started Now <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">Farm ERP</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>&copy; 2024 Farm ERP Platform. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Benefits</a>
              <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Stats</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
