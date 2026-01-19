import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Check, Loader2, Search, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card, CardContent } from '@/shared/ui/card'
import { useAuth } from '@/app/providers/auth-provider'
import { useToast } from '@/shared/ui/use-toast'
import { formatCurrency } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/search')({
    component: SearchPage,
})

function SearchPage() {
    const { token } = useAuth()
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')

    const { data: products, isFetching } = useQuery({
        queryKey: ['products', 'search', debouncedQuery],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (debouncedQuery) params.set('search', debouncedQuery)
            const res = await fetch(`/api/products?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
        enabled: debouncedQuery.length > 0,
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
            toast({ title: 'Added to your shop!' })
        },
    })

    const myProductIds = new Set(creatorProducts?.data?.map((p: { productId: string }) => p.productId) || [])

    const handleSearch = (value: string) => {
        setQuery(value)
        // Simple debounce
        setTimeout(() => setDebouncedQuery(value), 300)
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-10"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('')
                            setDebouncedQuery('')
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {!debouncedQuery && (
                <div className="py-12 text-center text-muted-foreground">
                    <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Search for products to add to your shop</p>
                </div>
            )}

            {debouncedQuery && isFetching && (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}

            {debouncedQuery && !isFetching && products?.data?.items?.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                    <p>No products found for "{debouncedQuery}"</p>
                </div>
            )}

            {products?.data?.items?.map((product: {
                id: string
                name: string
                brand: string
                imageUrl: string
                price: number
                commission: number
                isVerified: boolean
            }) => {
                const isAdded = myProductIds.has(product.id)

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
                                onClick={() => !isAdded && addMutation.mutate(product.id)}
                                disabled={isAdded}
                            >
                                {isAdded ? <Check className="h-4 w-4" /> : 'Add'}
                            </Button>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
