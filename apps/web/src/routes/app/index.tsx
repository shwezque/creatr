import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ChevronRight, Instagram, Plus, ShoppingBag, TrendingUp, Twitter, Wallet, Youtube } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { useAuth } from '@/app/providers/auth-provider'
import { formatCurrency, formatNumber, cn } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/')({
    component: DashboardPage,
})

interface SocialConnection {
    platform: string
    status: string
    handle?: string
    followers?: number
}

interface CreditState {
    hasConsented: boolean
    hasScore: boolean
    assessment?: {
        tier: string
        score: number
        maxLoanAmount: number
    }
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    instagram: Instagram,
    tiktok: TrendingUp,
    youtube: Youtube,
    twitter: Twitter,
}

const tierColors: Record<string, string> = {
    A: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    B: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    C: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    D: 'text-red-600 bg-red-100 dark:bg-red-900/30',
}

function getStoredConnections(): SocialConnection[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('creatr-connections')
    return stored ? JSON.parse(stored) : []
}

function getStoredShopProducts(): string[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('creatr-shop-products')
    return stored ? JSON.parse(stored) : []
}

function getCreditState(): CreditState {
    if (typeof window === 'undefined') return { hasConsented: false, hasScore: false }
    const stored = localStorage.getItem('creatr-credit')
    return stored ? JSON.parse(stored) : { hasConsented: false, hasScore: false }
}

function DashboardPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [connections, setConnections] = useState<SocialConnection[]>([])
    const [productCount, setProductCount] = useState(0)
    const [creditState, setCreditState] = useState<CreditState>({ hasConsented: false, hasScore: false })
    const [isLoading, setIsLoading] = useState(true)

    // Mock analytics data for demo
    const totalEarnings = productCount * 12.50 // $12.50 per product in shop
    const totalConversions = productCount * 3 // 3 sales per product

    useEffect(() => {
        const storedConnections = getStoredConnections()
        const products = getStoredShopProducts()
        const credit = getCreditState()

        setConnections(storedConnections.filter((c) => c.status === 'connected'))
        setProductCount(products.length)
        setCreditState(credit)
        setIsLoading(false)
    }, [])

    const connectedCount = connections.length
    const totalFollowers = connections.reduce((sum, c) => sum + (c.followers || 0), 0)

    // Redirect to connect page if no social accounts connected (onboarding)
    useEffect(() => {
        if (!isLoading && connectedCount === 0) {
            navigate({ to: '/app/connect' })
        }
    }, [isLoading, connectedCount, navigate])

    // Show nothing while checking onboarding status
    if (isLoading || connectedCount === 0) {
        return null
    }

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Creator'}!</h1>
                <p className="text-muted-foreground">Here's what's happening with your creator account.</p>
            </div>

            {/* Social Media Stats */}
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Your Platforms</h2>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/app/connect">
                            Manage <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    {connections.map((connection) => {
                        const Icon = platformIcons[connection.platform] || TrendingUp
                        return (
                            <Card key={connection.platform}>
                                <CardContent className="flex items-center gap-3 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium capitalize">{connection.platform}</p>
                                        <p className="text-sm text-muted-foreground">@{connection.handle || 'connected'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{formatNumber(connection.followers || 0)}</p>
                                        <p className="text-xs text-muted-foreground">followers</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                    <Card>
                        <CardContent className="p-3 text-center">
                            <p className="text-2xl font-bold">{connectedCount}</p>
                            <p className="text-xs text-muted-foreground">Platforms</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3 text-center">
                            <p className="text-2xl font-bold">{formatNumber(totalFollowers)}</p>
                            <p className="text-xs text-muted-foreground">Total Followers</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3 text-center">
                            <p className="text-2xl font-bold">{productCount}</p>
                            <p className="text-xs text-muted-foreground">Products</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Credit Score Preview */}
            {creditState.hasScore && creditState.assessment && (
                <Card className="overflow-hidden">
                    <div className={cn('p-4', tierColors[creditState.assessment.tier] || tierColors.D)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium opacity-80">Creator Credit</p>
                                <p className="text-2xl font-bold">Tier {creditState.assessment.tier}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium opacity-80">Eligible Up To</p>
                                <p className="text-2xl font-bold">{formatCurrency(creditState.assessment.maxLoanAmount)}</p>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-4">
                        <div className="mb-2 flex justify-between text-sm">
                            <span className="text-muted-foreground">Credit Score</span>
                            <span className="font-medium">{creditState.assessment.score} / 1000</span>
                        </div>
                        <Progress value={(creditState.assessment.score / 1000) * 100} className="h-2" />
                        <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                            <Link to="/app/credit">
                                View Loan Offers <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {!creditState.hasScore && (
                <Card className="border-primary/50 bg-primary/5">
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <h3 className="font-medium">Check Your Creator Credit</h3>
                            <p className="text-sm text-muted-foreground">
                                Get personalized loan offers based on your performance
                            </p>
                        </div>
                        <Button asChild>
                            <Link to="/app/credit">
                                Get Started
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">My Products</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{productCount}</div>
                        <p className="text-xs text-muted-foreground">in your shop</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
                        <p className="text-xs text-muted-foreground">from commissions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(totalConversions)}</div>
                        <p className="text-xs text-muted-foreground">total sales</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Quick Actions</h2>

                {productCount === 0 && (
                    <Card className="border-primary/50 bg-primary/5">
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <h3 className="font-medium">Add products to your shop</h3>
                                <p className="text-sm text-muted-foreground">
                                    Browse recommendations and add products to earn commissions
                                </p>
                            </div>
                            <Button asChild>
                                <Link to="/app/recommendations">
                                    <Plus className="mr-2 h-4 w-4" /> Browse
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                    <Button variant="outline" className="h-auto justify-start p-4" asChild>
                        <Link to="/app/shoplinks">
                            <ShoppingBag className="mr-3 h-5 w-5 text-primary" />
                            <div className="text-left">
                                <div className="font-medium">Manage Shoplinks</div>
                                <div className="text-xs text-muted-foreground">Share your product links</div>
                            </div>
                        </Link>
                    </Button>

                    <Button variant="outline" className="h-auto justify-start p-4" asChild>
                        <Link to="/app/analytics">
                            <TrendingUp className="mr-3 h-5 w-5 text-primary" />
                            <div className="text-left">
                                <div className="font-medium">View Analytics</div>
                                <div className="text-xs text-muted-foreground">Track your performance</div>
                            </div>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
