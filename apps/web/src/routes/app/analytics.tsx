import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Loader2, TrendingUp, MousePointer, ShoppingCart, Wallet } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useAuth } from '@/app/providers/auth-provider'
import { useToast } from '@/shared/ui/use-toast'
import { formatCurrency, formatNumber, cn } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/analytics')({
    component: AnalyticsPage,
})

function AnalyticsPage() {
    const { token } = useAuth()
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const { data: summary, isLoading } = useQuery({
        queryKey: ['analytics', 'summary'],
        queryFn: async () => {
            const res = await fetch('/api/analytics/summary', {
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
    })

    const { data: productAnalytics } = useQuery({
        queryKey: ['analytics', 'products'],
        queryFn: async () => {
            const res = await fetch('/api/analytics/products', {
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
    })

    const simulateMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/analytics/simulate', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['analytics'] })
            toast({
                title: 'Events simulated!',
                description: `Added ${data.data.clicks} clicks and ${data.data.conversions} conversions.`,
            })
        },
        onError: () => {
            toast({
                title: 'Simulation failed',
                description: 'Make sure you have products in your shop.',
                variant: 'destructive',
            })
        },
    })

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const stats = summary?.data || {}
    const products = productAnalytics?.data || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">Track your affiliate performance.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => simulateMutation.mutate()} disabled={simulateMutation.isPending}>
                    {simulateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Simulate
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Clicks"
                    value={formatNumber(stats.totalClicks || 0)}
                    trend={stats.clicksTrend}
                    icon={MousePointer}
                />
                <StatCard
                    title="Conversions"
                    value={formatNumber(stats.totalConversions || 0)}
                    trend={stats.conversionsTrend}
                    icon={ShoppingCart}
                />
                <StatCard
                    title="Revenue"
                    value={formatCurrency(stats.totalRevenue || 0)}
                    trend={stats.revenueTrend}
                    icon={TrendingUp}
                />
                <StatCard
                    title="Earnings"
                    value={formatCurrency(stats.totalCommission || 0)}
                    icon={Wallet}
                    highlight
                />
            </div>

            {products.length > 0 && (
                <div>
                    <h2 className="mb-3 text-lg font-semibold">Per Product</h2>
                    <div className="space-y-3">
                        {products.map((item: {
                            productId: string
                            product: { name: string; imageUrl: string }
                            clicks: number
                            conversions: number
                            commission: number
                            cvr: number
                            trend: number
                        }) => (
                            <Card key={item.productId}>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="line-clamp-1 font-medium">{item.product.name}</p>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span>{item.clicks} clicks</span>
                                            <span>{item.conversions} sales</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-green-600 dark:text-green-400">
                                            {formatCurrency(item.commission)}
                                        </p>
                                        <TrendBadge value={item.trend} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {products.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p className="mb-2">No analytics data yet.</p>
                        <p className="text-sm">Add products to your shop and share your links to start tracking.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

function StatCard({
    title,
    value,
    trend,
    icon: Icon,
    highlight,
}: {
    title: string
    value: string
    trend?: number
    icon: React.ComponentType<{ className?: string }>
    highlight?: boolean
}) {
    return (
        <Card className={cn(highlight && 'border-primary/50 bg-primary/5')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend !== undefined && <TrendBadge value={trend} />}
            </CardContent>
        </Card>
    )
}

function TrendBadge({ value }: { value: number }) {
    const isPositive = value >= 0
    return (
        <div className={cn('flex items-center text-xs', isPositive ? 'text-green-600' : 'text-red-600')}>
            {isPositive ? <ArrowUp className="mr-0.5 h-3 w-3" /> : <ArrowDown className="mr-0.5 h-3 w-3" />}
            {Math.abs(value).toFixed(1)}%
        </div>
    )
}
