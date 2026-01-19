import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowRight, Check, Plus, Star } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { useToast } from '@/shared/ui/use-toast'
import { formatCurrency } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/recommendations')({
    component: RecommendationsPage,
})

interface Product {
    id: string
    name: string
    brand: string
    imageUrl: string
    price: number
    srp: number
    commission: number
    rating: number
    soldCount: number
    isVerified: boolean
    category: string
}

// Great mock products for demo
const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Glow Serum - Vitamin C Brightening Complex',
        brand: 'Luminara Beauty',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
        price: 45.99,
        srp: 59.99,
        commission: 25,
        rating: 4.9,
        soldCount: 12500,
        isVerified: true,
        category: 'Beauty'
    },
    {
        id: '2',
        name: 'Wireless Earbuds Pro - Active Noise Cancelling',
        brand: 'SoundCore',
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
        price: 79.99,
        srp: 129.99,
        commission: 18,
        rating: 4.7,
        soldCount: 8900,
        isVerified: true,
        category: 'Tech'
    },
    {
        id: '3',
        name: 'Minimalist Leather Tote - Everyday Carry',
        brand: 'Everlane',
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
        price: 120.00,
        srp: 168.00,
        commission: 20,
        rating: 4.8,
        soldCount: 5600,
        isVerified: true,
        category: 'Fashion'
    },
    {
        id: '4',
        name: 'Premium Yoga Mat - Extra Thick Non-Slip',
        brand: 'Manduka',
        imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
        price: 68.00,
        srp: 89.00,
        commission: 22,
        rating: 4.9,
        soldCount: 7200,
        isVerified: true,
        category: 'Fitness'
    },
    {
        id: '5',
        name: 'Smart Water Bottle - Temperature Display',
        brand: 'HydroFlask',
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
        price: 34.99,
        srp: 45.99,
        commission: 30,
        rating: 4.6,
        soldCount: 15800,
        isVerified: false,
        category: 'Lifestyle'
    },
    {
        id: '6',
        name: 'Retinol Night Cream - Anti-Aging Formula',
        brand: 'The Ordinary',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
        price: 28.50,
        srp: 35.00,
        commission: 28,
        rating: 4.8,
        soldCount: 22100,
        isVerified: true,
        category: 'Beauty'
    },
    {
        id: '7',
        name: 'Portable Ring Light - Studio Quality',
        brand: 'Neewer',
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop',
        price: 42.99,
        srp: 64.99,
        commission: 24,
        rating: 4.5,
        soldCount: 9400,
        isVerified: true,
        category: 'Creator Gear'
    },
    {
        id: '8',
        name: 'Silk Pillowcase Set - 100% Mulberry Silk',
        brand: 'Slip',
        imageUrl: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=400&fit=crop',
        price: 89.00,
        srp: 110.00,
        commission: 20,
        rating: 4.9,
        soldCount: 6800,
        isVerified: true,
        category: 'Home'
    },
]

function getStoredShopProducts(): string[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('creatr-shop-products')
    return stored ? JSON.parse(stored) : []
}

function saveShopProducts(productIds: string[]) {
    localStorage.setItem('creatr-shop-products', JSON.stringify(productIds))
}

function RecommendationsPage() {
    const { toast } = useToast()
    const [myProductIds, setMyProductIds] = useState<Set<string>>(new Set())
    const [addingProductId, setAddingProductId] = useState<string | null>(null)

    // Load shop products from localStorage
    useEffect(() => {
        setMyProductIds(new Set(getStoredShopProducts()))
    }, [])

    const handleAddToShop = async (productId: string) => {
        setAddingProductId(productId)

        // Simulate adding delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const updatedIds = new Set(myProductIds)
        updatedIds.add(productId)
        setMyProductIds(updatedIds)
        saveShopProducts(Array.from(updatedIds))
        setAddingProductId(null)

        toast({
            title: 'Added to your shop!',
            description: 'Generate a shoplink to start earning.'
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Recommended For You</h1>
                    <p className="text-muted-foreground">Products matched to your content and audience.</p>
                </div>
                <Button asChild size="sm" className="shrink-0">
                    <Link to="/app/shoplinks">
                        {myProductIds.size > 0 && (
                            <span className="mr-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                                {myProductIds.size}
                            </span>
                        )}
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {mockProducts.map((product) => {
                    const isAdded = myProductIds.has(product.id)
                    const isAdding = addingProductId === product.id

                    return (
                        <Card key={product.id} className="overflow-hidden">
                            <Link to="/app/products/$productId" params={{ productId: product.id }}>
                                <div className="relative aspect-square bg-muted">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                    />
                                    {product.isVerified && (
                                        <span className="absolute left-2 top-2 rounded bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                                            Verified
                                        </span>
                                    )}
                                    <span className="absolute right-2 top-2 rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                        {product.category}
                                    </span>
                                </div>
                            </Link>
                            <CardContent className="p-3">
                                <Link to="/app/products/$productId" params={{ productId: product.id }}>
                                    <p className="mb-1 line-clamp-2 text-sm font-medium">{product.name}</p>
                                </Link>
                                <p className="mb-1 text-xs text-muted-foreground">{product.brand}</p>
                                <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {product.rating} · {product.soldCount.toLocaleString()} sold
                                </div>
                                <div className="mb-2 flex items-baseline gap-2">
                                    <span className="text-lg font-bold text-primary">
                                        {formatCurrency(product.price)}
                                    </span>
                                    {product.srp > product.price && (
                                        <span className="text-xs text-muted-foreground line-through">
                                            {formatCurrency(product.srp)}
                                        </span>
                                    )}
                                </div>
                                <div className="mb-3 text-xs font-medium text-green-600 dark:text-green-400">
                                    💰 Earn {product.commission}% commission
                                </div>
                                <Button
                                    size="sm"
                                    className="w-full"
                                    variant={isAdded ? 'secondary' : 'default'}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (!isAdded) handleAddToShop(product.id)
                                    }}
                                    disabled={isAdded || isAdding}
                                >
                                    {isAdding ? (
                                        'Adding...'
                                    ) : isAdded ? (
                                        <>
                                            <Check className="mr-2 h-4 w-4" /> In My Shop
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" /> Add to Shop
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

