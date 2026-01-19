import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft, Check, Copy, Share2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { useToast } from '@/shared/ui/use-toast'
import { formatCurrency } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/products/$productId')({
    component: ProductDetailPage,
})

interface Product {
    id: string
    name: string
    brand: string
    imageUrl: string
    price: number
    srp: number
    commission: number
    commissionAmount: number
    isVerified: boolean
    description: string
    benefits: string[]
    contentHooks: string[]
    category: string
}

// All products data
const productsData: Record<string, Product> = {
    '1': {
        id: '1',
        name: 'Glow Serum - Vitamin C Brightening Complex',
        brand: 'Luminara Beauty',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
        price: 45.99,
        srp: 59.99,
        commission: 25,
        commissionAmount: 11.50,
        isVerified: true,
        category: 'Beauty',
        description: 'A potent vitamin C serum that brightens skin, reduces dark spots, and provides antioxidant protection. Formulated with 15% L-ascorbic acid and hyaluronic acid for maximum efficacy.',
        benefits: ['Brightens dull skin', 'Reduces dark spots', 'Boosts collagen production', 'Hydrates deeply'],
        contentHooks: ['Show your morning skincare routine', 'Before/after comparison over 30 days', 'Explain why vitamin C is essential'],
    },
    '2': {
        id: '2',
        name: 'Wireless Earbuds Pro - Active Noise Cancelling',
        brand: 'SoundCore',
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
        price: 79.99,
        srp: 129.99,
        commission: 18,
        commissionAmount: 14.40,
        isVerified: true,
        category: 'Tech',
        description: 'Premium wireless earbuds with active noise cancellation, 40-hour battery life, and crystal-clear audio. Perfect for music, calls, and focus work.',
        benefits: ['Active noise cancellation', '40-hour battery life', 'IPX5 water resistant', 'Premium sound quality'],
        contentHooks: ['Unboxing and first impressions', 'Compare sound quality to competitors', 'Best earbuds for content creators'],
    },
    '3': {
        id: '3',
        name: 'Minimalist Leather Tote - Everyday Carry',
        brand: 'Everlane',
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
        price: 120.00,
        srp: 168.00,
        commission: 20,
        commissionAmount: 24.00,
        isVerified: true,
        category: 'Fashion',
        description: 'Handcrafted from Italian leather, this minimalist tote is perfect for work, travel, or everyday use. Features a laptop sleeve and multiple pockets.',
        benefits: ['Italian leather', 'Fits 15" laptop', 'Multiple pockets', 'Timeless design'],
        contentHooks: ['What\'s in my bag', 'Work bag essentials', 'Capsule wardrobe staple'],
    },
    '4': {
        id: '4',
        name: 'Premium Yoga Mat - Extra Thick Non-Slip',
        brand: 'Manduka',
        imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
        price: 68.00,
        srp: 89.00,
        commission: 22,
        commissionAmount: 14.96,
        isVerified: true,
        category: 'Fitness',
        description: 'Professional-grade yoga mat with superior cushioning and grip. Made from eco-friendly materials that last for years of practice.',
        benefits: ['6mm thick cushioning', 'Non-slip both sides', 'Eco-friendly materials', 'Lifetime guarantee'],
        contentHooks: ['Morning yoga routine', 'Home workout setup', 'Best yoga mats 2024'],
    },
    '5': {
        id: '5',
        name: 'Smart Water Bottle - Temperature Display',
        brand: 'HydroFlask',
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
        price: 34.99,
        srp: 45.99,
        commission: 30,
        commissionAmount: 10.50,
        isVerified: false,
        category: 'Lifestyle',
        description: 'Stay hydrated with this smart water bottle featuring a LED temperature display. Keeps drinks cold for 24 hours or hot for 12 hours.',
        benefits: ['LED temperature display', '24-hour cold retention', '12-hour hot retention', 'BPA-free materials'],
        contentHooks: ['Hydration challenge', 'Desk setup essentials', 'Cool gadgets under $50'],
    },
    '6': {
        id: '6',
        name: 'Retinol Night Cream - Anti-Aging Formula',
        brand: 'The Ordinary',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
        price: 28.50,
        srp: 35.00,
        commission: 28,
        commissionAmount: 7.98,
        isVerified: true,
        category: 'Beauty',
        description: 'A gentle yet effective retinol night cream that reduces fine lines and improves skin texture while you sleep. Suitable for beginners.',
        benefits: ['Reduces fine lines', 'Improves skin texture', 'Gentle formula', 'Visible results in 4 weeks'],
        contentHooks: ['Night skincare routine', 'Affordable anti-aging products', 'Retinol for beginners'],
    },
    '7': {
        id: '7',
        name: 'Portable Ring Light - Studio Quality',
        brand: 'Neewer',
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop',
        price: 42.99,
        srp: 64.99,
        commission: 24,
        commissionAmount: 10.32,
        isVerified: true,
        category: 'Creator Gear',
        description: 'Professional 18-inch ring light with adjustable color temperature and brightness. Perfect for content creation, video calls, and photography.',
        benefits: ['3 color temperatures', 'Dimmable brightness', 'Phone holder included', 'Foldable tripod'],
        contentHooks: ['My filming setup', 'Best lighting for beginners', 'Upgrade your zoom calls'],
    },
    '8': {
        id: '8',
        name: 'Silk Pillowcase Set - 100% Mulberry Silk',
        brand: 'Slip',
        imageUrl: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=400&fit=crop',
        price: 89.00,
        srp: 110.00,
        commission: 20,
        commissionAmount: 17.80,
        isVerified: true,
        category: 'Home',
        description: 'Luxurious 22-momme mulberry silk pillowcases that reduce hair breakage and prevent sleep creases. A beauty essential for healthier hair and skin.',
        benefits: ['Reduces hair breakage', 'Prevents sleep creases', 'Hypoallergenic', 'Temperature regulating'],
        contentHooks: ['Beauty sleep secrets', 'Hair care routine', 'Luxury bedroom upgrade'],
    },
}

function getStoredShopProducts(): string[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('creatr-shop-products')
    return stored ? JSON.parse(stored) : []
}

function saveShopProducts(productIds: string[]) {
    localStorage.setItem('creatr-shop-products', JSON.stringify(productIds))
}

function getStoredShoplinks(): Array<{ id: string; productId: string; shoplink: string }> {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('creatr-shoplinks')
    return stored ? JSON.parse(stored) : []
}

function saveShoplinks(links: Array<{ id: string; productId: string; shoplink: string }>) {
    localStorage.setItem('creatr-shoplinks', JSON.stringify(links))
}

function ProductDetailPage() {
    const { productId } = Route.useParams()
    const { toast } = useToast()
    const [isInShop, setIsInShop] = useState(false)
    const [shoplink, setShoplink] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const product = productsData[productId]

    useEffect(() => {
        const shopProducts = getStoredShopProducts()
        const shoplinks = getStoredShoplinks()

        setIsInShop(shopProducts.includes(productId))
        const existingLink = shoplinks.find(l => l.productId === productId)
        setShoplink(existingLink?.shoplink || null)
    }, [productId])

    const handleAddToShop = async () => {
        setIsAdding(true)
        await new Promise(resolve => setTimeout(resolve, 500))

        const shopProducts = getStoredShopProducts()
        if (!shopProducts.includes(productId)) {
            saveShopProducts([...shopProducts, productId])
        }

        setIsInShop(true)
        setIsAdding(false)
        toast({ title: 'Added to your shop!' })
    }

    const handleGenerateLink = async () => {
        setIsGenerating(true)
        await new Promise(resolve => setTimeout(resolve, 500))

        const newLink = `https://creatr.shop/p/${productId}?ref=demo_creator`
        const shoplinks = getStoredShoplinks()
        const newLinks = [...shoplinks.filter(l => l.productId !== productId), { id: `link-${Date.now()}`, productId, shoplink: newLink }]
        saveShoplinks(newLinks)

        setShoplink(newLink)
        setIsGenerating(false)
        navigator.clipboard.writeText(newLink)
        toast({ title: 'Shoplink copied!', description: 'Share it with your audience to earn commissions.' })
    }

    const copyLink = () => {
        if (shoplink) {
            navigator.clipboard.writeText(shoplink)
            toast({ title: 'Link copied!' })
        }
    }

    if (!product) {
        return (
            <div className="py-12 text-center">
                <p className="text-muted-foreground">Product not found</p>
                <Button asChild className="mt-4">
                    <Link to="/app/recommendations">Browse Products</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" asChild>
                <Link to="/app/recommendations">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Link>
            </Button>

            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            </div>

            <div>
                <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{product.brand}</span>
                    {product.isVerified && (
                        <span className="flex items-center text-green-600">
                            <Check className="mr-0.5 h-3 w-3" /> Verified
                        </span>
                    )}
                </div>
                <h1 className="text-xl font-bold">{product.name}</h1>
            </div>

            <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
                {product.srp > product.price && (
                    <span className="text-muted-foreground line-through">{formatCurrency(product.srp)}</span>
                )}
                <span className="ml-auto text-lg font-semibold text-green-600 dark:text-green-400">
                    Earn {product.commission}%
                </span>
            </div>

            <Card>
                <CardContent className="p-4">
                    <p className="mb-2 font-medium">Your Commission</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(product.commissionAmount)}</p>
                    <p className="text-sm text-muted-foreground">per sale from your shoplink</p>
                </CardContent>
            </Card>

            <div className="flex gap-3">
                {!isInShop ? (
                    <Button className="flex-1" onClick={handleAddToShop} disabled={isAdding}>
                        {isAdding ? 'Adding...' : 'Add to My Shop'}
                    </Button>
                ) : shoplink ? (
                    <>
                        <Button variant="outline" className="flex-1" onClick={copyLink}>
                            <Copy className="mr-2 h-4 w-4" /> Copy Link
                        </Button>
                        <Button variant="outline" size="icon" onClick={copyLink}>
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <Button className="flex-1" onClick={handleGenerateLink} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : 'Create Shop Link'}
                    </Button>
                )}
            </div>

            <div>
                <h2 className="mb-2 font-semibold">Product Description</h2>
                <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>

            {product.benefits.length > 0 && (
                <div>
                    <h2 className="mb-2 font-semibold">Key Benefits</h2>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {product.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" /> {benefit}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {product.contentHooks.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <h2 className="mb-2 font-semibold">Content Ideas</h2>
                        <ul className="space-y-2 text-sm">
                            {product.contentHooks.map((hook, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="mt-0.5 text-primary">💡</span> {hook}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
