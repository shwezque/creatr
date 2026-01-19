import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, Plus, Star } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { useAuth } from '@/app/providers/auth-provider'
import { useToast } from '@/shared/ui/use-toast'
import { formatCurrency } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/recommendations')({
    component: RecommendationsPage,
})

function RecommendationsPage() {
    const { token } = useAuth()
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await fetch('/api/products?sortBy=rating', {
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
        mutationFn: async (productId: string) => {
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
            toast({ title: 'Added to your shop!', description: 'Generate a shoplink to start earning.' })
        },
    })

    const myProductIds = new Set(creatorProducts?.data?.map((p: { productId: string }) => p.productId) || [])

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
                <h1 className="text-2xl font-bold">Recommended For You</h1>
                <p className="text-muted-foreground">Products matched to your content and audience.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {products?.data?.items?.map((product: {
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
                }) => {
                    const isAdded = myProductIds.has(product.id)
                    const isAdding = addMutation.isPending && addMutation.variables === product.id

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
                                </div>
                            </Link>
                            <CardContent className="p-3">
                                <Link to="/app/products/$productId" params={{ productId: product.id }}>
                                    <p className="mb-1 line-clamp-2 text-sm font-medium">{product.name}</p>
                                </Link>
                                <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {product.rating} · {product.soldCount} sold
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
                                <div className="mb-3 text-xs text-green-600 dark:text-green-400">
                                    Earn {product.commission}% commission
                                </div>
                                <Button
                                    size="sm"
                                    className="w-full"
                                    variant={isAdded ? 'secondary' : 'default'}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (!isAdded) addMutation.mutate(product.id)
                                    }}
                                    disabled={isAdded || isAdding}
                                >
                                    {isAdding ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
