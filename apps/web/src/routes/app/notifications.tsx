import { createFileRoute } from '@tanstack/react-router'
import { Bell, Check, Gift, TrendingUp, Users, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/notifications')({
    component: NotificationsPage,
})

interface Notification {
    id: string
    type: 'sale' | 'milestone' | 'promo' | 'connection'
    title: string
    description: string
    time: string
    read: boolean
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'sale',
        title: 'New sale!',
        description: 'You earned $12.50 commission from a product sale.',
        time: '2 min ago',
        read: false,
    },
    {
        id: '2',
        type: 'milestone',
        title: 'Milestone reached!',
        description: 'You hit 1,000 total clicks on your shop links.',
        time: '1 hour ago',
        read: false,
    },
    {
        id: '3',
        type: 'promo',
        title: 'New offer available',
        description: 'A brand you follow has a new 25% commission deal.',
        time: '3 hours ago',
        read: false,
    },
    {
        id: '4',
        type: 'connection',
        title: 'TikTok connected',
        description: 'Your TikTok account was successfully linked.',
        time: '1 day ago',
        read: true,
    },
    {
        id: '5',
        type: 'sale',
        title: 'New sale!',
        description: 'You earned $8.25 commission from a product sale.',
        time: '2 days ago',
        read: true,
    },
]

function NotificationsPage() {
    const unreadCount = mockNotifications.filter((n) => !n.read).length

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'sale':
                return TrendingUp
            case 'milestone':
                return Gift
            case 'promo':
                return Bell
            case 'connection':
                return Users
            default:
                return Bell
        }
    }

    const getIconColor = (type: Notification['type']) => {
        switch (type) {
            case 'sale':
                return 'text-green-600 bg-green-100 dark:bg-green-900/30'
            case 'milestone':
                return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
            case 'promo':
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
            case 'connection':
                return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm">
                        <Check className="mr-2 h-4 w-4" />
                        Mark all read
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {mockNotifications.map((notification) => {
                    const Icon = getIcon(notification.type)
                    return (
                        <Card
                            key={notification.id}
                            className={cn(
                                'transition-colors',
                                !notification.read && 'border-primary/30 bg-primary/5'
                            )}
                        >
                            <CardContent className="flex items-start gap-4 p-4">
                                <div
                                    className={cn(
                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                                        getIconColor(notification.type)
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{notification.title}</p>
                                        {!notification.read && (
                                            <span className="h-2 w-2 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {notification.description}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {notification.time}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {mockNotifications.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No notifications yet.</p>
                        <p className="text-sm text-muted-foreground">
                            We'll notify you when something happens.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
