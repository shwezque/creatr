import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ArrowRight, Play, Star, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { useAuth } from '@/app/providers/auth-provider'

export const Route = createFileRoute('/')({
    component: LandingPage,
})

function LandingPage() {
    const { loginDemo, isLoading } = useAuth()
    const navigate = useNavigate()

    // Reset all session data when landing page loads
    useEffect(() => {
        localStorage.removeItem('creatr-social-connections')
        localStorage.removeItem('creatr-analysis-complete')
        localStorage.removeItem('creatr-shop-products')
        localStorage.removeItem('creatr-shoplinks')
        localStorage.removeItem('creatr-token')
    }, [])

    const handleGetStarted = async () => {
        // Set demo token first (for static hosting)
        localStorage.setItem('creatr-token', 'demo-static-token')

        // Try demo login (may fail on static hosting, that's ok)
        try {
            await loginDemo()
        } catch (error) {
            console.warn('Demo login not available (static hosting), using offline mode')
        }

        navigate({ to: '/app/connect' })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
            {/* Hero Section */}
            <div className="container px-4 py-12 md:py-24">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-6 flex items-center justify-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                            <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground" />
                        </div>
                        <span className="text-3xl font-bold">Creatr</span>
                    </div>

                    <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                        Generate income from your{' '}
                        <span className="text-primary">social media profile</span>
                    </h1>

                    <p className="mb-8 text-lg text-muted-foreground">
                        Connect your social accounts, discover products matched to your content,
                        and earn commissions with every sale. Plus, unlock exclusive loan offers
                        based on your creator score.
                    </p>

                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <Button size="lg" onClick={handleGetStarted} disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'Get Started'} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <Link to="/about">Learn More</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container px-4 pb-16">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="flex flex-col items-center p-6 text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mb-2 font-semibold">Connect & Analyze</h3>
                            <p className="text-sm text-muted-foreground">
                                Link your social accounts and get AI-powered insights about your content and audience.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex flex-col items-center p-6 text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Star className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mb-2 font-semibold">Curated Products</h3>
                            <p className="text-sm text-muted-foreground">
                                Discover products that match your niche with competitive commission rates.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex flex-col items-center p-6 text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mb-2 font-semibold">Grow & Earn</h3>
                            <p className="text-sm text-muted-foreground">
                                Track your performance, climb the leaderboard, and unlock credit opportunities.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t py-8">
                <div className="container text-center text-sm text-muted-foreground">
                    <p>© 2026 Creatr. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
