import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, Copy, Loader2, Share2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { useAuth } from '@/app/providers/auth-provider'
import { useToast } from '@/shared/ui/use-toast'
import { formatCurrency } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/products/$productId')({
    component: ProductDetailPage,
})

function ProductDetailPage() {
    const { productId } = Route.useParams()
    const { token } = useAuth()
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            const res = await fetch(`/api/products/${productId}`, {
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

    const addMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/products/creator/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId }),
            })
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['creator-products'] })
            toast({ title: 'Added to your shop!' })
        },
    })

    const generateLinkMutation = useMutation({
        mutationFn: async () => {
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
            queryClient.invalidateQueries({ queryKey: ['creator-products'] })
            navigator.clipboard.writeText(data.data.shoplink)
            toast({ title: 'Shoplink copied!', description: 'Share it with your audience to earn commissions.' })
        },
    })

    const creatorProduct = creatorProducts?.data?.find((p: { productId: string }) => p.productId === productId)
    const isInShop = !!creatorProduct
    const hasShoplink = !!creatorProduct?.shoplink

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const p = product?.data
    if (!p) {
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
                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
            </div>

            <div>
                <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{p.brand}</span>
                    {p.isVerified && (
                        <span className="flex items-center text-green-600">
                            <Check className="mr-0.5 h-3 w-3" /> Verified
                        </span>
                    )}
                </div>
                <h1 className="text-xl font-bold">{p.name}</h1>
            </div>

            <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">{formatCurrency(p.price)}</span>
                {p.srp > p.price && (
                    <span className="text-muted-foreground line-through">{formatCurrency(p.srp)}</span>
                )}
                <span className="ml-auto text-lg font-semibold text-green-600 dark:text-green-400">
                    Earn {p.commission}%
                </span>
            </div>

            <Card>
                <CardContent className="p-4">
                    <p className="mb-2 font-medium">Your Commission</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(p.commissionAmount)}</p>
                    <p className="text-sm text-muted-foreground">per sale from your shoplink</p>
                </CardContent>
            </Card>

            <div className="flex gap-3">
                {!isInShop ? (
                    <Button className="flex-1" onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
                        {addMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Add to My Shop
                    </Button>
                ) : hasShoplink ? (
                    <>
                        <Button variant="outline" className="flex-1" onClick={() => {
                            navigator.clipboard.writeText(creatorProduct.shoplink)
                            toast({ title: 'Link copied!' })
                        }}>
                            <Copy className="mr-2 h-4 w-4" /> Copy Link
                        </Button>
                        <Button variant="outline" size="icon">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <Button className="flex-1" onClick={() => generateLinkMutation.mutate()} disabled={generateLinkMutation.isPending}>
                        {generateLinkMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Shop Link
                    </Button>
                )}
            </div>

            <div>
                <h2 className="mb-2 font-semibold">Product Description</h2>
                <p className="text-sm text-muted-foreground">{p.description}</p>
            </div>

            {p.benefits?.length > 0 && (
                <div>
                    <h2 className="mb-2 font-semibold">Key Benefits</h2>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {p.benefits.map((benefit: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" /> {benefit}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {p.contentHooks?.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <h2 className="mb-2 font-semibold">Content Ideas</h2>
                        <ul className="space-y-2 text-sm">
                            {p.contentHooks.map((hook: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="mt-0.5 text-primary">💡</span> {hook}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {p.similarProducts?.length > 0 && (
                <div>
                    <h2 className="mb-3 font-semibold">Similar Products</h2>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {p.similarProducts.map((similar: { id: string; imageUrl: string; name: string; price: number }) => (
                            <Link
                                key={similar.id}
                                to="/app/products/$productId"
                                params={{ productId: similar.id }}
                                className="w-32 shrink-0"
                            >
                                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                    <img src={similar.imageUrl} alt={similar.name} className="h-full w-full object-cover" />
                                </div>
                                <p className="mt-1 line-clamp-2 text-xs">{similar.name}</p>
                                <p className="text-xs font-medium text-primary">{formatCurrency(similar.price)}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
