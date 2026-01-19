import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/shared/ui/button'
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
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="mb-6 flex items-center justify-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                        <Play className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
                    </div>
                    <span className="text-2xl font-bold">Creatr</span>
                </div>

                <h1 className="mb-3 text-2xl font-black tracking-tight leading-tight">
                    Generate income from your{' '}
                    <span className="text-primary">social media profile</span>
                </h1>

                <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                    Connect your accounts, discover matched products, and earn commissions with every sale.
                </p>

                <Button size="lg" onClick={handleGetStarted} disabled={isLoading} className="w-full max-w-xs">
                    {isLoading ? 'Loading...' : 'Get Started'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
