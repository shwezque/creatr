import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Copy, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { useToast } from '@/shared/ui/use-toast'
import { formatCurrency } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/shoplinks')({
    component: ShoplinksPage,
})

// Mock product data
const mockProducts: Record<string, { name: string; brand: string; imageUrl: string; price: number }> = {
    '1': { name: 'Glow Serum - Vitamin C Brightening Complex', brand: 'Luminara Beauty', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop', price: 45.99 },
    '2': { name: 'Wireless Earbuds Pro - Active Noise Cancelling', brand: 'SoundCore', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop', price: 79.99 },
    '3': { name: 'Minimalist Leather Tote - Everyday Carry', brand: 'Everlane', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop', price: 120.00 },
    '4': { name: 'Premium Yoga Mat - Extra Thick Non-Slip', brand: 'Manduka', imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=100&h=100&fit=crop', price: 68.00 },
    '5': { name: 'Smart Water Bottle - Temperature Display', brand: 'HydroFlask', imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=100&h=100&fit=crop', price: 34.99 },
    '6': { name: 'Retinol Night Cream - Anti-Aging Formula', brand: 'The Ordinary', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop', price: 28.50 },
    '7': { name: 'Portable Ring Light - Studio Quality', brand: 'Neewer', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop', price: 42.99 },
    '8': { name: 'Silk Pillowcase Set - 100% Mulberry Silk', brand: 'Slip', imageUrl: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=100&h=100&fit=crop', price: 89.00 },
}

interface Shoplink {
    id: string
    productId: string
    shoplink: string
}

function getStoredShopProducts(): string[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('creatr-shop-products')
    return stored ? JSON.parse(stored) : []
}

function saveShopProducts(productIds: string[]) {
    localStorage.setItem('creatr-shop-products', JSON.stringify(productIds))
}

function getStoredShoplinks(): Shoplink[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('creatr-shoplinks')
    return stored ? JSON.parse(stored) : []
}

function saveShoplinks(links: Shoplink[]) {
    localStorage.setItem('creatr-shoplinks', JSON.stringify(links))
}

function ShoplinksPage() {
    const { toast } = useToast()
    const [shoplinks, setShoplinks] = useState<Shoplink[]>([])

    useEffect(() => {
        setShoplinks(getStoredShoplinks())
    }, [])

    const copyLink = (link: string) => {
        navigator.clipboard.writeText(link)
        toast({ title: 'Link copied!' })
    }

    const handleRemove = (productId: string) => {
        // Remove from shop products
        const shopProducts = getStoredShopProducts()
        const updatedProducts = shopProducts.filter(id => id !== productId)
        saveShopProducts(updatedProducts)

        // Also remove any associated shoplink
        const updatedLinks = shoplinks.filter(link => link.productId !== productId)
        setShoplinks(updatedLinks)
        saveShoplinks(updatedLinks)

        toast({ title: 'Product removed from your shop' })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Your Shop Links</h1>
                <p className="text-muted-foreground">Share these links to earn commissions.</p>
            </div>

            {shoplinks.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                    <p className="mb-4">No shoplinks yet. Add products to get started!</p>
                    <Button asChild>
                        <Link to="/app/recommendations">Browse Products</Link>
                    </Button>
                </div>
            )}

            {shoplinks.length > 0 && (
                <div className="space-y-3">
                    {shoplinks.map((link) => {
                        const product = mockProducts[link.productId] || { name: `Product ${link.productId}`, brand: 'Unknown', imageUrl: '', price: 0 }
                        return (
                            <Card key={link.id}>
                                <CardContent className="flex items-center gap-3 p-3">
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="line-clamp-1 font-medium">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">{product.brand} • {formatCurrency(product.price)}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button variant="outline" size="sm" onClick={() => copyLink(link.shoplink)}>
                                            <Copy className="mr-2 h-4 w-4" /> Copy
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRemove(link.productId)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Browse More Products button */}
            {shoplinks.length > 0 && (
                <div className="pt-2">
                    <Button variant="outline" className="w-full" asChild>
                        <Link to="/app/recommendations">Browse More Products</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
