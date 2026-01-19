import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, MousePointer, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { useToast } from '@/shared/ui/use-toast'
import { formatCurrency, formatNumber, cn } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/analytics')({
    component: AnalyticsPage,
})

// Mock leaderboard data
const mockLeaderboard = [
    { rank: 1, name: 'Jomar Yee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', categories: 'Lifestyle/Clothes/Travel' },
    { rank: 2, name: 'Connh Cruz', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face', categories: 'Food/Mom/Appliances' },
    { rank: 3, name: 'Malupiton', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face', categories: 'Lifestyle/Clothes/Travel' },
    { rank: 4, name: 'Rei Germar', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face', categories: 'Beauty/Clothes/Travel' },
    { rank: 5, name: 'Abi Marquez', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face', categories: 'Food/Appliances' },
    { rank: 6, name: 'Ninong Ry', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face', categories: 'Food/Appliances' },
    { rank: 7, name: 'Cong TV', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', categories: 'Lifestyle/Food/Appliances' },
    { rank: 8, name: 'Viy Cortez-Velasquez', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face', categories: 'Lifestyle/Food/Appliances' },
    { rank: 9, name: 'Joshua Garcia', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face', categories: 'Beauty/Food/Travel' },
    { rank: 10, name: 'Andrea Brillantes', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&crop=face', categories: 'Beauty/Food/Travel' },
]

// Mock product data for analytics
const mockProducts = [
    { id: '1', name: 'Glow Serum - Vitamin C Brightening Complex', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop' },
    { id: '2', name: 'Wireless Earbuds Pro - Active Noise Cancelling', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop' },
    { id: '3', name: 'Minimalist Leather Tote - Everyday Carry', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop' },
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
    const [activeTab, setActiveTab] = useState('analytics')
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
            return { productId, product: mockProduct, clicks, conversions, commission, trend: Math.random() * 40 - 10 }
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
            toast({ title: 'No products in shop', description: 'Add products first.', variant: 'destructive' })
            return
        }
        setIsSimulating(true)
        await new Promise(resolve => setTimeout(resolve, 500))
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
        toast({ title: 'Events simulated!' })
    }

    return (
        <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                </TabsList>

                <TabsContent value="analytics" className="mt-4 space-y-4">
                    {/* Compact Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <CompactStatCard label="Clicks" value={formatNumber(stats.totalClicks)} trend={stats.clicksTrend} icon={<MousePointer className="h-4 w-4" />} />
                        <CompactStatCard label="Sales" value={formatNumber(stats.totalConversions)} trend={stats.conversionsTrend} icon={<ShoppingCart className="h-4 w-4" />} />
                        <CompactStatCard label="Revenue" value={formatCurrency(stats.totalRevenue)} trend={stats.revenueTrend} icon={<TrendingUp className="h-4 w-4" />} />
                        <CompactStatCard label="Earnings" value={formatCurrency(stats.totalCommission)} highlight icon={<Wallet className="h-4 w-4" />} />
                    </div>

                    {/* Mini Chart Visualization */}
                    <Card>
                        <CardContent className="p-3">
                            <div className="mb-2 flex items-center justify-between text-xs">
                                <span className="font-medium">Performance Trend</span>
                                <span className="text-muted-foreground">Last 7 days</span>
                            </div>
                            <div className="flex h-16 items-end gap-1">
                                {[35, 50, 45, 70, 60, 85, 75].map((h, i) => (
                                    <div key={i} className="flex-1 rounded-t bg-primary/80" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Performance */}
                    {productAnalytics.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Top Products</span>
                                <Button variant="ghost" size="sm" onClick={handleSimulate} disabled={isSimulating}>
                                    {isSimulating ? '...' : 'Simulate'}
                                </Button>
                            </div>
                            {productAnalytics.slice(0, 3).map((item) => (
                                <Card key={item.productId}>
                                    <CardContent className="flex items-center gap-2 p-2">
                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                                            <img src={item.product.imageUrl} alt="" className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="line-clamp-1 text-xs font-medium">{item.product.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.clicks} clicks • {item.conversions} sales</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-green-600">{formatCurrency(item.commission)}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {productAnalytics.length === 0 && (
                        <Card>
                            <CardContent className="py-8 text-center text-sm text-muted-foreground">
                                <p>No analytics data yet. Add products and share links to start tracking.</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="leaderboard" className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Real-time Creatr Ranking</h2>
                        <button className="text-xs text-muted-foreground">See more</button>
                    </div>

                    {mockLeaderboard.map((creator) => (
                        <div key={creator.rank} className="flex items-center gap-3 py-2">
                            <span className="w-5 text-sm text-muted-foreground">{creator.rank}</span>
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                                <img src={creator.avatar} alt={creator.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{creator.name}</p>
                                <p className="text-xs text-muted-foreground">{creator.categories}</p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function CompactStatCard({ label, value, trend, icon, highlight }: { label: string; value: string; trend?: number; icon: React.ReactNode; highlight?: boolean }) {
    return (
        <Card className={cn('p-3', highlight && 'border-primary/50 bg-primary/5')}>
            <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div>
            <p className="mt-1 text-lg font-bold">{value}</p>
            {trend !== undefined && (
                <div className={cn('flex items-center text-xs', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
                    {trend >= 0 ? <ArrowUp className="mr-0.5 h-3 w-3" /> : <ArrowDown className="mr-0.5 h-3 w-3" />}
                    {Math.abs(trend).toFixed(1)}%
                </div>
            )}
        </Card>
    )
}
