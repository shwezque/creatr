import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { useAuth } from '@/app/providers/auth-provider'
import { cn } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/analyze')({
    component: AnalyzePage,
})

const steps = [
    { id: 1, label: 'Fetching posts', description: 'Retrieving content from your accounts' },
    { id: 2, label: 'Analyzing content', description: 'Identifying topics and themes' },
    { id: 3, label: 'Computing signals', description: 'Analyzing engagement patterns' },
    { id: 4, label: 'Generating fit', description: 'Finding your best product matches' },
]

function AnalyzePage() {
    const { token } = useAuth()
    const queryClient = useQueryClient()

    const { data: status } = useQuery({
        queryKey: ['analysis', 'status'],
        queryFn: async () => {
            const res = await fetch('/api/analysis/status', {
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
        refetchInterval: (query) => {
            const data = query.state.data
            if (data?.data?.status === 'complete' || data?.data?.status === 'failed') {
                return false
            }
            return 1000
        },
    })

    const startMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/analysis/start', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['analysis'] })
        },
    })

    const currentStatus = status?.data?.status || 'idle'
    const currentStep = status?.data?.step || 0

    useEffect(() => {
        if (currentStatus === 'idle' && !startMutation.isPending) {
            startMutation.mutate()
        }
    }, [currentStatus, startMutation])

    const isComplete = currentStatus === 'complete'
    const isFailed = currentStatus === 'failed'

    return (
        <div className="mx-auto max-w-lg space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold">
                    {isComplete ? 'Analysis Complete!' : 'Analyzing Your Profile'}
                </h1>
                <p className="text-muted-foreground">
                    {isComplete
                        ? 'We found the best products for your audience.'
                        : 'This usually takes about 30 seconds...'}
                </p>
            </div>

            {!isComplete && !isFailed && (
                <div className="py-8">
                    <div className="relative mx-auto h-24 w-24">
                        <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                        <div className="absolute inset-2 animate-pulse rounded-full bg-primary/50" />
                        <div className="absolute inset-4 flex items-center justify-center rounded-full bg-primary">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
                        </div>
                    </div>
                </div>
            )}

            <Card>
                <CardContent className="space-y-4 p-6">
                    {steps.map((step) => {
                        const isActive = step.id === currentStep
                        const isDone = step.id < currentStep || isComplete

                        return (
                            <div key={step.id} className="flex items-start gap-4">
                                <div
                                    className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                        isDone && 'border-green-500 bg-green-500',
                                        isActive && !isDone && 'border-primary',
                                        !isActive && !isDone && 'border-muted'
                                    )}
                                >
                                    {isDone ? (
                                        <Check className="h-4 w-4 text-white" />
                                    ) : isActive ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    ) : (
                                        <span className="text-sm text-muted-foreground">{step.id}</span>
                                    )}
                                </div>
                                <div className="flex-1 pt-1">
                                    <p className={cn('font-medium', !isDone && !isActive && 'text-muted-foreground')}>
                                        {step.label}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                    {isActive && !isDone && (
                                        <Progress value={50} className="mt-2 h-1" />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {isFailed && (
                <div className="text-center">
                    <p className="mb-4 text-destructive">Analysis failed. Please try again.</p>
                    <Button onClick={() => startMutation.mutate()}>Retry Analysis</Button>
                </div>
            )}

            {isComplete && (
                <div className="flex justify-center">
                    <Button size="lg" asChild>
                        <Link to="/app/recommendations">
                            See Recommendations <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
