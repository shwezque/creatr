import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { Check, Plus, Search, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card, CardContent } from '@/shared/ui/card'
import { useToast } from '@/shared/ui/use-toast'
import { formatCurrency } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/search')({
    component: SearchPage,
})

interface Product {
    id: string
    name: string
    brand: string
    imageUrl: string
    price: number
    commission: number
    isVerified: boolean
}

// All available products for search
const allProducts: Product[] = [
    { id: '1', name: 'Glow Serum - Vitamin C Brightening Complex', brand: 'Luminara Beauty', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop', price: 45.99, commission: 25, isVerified: true },
    { id: '2', name: 'Wireless Earbuds Pro - Active Noise Cancelling', brand: 'SoundCore', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop', price: 79.99, commission: 18, isVerified: true },
    { id: '3', name: 'Minimalist Leather Tote - Everyday Carry', brand: 'Everlane', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop', price: 120.00, commission: 20, isVerified: true },
    { id: '4', name: 'Premium Yoga Mat - Extra Thick Non-Slip', brand: 'Manduka', imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=100&h=100&fit=crop', price: 68.00, commission: 22, isVerified: true },
    { id: '5', name: 'Smart Water Bottle - Temperature Display', brand: 'HydroFlask', imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=100&h=100&fit=crop', price: 34.99, commission: 30, isVerified: false },
    { id: '6', name: 'Retinol Night Cream - Anti-Aging Formula', brand: 'The Ordinary', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop', price: 28.50, commission: 28, isVerified: true },
    { id: '7', name: 'Portable Ring Light - Studio Quality', brand: 'Neewer', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop', price: 42.99, commission: 24, isVerified: true },
    { id: '8', name: 'Silk Pillowcase Set - 100% Mulberry Silk', brand: 'Slip', imageUrl: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=100&h=100&fit=crop', price: 89.00, commission: 20, isVerified: true },
    { id: '9', name: 'Vitamin C Face Mist - Hydrating Spray', brand: 'Tatcha', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop', price: 48.00, commission: 22, isVerified: true },
    { id: '10', name: 'Bluetooth Speaker - Waterproof Portable', brand: 'JBL', imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop', price: 129.99, commission: 15, isVerified: true },
]

function getStoredShopProducts(): string[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('creatr-shop-products')
    return stored ? JSON.parse(stored) : []
}

function saveShopProducts(productIds: string[]) {
    localStorage.setItem('creatr-shop-products', JSON.stringify(productIds))
}

function SearchPage() {
    const { toast } = useToast()
    const [query, setQuery] = useState('')
    const [myProductIds, setMyProductIds] = useState<Set<string>>(new Set())
    const [addingProductId, setAddingProductId] = useState<string | null>(null)

    useEffect(() => {
        setMyProductIds(new Set(getStoredShopProducts()))
    }, [])

    const filteredProducts = useMemo(() => {
        if (!query.trim()) return []
        const lowerQuery = query.toLowerCase()
        return allProducts.filter(
            p => p.name.toLowerCase().includes(lowerQuery) ||
                p.brand.toLowerCase().includes(lowerQuery)
        )
    }, [query])

    const handleAddToShop = async (productId: string) => {
        setAddingProductId(productId)
        await new Promise(resolve => setTimeout(resolve, 300))

        const updatedIds = new Set(myProductIds)
        updatedIds.add(productId)
        setMyProductIds(updatedIds)
        saveShopProducts(Array.from(updatedIds))
        setAddingProductId(null)

        toast({ title: 'Added to your shop!' })
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 pr-10"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {!query && (
                <div className="py-12 text-center text-muted-foreground">
                    <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Search for products to add to your shop</p>
                </div>
            )}

            {query && filteredProducts.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                    <p>No products found for "{query}"</p>
                </div>
            )}

            {filteredProducts.map((product) => {
                const isAdded = myProductIds.has(product.id)
                const isAdding = addingProductId === product.id

                return (
                    <Card key={product.id}>
                        <CardContent className="flex items-center gap-3 p-3">
                            <Link to="/app/products/$productId" params={{ productId: product.id }}>
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link to="/app/products/$productId" params={{ productId: product.id }}>
                                    <p className="line-clamp-1 font-medium">{product.name}</p>
                                </Link>
                                <p className="text-sm text-muted-foreground">{product.brand}</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">{formatCurrency(product.price)}</span>
                                    <span className="text-green-600 dark:text-green-400">{product.commission}%</span>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant={isAdded ? 'secondary' : 'default'}
                                onClick={() => !isAdded && handleAddToShop(product.id)}
                                disabled={isAdded || isAdding}
                            >
                                {isAdding ? '...' : isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            </Button>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
