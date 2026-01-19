import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Copy } from 'lucide-react'
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
    const [shopProducts, setShopProducts] = useState<string[]>([])
    const [shoplinks, setShoplinks] = useState<Shoplink[]>([])
    const [generatingId, setGeneratingId] = useState<string | null>(null)

    useEffect(() => {
        setShopProducts(getStoredShopProducts())
        setShoplinks(getStoredShoplinks())
    }, [])

    const productsWithoutLinks = shopProducts.filter(
        productId => !shoplinks.some(link => link.productId === productId)
    )

    const handleGenerate = async (productId: string) => {
        setGeneratingId(productId)
        await new Promise(resolve => setTimeout(resolve, 500))

        const newLink: Shoplink = {
            id: `link-${Date.now()}`,
            productId,
            shoplink: `https://creatr.shop/p/${productId}?ref=demo_creator`,
        }

        const updatedLinks = [...shoplinks, newLink]
        setShoplinks(updatedLinks)
        saveShoplinks(updatedLinks)
        setGeneratingId(null)

        navigator.clipboard.writeText(newLink.shoplink)
        toast({ title: 'Shoplink created and copied!' })
    }

    const copyLink = (link: string) => {
        navigator.clipboard.writeText(link)
        toast({ title: 'Link copied!' })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Your Shop Links</h1>
                <p className="text-muted-foreground">Share these links to earn commissions.</p>
            </div>

            {shoplinks.length === 0 && productsWithoutLinks.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                    <p className="mb-4">No shoplinks yet. Add products to get started!</p>
                    <Button asChild>
                        <Link to="/app/recommendations">Browse Products</Link>
                    </Button>
                </div>
            )}

            {productsWithoutLinks.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground">Generate Links</h2>
                    {productsWithoutLinks.map((productId) => {
                        const product = mockProducts[productId] || { name: `Product ${productId}`, brand: 'Unknown', imageUrl: '', price: 0 }
                        return (
                            <Card key={productId}>
                                <CardContent className="flex items-center gap-3 p-3">
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="line-clamp-1 font-medium">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">{product.brand}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleGenerate(productId)}
                                        disabled={generatingId === productId}
                                    >
                                        {generatingId === productId ? 'Generating...' : 'Generate'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {shoplinks.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground">Active Links</h2>
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
                                    <Button variant="outline" size="sm" className="shrink-0" onClick={() => copyLink(link.shoplink)}>
                                        <Copy className="mr-2 h-4 w-4" /> Copy
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
