import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowDown, ArrowUp, MousePointer, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useToast } from '@/shared/ui/use-toast'
import { formatCurrency, formatNumber, cn } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/analytics')({
    component: AnalyticsPage,
})

// Mock product data for analytics
const mockProducts = [
    {
        id: '1',
        name: 'Glow Serum - Vitamin C Brightening Complex',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop',
    },
    {
        id: '2',
        name: 'Wireless Earbuds Pro - Active Noise Cancelling',
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop',
    },
    {
        id: '3',
        name: 'Minimalist Leather Tote - Everyday Carry',
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop',
    },
]

function getStoredShopProducts(): string[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('creatr-shop-products')
    return stored ? JSON.parse(stored) : []
}

function getStoredAnalytics() {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('creatr-analytics')
    return stored ? JSON.parse(stored) : null
}

function saveAnalytics(data: object) {
    localStorage.setItem('creatr-analytics', JSON.stringify(data))
}

function AnalyticsPage() {
    const { toast } = useToast()
    const [shopProducts, setShopProducts] = useState<string[]>([])
    const [stats, setStats] = useState({
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        totalCommission: 0,
        clicksTrend: 0,
        conversionsTrend: 0,
        revenueTrend: 0,
    })
    const [productAnalytics, setProductAnalytics] = useState<Array<{
        productId: string
        product: { name: string; imageUrl: string }
        clicks: number
        conversions: number
        commission: number
        trend: number
    }>>([])
    const [isSimulating, setIsSimulating] = useState(false)

    useEffect(() => {
        const products = getStoredShopProducts()
        setShopProducts(products)

        // Load existing analytics or generate mock data
        const existingAnalytics = getStoredAnalytics()
        if (existingAnalytics) {
            setStats(existingAnalytics.stats)
            setProductAnalytics(existingAnalytics.products)
        } else if (products.length > 0) {
            generateMockAnalytics(products)
        }
    }, [])

    const generateMockAnalytics = (products: string[]) => {
        const productData = products.map((productId) => {
            const mockProduct = mockProducts.find(p => p.id === productId) || {
                name: `Product ${productId}`,
                imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop',
            }
            const clicks = Math.floor(Math.random() * 500) + 50
            const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02))
            const commission = conversions * (Math.random() * 15 + 5)
            return {
                productId,
                product: mockProduct,
                clicks,
                conversions,
                commission,
                trend: Math.random() * 40 - 10,
            }
        })

        const totalClicks = productData.reduce((sum, p) => sum + p.clicks, 0)
        const totalConversions = productData.reduce((sum, p) => sum + p.conversions, 0)
        const totalCommission = productData.reduce((sum, p) => sum + p.commission, 0)

        const newStats = {
            totalClicks,
            totalConversions,
            totalRevenue: totalCommission * 4,
            totalCommission,
            clicksTrend: Math.random() * 30 - 5,
            conversionsTrend: Math.random() * 20 - 5,
            revenueTrend: Math.random() * 25,
        }

        setStats(newStats)
        setProductAnalytics(productData)
        saveAnalytics({ stats: newStats, products: productData })
    }

    const handleSimulate = async () => {
        if (shopProducts.length === 0) {
            toast({
                title: 'No products in shop',
                description: 'Add products to your shop first.',
                variant: 'destructive',
            })
            return
        }

        setIsSimulating(true)
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Add random clicks and conversions
        const addedClicks = Math.floor(Math.random() * 50) + 10
        const addedConversions = Math.floor(addedClicks * (Math.random() * 0.15 + 0.05))
        const addedCommission = addedConversions * (Math.random() * 12 + 5)

        const newStats = {
            ...stats,
            totalClicks: stats.totalClicks + addedClicks,
            totalConversions: stats.totalConversions + addedConversions,
            totalRevenue: stats.totalRevenue + addedCommission * 4,
            totalCommission: stats.totalCommission + addedCommission,
        }

        setStats(newStats)
        saveAnalytics({ stats: newStats, products: productAnalytics })
        setIsSimulating(false)

        toast({
            title: 'Events simulated!',
            description: `Added ${addedClicks} clicks and ${addedConversions} conversions.`,
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">Track your affiliate performance.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSimulate} disabled={isSimulating}>
                    {isSimulating ? 'Simulating...' : 'Simulate'}
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Clicks"
                    value={formatNumber(stats.totalClicks)}
                    trend={stats.clicksTrend}
                    icon={MousePointer}
                />
                <StatCard
                    title="Conversions"
                    value={formatNumber(stats.totalConversions)}
                    trend={stats.conversionsTrend}
                    icon={ShoppingCart}
                />
                <StatCard
                    title="Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    trend={stats.revenueTrend}
                    icon={TrendingUp}
                />
                <StatCard
                    title="Earnings"
                    value={formatCurrency(stats.totalCommission)}
                    icon={Wallet}
                    highlight
                />
            </div>

            {productAnalytics.length > 0 && (
                <div>
                    <h2 className="mb-3 text-lg font-semibold">Per Product</h2>
                    <div className="space-y-3">
                        {productAnalytics.map((item) => (
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

            {productAnalytics.length === 0 && (
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
