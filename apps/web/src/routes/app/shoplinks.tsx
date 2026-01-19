import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy, Loader2, Share2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { useAuth } from '@/app/providers/auth-provider'
import { useToast } from '@/shared/ui/use-toast'
import { formatCurrency } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/shoplinks')({
    component: ShoplinksPage,
})

function ShoplinksPage() {
    const { token } = useAuth()
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const { data: shoplinks, isLoading } = useQuery({
        queryKey: ['shoplinks'],
        queryFn: async () => {
            const res = await fetch('/api/products/shoplinks', {
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

    const generateMutation = useMutation({
        mutationFn: async (productId: string) => {
            const res = await fetch('/api/products/shoplinks/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId }),
            })
            return res.json()
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['shoplinks'] })
            queryClient.invalidateQueries({ queryKey: ['creator-products'] })
            navigator.clipboard.writeText(data.data.shoplink)
            toast({ title: 'Shoplink created and copied!' })
        },
    })

    const copyLink = (link: string) => {
        navigator.clipboard.writeText(link)
        toast({ title: 'Link copied!' })
    }

    const productsWithoutLinks = creatorProducts?.data?.filter((p: { shoplink?: string }) => !p.shoplink) || []

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Your Shop Links</h1>
                <p className="text-muted-foreground">Share these links to earn commissions.</p>
            </div>

            {shoplinks?.data?.length === 0 && productsWithoutLinks.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                    <p className="mb-4">No shoplinks yet. Add products to get started!</p>
                    <Button asChild>
                        <a href="/app/recommendations">Browse Products</a>
                    </Button>
                </div>
            )}

            {productsWithoutLinks.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground">Generate Links</h2>
                    {productsWithoutLinks.map((item: { productId: string; product: { id: string; name: string; brand: string; imageUrl: string; price: number } }) => (
                        <Card key={item.productId}>
                            <CardContent className="flex items-center gap-3 p-3">
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                    <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="line-clamp-1 font-medium">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => generateMutation.mutate(item.productId)}
                                    disabled={generateMutation.isPending && generateMutation.variables === item.productId}
                                >
                                    {generateMutation.isPending && generateMutation.variables === item.productId ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Generate'
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {shoplinks?.data?.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground">Active Links</h2>
                    {shoplinks.data.map((item: {
                        id: string
                        productId: string
                        product: { name: string; brand: string; imageUrl: string; price: number }
                        shoplink: string
                    }) => (
                        <Card key={item.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium">{item.product.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                                        <p className="mt-1 text-sm font-medium">{formatCurrency(item.product.price)}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => copyLink(item.shoplink)}>
                                        <Copy className="mr-2 h-4 w-4" /> Copy Link
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => copyLink(item.shoplink)}>
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
