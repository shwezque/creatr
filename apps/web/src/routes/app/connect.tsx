import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Check, Loader2, AlertCircle, Instagram, Youtube } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { useAuth } from '@/app/providers/auth-provider'
import { useToast } from '@/shared/ui/use-toast'
import { cn, formatNumber } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/connect')({
    component: ConnectPage,
})

const platforms = [
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: 'bg-black' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' },
]

function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
    )
}

function ConnectPage() {
    const { token } = useAuth()
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const { data: socials, isLoading } = useQuery({
        queryKey: ['socials'],
        queryFn: async () => {
            const res = await fetch('/api/socials', {
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
    })

    const { data: analysis } = useQuery({
        queryKey: ['analysis', 'status'],
        queryFn: async () => {
            const res = await fetch('/api/analysis/status', {
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
    })

    const connectMutation = useMutation({
        mutationFn: async (platform: string) => {
            const res = await fetch('/api/socials/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ platform }),
            })
            return res.json()
        },
        onSuccess: (_data, platform) => {
            queryClient.invalidateQueries({ queryKey: ['socials'] })
            toast({ title: `${platform} connected!`, description: 'Your account has been linked successfully.' })
            // Navigate to analyze page after connecting
            setTimeout(() => {
                navigate({ to: '/app/analyze' })
            }, 500)
        },
        onError: () => {
            toast({ title: 'Connection failed', description: 'Please try again.', variant: 'destructive' })
        },
    })

    const disconnectMutation = useMutation({
        mutationFn: async (platform: string) => {
            const res = await fetch('/api/socials/disconnect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ platform }),
            })
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['socials'] })
            toast({ title: 'Account disconnected' })
        },
    })

    const connections = socials?.data || []
    const getConnection = (platform: string) => connections.find((c: { platform: string }) => c.platform === platform)
    const connectedCount = connections.filter((c: { status: string }) => c.status === 'connected').length
    const analysisComplete = analysis?.data?.status === 'complete'

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
                <h1 className="text-2xl font-bold">Connect Your Accounts</h1>
                <p className="text-muted-foreground">
                    Link your social accounts to unlock product recommendations and creator insights.
                </p>
            </div>

            <div className="space-y-3">
                {platforms.map((platform) => {
                    const connection = getConnection(platform.id)
                    const isConnected = connection?.status === 'connected'
                    const isPending = connectMutation.isPending && connectMutation.variables === platform.id

                    return (
                        <Card key={platform.id} className={cn(isConnected && 'border-primary/50')}>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg text-white', platform.color)}>
                                    <platform.icon className="h-6 w-6" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{platform.name}</span>
                                        {isConnected && <Check className="h-4 w-4 text-green-500" />}
                                    </div>
                                    {isConnected && connection.handle && (
                                        <div className="text-sm text-muted-foreground">
                                            {connection.handle} · {formatNumber(connection.followers || 0)} followers
                                        </div>
                                    )}
                                </div>

                                {isConnected ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => disconnectMutation.mutate(platform.id)}
                                        disabled={disconnectMutation.isPending}
                                    >
                                        Disconnect
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => connectMutation.mutate(platform.id)}
                                        disabled={isPending}
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect'}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {connectedCount === 0 && (
                <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/20">
                    <CardContent className="flex items-start gap-3 p-4">
                        <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                        <div className="text-sm">
                            <p className="font-medium text-yellow-800 dark:text-yellow-200">
                                Connect at least one account
                            </p>
                            <p className="text-yellow-700 dark:text-yellow-300">
                                We need access to your social data to provide personalized recommendations.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {connectedCount > 0 && (
                <div className="flex justify-center pt-4">
                    {analysisComplete ? (
                        <Button asChild size="lg">
                            <Link to="/app/recommendations">
                                View Recommendations <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild size="lg">
                            <Link to="/app/analyze">
                                Analyze My Profile <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
