import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
    ChevronRight, CreditCard, HelpCircle, Link2, LogOut, Moon,
    Shield, Sun
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Switch } from '@/shared/ui/switch'
import { useAuth } from '@/app/providers/auth-provider'
import { useTheme } from '@/app/providers/theme-provider'
import { formatNumber } from '@/shared/lib/utils'

export const Route = createFileRoute('/app/profile')({
    component: ProfilePage,
})

interface SocialConnection {
    platform: string
    status: string
    followers?: number
}

function getStoredConnections(): SocialConnection[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('creatr-connections')
    return stored ? JSON.parse(stored) : []
}

function getStoredShopProducts(): string[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('creatr-shop-products')
    return stored ? JSON.parse(stored) : []
}

function ProfilePage() {
    const { user, logout } = useAuth()
    const { theme, setTheme } = useTheme()
    const navigate = useNavigate()
    const [connectedPlatforms, setConnectedPlatforms] = useState<SocialConnection[]>([])
    const [productCount, setProductCount] = useState(0)

    useEffect(() => {
        const connections = getStoredConnections()
        const products = getStoredShopProducts()
        setConnectedPlatforms(connections.filter((c) => c.status === 'connected'))
        setProductCount(products.length)
    }, [])

    const totalFollowers = connectedPlatforms.reduce((sum, p) => sum + (p.followers || 0), 0)

    const handleLogout = async () => {
        await logout()
        navigate({ to: '/' })
    }

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-medium">
                            {user?.name?.charAt(0) || 'C'}
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-xl font-bold">{user?.name}</h1>
                    <p className="text-muted-foreground">@{user?.username}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <Card>
                    <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold">{connectedPlatforms.length}</p>
                        <p className="text-xs text-muted-foreground">Platforms</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold">{formatNumber(totalFollowers)}</p>
                        <p className="text-xs text-muted-foreground">Followers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold">{productCount}</p>
                        <p className="text-xs text-muted-foreground">Products</p>
                    </CardContent>
                </Card>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground">Account</h2>

                <MenuLink to="/app/connect" icon={Link2}>
                    Connected Accounts
                </MenuLink>

                <MenuLink to="/app/credit" icon={CreditCard}>
                    Creator Credit
                </MenuLink>

                <MenuLink to="/app/leaderboard" icon={Shield}>
                    Leaderboard
                </MenuLink>
            </div>

            <div className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground">Preferences</h2>

                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            {theme === 'dark' ? (
                                <Moon className="h-5 w-5 text-muted-foreground" />
                            ) : (
                                <Sun className="h-5 w-5 text-muted-foreground" />
                            )}
                            <span>Dark Mode</span>
                        </div>
                        <Switch
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground">Support</h2>

                <MenuLink to="/about" icon={HelpCircle}>
                    Help & FAQ
                </MenuLink>
            </div>

            <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
            </Button>

            <p className="text-center text-xs text-muted-foreground">
                Creatr v1.0.0
            </p>
        </div>
    )
}

function MenuLink({
    to,
    icon: Icon,
    children,
}: {
    to: string
    icon: React.ComponentType<{ className?: string }>
    children: React.ReactNode
}) {
    return (
        <Card>
            <CardContent className="p-0">
                <Link to={to} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span>{children}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
            </CardContent>
        </Card>
    )
}

