import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Crown, Loader2, Medal } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { useAuth } from '@/app/providers/auth-provider'
import { formatCurrency, cn } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/leaderboard')({
    component: LeaderboardPage,
})

const ranges = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: 'all', label: 'All Time' },
]

function LeaderboardPage() {
    const { token } = useAuth()
    const [range, setRange] = useState('30d')

    const { data: leaderboard, isLoading } = useQuery({
        queryKey: ['leaderboard', range],
        queryFn: async () => {
            const res = await fetch(`/api/leaderboard?range=${range}&limit=20`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            return res.json()
        },
    })

    const entries = leaderboard?.data || []
    const currentUserEntry = entries.find((e: { isCurrentUser: boolean }) => e.isCurrentUser)

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
                <h1 className="text-2xl font-bold">Leaderboard</h1>
                <p className="text-muted-foreground">Top earning creators this period.</p>
            </div>

            <Tabs value={range} onValueChange={setRange}>
                <TabsList className="grid w-full grid-cols-3">
                    {ranges.map((r) => (
                        <TabsTrigger key={r.id} value={r.id}>
                            {r.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-2">
                {entries.slice(0, 3).map((entry: {
                    rank: number
                    username: string
                    displayName: string
                    avatarUrl?: string
                    earnings: number
                    isCurrentUser: boolean
                }, index: number) => (
                    <div
                        key={entry.username}
                        className={cn(
                            'flex flex-col items-center rounded-lg border p-3 text-center',
                            index === 0 && 'order-2 bg-yellow-50 dark:bg-yellow-900/20',
                            index === 1 && 'order-1',
                            index === 2 && 'order-3',
                            entry.isCurrentUser && 'ring-2 ring-primary'
                        )}
                    >
                        <div className="mb-2">
                            {index === 0 && <Crown className="h-6 w-6 text-yellow-500" />}
                            {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                            {index === 2 && <Medal className="h-5 w-5 text-amber-700" />}
                        </div>
                        <div className="mb-2 h-12 w-12 overflow-hidden rounded-full bg-muted">
                            {entry.avatarUrl ? (
                                <img src={entry.avatarUrl} alt={entry.displayName} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-lg font-medium">
                                    {entry.displayName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <p className="line-clamp-1 text-sm font-medium">{entry.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{entry.username}</p>
                        <p className="mt-1 font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(entry.earnings)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Rest of leaderboard */}
            <div className="space-y-2">
                {entries.slice(3).map((entry: {
                    rank: number
                    username: string
                    displayName: string
                    avatarUrl?: string
                    categories: string[]
                    earnings: number
                    conversions: number
                    isCurrentUser: boolean
                }) => (
                    <Card key={entry.username} className={cn(entry.isCurrentUser && 'ring-2 ring-primary')}>
                        <CardContent className="flex items-center gap-3 p-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                {entry.rank}
                            </div>
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                                {entry.avatarUrl ? (
                                    <img src={entry.avatarUrl} alt={entry.displayName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center font-medium">
                                        {entry.displayName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="line-clamp-1 font-medium">
                                    {entry.displayName}
                                    {entry.isCurrentUser && <span className="ml-1 text-xs text-primary">(You)</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {entry.categories?.slice(0, 2).join(', ')}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-green-600 dark:text-green-400">
                                    {formatCurrency(entry.earnings)}
                                </p>
                                <p className="text-xs text-muted-foreground">{entry.conversions} sales</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {currentUserEntry && currentUserEntry.rank > 10 && (
                <Card className="border-primary/50 bg-primary/5">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                                {currentUserEntry.rank}
                            </div>
                            <span className="font-medium">Your Position</span>
                        </div>
                        <span className="font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(currentUserEntry.earnings)}
                        </span>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
