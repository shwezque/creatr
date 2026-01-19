import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Plus, ShoppingBag, TrendingUp, Wallet } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useAuth } from '@/app/providers/auth-provider'
import { formatCurrency, formatNumber } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/')({
    component: DashboardPage,
})

function DashboardPage() {
    const { user, token } = useAuth()
    const navigate = useNavigate()

    const { data: socials, isLoading: socialsLoading } = useQuery({
        queryKey: ['socials'],
        queryFn: async () => {
            const res = await fetch('/api/socials', {
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
    })

    const { data: analytics } = useQuery({
        queryKey: ['analytics', 'summary'],
        queryFn: async () => {
            const res = await fetch('/api/analytics/summary', {
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
    })

    const { data: creatorProducts } = useQuery({
        queryKey: ['creator-products'],
        queryFn: async () => {
            const res = await fetch('/api/products/creator/products', {
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
    })

    const connectedCount = socials?.data?.filter((s: { status: string }) => s.status === 'connected').length || 0
    const productCount = creatorProducts?.data?.length || 0
    const totalEarnings = analytics?.data?.totalCommission || 0

    // Redirect to connect page if no social accounts connected (onboarding)
    useEffect(() => {
        if (!socialsLoading && connectedCount === 0) {
            navigate({ to: '/app/connect' })
        }
    }, [socialsLoading, connectedCount, navigate])

    // Show nothing while checking onboarding status
    if (socialsLoading || connectedCount === 0) {
        return null
    }

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Here's what's happening with your creator account.</p>
            </div>

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
                        <div className="text-2xl font-bold">{formatNumber(analytics?.data?.totalConversions || 0)}</div>
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
                        <Link to="/app/credit">
                            <Wallet className="mr-3 h-5 w-5 text-primary" />
                            <div className="text-left">
                                <div className="font-medium">Creator Credit</div>
                                <div className="text-xs text-muted-foreground">Check your loan eligibility</div>
                            </div>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
